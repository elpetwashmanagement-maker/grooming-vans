import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const MODULE_KEYS = {
  SCHEDULING:    'scheduling',
  DAILY_RECORD:  'daily_record',
  EPW:           'epw',
  ATW:           'atw',
  GPS_ROUTES:    'gps_routes',
  REMINDERS:     'reminders',
  INVOICING:     'invoicing',
  MULTI_COMPANY: 'multi_company',
  PAYROLL:       'payroll',
  FINANCES:      'finances',
  BOARDING:      'boarding',
  INVENTORY:     'inventory',
  SQUARE:        'square',
  AUDIT:         'audit',
  BOOKING_PORTAL:'booking_portal',
};

const CORE_MODULES = new Set(['scheduling', 'daily_record']);

export function useModules(companyId) {
  const [modules, setModules] = useState(() => {
    const initial = {};
    Object.values(MODULE_KEYS).forEach(key => {
      initial[key] = CORE_MODULES.has(key);
    });
    initial['epw'] = true;
    initial['atw'] = true;
    initial['boarding'] = true;
    return initial;
  });
  const [loading, setLoading] = useState(true);

  const loadModules = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('module, active, company_id');
      if (error) throw error;
      const loaded = {};
      Object.values(MODULE_KEYS).forEach(key => {
        loaded[key] = CORE_MODULES.has(key);
      });
      loaded['epw'] = true;
      loaded['atw'] = true;
      loaded['boarding'] = true;
      // Primero aplicar flags no-global
      (data || []).filter(f => f.company_id !== 'global').forEach(({ module, active }) => {
        if (Object.values(MODULE_KEYS).includes(module)) {
          loaded[module] = CORE_MODULES.has(module) ? true : active;
        }
      });
      // Luego aplicar flags global (tienen prioridad)
      (data || []).filter(f => f.company_id === 'global').forEach(({ module, active }) => {
        if (Object.values(MODULE_KEYS).includes(module)) {
          loaded[module] = CORE_MODULES.has(module) ? true : active;
        }
      });
      setModules(loaded);
    } catch (err) {
      console.error('Error loading feature flags:', err);
      const allEnabled = {};
      Object.values(MODULE_KEYS).forEach(key => { allEnabled[key] = true; });
      setModules(allEnabled);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const isEnabled = useCallback((moduleKey) => {
    return modules[moduleKey] === true;
  }, [modules]);

  const allEnabled = useCallback((moduleKeys) => {
    return moduleKeys.every(k => modules[k] === true);
  }, [modules]);

  const anyEnabled = useCallback((moduleKeys) => {
    return moduleKeys.some(k => modules[k] === true);
  }, [modules]);

  return { modules, isEnabled, allEnabled, anyEnabled, loading, reload: loadModules };
}
