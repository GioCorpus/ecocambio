import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FusionSolarStation {
  stationCode: string;
  stationName: string;
  stationAddr: string;
  capacity: number;
}

interface TestConnectionResult {
  success: boolean;
  stations?: FusionSolarStation[];
  message?: string;
  error?: string;
}

interface SyncResult {
  success: boolean;
  readings_count?: number;
  message?: string;
  error?: string;
}

export function useFusionSolar() {
  const [isLoading, setIsLoading] = useState(false);
  const [stations, setStations] = useState<FusionSolarStation[]>([]);

  const testConnection = async (
    username: string,
    password: string,
    region: string = 'eu5'
  ): Promise<TestConnectionResult> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('fusionsolar-sync', {
        body: {
          action: 'test_connection',
          credentials: { username, password },
          region,
        },
      });

      if (error) throw error;

      if (data.success) {
        setStations(data.stations || []);
        toast({
          title: 'Conexión exitosa',
          description: data.message,
        });
      } else {
        toast({
          title: 'Error de conexión',
          description: data.error,
          variant: 'destructive',
        });
      }

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const syncReadings = async (
    inverterId: string,
    stationCode?: string,
    region: string = 'eu5'
  ): Promise<SyncResult> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('fusionsolar-sync', {
        body: {
          action: 'sync_readings',
          inverterId,
          stationCode,
          region,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Sincronización completada',
          description: data.message,
        });
      } else {
        toast({
          title: 'Error de sincronización',
          description: data.error,
          variant: 'destructive',
        });
      }

      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const getStations = async (
    username: string,
    password: string,
    region: string = 'eu5'
  ): Promise<FusionSolarStation[]> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('fusionsolar-sync', {
        body: {
          action: 'get_stations',
          credentials: { username, password },
          region,
        },
      });

      if (error) throw error;

      if (data.success) {
        setStations(data.stations || []);
        return data.stations || [];
      }

      return [];
    } catch (error) {
      console.error('Error getting stations:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    stations,
    testConnection,
    syncReadings,
    getStations,
  };
}
