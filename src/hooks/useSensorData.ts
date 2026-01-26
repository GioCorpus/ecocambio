import { useState, useEffect, useCallback } from 'react';

export interface SensorReading {
  timestamp: Date;
  voltage: number;
  current: number;
  watts: number;
  kilowatts: number;
}

export const useSensorData = (intervalMs: number = 5000) => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [isLowVoltage, setIsLowVoltage] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const generateReading = useCallback((): SensorReading => {
    // Simulate solar panel sensor readings
    // Voltage between 35-130V (solar panel output varies with sunlight)
    const voltage = Math.random() > 0.12 
      ? 80 + (Math.random() - 0.3) * 50 // Normal: 65-115V
      : 30 + Math.random() * 25; // Low voltage: 30-55V (cloudy/low light)
    
    // Current between 1-15A (depends on load and sunlight)
    const current = 3 + Math.random() * 10;
    
    // Calculate watts and kilowatts
    const watts = voltage * current;
    const kilowatts = watts / 1000;

    return {
      timestamp: new Date(),
      voltage: parseFloat(voltage.toFixed(2)),
      current: parseFloat(current.toFixed(2)),
      watts: parseFloat(watts.toFixed(2)),
      kilowatts: parseFloat(kilowatts.toFixed(3)),
    };
  }, []);

  const addReading = useCallback(() => {
    const newReading = generateReading();
    setLatestReading(newReading);
    setIsLowVoltage(newReading.voltage < 50);
    
    setReadings(prev => {
      const updated = [...prev, newReading];
      // Keep only last 24 readings for the chart (2 minutes of data at 5s intervals)
      return updated.slice(-24);
    });
  }, [generateReading]);

  useEffect(() => {
    // Simulate connection after a brief delay
    const connectionTimeout = setTimeout(() => {
      setIsConnected(true);
      addReading();
    }, 1500);
    
    // Set up interval for readings after connection
    const interval = setInterval(() => {
      if (isConnected) {
        addReading();
      }
    }, intervalMs);
    
    return () => {
      clearTimeout(connectionTimeout);
      clearInterval(interval);
    };
  }, [intervalMs, addReading, isConnected]);

  return {
    readings,
    latestReading,
    isLowVoltage,
    isConnected,
    addReading,
  };
};
