import { Cloud, Upload } from 'lucide-react';
import { useClickSound } from '@/hooks/useClickSound';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface CloudButtonProps {
  onSend?: () => void;
}

export const CloudButton = ({ onSend }: CloudButtonProps) => {
  const { playSuccessSound } = useClickSound();
  const [isSending, setIsSending] = useState(false);

  const handleClick = () => {
    playSuccessSound();
    setIsSending(true);
    
    // Simulate sending data
    setTimeout(() => {
      setIsSending(false);
      toast({
        title: "✅ Datos enviados",
        description: "Los datos del sensor se han enviado a la nube correctamente.",
      });
      onSend?.();
    }, 1500);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isSending}
      className={`
        relative w-full py-6 px-8 rounded-2xl
        bg-gradient-to-r from-primary via-electric to-accent
        text-primary-foreground font-bold text-xl
        transition-all duration-300 transform
        hover:scale-[1.02] hover:shadow-[0_0_50px_hsl(var(--electric-glow)/0.5)]
        active:scale-[0.98]
        disabled:opacity-70 disabled:cursor-not-allowed
        animate-pulse-glow
        overflow-hidden
        border-2 border-electric/30
      `}
    >
      {/* Animated background */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-data-flow"
        style={{ backgroundSize: '200% 100%' }}
      />
      
      <div className="relative flex items-center justify-center gap-4">
        {isSending ? (
          <>
            <Upload className="w-8 h-8 animate-bounce" />
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <Cloud className="w-8 h-8" />
            <span>Envío datos a la nube</span>
          </>
        )}
      </div>
    </button>
  );
};
