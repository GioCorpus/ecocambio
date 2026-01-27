import { Bell, BellOff, BellRing } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export const NotificationToggle = () => {
  const { isSupported, isEnabled, permission, requestPermission } = usePushNotifications();

  const handleToggle = async () => {
    if (!isSupported) {
      toast.error('Tu navegador no soporta notificaciones push');
      return;
    }

    if (permission === 'denied') {
      toast.error('Las notificaciones están bloqueadas. Habilítalas en la configuración del navegador.');
      return;
    }

    if (!isEnabled) {
      const granted = await requestPermission();
      if (granted) {
        toast.success('¡Notificaciones activadas! Te avisaremos cuando haya bajo voltaje.');
      } else {
        toast.error('No se pudo activar las notificaciones');
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3">
      <div className="p-2 rounded-lg bg-secondary">
        {isEnabled ? (
          <BellRing className="w-4 h-4 text-ecoTeal" />
        ) : permission === 'denied' ? (
          <BellOff className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Bell className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          Notificaciones Push
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {isEnabled 
            ? 'Recibirás alertas de bajo voltaje' 
            : permission === 'denied'
            ? 'Bloqueadas en navegador'
            : 'Activa para recibir alertas'}
        </p>
      </div>
      
      <Switch
        checked={isEnabled}
        onCheckedChange={handleToggle}
        disabled={permission === 'denied'}
        className="data-[state=checked]:bg-ecoTeal"
      />
    </div>
  );
};
