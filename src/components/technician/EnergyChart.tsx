import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface DailyEnergy {
  date: string;
  energy_kwh: number;
  savings_mxn: number;
}

interface EnergyChartProps {
  dailyData: DailyEnergy[];
  title?: string;
}

export const EnergyChart = ({ dailyData, title = 'Energía Generada (últimos 7 días)' }: EnergyChartProps) => {
  const chartData = dailyData.map((d) => ({
    day: new Date(d.date).toLocaleDateString('es-MX', { weekday: 'short' }),
    energy: d.energy_kwh,
    savings: d.savings_mxn,
  }));

  const totalEnergy = dailyData.reduce((sum, d) => sum + d.energy_kwh, 0);
  const totalSavings = dailyData.reduce((sum, d) => sum + d.savings_mxn, 0);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <TrendingUp className="w-4 h-4 text-success" />
            {title}
          </CardTitle>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {totalEnergy.toFixed(1)} kWh
            </p>
            <p className="text-xs text-success">
              ${totalSavings.toFixed(0)} MXN ahorrados
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-40 sm:h-48">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="day" 
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
                  formatter={(value: number, name: string) => [
                    name === 'energy' 
                      ? `${value.toFixed(1)} kWh` 
                      : `$${value.toFixed(0)} MXN`,
                    name === 'energy' ? 'Energía' : 'Ahorro'
                  ]}
                />
                <Bar
                  dataKey="energy"
                  fill="hsl(var(--eco-blue))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Sin datos de energía disponibles
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
