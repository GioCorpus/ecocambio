import { Wifi, Loader2, Check } from 'lucide-react';
import { useEcoSounds } from '@/hooks/useEcoSounds';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface MonitorButtonProps {
  onSend?: () => void;
  disabled?: boolean;
}

export const MonitorButton = ({ onSend, disabled }: MonitorButtonProps) => {
  const { playSuccessSound } = useEcoSounds();
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleClick = () => {
    if (disabled || status !== 'idle') return;
    
    setStatus('sending');
    
    // Simulate sending data via WiFi
    setTimeout(() => {
      playSuccessSound();
      setStatus('success');
      toast({
        title: "Datos enviados",
        description: "Los datos se han enviado a la app EcoCambio vía Wi-Fi.",
      });
      onSend?.();
      
      // Reset after showing success
      setTimeout(() => setStatus('idle'), 2000);
    }, 1800);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || status !== 'idle'}
      className={`
        relative w-full py-5 px-8 rounded-2xl
        bg-gradient-to-r from-ecoTeal to-ecoBlue
        text-primary-foreground font-semibold text-lg
        transition-all duration-500 ease-out
        hover:shadow-[0_0_40px_hsl(var(--eco-teal)/0.35)]
        active:scale-[0.99]
        disabled:opacity-60 disabled:cursor-not-allowed
        border border-white/10
        overflow-hidden
        group
      `}
    >
      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ backgroundSize: '200% 100%' }}
      />
      
      <div className="relative flex items-center justify-center gap-3">
        {status === 'idle' && (
          <>
            <Wifi className="w-6 h-6" />
            <span>Monitorea</span>
          </>
        )}
        {status === 'sending' && (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Enviando a EcoCambio...</span>
          </>
        )}
        {status === 'success' && (
          <>
            <Check className="w-6 h-6" />
            <span>¡Enviado!</span>
          </>
        )}
      </div>
    </button>
  );
};
