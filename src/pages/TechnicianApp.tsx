import { useAuthContext } from '@/contexts/AuthContext';
import { AuthPage } from '@/components/technician/AuthPage';
import { TechnicianHome } from '@/components/technician/TechnicianHome';
import { Skeleton } from '@/components/ui/skeleton';
import { Sun } from 'lucide-react';

const TechnicianApp = () => {
  const { isLoading, isAuthenticated } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-ecoTeal/20 to-ecoBlue/20 border border-ecoTeal/20 w-fit mx-auto animate-pulse">
            <Sun className="w-8 h-8 text-ecoTeal" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <TechnicianHome />;
};

export default TechnicianApp;
