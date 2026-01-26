import { Zap, Activity, Gauge } from 'lucide-react';
import { SensorCard } from '@/components/SensorCard';
import { SensorChart } from '@/components/SensorChart';
import { CloudButton } from '@/components/CloudButton';
import { LowVoltageAlert } from '@/components/LowVoltageAlert';
import { useSensorData } from '@/hooks/useSensorData';
import { useState, useEffect } from 'react';

const Index = () => {
  const { readings, latestReading, isLowVoltage } = useSensorData(10000);
  const [showAlert, setShowAlert] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

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
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {/* Low voltage alert modal */}
      <LowVoltageAlert 
        voltage={latestReading?.voltage || 0}
        isVisible={showAlert}
        onDismiss={handleDismissAlert}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            <span className="text-electric">⚡</span> Monitor de Energía
          </h1>
          <p className="text-muted-foreground text-lg">
            Lectura en tiempo real cada 10 segundos
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-watts animate-pulse" />
            <span>Conectado</span>
          </div>
        </header>

        {/* Sensor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SensorCard
            title="Voltaje"
            value={latestReading?.voltage || 0}
            unit="V"
            icon={<Zap className="w-6 h-6" />}
            variant="voltage"
            isAlert={isLowVoltage}
          />
          <SensorCard
            title="Corriente"
            value={latestReading?.current || 0}
            unit="A"
            icon={<Activity className="w-6 h-6" />}
            variant="current"
          />
          <SensorCard
            title="Potencia"
            value={latestReading?.watts || 0}
            unit="W"
            icon={<Gauge className="w-6 h-6" />}
            variant="watts"
          />
        </div>

        {/* Low Voltage Warning Banner */}
        {isLowVoltage && (
          <div className="bg-danger/10 border-2 border-danger/50 rounded-2xl p-4 flex items-center justify-center gap-3 animate-pulse">
            <Zap className="w-6 h-6 text-danger" />
            <span className="text-danger font-semibold">
              ¡Advertencia! Voltaje por debajo de 50V
            </span>
          </div>
        )}

        {/* Chart */}
        <SensorChart readings={readings} />

        {/* Cloud Button */}
        <div className="pt-4">
          <CloudButton />
        </div>

        {/* Footer info */}
        <footer className="text-center text-muted-foreground text-sm pb-4">
          <p>Última lectura: {latestReading?.timestamp.toLocaleTimeString('es-ES') || '--:--:--'}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
