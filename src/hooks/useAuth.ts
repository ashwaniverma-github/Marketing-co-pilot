import { useMemo } from 'react';
import { signOut, useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  const authState = useMemo(() => {
    return {
      user: session?.user ?? null,
      isLoading: status === 'loading',
      isAuthenticated: status === 'authenticated',
    };
  }, [session, status]);

  const logout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return {
    ...authState,
    checkAuth: () => {},
    logout,
  };
}
