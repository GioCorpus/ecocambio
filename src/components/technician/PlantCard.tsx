import { Sun, Zap, TrendingUp, AlertTriangle, MapPin, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Plant, PlantSummary } from '@/types/technician';

interface PlantCardProps {
  plant: Plant;
  summary?: Partial<PlantSummary>;
  onClick: () => void;
}

export const PlantCard = ({ plant, summary, onClick }: PlantCardProps) => {
  const alertCount = summary?.active_alerts?.length || 0;
  const hasCriticalAlerts = summary?.active_alerts?.some(a => a.severity === 'critical');

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:border-ecoTeal/40 hover:shadow-lg hover:shadow-ecoTeal/10 ${
        hasCriticalAlerts ? 'border-danger/50 animate-pulse-danger' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-ecoTeal/10">
                <Sun className="w-4 h-4 text-ecoTeal" />
              </div>
              <h3 className="font-medium text-foreground truncate">
                {plant.name}
              </h3>
            </div>

            {plant.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{plant.location}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              {summary?.total_power_kw !== undefined && (
                <div className="flex items-center gap-1 text-xs">
                  <Zap className="w-3 h-3 text-voltage" />
                  <span className="text-foreground font-medium">
                    {summary.total_power_kw.toFixed(1)} kW
                  </span>
                </div>
              )}
              
              {summary?.energy_today_kwh !== undefined && (
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-foreground font-medium">
                    {summary.energy_today_kwh.toFixed(1)} kWh hoy
                  </span>
                </div>
              )}

              {plant.capacity_kw && (
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  {plant.capacity_kw} kW instalados
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {alertCount > 0 && (
              <Badge 
                variant={hasCriticalAlerts ? 'destructive' : 'outline'} 
                className="gap-1"
              >
                <AlertTriangle className="w-3 h-3" />
                {alertCount}
              </Badge>
            )}
            
            {summary?.inverters_total !== undefined && (
              <span className="text-xs text-muted-foreground">
                {summary.inverters_online}/{summary.inverters_total} online
              </span>
            )}

            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-ecoTeal transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
