-- Create table for low voltage alert events
CREATE TABLE public.voltage_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  min_voltage DECIMAL(8,2) NOT NULL,
  avg_voltage DECIMAL(8,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.voltage_alerts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read voltage alerts
CREATE POLICY "Anyone can read voltage alerts"
ON public.voltage_alerts
FOR SELECT
USING (true);

-- Allow anyone to insert voltage alerts
CREATE POLICY "Anyone can insert voltage alerts"
ON public.voltage_alerts
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update voltage alerts (to close them)
CREATE POLICY "Anyone can update voltage alerts"
ON public.voltage_alerts
FOR UPDATE
USING (true);

-- Create index for efficient querying
CREATE INDEX idx_voltage_alerts_started_at ON public.voltage_alerts(started_at DESC);
CREATE INDEX idx_voltage_alerts_active ON public.voltage_alerts(is_active) WHERE is_active = true;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.voltage_alerts;