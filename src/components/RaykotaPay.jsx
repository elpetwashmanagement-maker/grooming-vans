// src/components/RaykotaPay.jsx
// Sección de configuración de pagos — "Raykota Pay"
// Similar a MoeGo Pay pero para Raykota

import { useState } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_PAYMENT_METHODS = [
  { id: 'cash',          label: 'Cash',           icon: '💵', enabled: true,  editable: false },
  { id: 'check',         label: 'Check',          icon: '📝', enabled: true,  editable: false },
  { id: 'credit_card',   label: 'Credit Card',    icon: '💳', enabled: true,  editable: false },
  { id: 'zelle_epw',     label: 'Zelle EPW',      icon: '📱', enabled: true,  editable: true  },
  { id: 'zelle_atw',     label: 'Zelle ATW',      icon: '📱', enabled: true,  editable: true  },
  { id: 'venmo',         label: 'Venmo',          icon: '💙', enabled: true,  editable: true  },
  { id: 'square',        label: 'Square',         icon: '🟦', enabled: true,  editable: false },
  { id: 'zelle_custom',  label: 'Zelle Custom',   icon: '📱', enabled: false, editable: true  },
];

const SQUARE_STATUS = {
  epw: { name: 'El Pet Wash', status: 'active',  label: 'Active ✅',  color: '#16a34a', dashboardUrl: 'https://squareup.com/dashboard' },
  atw: { name: 'All Tails Wag', status: 'active', label: 'Active ✅', color: '#16a34a', dashboardUrl: 'https://squareup.com/dashboard' },
};

export function RaykotaPay({ settings, updateSettings }) {
  const [methods, setMethods] = useState(DEFAULT_PAYMENT_METHODS);
  const [editingMethod, setEditingMethod] = useState(null);
  const [cardFeePct, setCardFeePct] = useState(settings?.cardFeePct || 5.5);
  const [tipsEnabled, setTipsEnabled] = useState(settings?.tipsToGroomer !== 0);
  const [tapToPayEnabled, setTapToPayEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggleMethod = (id) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const saveSettings = async () => {
    setSaving(true);
    await updateSettings({ ...settings, cardFeePct });
    setSaving(false);
  };

  return (
    <div>
      {/* Square Status por empresa */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Raykota Pay — Square Status
        </div>
        {Object.entries(SQUARE_STATUS).map(([id, co]) => (
          <div key={id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{co.name}</div>
                <div style={{ fontSize: 12, color: co.color, marginTop: 2, fontWeight: 600 }}>{co.label}</div>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{id.toUpperCase()}</div>
            </div>
            <a
              href={co.dashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', width: '100%', padding: '10px',
                background: '#f0fdfa', border: '1.5px solid #0f766e',
                borderRadius: 8, color: '#0f766e', fontWeight: 700,
                fontSize: 13, textAlign: 'center', textDecoration: 'none',
              }}
            >
              🏦 Configure bank account → Square
            </a>
          </div>
        ))}
      </div>

      {/* Métodos de pago */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Payment Methods
        </div>
        {methods.map(method => (
          <div key={method.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', marginBottom: 8 }}>
            {editingMethod === method.id ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 20 }}>{method.icon}</span>
                <input
                  defaultValue={method.label}
                  autoFocus
                  onBlur={e => {
                    setMethods(prev => prev.map(m => m.id === method.id ? { ...m, label: e.target.value } : m));
                    setEditingMethod(null);
                  }}
                  style={{ flex: 1, padding: '6px 10px', border: '1.5px solid #0f766e', borderRadius: 8, fontSize: 14 }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{method.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{method.label}</div>
                    {method.editable && (
                      <button onClick={() => setEditingMethod(method.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#0f766e', padding: 0, marginTop: 2 }}>
                        Edit name
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleMethod(method.id)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none',
                    background: method.enabled ? '#16a34a' : '#cbd5e1',
                    cursor: 'pointer', position: 'relative', flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 9, background: '#fff',
                    position: 'absolute', top: 3,
                    left: method.enabled ? 23 : 3,
                    transition: 'left 0.2s',
                  }} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tips */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Tipping
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Collect tips</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Show tip options when processing payments</div>
            </div>
            <button
              onClick={() => setTipsEnabled(!tipsEnabled)}
              style={{
                width: 44, height: 24, borderRadius: 12, border: 'none',
                background: tipsEnabled ? '#16a34a' : '#cbd5e1',
                cursor: 'pointer', position: 'relative', flexShrink: 0,
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 9, background: '#fff',
                position: 'absolute', top: 3,
                left: tipsEnabled ? 23 : 3,
                transition: 'left 0.2s',
              }} />
            </button>
          </div>
        </div>
      </div>

      {/* Card Fee */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Card Processing Fee
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Credit card fee %</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Added to total when paying by card</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number" step="0.1" value={cardFeePct}
                onChange={e => setCardFeePct(parseFloat(e.target.value) || 0)}
                style={{ width: 70, padding: '8px 10px', border: '1.5px solid #0f766e', borderRadius: 10, fontSize: 16, fontWeight: 700, textAlign: 'center' }}
              />
              <span style={{ fontSize: 16, color: '#64748b' }}>%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tap to Pay */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Device & Hardware
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>📱 Tap to Pay on iPhone</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Accept contactless payments</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>Enabled</span>
          </div>
        </div>
      </div>

      <button onClick={saveSettings} style={{ width: '100%', padding: 14, background: '#0f766e', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
        {saving ? '...' : '✅ Save Payment Settings'}
      </button>
    </div>
  );
}
