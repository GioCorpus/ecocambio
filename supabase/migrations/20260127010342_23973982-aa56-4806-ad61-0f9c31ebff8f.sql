-- Create table for solar panel sensor readings
CREATE TABLE public.sensor_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voltage DECIMAL(8,2) NOT NULL,
  current DECIMAL(8,2) NOT NULL,
  watts DECIMAL(10,2) NOT NULL,
  kilowatts DECIMAL(10,3) NOT NULL,
  is_low_voltage BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read sensor readings (public API for mobile app)
CREATE POLICY "Anyone can read sensor readings"
ON public.sensor_readings
FOR SELECT
USING (true);

-- Allow anyone to insert sensor readings (for the monitoring device)
CREATE POLICY "Anyone can insert sensor readings"
ON public.sensor_readings
FOR INSERT
WITH CHECK (true);

-- Create index for efficient querying by date
CREATE INDEX idx_sensor_readings_created_at ON public.sensor_readings(created_at DESC);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;