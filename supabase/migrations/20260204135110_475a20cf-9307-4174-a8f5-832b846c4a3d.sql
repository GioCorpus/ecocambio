-- Enum para marcas de inversor
CREATE TYPE public.inverter_brand AS ENUM ('fronius', 'huawei', 'hoymiles', 'growatt', 'sma');

-- Enum para severidad de alertas
CREATE TYPE public.alert_severity AS ENUM ('info', 'warning', 'critical');

-- Enum para estado de conexión
CREATE TYPE public.connection_status AS ENUM ('online', 'offline', 'degraded', 'unknown');

-- Enum para roles de usuario
CREATE TYPE public.app_role AS ENUM ('admin', 'technician', 'viewer');

-- Tabla de técnicos/perfiles de usuario
CREATE TABLE public.technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{"theme": "light", "notifications": true, "tariff_mxn_kwh": 2.5}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabla de roles de usuario (separada para seguridad)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'technician',
  UNIQUE (user_id, role)
);

-- Tabla de plantas/instalaciones
CREATE TABLE public.plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  address TEXT,
  city TEXT DEFAULT 'Mexicali',
  state TEXT DEFAULT 'Baja California',
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  capacity_kw NUMERIC(10, 2),
  installation_date DATE,
  client_name TEXT,
  client_phone TEXT,
  client_email TEXT,
  notes TEXT,
  tariff_mxn_kwh NUMERIC(6, 4) DEFAULT 2.50,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabla de inversores
CREATE TABLE public.inverters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE NOT NULL,
  brand inverter_brand NOT NULL,
  model TEXT,
  serial_number TEXT,
  rated_power_kw NUMERIC(10, 2),
  
  -- Configuración de conexión cloud
  api_url TEXT,
  api_credentials JSONB, -- Encriptado: {username, password, api_key, site_id}
  
  -- Estado actual
  status connection_status DEFAULT 'unknown',
  last_seen_at TIMESTAMPTZ,
  firmware_version TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabla de lecturas normalizadas (timeseries)
CREATE TABLE public.readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inverter_id UUID REFERENCES public.inverters(id) ON DELETE CASCADE NOT NULL,
  plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE NOT NULL,
  
  -- Datos normalizados
  power_kw NUMERIC(10, 3),           -- Potencia activa actual
  energy_today_kwh NUMERIC(12, 3),   -- Yield diario
  energy_total_kwh NUMERIC(14, 3),   -- Yield acumulado
  
  -- Datos opcionales
  temperature_c NUMERIC(5, 2),       -- Temperatura del inversor
  battery_soc NUMERIC(5, 2),         -- Estado de carga batería (0-100)
  voltage_dc NUMERIC(8, 2),          -- Voltaje DC (string input)
  current_dc NUMERIC(8, 2),          -- Corriente DC
  voltage_ac NUMERIC(8, 2),          -- Voltaje AC (grid)
  frequency_hz NUMERIC(5, 2),        -- Frecuencia de red
  
  -- Metadatos
  raw_data JSONB,                    -- Datos originales sin normalizar
  recorded_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabla de alertas estandarizadas
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inverter_id UUID REFERENCES public.inverters(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE NOT NULL,
  
  -- Tipo de alerta normalizado
  alert_type TEXT NOT NULL, -- 'string_fault', 'low_production', 'communication_error', 'inverter_offline', 'high_temperature', 'grid_fault'
  severity alert_severity NOT NULL DEFAULT 'warning',
  
  -- Detalles
  title TEXT NOT NULL,
  message TEXT,
  raw_code TEXT,           -- Código original del fabricante
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabla de asignación técnico-planta
CREATE TABLE public.plant_technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE NOT NULL,
  technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE NOT NULL,
  can_edit BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (plant_id, technician_id)
);

-- Índices para rendimiento
CREATE INDEX idx_readings_inverter_time ON public.readings(inverter_id, recorded_at DESC);
CREATE INDEX idx_readings_plant_time ON public.readings(plant_id, recorded_at DESC);
CREATE INDEX idx_alerts_plant_active ON public.alerts(plant_id, is_active, started_at DESC);
CREATE INDEX idx_alerts_severity ON public.alerts(severity, is_active);
CREATE INDEX idx_inverters_plant ON public.inverters(plant_id);
CREATE INDEX idx_inverters_status ON public.inverters(status);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inverters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_technicians ENABLE ROW LEVEL SECURITY;

-- Función para verificar rol (security definer para evitar recursión)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Función para verificar acceso a planta
CREATE OR REPLACE FUNCTION public.can_access_plant(_user_id UUID, _plant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.plant_technicians pt
    JOIN public.technicians t ON t.id = pt.technician_id
    WHERE t.user_id = _user_id AND pt.plant_id = _plant_id
  )
  OR public.has_role(_user_id, 'admin')
$$;

-- RLS Policies para technicians
CREATE POLICY "Users can view their own profile"
ON public.technicians FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.technicians FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.technicians FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- RLS Policies para user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies para plants
CREATE POLICY "Users can view assigned plants"
ON public.plants FOR SELECT
TO authenticated
USING (public.can_access_plant(auth.uid(), id) OR created_by = auth.uid());

CREATE POLICY "Admins can insert plants"
ON public.plants FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'technician'));

CREATE POLICY "Admins can update plants"
ON public.plants FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR created_by = auth.uid());

-- RLS Policies para inverters
CREATE POLICY "Users can view inverters of assigned plants"
ON public.inverters FOR SELECT
TO authenticated
USING (public.can_access_plant(auth.uid(), plant_id));

CREATE POLICY "Technicians can manage inverters"
ON public.inverters FOR ALL
TO authenticated
USING (public.can_access_plant(auth.uid(), plant_id))
WITH CHECK (public.can_access_plant(auth.uid(), plant_id));

-- RLS Policies para readings
CREATE POLICY "Users can view readings of assigned plants"
ON public.readings FOR SELECT
TO authenticated
USING (public.can_access_plant(auth.uid(), plant_id));

CREATE POLICY "System can insert readings"
ON public.readings FOR INSERT
TO authenticated
WITH CHECK (public.can_access_plant(auth.uid(), plant_id));

-- RLS Policies para alerts
CREATE POLICY "Users can view alerts of assigned plants"
ON public.alerts FOR SELECT
TO authenticated
USING (public.can_access_plant(auth.uid(), plant_id));

CREATE POLICY "Users can update alerts of assigned plants"
ON public.alerts FOR UPDATE
TO authenticated
USING (public.can_access_plant(auth.uid(), plant_id));

CREATE POLICY "System can insert alerts"
ON public.alerts FOR INSERT
TO authenticated
WITH CHECK (public.can_access_plant(auth.uid(), plant_id));

-- RLS Policies para plant_technicians
CREATE POLICY "Users can view their plant assignments"
ON public.plant_technicians FOR SELECT
TO authenticated
USING (
  technician_id IN (SELECT id FROM public.technicians WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage plant assignments"
ON public.plant_technicians FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger para crear perfil de técnico automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.technicians (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'technician');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_technicians_updated_at
BEFORE UPDATE ON public.technicians
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_plants_updated_at
BEFORE UPDATE ON public.plants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_inverters_updated_at
BEFORE UPDATE ON public.inverters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Habilitar Realtime para tablas críticas
ALTER PUBLICATION supabase_realtime ADD TABLE public.readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inverters;