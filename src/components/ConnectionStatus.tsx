import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting?: boolean;
}

export const ConnectionStatus = ({ isConnected, isConnecting }: ConnectionStatusProps) => {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500",
      isConnected 
        ? "bg-success/10 text-success border border-success/20" 
        : "bg-muted text-muted-foreground border border-border"
    )}>
      {isConnecting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Conectando...</span>
        </>
      ) : isConnected ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Panel conectado</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Sin conexión</span>
        </>
      )}
    </div>
  );
};
