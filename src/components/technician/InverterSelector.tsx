import { useState } from 'react';
import { Plus, Wifi, Server, Key, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { BRAND_CONFIGS, type InverterBrand } from '@/types/technician';
import { toast } from '@/hooks/use-toast';

interface InverterSelectorProps {
  onAdd: (inverter: {
    brand: InverterBrand;
    model?: string;
    serial_number?: string;
    rated_power_kw?: number;
    api_url?: string;
    api_credentials?: Record<string, string>;
  }) => Promise<{ error?: Error | null }>;
}

export const InverterSelector = ({ onAdd }: InverterSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [brand, setBrand] = useState<InverterBrand | ''>('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [ratedPower, setRatedPower] = useState('');
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  const selectedBrandConfig = brand ? BRAND_CONFIGS[brand] : null;

  const handleCredentialChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand) return;

    setIsLoading(true);

    const result = await onAdd({
      brand,
      model: model || undefined,
      serial_number: serialNumber || undefined,
      rated_power_kw: ratedPower ? parseFloat(ratedPower) : undefined,
      api_credentials: Object.keys(credentials).length > 0 ? credentials : undefined,
    });

    if (result.error) {
      toast({
        title: 'Error al agregar inversor',
        description: result.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Inversor agregado',
        description: `${BRAND_CONFIGS[brand].name} conectado exitosamente`,
      });
      // Vibration feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
      }
      setIsOpen(false);
      resetForm();
    }

    setIsLoading(false);
  };

  const resetForm = () => {
    setBrand('');
    setModel('');
    setSerialNumber('');
    setRatedPower('');
    setCredentials({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-ecoTeal to-ecoBlue">
          <Plus className="w-4 h-4" />
          Agregar Inversor
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-ecoTeal" />
            Nuevo Inversor
          </DialogTitle>
          <DialogDescription>
            Configura la conexión a la API cloud del inversor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Marca del inversor</Label>
            <Select value={brand} onValueChange={(v) => setBrand(v as InverterBrand)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar marca..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BRAND_CONFIGS).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: config.color }}
                      />
                      {config.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBrandConfig && (
            <>
              <Card className="bg-muted/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Wifi className="w-4 h-4 text-ecoBlue" />
                    <span className="text-muted-foreground">
                      Conexión vía: <span className="text-foreground">{selectedBrandConfig.cloudApi}</span>
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    placeholder="ej. Symo 10.0"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="power">Potencia (kW)</Label>
                  <Input
                    id="power"
                    type="number"
                    step="0.1"
                    placeholder="ej. 10.0"
                    value={ratedPower}
                    onChange={(e) => setRatedPower(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial">Número de serie</Label>
                <Input
                  id="serial"
                  placeholder="S/N del inversor"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                />
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Key className="w-4 h-4 text-warning" />
                  <Label className="text-sm font-medium">Credenciales Cloud</Label>
                </div>

                <div className="space-y-3">
                  {selectedBrandConfig.requiresCredentials.includes('username') && (
                    <div className="space-y-2">
                      <Label htmlFor="username">Usuario</Label>
                      <Input
                        id="username"
                        placeholder="usuario@email.com"
                        value={credentials.username || ''}
                        onChange={(e) => handleCredentialChange('username', e.target.value)}
                      />
                    </div>
                  )}

                  {selectedBrandConfig.requiresCredentials.includes('password') && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={credentials.password || ''}
                          onChange={(e) => handleCredentialChange('password', e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedBrandConfig.requiresCredentials.includes('api_key') && (
                    <div className="space-y-2">
                      <Label htmlFor="api_key">API Key</Label>
                      <Input
                        id="api_key"
                        placeholder="Tu API Key"
                        value={credentials.api_key || ''}
                        onChange={(e) => handleCredentialChange('api_key', e.target.value)}
                      />
                    </div>
                  )}

                  {selectedBrandConfig.requiresCredentials.includes('site_id') && (
                    <div className="space-y-2">
                      <Label htmlFor="site_id">Site ID / Plant ID</Label>
                      <Input
                        id="site_id"
                        placeholder="ID de la instalación"
                        value={credentials.site_id || ''}
                        onChange={(e) => handleCredentialChange('site_id', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-ecoTeal to-ecoBlue"
              disabled={!brand || isLoading}
            >
              {isLoading ? 'Conectando...' : 'Agregar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
