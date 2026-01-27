import { supabase } from '@/integrations/supabase/client';
import { SensorReading } from './useSensorData';

export const useSensorStorage = () => {
  const saveReading = async (reading: SensorReading) => {
    const { data, error } = await supabase
      .from('sensor_readings')
      .insert({
        voltage: reading.voltage,
        current: reading.current,
        watts: reading.watts,
        kilowatts: reading.kilowatts,
        is_low_voltage: reading.voltage < 50
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving reading:', error);
      throw error;
    }

    return data;
  };

  const saveMultipleReadings = async (readings: SensorReading[]) => {
    const formattedReadings = readings.map(reading => ({
      voltage: reading.voltage,
      current: reading.current,
      watts: reading.watts,
      kilowatts: reading.kilowatts,
      is_low_voltage: reading.voltage < 50
    }));

    const { data, error } = await supabase
      .from('sensor_readings')
      .insert(formattedReadings)
      .select();

    if (error) {
      console.error('Error saving readings:', error);
      throw error;
    }

    return data;
  };

  const getRecentReadings = async (limit: number = 100) => {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching readings:', error);
      throw error;
    }

    return data;
  };

  const getLowVoltageAlerts = async (limit: number = 50) => {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('is_low_voltage', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }

    return data;
  };

  return {
    saveReading,
    saveMultipleReadings,
    getRecentReadings,
    getLowVoltageAlerts
  };
};
