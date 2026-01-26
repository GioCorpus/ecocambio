import { cn } from "@/lib/utils";
import { useClickSound } from "@/hooks/useClickSound";

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  variant: 'voltage' | 'current' | 'watts';
  isAlert?: boolean;
}

const variantStyles = {
  voltage: 'border-voltage/30 hover:border-voltage/60',
  current: 'border-current/30 hover:border-current/60',
  watts: 'border-watts/30 hover:border-watts/60',
};

const variantGlow = {
  voltage: 'shadow-[0_0_30px_hsl(var(--voltage-color)/0.2)]',
  current: 'shadow-[0_0_30px_hsl(var(--current-color)/0.2)]',
  watts: 'shadow-[0_0_30px_hsl(var(--watts-color)/0.2)]',
};

const variantTextColor = {
  voltage: 'text-voltage',
  current: 'text-current',
  watts: 'text-watts',
};

export const SensorCard = ({ title, value, unit, icon, variant, isAlert }: SensorCardProps) => {
  const { playClickSound } = useClickSound();

  return (
    <div
      onClick={playClickSound}
      className={cn(
        "relative bg-card rounded-2xl p-6 border-2 cursor-pointer",
        "transition-all duration-300 transform hover:scale-[1.02]",
        "animate-float",
        variantStyles[variant],
        variantGlow[variant],
        isAlert && "animate-pulse-danger border-danger"
      )}
    >
      {/* Glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-20 blur-xl -z-10",
        variant === 'voltage' && "bg-voltage",
        variant === 'current' && "bg-current",
        variant === 'watts' && "bg-watts",
        isAlert && "bg-danger"
      )} />

      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "p-3 rounded-xl bg-secondary",
          variantTextColor[variant],
          isAlert && "text-danger"
        )}>
          {icon}
        </div>
        <span className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
          {title}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={cn(
          "text-5xl font-bold tracking-tight",
          variantTextColor[variant],
          isAlert && "text-danger"
        )}>
          {value.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </span>
        <span className="text-xl text-muted-foreground font-medium">{unit}</span>
      </div>
    </div>
  );
};
