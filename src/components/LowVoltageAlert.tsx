import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useEcoSounds } from '@/hooks/useEcoSounds';

interface LowVoltageAlertProps {
  voltage: number;
  isVisible: boolean;
  onDismiss: () => void;
}

export const LowVoltageAlert = ({ voltage, isVisible, onDismiss }: LowVoltageAlertProps) => {
  const { playAlertSound } = useEcoSounds();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative bg-card border border-danger/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_hsl(var(--danger)/0.25)] animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="p-4 rounded-full bg-danger/10 mb-5">
            <AlertTriangle className="w-12 h-12 text-danger" />
          </div>
          
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Bajo Voltaje Detectado
          </h2>
          
          <p className="text-muted-foreground text-sm mb-5">
            El panel solar está generando menos energía de lo esperado
          </p>
          
          <div className="bg-danger/5 rounded-xl px-6 py-4 border border-danger/20">
            <span className="text-danger text-3xl font-light">
              {voltage.toFixed(1)}
            </span>
            <span className="text-danger/60 text-lg ml-1">V</span>
            <p className="text-danger/50 text-xs mt-1">Mínimo recomendado: 50V</p>
          </div>
          
          <button
            onClick={onDismiss}
            className="mt-6 px-8 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl text-foreground text-sm font-medium transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
