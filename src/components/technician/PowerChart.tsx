import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import type { Reading } from '@/types/technician';

interface PowerChartProps {
  readings: Reading[];
  title?: string;
}

export const PowerChart = ({ readings, title = 'Potencia en Tiempo Real' }: PowerChartProps) => {
  // Prepare data for chart (reverse to show oldest first)
  const chartData = [...readings]
    .reverse()
    .slice(-30)
    .map((reading) => ({
      time: new Date(reading.recorded_at).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      power: reading.power_kw || 0,
      energy: reading.energy_today_kwh || 0,
    }));

  const maxPower = Math.max(...chartData.map(d => d.power), 1);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Activity className="w-4 h-4 text-ecoTeal" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 sm:h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--eco-teal))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--eco-teal))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, Math.ceil(maxPower * 1.1)]}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`${value.toFixed(2)} kW`, 'Potencia']}
                />
                <Area
                  type="monotone"
                  dataKey="power"
                  stroke="hsl(var(--eco-teal))"
                  strokeWidth={2}
                  fill="url(#powerGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'hsl(var(--eco-teal))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Esperando datos de potencia...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
