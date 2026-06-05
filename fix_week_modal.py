content = open('src/App.jsx').read()

# Agregar modal standalone para cuando selectedAppt esta activo fuera de lista view
old = """      {viewingReceipt && (
        <div onClick={() => setViewingReceipt(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <img src={viewingReceipt} alt="Recibo" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
        </div>
      )}
    </div>
  );
}"""

new = """      {viewingReceipt && (
        <div onClick={() => setViewingReceipt(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <img src={viewingReceipt} alt="Recibo" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
        </div>
      )}
      {/* Modal standalone para vistas Week/Month/Ruta */}
      {selectedAppt && viewMode !== 'lista' && (() => {
        const appt = appointments.find(a => a.id === selectedAppt);
        if (!appt) return null;
        const sc = STATUS_COLORS[appt.status] || STATUS_COLORS.unconfirmed;
        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9997, padding: '16px',
          }} onClick={e => { if (e.target === e.currentTarget) setSelectedAppt(null); }}>
            <div style={{
              background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420,
              maxHeight: '80vh', overflowY: 'auto', padding: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>{appt.client?.name || 'Sin cliente'}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{appt.timeStart}{appt.timeEnd ? ` — ${appt.timeEnd}` : ''}</div>
                </div>
                <button onClick={() => setSelectedAppt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#64748b' }}>✕</button>
              </div>
              <div style={{ padding: '6px 10px', background: sc.bg, borderRadius: 8, display: 'inline-block', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: sc.text }}>{STATUS_LABELS[appt.status]}</span>
              </div>
              {appt.client?.address && <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>📍 {appt.client.address}</div>}
              {(appt.pets || []).length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  {appt.pets.map(ap => (
                    <div key={ap.id} style={{ fontSize: 13, marginBottom: 4 }}>
                      🐾 <strong>{ap.pet?.name}</strong> — {ap.service || 'Sin servicio'} · ${ap.amount || 0}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => { setViewMode('lista'); }} style={{
                width: '100%', padding: '10px', background: '#0f766e', border: 'none',
                borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}>
                Ver detalle completo →
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}"""

if old in content:
    content = content.replace(old, new)
    print("OK: modal standalone para Week/Month/Ruta")
else:
    print("NO ENCONTRADO")

open('src/App.jsx', 'w').write(content)