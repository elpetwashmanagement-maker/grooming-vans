// src/components/CombosAdmin.jsx
// Panel editable de Blades y Combos con colores reales
// Se agrega en Settings → Tools & Combos

import { useState } from 'react';
import { supabase } from '../lib/supabase';

// Colores reales de los snap-on combs (formato de la app)
export const DEFAULT_COMBOS = [
  { id: 'combo-5',  label: '#5 (1/8")',   mm: '3mm',   color: '#dc2626', textColor: '#fff', name: 'Rojo' },
  { id: 'combo-4',  label: '#4 (1/4")',   mm: '6mm',   color: '#eab308', textColor: '#000', name: 'Amarillo' },
  { id: 'combo-2',  label: '#2 (3/8")',   mm: '10mm',  color: '#0ea5e9', textColor: '#fff', name: 'Azul claro' },
  { id: 'combo-1',  label: '#1 (1/2")',   mm: '13mm',  color: '#16a34a', textColor: '#fff', name: 'Verde' },
  { id: 'combo-0',  label: '#0 (5/8")',   mm: '16mm',  color: '#ea580c', textColor: '#fff', name: 'Naranja' },
  { id: 'combo-a',  label: '#A (3/4")',   mm: '19mm',  color: '#4c1d95', textColor: '#fff', name: 'Morado oscuro' },
  { id: 'combo-c',  label: '#C (7/8")',   mm: '22mm',  color: '#991b1b', textColor: '#fff', name: 'Rojo oscuro' },
  { id: 'combo-e',  label: '#E (1")',     mm: '25mm',  color: '#0f172a', textColor: '#fff', name: 'Azul/Negro' },
];

export const DEFAULT_BLADES = [
  { id: 'blade-3f',  label: '#3F',  mm: '13mm',   color: '#64748b', textColor: '#fff' },
  { id: 'blade-4f',  label: '#4F',  mm: '9.5mm',  color: '#64748b', textColor: '#fff' },
  { id: 'blade-5f',  label: '#5F',  mm: '6.3mm',  color: '#64748b', textColor: '#fff' },
  { id: 'blade-7f',  label: '#7F',  mm: '3.2mm',  color: '#475569', textColor: '#fff' },
  { id: 'blade-10',  label: '#10',  mm: '1.6mm',  color: '#334155', textColor: '#fff' },
  { id: 'blade-15',  label: '#15',  mm: '1.2mm',  color: '#1e293b', textColor: '#fff' },
  { id: 'blade-30',  label: '#30',  mm: '0.5mm',  color: '#0f172a', textColor: '#fff' },
  { id: 'blade-40',  label: '#40',  mm: '0.25mm', color: '#020617', textColor: '#fff' },
  { id: 'blade-50',  label: '#50',  mm: '0.2mm',  color: '#000',    textColor: '#fff' },
];

// Chip visual de combo/blade — úsalo en la ficha también
export function ComboChip({ label, color, textColor, mm, size = 'md' }) {
  const sizes = {
    sm: { padding: '2px 8px', fontSize: 11, borderRadius: 6 },
    md: { padding: '4px 12px', fontSize: 13, borderRadius: 8 },
    lg: { padding: '8px 16px', fontSize: 15, borderRadius: 10 },
  };
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: color, color: textColor,
      fontWeight: 700, ...sizes[size],
      border: '2px solid rgba(255,255,255,0.2)',
    }}>
      <span>{label}</span>
      {mm && <span style={{ opacity: 0.75, fontWeight: 400, fontSize: sizes[size].fontSize - 2 }}>{mm}</span>}
    </div>
  );
}

export function CombosAdmin() {
  const [combos, setCombos] = useState(DEFAULT_COMBOS);
  const [blades, setBlades] = useState(DEFAULT_BLADES);
  const [editingCombo, setEditingCombo] = useState(null);
  const [activeTab, setActiveTab] = useState('combos');

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['combos', 'blades'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '8px 20px', borderRadius: 8, border: '1.5px solid',
            borderColor: activeTab === t ? '#0f766e' : '#e2e8f0',
            background: activeTab === t ? '#f0fdfa' : '#fff',
            color: activeTab === t ? '#0f766e' : '#64748b',
            fontWeight: activeTab === t ? 700 : 400,
            cursor: 'pointer', fontSize: 14, textTransform: 'capitalize',
          }}>
            {t === 'combos' ? '🎨 Combos (Guardas)' : '⚙️ Blades'}
          </button>
        ))}
      </div>

      {/* Combos */}
      {activeTab === 'combos' && (
        <div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
            Colores estándar de peine guardas. El groomer ve estos colores en la ficha.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {combos.map(combo => (
              <div key={combo.id} style={{
                border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#fafafa',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ComboChip label={combo.label} color={combo.color} textColor={combo.textColor} mm={combo.mm} size="md" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{combo.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{combo.mm}</div>
                  </div>
                </div>
                <button onClick={() => setEditingCombo(combo)} style={{
                  background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
                  padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: '#64748b',
                }}>
                  Edit
                </button>
              </div>
            ))}
          </div>

          {/* Modal edición combo */}
          {editingCombo && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
            }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: 320 }}>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>
                  Edit Combo {editingCombo.label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Nombre</label>
                    <input value={editingCombo.name}
                      onChange={e => setEditingCombo(c => ({...c, name: e.target.value}))}
                      style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Medida</label>
                    <input value={editingCombo.mm}
                      onChange={e => setEditingCombo(c => ({...c, mm: e.target.value}))}
                      style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="color" value={editingCombo.color}
                        onChange={e => setEditingCombo(c => ({...c, color: e.target.value}))}
                        style={{ width: 48, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer' }} />
                      <ComboChip label={editingCombo.label} color={editingCombo.color} textColor={editingCombo.textColor} mm={editingCombo.mm} size="md" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => {
                      setCombos(prev => prev.map(c => c.id === editingCombo.id ? editingCombo : c));
                      setEditingCombo(null);
                    }} style={{ flex: 1, padding: '10px', background: '#0f766e', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                      Guardar
                    </button>
                    <button onClick={() => setEditingCombo(null)}
                      style={{ padding: '10px 16px', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Blades */}
      {activeTab === 'blades' && (
        <div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
            Blades de corte estándar. Solo el número — el groomer los conoce.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {blades.map(blade => (
              <ComboChip key={blade.id} label={blade.label} color={blade.color} textColor={blade.textColor} mm={blade.mm} size="lg" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}