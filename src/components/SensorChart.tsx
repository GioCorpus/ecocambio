import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { SensorReading } from '@/hooks/useSensorData';

interface SensorChartProps {
  readings: SensorReading[];
}

export const SensorChart = ({ readings }: SensorChartProps) => {
  const chartData = readings.map((reading, index) => ({
    name: reading.timestamp.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }),
    voltage: reading.voltage,
    current: reading.current,
    watts: reading.watts / 10, // Scale down for better visualization
    index,
  }));

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-[0_0_40px_hsl(var(--electric-glow)/0.1)]">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-electric animate-pulse" />
        Gráfico en Tiempo Real
      </h3>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                color: 'hsl(var(--foreground))'
              }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
              formatter={(value: number, name: string) => {
                if (name === 'watts') return [`${(value * 10).toFixed(1)} W`, 'Potencia'];
                if (name === 'voltage') return [`${value.toFixed(1)} V`, 'Voltaje'];
                if (name === 'current') return [`${value.toFixed(2)} A`, 'Corriente'];
                return [value, name];
              }}
            />
            <Legend 
              formatter={(value) => {
                if (value === 'voltage') return 'Voltaje (V)';
                if (value === 'current') return 'Corriente (A)';
                if (value === 'watts') return 'Potencia (×10W)';
                return value;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="voltage" 
              stroke="hsl(var(--voltage-color))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--voltage-color))', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--voltage-color))' }}
            />
            <Line 
              type="monotone" 
              dataKey="current" 
              stroke="hsl(var(--current-color))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--current-color))', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--current-color))' }}
            />
            <Line 
              type="monotone" 
              dataKey="watts" 
              stroke="hsl(var(--watts-color))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--watts-color))', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--watts-color))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
