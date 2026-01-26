import { cn } from "@/lib/utils";

interface EcoSensorCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  variant: 'voltage' | 'current' | 'power';
  isAlert?: boolean;
  decimals?: number;
}

const variantStyles = {
  voltage: 'border-voltage/20 hover:border-voltage/40',
  current: 'border-current/20 hover:border-current/40',
  power: 'border-power/20 hover:border-power/40',
};

const variantGlow = {
  voltage: 'shadow-[0_0_25px_hsl(var(--voltage-color)/0.15)]',
  current: 'shadow-[0_0_25px_hsl(var(--current-color)/0.15)]',
  power: 'shadow-[0_0_25px_hsl(var(--power-color)/0.15)]',
};

const variantTextColor = {
  voltage: 'text-voltage',
  current: 'text-current',
  power: 'text-power',
};

const variantIconBg = {
  voltage: 'bg-voltage/10',
  current: 'bg-current/10',
  power: 'bg-power/10',
};

export const EcoSensorCard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  variant, 
  isAlert,
  decimals = 1 
}: EcoSensorCardProps) => {
  return (
    <div
      className={cn(
        "relative bg-card/80 backdrop-blur-sm rounded-2xl p-6 border",
        "transition-all duration-500 ease-out",
        "hover:bg-card",
        variantStyles[variant],
        variantGlow[variant],
        isAlert && "animate-pulse-danger border-danger/50"
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-5">
          <div className={cn(
            "p-2.5 rounded-xl transition-colors duration-300",
            variantIconBg[variant],
            variantTextColor[variant],
            isAlert && "bg-danger/10 text-danger"
          )}>
            {icon}
          </div>
          <span className="text-muted-foreground font-medium text-sm tracking-wide">
            {title}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-4xl sm:text-5xl font-light tracking-tight transition-colors duration-300",
            variantTextColor[variant],
            isAlert && "text-danger"
          )}>
            {value.toLocaleString('es-ES', { 
              minimumFractionDigits: decimals, 
              maximumFractionDigits: decimals 
            })}
          </span>
          <span className="text-lg text-muted-foreground/70 font-light">{unit}</span>
        </div>
      </div>
    </div>
  );
};
