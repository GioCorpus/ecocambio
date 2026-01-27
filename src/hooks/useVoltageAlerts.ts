import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VoltageAlert {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  min_voltage: number;
  avg_voltage: number | null;
  is_active: boolean;
}

export const useVoltageAlerts = () => {
  const [alerts, setAlerts] = useState<VoltageAlert[]>([]);
  const [activeAlert, setActiveAlert] = useState<VoltageAlert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const voltageReadings = useRef<number[]>([]);

  // Fetch alerts from database
  const fetchAlerts = useCallback(async () => {
    const { data, error } = await supabase
      .from('voltage_alerts')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching alerts:', error);
      return;
    }

    setAlerts(data || []);
    
    // Check if there's an active alert
    const active = data?.find(a => a.is_active);
    if (active) {
      setActiveAlert(active);
    }
    
    setIsLoading(false);
  }, []);

  // Start a new alert when voltage drops below 50V
  const startAlert = useCallback(async (voltage: number) => {
    if (activeAlert) return; // Already have an active alert

    voltageReadings.current = [voltage];

    const { data, error } = await supabase
      .from('voltage_alerts')
      .insert({
        min_voltage: voltage,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting alert:', error);
      return;
    }

    setActiveAlert(data);
    setAlerts(prev => [data, ...prev]);
  }, [activeAlert]);

  // End the current alert when voltage recovers
  const endAlert = useCallback(async () => {
    if (!activeAlert) return;

    const endedAt = new Date().toISOString();
    const startedAt = new Date(activeAlert.started_at);
    const durationSeconds = Math.round((new Date(endedAt).getTime() - startedAt.getTime()) / 1000);
    
    const avgVoltage = voltageReadings.current.length > 0
      ? voltageReadings.current.reduce((a, b) => a + b, 0) / voltageReadings.current.length
      : activeAlert.min_voltage;

    const { data, error } = await supabase
      .from('voltage_alerts')
      .update({
        ended_at: endedAt,
        duration_seconds: durationSeconds,
        avg_voltage: parseFloat(avgVoltage.toFixed(2)),
        is_active: false
      })
      .eq('id', activeAlert.id)
      .select()
      .single();

    if (error) {
      console.error('Error ending alert:', error);
      return;
    }

    setActiveAlert(null);
    voltageReadings.current = [];
    setAlerts(prev => prev.map(a => a.id === data.id ? data : a));
  }, [activeAlert]);

  // Track voltage during an active alert
  const trackVoltage = useCallback((voltage: number) => {
    if (!activeAlert) return;

    voltageReadings.current.push(voltage);

    // Update min voltage if lower
    if (voltage < activeAlert.min_voltage) {
      supabase
        .from('voltage_alerts')
        .update({ min_voltage: voltage })
        .eq('id', activeAlert.id)
        .then(({ error }) => {
          if (error) console.error('Error updating min voltage:', error);
        });

      setActiveAlert(prev => prev ? { ...prev, min_voltage: voltage } : null);
    }
  }, [activeAlert]);

  // Handle voltage changes
  const handleVoltageChange = useCallback((voltage: number, isLowVoltage: boolean) => {
    if (isLowVoltage) {
      if (!activeAlert) {
        startAlert(voltage);
      } else {
        trackVoltage(voltage);
      }
    } else if (activeAlert) {
      endAlert();
    }
  }, [activeAlert, startAlert, trackVoltage, endAlert]);

  // Initial fetch
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('voltage_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voltage_alerts'
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAlerts]);

  return {
    alerts,
    activeAlert,
    isLoading,
    handleVoltageChange,
    fetchAlerts
  };
};
