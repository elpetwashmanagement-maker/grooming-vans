// ModulesContext.jsx
// Provee los módulos activos a toda la app sin prop-drilling.
// Envuelve tu <App> con <ModulesProvider> y usa useModulesContext() en cualquier componente.

import { createContext, useContext } from 'react';
import { useModules, MODULE_KEYS } from '../hooks/useModules';

const ModulesContext = createContext(null);

export function ModulesProvider({ companyId, children }) {
  const modulesApi = useModules(companyId);

  return (
    <ModulesContext.Provider value={modulesApi}>
      {children}
    </ModulesContext.Provider>
  );
}

export function useModulesContext() {
  const ctx = useContext(ModulesContext);
  if (!ctx) throw new Error('useModulesContext must be used inside <ModulesProvider>');
  return ctx;
}

export { MODULE_KEYS };
