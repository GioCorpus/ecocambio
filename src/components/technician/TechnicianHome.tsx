import { useState } from 'react';
import { Plus, Sun, LogOut, User, Settings, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PlantCard } from './PlantCard';
import { PlantDashboard } from './PlantDashboard';
import { useAuthContext } from '@/contexts/AuthContext';
import { usePlants } from '@/hooks/usePlants';
import { toast } from '@/hooks/use-toast';

export const TechnicianHome = () => {
  const { technician, signOut } = useAuthContext();
  const { plants, isLoading, createPlant } = usePlants();
  
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingPlant, setIsAddingPlant] = useState(false);
  const [newPlant, setNewPlant] = useState({
    name: '',
    location: '',
    capacity_kw: '',
    client_name: '',
  });

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente',
    });
  };

  const handleAddPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await createPlant({
      name: newPlant.name,
      location: newPlant.location || undefined,
      capacity_kw: newPlant.capacity_kw ? parseFloat(newPlant.capacity_kw) : undefined,
      client_name: newPlant.client_name || undefined,
    });

    if (error) {
      toast({
        title: 'Error al crear planta',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Planta creada',
        description: `${newPlant.name} agregada exitosamente`,
      });
      // Vibration feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
      }
      setIsAddingPlant(false);
      setNewPlant({ name: '', location: '', capacity_kw: '', client_name: '' });
    }
  };

  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If a plant is selected, show its dashboard
  if (selectedPlantId) {
    return (
      <PlantDashboard
        plantId={selectedPlantId}
        onBack={() => setSelectedPlantId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-ecoTeal/5 via-transparent to-ecoBlue/5 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-ecoTeal/20 to-ecoBlue/20 border border-ecoTeal/20">
              <Sun className="w-5 h-5 text-ecoTeal" />
            </div>
            <div>
              <h1 className="font-medium text-foreground text-sm">
                EcoCambio Technician
              </h1>
              <p className="text-xs text-muted-foreground">
                {technician?.full_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="relative max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Search and Add */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar planta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog open={isAddingPlant} onOpenChange={setIsAddingPlant}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-ecoTeal to-ecoBlue">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nueva Planta</span>
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-ecoTeal" />
                  Nueva Instalación
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleAddPlant} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="plant-name">Nombre de la planta *</Label>
                  <Input
                    id="plant-name"
                    placeholder="ej. Casa García - Mexicali"
                    value={newPlant.name}
                    onChange={(e) => setNewPlant(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plant-location">Ubicación</Label>
                  <Input
                    id="plant-location"
                    placeholder="ej. Col. Nuevo Mexicali"
                    value={newPlant.location}
                    onChange={(e) => setNewPlant(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="plant-capacity">Capacidad (kW)</Label>
                    <Input
                      id="plant-capacity"
                      type="number"
                      step="0.1"
                      placeholder="ej. 10.5"
                      value={newPlant.capacity_kw}
                      onChange={(e) => setNewPlant(prev => ({ ...prev, capacity_kw: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plant-client">Cliente</Label>
                    <Input
                      id="plant-client"
                      placeholder="Nombre del cliente"
                      value={newPlant.client_name}
                      onChange={(e) => setNewPlant(prev => ({ ...prev, client_name: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsAddingPlant(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-ecoTeal to-ecoBlue"
                  >
                    Crear Planta
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-light text-foreground">
                {plants.length}
              </p>
              <p className="text-xs text-muted-foreground">Plantas</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-light text-success">
                {plants.filter(p => p.inverters && p.inverters.length > 0).length}
              </p>
              <p className="text-xs text-muted-foreground">Activas</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-light text-warning">
                {plants.reduce((sum, p) => sum + (p.active_alerts_count || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Alertas</p>
            </CardContent>
          </Card>
        </div>

        {/* Plants List */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Mis Plantas ({filteredPlants.length})
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="border-border/50 animate-pulse">
                  <CardContent className="p-4 h-24" />
                </Card>
              ))}
            </div>
          ) : filteredPlants.length === 0 ? (
            <Card className="border-border/50 border-dashed">
              <CardContent className="p-8 text-center">
                <Sun className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">
                  {searchQuery
                    ? 'No se encontraron plantas'
                    : 'No tienes plantas asignadas'}
                </p>
                {!searchQuery && (
                  <Button
                    variant="outline"
                    className="mt-4 gap-2"
                    onClick={() => setIsAddingPlant(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Agregar primera planta
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredPlants.map(plant => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  onClick={() => setSelectedPlantId(plant.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground py-4">
          <p>EcoCambio Technician v1.0</p>
          <p>Mexicali, Baja California</p>
        </footer>
      </div>
    </div>
  );
};
