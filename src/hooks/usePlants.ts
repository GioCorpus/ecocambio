import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Plant, Inverter, Reading, Alert, PlantSummary, InverterBrand, ConnectionStatus, AlertSeverity } from '@/types/technician';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapPlant = (row: any): Plant => ({
  id: row.id,
  name: row.name,
  location: row.location ?? undefined,
  address: row.address ?? undefined,
  city: row.city ?? 'Mexicali',
  state: row.state ?? 'Baja California',
  latitude: row.latitude ?? undefined,
  longitude: row.longitude ?? undefined,
  capacity_kw: row.capacity_kw ?? undefined,
  installation_date: row.installation_date ?? undefined,
  client_name: row.client_name ?? undefined,
  client_phone: row.client_phone ?? undefined,
  client_email: row.client_email ?? undefined,
  notes: row.notes ?? undefined,
  tariff_mxn_kwh: row.tariff_mxn_kwh ?? 2.5,
  created_by: row.created_by ?? undefined,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapInverter = (row: any): Inverter => ({
  id: row.id,
  plant_id: row.plant_id,
  brand: row.brand as InverterBrand,
  model: row.model ?? undefined,
  serial_number: row.serial_number ?? undefined,
  rated_power_kw: row.rated_power_kw ?? undefined,
  api_url: row.api_url ?? undefined,
  api_credentials: row.api_credentials as Inverter['api_credentials'],
  status: (row.status ?? 'unknown') as ConnectionStatus,
  last_seen_at: row.last_seen_at ?? undefined,
  firmware_version: row.firmware_version ?? undefined,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapReading = (row: any): Reading => ({
  id: row.id,
  inverter_id: row.inverter_id,
  plant_id: row.plant_id,
  power_kw: row.power_kw ?? undefined,
  energy_today_kwh: row.energy_today_kwh ?? undefined,
  energy_total_kwh: row.energy_total_kwh ?? undefined,
  temperature_c: row.temperature_c ?? undefined,
  battery_soc: row.battery_soc ?? undefined,
  voltage_dc: row.voltage_dc ?? undefined,
  current_dc: row.current_dc ?? undefined,
  voltage_ac: row.voltage_ac ?? undefined,
  frequency_hz: row.frequency_hz ?? undefined,
  raw_data: row.raw_data ?? undefined,
  recorded_at: row.recorded_at,
  created_at: row.created_at,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapAlert = (row: any): Alert => ({
  id: row.id,
  inverter_id: row.inverter_id ?? undefined,
  plant_id: row.plant_id,
  alert_type: row.alert_type as Alert['alert_type'],
  severity: row.severity as AlertSeverity,
  title: row.title,
  message: row.message ?? undefined,
  raw_code: row.raw_code ?? undefined,
  is_active: row.is_active,
  acknowledged_at: row.acknowledged_at ?? undefined,
  acknowledged_by: row.acknowledged_by ?? undefined,
  resolved_at: row.resolved_at ?? undefined,
  started_at: row.started_at,
  created_at: row.created_at,
});

export const usePlants = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlants = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('plants')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setPlants((data || []).map(mapPlant));
    } catch (err) {
      console.error('Error fetching plants:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  const getPlantWithDetails = useCallback(async (plantId: string): Promise<PlantSummary | null> => {
    try {
      const [plantResult, invertersResult, readingsResult, alertsResult] = await Promise.all([
        supabase.from('plants').select('*').eq('id', plantId).single(),
        supabase.from('inverters').select('*').eq('plant_id', plantId),
        supabase
          .from('readings')
          .select('*')
          .eq('plant_id', plantId)
          .order('recorded_at', { ascending: false })
          .limit(50),
        supabase
          .from('alerts')
          .select('*')
          .eq('plant_id', plantId)
          .eq('is_active', true)
          .order('severity', { ascending: false })
          .order('started_at', { ascending: false }),
      ]);

      if (plantResult.error) throw plantResult.error;

      const plant = mapPlant(plantResult.data);
      const inverters = (invertersResult.data || []).map(mapInverter);
      const readings = (readingsResult.data || []).map(mapReading);
      const activeAlerts = (alertsResult.data || []).map(mapAlert);

      // Get latest readings per inverter
      const latestReadings = new Map<string, Reading>();
      for (const reading of readings) {
        if (!latestReadings.has(reading.inverter_id)) {
          latestReadings.set(reading.inverter_id, reading);
        }
      }

      // Calculate summary
      let totalPowerKw = 0;
      let energyTodayKwh = 0;
      let energyTotalKwh = 0;
      let invertersOnline = 0;

      for (const inverter of inverters) {
        const reading = latestReadings.get(inverter.id);
        if (reading) {
          totalPowerKw += reading.power_kw || 0;
          energyTodayKwh += reading.energy_today_kwh || 0;
          energyTotalKwh += reading.energy_total_kwh || 0;
        }
        if (inverter.status === 'online') {
          invertersOnline++;
        }
      }

      const tariff = plant.tariff_mxn_kwh;
      
      return {
        plant: { ...plant, inverters },
        total_power_kw: totalPowerKw,
        energy_today_kwh: energyTodayKwh,
        energy_total_kwh: energyTotalKwh,
        savings_today_mxn: energyTodayKwh * tariff,
        savings_total_mxn: energyTotalKwh * tariff,
        inverters_online: invertersOnline,
        inverters_total: inverters.length,
        active_alerts: activeAlerts,
      };
    } catch (err) {
      console.error('Error fetching plant details:', err);
      return null;
    }
  }, []);

  const createPlant = useCallback(async (plantData: Partial<Plant>) => {
    const { data, error } = await supabase
      .from('plants')
      .insert({
        name: plantData.name!,
        location: plantData.location,
        address: plantData.address,
        city: plantData.city || 'Mexicali',
        state: plantData.state || 'Baja California',
        latitude: plantData.latitude,
        longitude: plantData.longitude,
        capacity_kw: plantData.capacity_kw,
        installation_date: plantData.installation_date,
        client_name: plantData.client_name,
        client_phone: plantData.client_phone,
        client_email: plantData.client_email,
        notes: plantData.notes,
        tariff_mxn_kwh: plantData.tariff_mxn_kwh || 2.5,
      })
      .select()
      .single();

    if (!error) {
      await fetchPlants();
    }

    return { data: data ? mapPlant(data) : null, error };
  }, [fetchPlants]);

  return {
    plants,
    isLoading,
    error,
    fetchPlants,
    getPlantWithDetails,
    createPlant,
  };
};

export const useInverters = (plantId?: string) => {
  const [inverters, setInverters] = useState<Inverter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInverters = useCallback(async () => {
    if (!plantId) {
      setInverters([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('inverters')
      .select('*')
      .eq('plant_id', plantId)
      .order('created_at');

    if (!error) {
      setInverters((data || []).map(mapInverter));
    }
    setIsLoading(false);
  }, [plantId]);

  useEffect(() => {
    fetchInverters();
  }, [fetchInverters]);

  const addInverter = useCallback(async (inverterData: Partial<Inverter>) => {
    const { data, error } = await supabase
      .from('inverters')
      .insert([{
        plant_id: plantId!,
        brand: inverterData.brand! as 'fronius' | 'huawei' | 'hoymiles' | 'growatt' | 'sma',
        model: inverterData.model ?? null,
        serial_number: inverterData.serial_number ?? null,
        rated_power_kw: inverterData.rated_power_kw ?? null,
        api_url: inverterData.api_url ?? null,
        api_credentials: inverterData.api_credentials ? JSON.parse(JSON.stringify(inverterData.api_credentials)) : null,
        status: 'unknown' as const,
      }])
      .select()
      .single();

    if (!error) {
      await fetchInverters();
    }

    return { data: data ? mapInverter(data) : null, error };
  }, [plantId, fetchInverters]);

  return {
    inverters,
    isLoading,
    fetchInverters,
    addInverter,
  };
};

export const useReadings = (plantId?: string) => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReadings = useCallback(async (limit = 100) => {
    if (!plantId) {
      setReadings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .eq('plant_id', plantId)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (!error) {
      setReadings((data || []).map(mapReading));
    }
    setIsLoading(false);
  }, [plantId]);

  useEffect(() => {
    fetchReadings();

    // Subscribe to realtime updates
    if (plantId) {
      const channel = supabase
        .channel(`readings-${plantId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'readings',
            filter: `plant_id=eq.${plantId}`,
          },
          (payload) => {
            const newReading = mapReading(payload.new);
            setReadings((prev) => [newReading, ...prev.slice(0, 99)]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [plantId, fetchReadings]);

  return {
    readings,
    isLoading,
    fetchReadings,
  };
};

export const useAlerts = (plantId?: string) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    if (!plantId) {
      setAlerts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('plant_id', plantId)
      .order('is_active', { ascending: false })
      .order('severity', { ascending: false })
      .order('started_at', { ascending: false })
      .limit(50);

    if (!error) {
      setAlerts((data || []).map(mapAlert));
    }
    setIsLoading(false);
  }, [plantId]);

  useEffect(() => {
    fetchAlerts();

    // Subscribe to realtime updates
    if (plantId) {
      const channel = supabase
        .channel(`alerts-${plantId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'alerts',
            filter: `plant_id=eq.${plantId}`,
          },
          () => {
            fetchAlerts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [plantId, fetchAlerts]);

  const acknowledgeAlert = useCallback(async (alertId: string): Promise<void> => {
    const { error } = await supabase
      .from('alerts')
      .update({
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) {
      console.error('Error acknowledging alert:', error);
    }
    await fetchAlerts();
  }, [fetchAlerts]);

  const resolveAlert = useCallback(async (alertId: string): Promise<void> => {
    const { error } = await supabase
      .from('alerts')
      .update({
        is_active: false,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (error) {
      console.error('Error resolving alert:', error);
    }
    await fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    activeAlerts: alerts.filter(a => a.is_active),
    isLoading,
    fetchAlerts,
    acknowledgeAlert,
    resolveAlert,
  };
};
