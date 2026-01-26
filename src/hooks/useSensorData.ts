import { useState, useEffect, useCallback } from 'react';

export interface SensorReading {
  timestamp: Date;
  voltage: number;
  current: number;
  watts: number;
}

export const useSensorData = (intervalMs: number = 10000) => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [isLowVoltage, setIsLowVoltage] = useState(false);

  const generateReading = useCallback((): SensorReading => {
    // Simulate sensor readings with some variation
    // Voltage between 40-130V to occasionally trigger low voltage alert
    const voltage = Math.random() > 0.15 
      ? 100 + (Math.random() - 0.5) * 40 // Normal: 80-120V
      : 35 + Math.random() * 20; // Low voltage: 35-55V
    
    // Current between 0.5-10A
    const current = 2 + Math.random() * 6;
    
    // Calculate watts
    const watts = voltage * current;

    return {
      timestamp: new Date(),
      voltage: parseFloat(voltage.toFixed(2)),
      current: parseFloat(current.toFixed(2)),
      watts: parseFloat(watts.toFixed(2)),
    };
  }, []);

  const addReading = useCallback(() => {
    const newReading = generateReading();
    setLatestReading(newReading);
    setIsLowVoltage(newReading.voltage < 50);
    
    setReadings(prev => {
      const updated = [...prev, newReading];
      // Keep only last 20 readings for the chart
      return updated.slice(-20);
    });
  }, [generateReading]);

  useEffect(() => {
    // Initial reading
    addReading();
    
    // Set up interval for readings
    const interval = setInterval(addReading, intervalMs);
    
    return () => clearInterval(interval);
  }, [intervalMs, addReading]);

  return {
    readings,
    latestReading,
    isLowVoltage,
    addReading,
  };
};

