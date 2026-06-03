// useModules.js
// Carga los módulos activos para la empresa desde Supabase.
// Úsalo en App.jsx al iniciar sesión y pásalo por contexto.

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Módulos disponibles en el sistema
export const MODULE_KEYS = {
  // CORE — siempre activos
  SCHEDULING:    'scheduling',
  DAILY_RECORD:  'daily_record',

  // PRO
  GPS_ROUTES:    'gps_routes',
  REMINDERS:     'reminders',
  INVOICING:     'invoicing',

  // BUSINESS
  MULTI_COMPANY: 'multi_company',
  PAYROLL:       'payroll',
  FINANCES:      'finances',

  // ENTERPRISE
  BOARDING:      'boarding',
  INVENTORY:     'inventory',
  SQUARE:        'square',
  AUDIT:         'audit',
  BOOKING_PORTAL:'booking_portal',
};

// Módulos que SIEMPRE están activos (no se pueden desactivar)
const CORE_MODULES = new Set([
  MODULE_KEYS.SCHEDULING,
  MODULE_KEYS.DAILY_RECORD,
]);

export function useModules(companyId) {
  const [modules, setModules] = useState(() => {
    // Mientras carga, los CORE ya están disponibles
    const initial = {};
    Object.values(MODULE_KEYS).forEach(key => {
      initial[key] = CORE_MODULES.has(key);
    });
    return initial;
  });
  const [loading, setLoading] = useState(true);

  const loadModules = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('module, active')
        .eq('company_id', companyId);

      if (error) throw error;

      const loaded = {};

      // CORE siempre activo
      Object.values(MODULE_KEYS).forEach(key => {
        loaded[key] = CORE_MODULES.has(key);
      });

      // Aplicar flags de la base de datos
      (data || []).forEach(({ module, active }) => {
        if (module in MODULE_KEYS || Object.values(MODULE_KEYS).includes(module)) {
          loaded[module] = CORE_MODULES.has(module) ? true : active;
        }
      });

      setModules(loaded);
    } catch (err) {
      console.error('Error loading feature flags:', err);
      // En caso de error, mantener solo CORE activos
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  /**
   * Verifica si un módulo está activo.
   * @param {string} moduleKey - Una de MODULE_KEYS
   * @returns {boolean}
   */
  const isEnabled = useCallback((moduleKey) => {
    return modules[moduleKey] === true;
  }, [modules]);

  /**
   * Verifica si TODOS los módulos de la lista están activos.
   * @param {string[]} moduleKeys
   * @returns {boolean}
   */
  const allEnabled = useCallback((moduleKeys) => {
    return moduleKeys.every(k => modules[k] === true);
  }, [modules]);

  /**
   * Verifica si AL MENOS UNO de los módulos está activo.
   * @param {string[]} moduleKeys
   * @returns {boolean}
   */
  const anyEnabled = useCallback((moduleKeys) => {
    return moduleKeys.some(k => modules[k] === true);
  }, [modules]);

  return { modules, isEnabled, allEnabled, anyEnabled, loading, reload: loadModules };
}
