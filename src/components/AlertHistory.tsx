import { AlertTriangle, Clock, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { VoltageAlert } from '@/hooks/useVoltageAlerts';
import { useState } from 'react';

interface AlertHistoryProps {
  alerts: VoltageAlert[];
  isLoading: boolean;
}

const formatDuration = (seconds: number | null): string => {
  if (seconds === null) return 'En curso...';
  
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};

const formatDateTime = (dateString: string): { date: string; time: string } => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    }),
    time: date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  };
};

export const AlertHistory = ({ alerts, isLoading }: AlertHistoryProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const displayedAlerts = showAll ? alerts : alerts.slice(0, 5);
  const hasMoreAlerts = alerts.length > 5;

  if (isLoading) {
    return (
      <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-danger/10">
            <AlertTriangle className="w-5 h-5 text-danger" />
          </div>
          <h2 className="text-lg font-medium text-foreground">Historial de Alertas</h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted/30 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-danger/10">
            <AlertTriangle className="w-5 h-5 text-danger" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-medium text-foreground">Historial de Alertas</h2>
            <p className="text-sm text-muted-foreground">
              {alerts.length} evento{alerts.length !== 1 ? 's' : ''} de bajo voltaje
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-5 pb-5">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No hay alertas registradas</p>
              <p className="text-sm mt-1">Las alertas aparecerán cuando el voltaje baje de 50V</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {displayedAlerts.map((alert) => {
                  const { date, time } = formatDateTime(alert.started_at);
                  
                  return (
                    <div
                      key={alert.id}
                      className={`
                        p-4 rounded-xl border transition-all
                        ${alert.is_active 
                          ? 'bg-danger/10 border-danger/30 animate-pulse' 
                          : 'bg-muted/20 border-border/30 hover:bg-muted/30'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Date & Time */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {alert.is_active && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-danger text-white rounded-full">
                                ACTIVA
                              </span>
                            )}
                            <span className="text-sm font-medium text-foreground">{date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{time}</span>
                          </div>
                        </div>

                        {/* Center: Voltage Info */}
                        <div className="text-center">
                          <div className="flex items-center gap-1.5 text-danger">
                            <Zap className="w-4 h-4" />
                            <span className="font-semibold">{alert.min_voltage}V</span>
                          </div>
                          <span className="text-xs text-muted-foreground">mín</span>
                          {alert.avg_voltage && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              ~{alert.avg_voltage}V prom
                            </div>
                          )}
                        </div>

                        {/* Right: Duration */}
                        <div className="text-right">
                          <div className={`
                            font-semibold 
                            ${alert.is_active ? 'text-danger' : 'text-foreground'}
                          `}>
                            {formatDuration(alert.duration_seconds)}
                          </div>
                          <span className="text-xs text-muted-foreground">duración</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Show More Button */}
              {hasMoreAlerts && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full mt-3 py-2 text-sm text-ecoTeal hover:text-ecoBlue transition-colors"
                >
                  {showAll ? 'Mostrar menos' : `Ver ${alerts.length - 5} más`}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
