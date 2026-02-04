import { AlertTriangle, AlertCircle, Info, Check, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Alert, AlertSeverity } from '@/types/technician';
import { ALERT_TYPES } from '@/types/technician';

interface AlertListProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => Promise<void>;
  onResolve?: (alertId: string) => Promise<void>;
  compact?: boolean;
}

const severityConfig: Record<AlertSeverity, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  critical: { icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
  warning: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10' },
  info: { icon: Info, color: 'text-ecoBlue', bg: 'bg-ecoBlue/10' },
};

export const AlertList = ({ alerts, onAcknowledge, onResolve, compact = false }: AlertListProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const activeAlerts = alerts.filter(a => a.is_active);
  const resolvedAlerts = alerts.filter(a => !a.is_active);

  const handleAcknowledge = async (alertId: string) => {
    if (!onAcknowledge) return;
    setLoadingId(alertId);
    await onAcknowledge(alertId);
    setLoadingId(null);
  };

  const handleResolve = async (alertId: string) => {
    if (!onResolve) return;
    setLoadingId(alertId);
    await onResolve(alertId);
    setLoadingId(null);
  };

  const renderAlert = (alert: Alert) => {
    const config = severityConfig[alert.severity];
    const Icon = config.icon;
    const typeInfo = ALERT_TYPES[alert.alert_type] || ALERT_TYPES.general;

    return (
      <div
        key={alert.id}
        className={`p-3 rounded-lg border ${
          alert.is_active 
            ? `${config.bg} border-${alert.severity === 'critical' ? 'danger' : 'border'}/30` 
            : 'bg-muted/30 border-border/30 opacity-60'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-1.5 rounded ${config.bg}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-foreground">
                {alert.title}
              </span>
              <Badge 
                variant={alert.severity === 'critical' ? 'destructive' : 'outline'}
                className="text-xs"
              >
                {typeInfo.label}
              </Badge>
            </div>
            
            {alert.message && (
              <p className="text-xs text-muted-foreground mt-1">
                {alert.message}
              </p>
            )}
            
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(alert.started_at).toLocaleString('es-MX', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              
              {alert.acknowledged_at && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Check className="w-3 h-3" />
                  Reconocida
                </Badge>
              )}
            </div>
          </div>

          {alert.is_active && !compact && (
            <div className="flex flex-col gap-1">
              {!alert.acknowledged_at && onAcknowledge && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => handleAcknowledge(alert.id)}
                  disabled={loadingId === alert.id}
                >
                  Reconocer
                </Button>
              )}
              {onResolve && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => handleResolve(alert.id)}
                  disabled={loadingId === alert.id}
                >
                  Resolver
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {activeAlerts.slice(0, 3).map(renderAlert)}
        {activeAlerts.length > 3 && (
          <p className="text-xs text-muted-foreground text-center">
            +{activeAlerts.length - 3} alertas más
          </p>
        )}
      </div>
    );
  }

  return (
    <Card className="border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
            <CardTitle className="flex items-center justify-between text-base font-medium">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                Alertas
                {activeAlerts.length > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {activeAlerts.length}
                  </Badge>
                )}
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-2">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Check className="w-8 h-8 mx-auto mb-2 text-success" />
                Sin alertas activas
              </div>
            ) : (
              activeAlerts.map(renderAlert)
            )}

            {resolvedAlerts.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
                  Ver {resolvedAlerts.length} alertas resueltas
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {resolvedAlerts.slice(0, 5).map(renderAlert)}
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
