import { createContext, useContext } from 'react';

// El contexto y el hook viven aparte del componente proveedor para no romper el
// Fast Refresh de Vite: un archivo que exporta componentes no debe exportar
// tambien funciones sueltas.
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
