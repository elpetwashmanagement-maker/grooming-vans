content = open('src/App.jsx').read()

old = """                {isOpen && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-border-tertiary)' }} onClick={e => e.stopPropagation()}>"""

new = """                {isOpen && (
                  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9997, padding: '16px' }} onClick={e => { e.stopPropagation(); if (e.target === e.currentTarget) setSelectedAppt(null); }}>
                  <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 17 }}>{appt.client?.name || 'Sin cliente'}</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{appt.timeStart}{appt.timeEnd ? ` — ${appt.timeEnd}` : ''}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setSelectedAppt(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#64748b', lineHeight: 1 }}>✕</button>
                  </div>"""

if old in content:
    content = content.replace(old, new)
    print("OK: modal de cita agregado")
else:
    print("NO ENCONTRADO")

open('src/App.jsx', 'w').write(content)