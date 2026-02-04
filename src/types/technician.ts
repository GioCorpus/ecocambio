// Types for EcoCambio Technician system

export type InverterBrand = 'fronius' | 'huawei' | 'hoymiles' | 'growatt' | 'sma';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type ConnectionStatus = 'online' | 'offline' | 'degraded' | 'unknown';

export type AppRole = 'admin' | 'technician' | 'viewer';

export interface Technician {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  company?: string;
  avatar_url?: string;
  preferences: TechnicianPreferences;
  created_at: string;
  updated_at: string;
}

export interface TechnicianPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  tariff_mxn_kwh: number;
}

export interface Plant {
  id: string;
  name: string;
  location?: string;
  address?: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  capacity_kw?: number;
  installation_date?: string;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  notes?: string;
  tariff_mxn_kwh: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  inverters?: Inverter[];
  latest_reading?: Reading;
  active_alerts_count?: number;
}

export interface Inverter {
  id: string;
  plant_id: string;
  brand: InverterBrand;
  model?: string;
  serial_number?: string;
  rated_power_kw?: number;
  api_url?: string;
  api_credentials?: ApiCredentials;
  status: ConnectionStatus;
  last_seen_at?: string;
  firmware_version?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiCredentials {
  username?: string;
  password?: string;
  api_key?: string;
  site_id?: string;
}

export interface Reading {
  id: string;
  inverter_id: string;
  plant_id: string;
  power_kw?: number;
  energy_today_kwh?: number;
  energy_total_kwh?: number;
  temperature_c?: number;
  battery_soc?: number;
  voltage_dc?: number;
  current_dc?: number;
  voltage_ac?: number;
  frequency_hz?: number;
  raw_data?: Record<string, unknown>;
  recorded_at: string;
  created_at: string;
}

export interface Alert {
  id: string;
  inverter_id?: string;
  plant_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  message?: string;
  raw_code?: string;
  is_active: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  started_at: string;
  created_at: string;
}

export type AlertType = 
  | 'string_fault'
  | 'low_production'
  | 'communication_error'
  | 'inverter_offline'
  | 'high_temperature'
  | 'grid_fault'
  | 'battery_low'
  | 'general';

export interface PlantSummary {
  plant: Plant;
  total_power_kw: number;
  energy_today_kwh: number;
  energy_total_kwh: number;
  savings_today_mxn: number;
  savings_total_mxn: number;
  inverters_online: number;
  inverters_total: number;
  active_alerts: Alert[];
}

// Brand-specific configuration templates
export const BRAND_CONFIGS: Record<InverterBrand, {
  name: string;
  cloudApi: string;
  requiresCredentials: ('username' | 'password' | 'api_key' | 'site_id')[];
  color: string;
}> = {
  fronius: {
    name: 'Fronius',
    cloudApi: 'Solar.web API',
    requiresCredentials: ['username', 'password', 'site_id'],
    color: 'hsl(35, 90%, 50%)', // Orange
  },
  huawei: {
    name: 'Huawei',
    cloudApi: 'FusionSolar API',
    requiresCredentials: ['username', 'password'],
    color: 'hsl(355, 80%, 55%)', // Red
  },
  hoymiles: {
    name: 'Hoymiles',
    cloudApi: 'Hoymiles Cloud API',
    requiresCredentials: ['username', 'password'],
    color: 'hsl(200, 85%, 55%)', // Blue
  },
  growatt: {
    name: 'Growatt',
    cloudApi: 'Growatt Server API',
    requiresCredentials: ['username', 'password'],
    color: 'hsl(120, 70%, 45%)', // Green
  },
  sma: {
    name: 'SMA',
    cloudApi: 'Sunny Portal API',
    requiresCredentials: ['api_key', 'site_id'],
    color: 'hsl(210, 80%, 50%)', // Dark blue
  },
};

export const ALERT_TYPES: Record<AlertType, { label: string; icon: string }> = {
  string_fault: { label: 'Fallo de String', icon: 'Zap' },
  low_production: { label: 'Baja Producción', icon: 'TrendingDown' },
  communication_error: { label: 'Error de Comunicación', icon: 'WifiOff' },
  inverter_offline: { label: 'Inversor Desconectado', icon: 'Power' },
  high_temperature: { label: 'Alta Temperatura', icon: 'Thermometer' },
  grid_fault: { label: 'Fallo de Red', icon: 'AlertTriangle' },
  battery_low: { label: 'Batería Baja', icon: 'BatteryLow' },
  general: { label: 'Alerta General', icon: 'AlertCircle' },
};
