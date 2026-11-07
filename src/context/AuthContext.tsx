import { useApp } from './AppContext';

/**
 * Hook de conveniencia para acceder al estado de autenticación y sesión administrativa.
 * Facilita la interoperabilidad y desacoplamiento del módulo de autenticación.
 */
export const useAuth = () => {
  const {
    isAuthenticated,
    currentUser,
    adminRole,
    activeAdminUser,
    login,
    logout,
    setAdminRole,
  } = useApp();

  return {
    isAuthenticated,
    currentUser,
    adminRole,
    activeAdminUser,
    login,
    logout,
    setAdminRole,
  };
};

export { useApp };
