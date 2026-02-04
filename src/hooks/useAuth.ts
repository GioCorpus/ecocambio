import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Technician, AppRole, TechnicianPreferences } from '@/types/technician';

interface AuthState {
  user: User | null;
  session: Session | null;
  technician: Technician | null;
  roles: AppRole[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    technician: null,
    roles: [],
    isLoading: true,
    isAuthenticated: false,
  });

  const fetchTechnicianProfile = useCallback(async (userId: string) => {
    try {
      const [profileResult, rolesResult] = await Promise.all([
        supabase
          .from('technicians')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId),
      ]);

      // Map the profile data with proper type handling
      const profileData = profileResult.data;
      const technician: Technician | null = profileData ? {
        id: profileData.id,
        user_id: profileData.user_id,
        full_name: profileData.full_name,
        phone: profileData.phone ?? undefined,
        company: profileData.company ?? undefined,
        avatar_url: profileData.avatar_url ?? undefined,
        preferences: profileData.preferences 
          ? (profileData.preferences as unknown as TechnicianPreferences)
          : {
              theme: 'light',
              notifications: true,
              tariff_mxn_kwh: 2.5,
            },
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
      } : null;

      const roles = (rolesResult.data || []).map(r => r.role as AppRole);

      return { technician, roles };
    } catch (error) {
      console.error('Error fetching technician profile:', error);
      return { technician: null, roles: [] };
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { technician, roles } = await fetchTechnicianProfile(session.user.id);
          setState({
            user: session.user,
            session,
            technician,
            roles,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            session: null,
            technician: null,
            roles: [],
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { technician, roles } = await fetchTechnicianProfile(session.user.id);
        setState({
          user: session.user,
          session,
          technician,
          roles,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchTechnicianProfile]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const hasRole = (role: AppRole) => state.roles.includes(role);
  const isAdmin = () => hasRole('admin');

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
    refetchProfile: () => state.user && fetchTechnicianProfile(state.user.id),
  };
};
