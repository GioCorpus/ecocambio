import { useEffect, useState } from 'react';
import { ArrowLeft, Sun, Zap, TrendingUp, DollarSign, Thermometer, Battery, Server, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PowerChart } from './PowerChart';
import { EnergyChart } from './EnergyChart';
import { AlertList } from './AlertList';
import { InverterSelector } from './InverterSelector';
import { usePlants, useInverters, useReadings, useAlerts } from '@/hooks/usePlants';
import type { PlantSummary } from '@/types/technician';
import { BRAND_CONFIGS } from '@/types/technician';

interface PlantDashboardProps {
  plantId: string;
  onBack: () => void;
}

export const PlantDashboard = ({ plantId, onBack }: PlantDashboardProps) => {
  const { getPlantWithDetails } = usePlants();
  const { inverters, addInverter } = useInverters(plantId);
  const { readings, isLoading: readingsLoading } = useReadings(plantId);
  const { alerts, acknowledgeAlert, resolveAlert } = useAlerts(plantId);

  const [summary, setSummary] = useState<PlantSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await getPlantWithDetails(plantId);
      setSummary(data);
      setIsLoading(false);
    };
    fetchData();
  }, [plantId, getPlantWithDetails]);

  // Update summary when readings change
  useEffect(() => {
    if (readings.length > 0 && summary) {
      const latestByInverter = new Map();
      for (const reading of readings) {
        if (!latestByInverter.has(reading.inverter_id)) {
          latestByInverter.set(reading.inverter_id, reading);
        }
      }

      let totalPower = 0;
      let energyToday = 0;
      for (const reading of latestByInverter.values()) {
        totalPower += reading.power_kw || 0;
        energyToday += reading.energy_today_kwh || 0;
      }

      setSummary(prev => prev ? {
        ...prev,
        total_power_kw: totalPower,
        energy_today_kwh: energyToday,
        savings_today_mxn: energyToday * prev.plant.tariff_mxn_kwh,
      } : null);
    }
  }, [readings, summary?.plant.tariff_mxn_kwh]);

  // Generate mock daily data for demo
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const energy = 20 + Math.random() * 30;
    return {
      date: date.toISOString().split('T')[0],
      energy_kwh: energy,
      savings_mxn: energy * (summary?.plant.tariff_mxn_kwh || 2.5),
    };
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Planta no encontrada
      </div>
    );
  }

  const { plant } = summary;
  const latestReading = readings[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-medium text-foreground flex items-center gap-2">
                <Sun className="w-4 h-4 text-ecoTeal" />
                {plant.name}
              </h1>
              {plant.location && (
                <p className="text-xs text-muted-foreground">{plant.location}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Zap className="w-3.5 h-3.5 text-voltage" />
                Potencia Actual
              </div>
              <p className="text-2xl font-light text-foreground">
                {summary.total_power_kw.toFixed(1)}
                <span className="text-sm text-muted-foreground ml-1">kW</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-success" />
                Energía Hoy
              </div>
              <p className="text-2xl font-light text-foreground">
                {summary.energy_today_kwh.toFixed(1)}
                <span className="text-sm text-muted-foreground ml-1">kWh</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <DollarSign className="w-3.5 h-3.5 text-warning" />
                Ahorro Hoy
              </div>
              <p className="text-2xl font-light text-foreground">
                ${summary.savings_today_mxn.toFixed(0)}
                <span className="text-sm text-muted-foreground ml-1">MXN</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Server className="w-3.5 h-3.5 text-ecoBlue" />
                Inversores
              </div>
              <p className="text-2xl font-light text-foreground">
                {summary.inverters_online}
                <span className="text-sm text-muted-foreground">/{summary.inverters_total}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Optional metrics */}
        {latestReading && (latestReading.temperature_c || latestReading.battery_soc) && (
          <div className="flex gap-3">
            {latestReading.temperature_c && (
              <Card className="flex-1 border-border/50">
                <CardContent className="p-3 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-warning" />
                  <span className="text-sm">{latestReading.temperature_c.toFixed(1)}°C</span>
                </CardContent>
              </Card>
            )}
            {latestReading.battery_soc && (
              <Card className="flex-1 border-border/50">
                <CardContent className="p-3 flex items-center gap-2">
                  <Battery className="w-4 h-4 text-success" />
                  <span className="text-sm">{latestReading.battery_soc.toFixed(0)}% SOC</span>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Power Chart */}
        <PowerChart readings={readings} />

        {/* Energy Chart */}
        <EnergyChart dailyData={dailyData} />

        {/* Alerts */}
        <AlertList 
          alerts={alerts}
          onAcknowledge={acknowledgeAlert}
          onResolve={resolveAlert}
        />

        {/* Inverters */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Server className="w-4 h-4 text-ecoBlue" />
                Inversores ({inverters.length})
              </h3>
              <InverterSelector onAdd={addInverter} />
            </div>

            {inverters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No hay inversores configurados
              </div>
            ) : (
              <div className="space-y-2">
                {inverters.map((inv) => {
                  const brandConfig = BRAND_CONFIGS[inv.brand];
                  const invReading = readings.find(r => r.inverter_id === inv.id);

                  return (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: brandConfig.color }}
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {brandConfig.name} {inv.model || ''}
                          </p>
                          {inv.serial_number && (
                            <p className="text-xs text-muted-foreground">
                              S/N: {inv.serial_number}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {invReading && (
                          <span className="text-sm text-foreground">
                            {invReading.power_kw?.toFixed(1) || 0} kW
                          </span>
                        )}
                        <Badge
                          variant={inv.status === 'online' ? 'default' : 'secondary'}
                          className={inv.status === 'online' ? 'bg-success' : ''}
                        >
                          {inv.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground py-4">
          <p>
            Última actualización:{' '}
            {latestReading
              ? new Date(latestReading.recorded_at).toLocaleString('es-MX')
              : 'Sin datos'}
          </p>
          <p className="mt-1">
            Tarifa: ${plant.tariff_mxn_kwh.toFixed(2)} MXN/kWh
          </p>
        </footer>
      </div>
    </div>
  );
};
