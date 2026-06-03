// src/components/ModulesAdmin.jsx
// Panel de admin para activar/desactivar módulos por empresa
// Se agrega dentro de ConfigTab como una sección más

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ALL_MODULES = [
  // CORE — no se pueden desactivar
  { key: 'scheduling',     label: 'Agenda & Citas',         icon: '📅', plan: 'Core',       core: true },
  { key: 'daily_record',   label: 'Registro Diario',        icon: '📋', plan: 'Core',       core: true },
  // PRO
  { key: 'gps_routes',     label: 'GPS & Rutas',            icon: '🗺️',  plan: 'Pro',        core: false },
  { key: 'reminders',      label: 'Recordatorios SMS',      icon: '💬', plan: 'Pro',        core: false },
  { key: 'invoicing',      label: 'Facturación',            icon: '🧾', plan: 'Pro',        core: false },
  // BUSINESS
  { key: 'multi_company',  label: 'Multi-Empresa',          icon: '🏢', plan: 'Business',   core: false },
  { key: 'payroll',        label: 'Nómina & Comisiones',    icon: '💵', plan: 'Business',   core: false },
  { key: 'finances',       label: 'Finanzas & P&L',         icon: '📊', plan: 'Business',   core: false },
  // ENTERPRISE
  { key: 'boarding',       label: 'Boarding',               icon: '🏠', plan: 'Enterprise', core: false },
  { key: 'inventory',      label: 'Inventario',             icon: '📦', plan: 'Enterprise', core: false },
  { key: 'square',         label: 'Pagos Square',           icon: '💳', plan: 'Enterprise', core: false },
  { key: 'audit',          label: 'Auditoría',              icon: '🔍', plan: 'Enterprise', core: false },
  { key: 'booking_portal', label: 'Portal de Reservas',     icon: '🌐', plan: 'Enterprise', core: false },
];

const PLAN_COLORS = {
  Core:       { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  Pro:        { bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd' },
  Business:   { bg: '#fdf4ff', color: '#7e22ce', border: '#d8b4fe' },
  Enterprise: { bg: '#fff7ed', color: '#c2410c', border: '#fdba74' },
};

export function ModulesAdmin({ companies }) {
  const [selectedCompany, setSelectedCompany] = useState(companies?.[0]?.id || 'epw');
  const [flags, setFlags] = useState({});
  const [saving, setSaving] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlags();
  }, [selectedCompany]);

  async function loadFlags() {
    setLoading(true);
    const { data } = await supabase
      .from('feature_flags')
      .select('module, active')
      .eq('company_id', selectedCompany);

    const map = {};
    (data || []).forEach(({ module, active }) => { map[module] = active; });
    setFlags(map);
    setLoading(false);
  }

  async function toggle(moduleKey, currentValue) {
    if (ALL_MODULES.find(m => m.key === moduleKey)?.core) return; // no tocar CORE
    setSaving(moduleKey);
    const newValue = !currentValue;

    const { error } = await supabase
      .from('feature_flags')
      .upsert(
        { company_id: selectedCompany, module: moduleKey, active: newValue, activated_at: newValue ? new Date().toISOString() : null },
        { onConflict: 'company_id,module' }
      );

    if (!error) {
      setFlags(prev => ({ ...prev, [moduleKey]: newValue }));
    }
    setSaving(null);
  }

  const company = companies?.find(c => c.id === selectedCompany);

  return (
    <div>
      {/* Selector de empresa */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(companies || []).map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCompany(c.id)}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1.5px solid',
              borderColor: selectedCompany === c.id ? '#0f766e' : '#e2e8f0',
              background: selectedCompany === c.id ? '#f0fdfa' : '#fff',
              color: selectedCompany === c.id ? '#0f766e' : '#64748b',
              fontWeight: selectedCompany === c.id ? 700 : 400,
              cursor: 'pointer', fontSize: 14,
            }}
          >
            {c.logoEmoji || '🏢'} {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Cargando módulos...</div>
      ) : (
        <div>
          {/* Agrupar por plan */}
          {['Core', 'Pro', 'Business', 'Enterprise'].map(plan => {
            const planModules = ALL_MODULES.filter(m => m.plan === plan);
            const colors = PLAN_COLORS[plan];
            return (
              <div key={plan} style={{ marginBottom: 20 }}>
                <div style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: 999,
                  background: colors.bg, color: colors.color,
                  border: `1px solid ${colors.border}`,
                  fontSize: 11, fontWeight: 700, marginBottom: 10,
                  textTransform: 'uppercase', letterSpacing: '0.08em'
                }}>
                  {plan === 'Core' ? '🔵' : plan === 'Pro' ? '🟡' : plan === 'Business' ? '🟠' : '🔴'} {plan}
                </div>

                {planModules.map(mod => {
                  const isActive = mod.core ? true : (flags[mod.key] === true);
                  const isSaving = saving === mod.key;

                  return (
                    <div key={mod.key} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: 10,
                      border: '1px solid #f1f5f9', marginBottom: 6,
                      background: isActive ? '#fafffe' : '#fafafa',
                      opacity: mod.core ? 0.7 : 1,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{mod.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{mod.label}</div>
                          {mod.core && <div style={{ fontSize: 11, color: '#94a3b8' }}>Siempre activo</div>}
                        </div>
                      </div>

                      {/* Toggle switch */}
                      <button
                        onClick={() => toggle(mod.key, isActive)}
                        disabled={mod.core || isSaving}
                        style={{
                          width: 44, height: 24, borderRadius: 12, border: 'none',
                          background: isActive ? '#0f766e' : '#cbd5e1',
                          cursor: mod.core ? 'not-allowed' : 'pointer',
                          position: 'relative', transition: 'background 0.2s',
                          flexShrink: 0,
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: 9, background: '#fff',
                          position: 'absolute', top: 3,
                          left: isActive ? 23 : 3,
                          transition: 'left 0.2s',
                        }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
