import { Zap, Activity, Gauge, Sun } from 'lucide-react';
import { EcoSensorCard } from '@/components/EcoSensorCard';
import { EcoChart } from '@/components/EcoChart';
import { MonitorButton } from '@/components/MonitorButton';
import { LowVoltageAlert } from '@/components/LowVoltageAlert';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { AlertHistory } from '@/components/AlertHistory';
import { useSensorData } from '@/hooks/useSensorData';
import { useEcoSounds } from '@/hooks/useEcoSounds';
import { useVoltageAlerts } from '@/hooks/useVoltageAlerts';
import { useState, useEffect, useRef } from 'react';

const Index = () => {
  const { readings, latestReading, isLowVoltage, isConnected } = useSensorData(5000);
  const { playConnectionSound } = useEcoSounds();
  const { alerts, isLoading: alertsLoading, handleVoltageChange } = useVoltageAlerts();
  const [showAlert, setShowAlert] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const hasPlayedConnection = useRef(false);

  // Play connection sound when first connected
  useEffect(() => {
    if (isConnected && !hasPlayedConnection.current) {
      playConnectionSound();
      hasPlayedConnection.current = true;
    }
  }, [isConnected, playConnectionSound]);

  // Track voltage changes for alert history
  useEffect(() => {
    if (latestReading) {
      handleVoltageChange(latestReading.voltage, isLowVoltage);
    }
  }, [latestReading, isLowVoltage, handleVoltageChange]);

  useEffect(() => {
    if (isLowVoltage && !alertDismissed) {
      setShowAlert(true);
    }
    if (!isLowVoltage) {
      setAlertDismissed(false);
    }
  }, [isLowVoltage, alertDismissed]);

  const handleDismissAlert = () => {
    setShowAlert(false);
    setAlertDismissed(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Low voltage alert modal */}
      <LowVoltageAlert 
        voltage={latestReading?.voltage || 0}
        isVisible={showAlert}
        onDismiss={handleDismissAlert}
      />

      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-ecoTeal/5 via-transparent to-ecoBlue/5 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-ecoTeal/20 to-ecoBlue/20 border border-ecoTeal/20">
              <Sun className="w-7 h-7 text-ecoTeal" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-foreground tracking-tight">
              EcoCambio
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Monitoreo de panel solar cada 5 segundos
          </p>
          <ConnectionStatus isConnected={isConnected} isConnecting={!isConnected} />
        </header>

        {/* Sensor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <EcoSensorCard
            title="Voltaje"
            value={latestReading?.voltage || 0}
            unit="V"
            icon={<Zap className="w-5 h-5" />}
            variant="voltage"
            isAlert={isLowVoltage}
          />
          <EcoSensorCard
            title="Corriente"
            value={latestReading?.current || 0}
            unit="A"
            icon={<Activity className="w-5 h-5" />}
            variant="current"
            decimals={2}
          />
          <EcoSensorCard
            title="Potencia"
            value={latestReading?.kilowatts || 0}
            unit="kW"
            icon={<Gauge className="w-5 h-5" />}
            variant="power"
            decimals={3}
          />
        </div>

        {/* Low Voltage Warning Banner */}
        {isLowVoltage && (
          <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 flex items-center justify-center gap-3">
            <Zap className="w-5 h-5 text-danger" />
            <span className="text-danger text-sm font-medium">
              Voltaje por debajo de 50V — Verificar iluminación del panel
            </span>
          </div>
        )}

        {/* Chart */}
        <EcoChart readings={readings} />

        {/* Alert History */}
        <AlertHistory alerts={alerts} isLoading={alertsLoading} />

        {/* Monitor Button */}
        <div className="pt-2">
          <MonitorButton disabled={!isConnected} readings={readings} />
        </div>

        {/* Footer info */}
        <footer className="text-center text-muted-foreground/60 text-xs pt-4 pb-8">
          <p>
            Última lectura: {latestReading?.timestamp.toLocaleTimeString('es-ES') || 'Esperando conexión...'}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
