import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { SensorReading } from '@/hooks/useSensorData';

interface EcoChartProps {
  readings: SensorReading[];
}

export const EcoChart = ({ readings }: EcoChartProps) => {
  const chartData = readings.map((reading, index) => ({
    name: reading.timestamp.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }),
    voltaje: reading.voltage,
    corriente: reading.current,
    potencia: reading.kilowatts,
    index,
  }));

  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
      <h3 className="text-lg font-medium text-foreground/90 mb-6 flex items-center gap-3">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-ecoTeal animate-breathe" />
          <div className="w-1.5 h-1.5 rounded-full bg-ecoBlue animate-breathe" style={{ animationDelay: '0.5s' }} />
        </div>
        Panel Solar — Tiempo Real
      </h3>
      
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="voltageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--voltage-color))" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="hsl(var(--voltage-color))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--current-color))" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="hsl(var(--current-color))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--power-color))" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="hsl(var(--power-color))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                color: 'hsl(var(--foreground))',
                boxShadow: '0 10px 40px -10px hsl(var(--eco-teal) / 0.2)'
              }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '8px' }}
              formatter={(value: number, name: string) => {
                if (name === 'potencia') return [`${value.toFixed(3)} kW`, 'Potencia'];
                if (name === 'voltaje') return [`${value.toFixed(1)} V`, 'Voltaje'];
                if (name === 'corriente') return [`${value.toFixed(2)} A`, 'Corriente'];
                return [value, name];
              }}
            />
            <Legend 
              formatter={(value) => {
                if (value === 'voltaje') return 'Voltaje (V)';
                if (value === 'corriente') return 'Corriente (A)';
                if (value === 'potencia') return 'Potencia (kW)';
                return value;
              }}
              wrapperStyle={{ paddingTop: '20px' }}
            />
            <Area 
              type="monotone" 
              dataKey="potencia" 
              stroke="hsl(var(--power-color))" 
              strokeWidth={2.5}
              fill="url(#powerGradient)"
              dot={false}
              activeDot={{ r: 5, fill: 'hsl(var(--power-color))', strokeWidth: 0 }}
            />
            <Area 
              type="monotone" 
              dataKey="voltaje" 
              stroke="hsl(var(--voltage-color))" 
              strokeWidth={2}
              fill="url(#voltageGradient)"
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--voltage-color))', strokeWidth: 0 }}
            />
            <Area 
              type="monotone" 
              dataKey="corriente" 
              stroke="hsl(var(--current-color))" 
              strokeWidth={2}
              fill="url(#currentGradient)"
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--current-color))', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
