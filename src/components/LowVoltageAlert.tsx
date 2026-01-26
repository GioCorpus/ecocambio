import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useClickSound } from '@/hooks/useClickSound';

interface LowVoltageAlertProps {
  voltage: number;
  isVisible: boolean;
  onDismiss: () => void;
}

export const LowVoltageAlert = ({ voltage, isVisible, onDismiss }: LowVoltageAlertProps) => {
  const { playAlertSound, playClickSound } = useClickSound();
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (isVisible && !hasPlayed) {
      playAlertSound();
      setHasPlayed(true);
    }
    if (!isVisible) {
      setHasPlayed(false);
    }
  }, [isVisible, hasPlayed, playAlertSound]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-card border-2 border-danger rounded-2xl p-8 max-w-md w-full animate-pulse-danger shadow-[0_0_60px_hsl(var(--danger)/0.5)]">
        <button
          onClick={() => {
            playClickSound();
            onDismiss();
          }}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="p-4 rounded-full bg-danger/20 mb-4">
            <AlertTriangle className="w-16 h-16 text-danger animate-bounce" />
          </div>
          
          <h2 className="text-2xl font-bold text-danger mb-2">
            ⚠️ ¡Alerta de Bajo Voltaje!
          </h2>
          
          <p className="text-muted-foreground mb-4">
            El voltaje ha caído por debajo del umbral de seguridad
          </p>
          
          <div className="bg-danger/10 rounded-xl px-6 py-3 border border-danger/30">
            <span className="text-danger text-3xl font-bold">
              {voltage.toFixed(1)} V
            </span>
            <span className="text-danger/60 text-lg ml-2">/ 50V mínimo</span>
          </div>
          
          <button
            onClick={() => {
              playClickSound();
              onDismiss();
            }}
            className="mt-6 px-8 py-3 bg-secondary hover:bg-secondary/80 rounded-xl text-foreground font-medium transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
