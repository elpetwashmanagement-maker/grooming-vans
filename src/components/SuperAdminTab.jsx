import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lpzwnbrjpayjhlwjmuda.supabase.co",
  "sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT"
);

export default function SuperAdminTab() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ id: '', name: '', email: '', phone: '', plan: 'basic' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadTenants(); }, []);

  const loadTenants = async () => {
    setLoading(true);
    const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    setTenants(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!form.id || !form.name || !form.email) { alert('Fill all required fields'); return; }
    setSaving(true);
    const { error } = await supabase.from('tenants').insert({
      id: form.id.toLowerCase().replace(/\s/g, '-'),
      name: form.name,
      email: form.email,
      phone: form.phone,
      plan: form.plan,
      status: 'active',
    });
    if (!error) {
      await loadTenants();
      setShowAddForm(false);
      setForm({ id: '', name: '', email: '', phone: '', plan: 'basic' });
      alert('✅ Tenant created!');
    } else {
      alert('Error: ' + error.message);
    }
    setSaving(false);
  };

  const toggleStatus = async (tenant) => {
    const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
    await supabase.from('tenants').update({ status: newStatus }).eq('id', tenant.id);
    await loadTenants();
  };

  const planColors = { basic: '#0284c7', pro: '#7c3aed', enterprise: '#0f766e' };
  const statusColors = { active: '#0f766e', suspended: '#dc2626', trial: '#f59e0b' };

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: '0 auto', paddingBottom: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 800 }}>🏨 Hotel Raykota</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>Super Admin — All Tenants</div>
        </div>
        <button onClick={() => setShowAddForm(true)}
          style={{ background: '#0f766e', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
          ➕ New Tenant
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Tenants', value: tenants.length, icon: '🏢' },
          { label: 'Active', value: tenants.filter(t => t.status === 'active').length, icon: '✅' },
          { label: 'MRR', value: `$${tenants.filter(t => t.status === 'active').length * 99}`, icon: '💰' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 24 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div style={{ background: '#fff', borderRadius: 14, border: '2px solid #0f766e', padding: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>➕ New Tenant</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            {[
              { label: 'ID (slug) *', key: 'id', placeholder: 'ej: miami-paws' },
              { label: 'Company Name *', key: 'name', placeholder: 'Miami Paws Grooming' },
              { label: 'Email *', key: 'email', placeholder: 'owner@company.com' },
              { label: 'Phone', key: 'phone', placeholder: '+1 305...' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3, fontWeight: 600, textTransform: 'uppercase' }}>{f.label}</label>
                <input value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 3, fontWeight: 600, textTransform: 'uppercase' }}>Plan</label>
              <select value={form.plan} onChange={e => setForm(p => ({...p, plan: e.target.value}))}
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                <option value="basic">Basic — $49/mes</option>
                <option value="pro">Pro — $99/mes</option>
                <option value="enterprise">Enterprise — $149/mes</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: 10, background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            <button onClick={handleAdd} disabled={saving} style={{ flex: 2, padding: 10, background: '#0f766e', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
              {saving ? 'Creating...' : '✅ Create Tenant'}
            </button>
          </div>
        </div>
      )}

      {/* Tenants List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading...</div>
      ) : tenants.map(t => (
        <div key={t.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 16, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>ID: {t.id} · {t.email}</div>
              {t.phone && <div style={{ fontSize: 12, color: '#64748b' }}>📱 {t.phone}</div>}
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                Creado: {new Date(t.created_at).toLocaleDateString()}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <span style={{ background: planColors[t.plan] || '#64748b', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                {t.plan}
              </span>
              <span style={{ background: statusColors[t.status] + '20', color: statusColors[t.status], borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                {t.status}
              </span>
              <button onClick={() => toggleStatus(t)}
                style={{ background: 'none', border: `1px solid ${t.status === 'active' ? '#dc2626' : '#0f766e'}`, borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 11, color: t.status === 'active' ? '#dc2626' : '#0f766e', fontWeight: 600 }}>
                {t.status === 'active' ? '⏸ Suspend' : '▶ Activate'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
