content = open('src/App.jsx').read()

old = """                    {editingPets === appt.id && (
                      <div style={{ marginTop: 14, padding: '14px', background: '#f0fdfa', borderRadius: 12, border: '1.5px solid #0f766e' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f766e', marginBottom: 12 }}>✏️ Edit pets & prices</div>"""

new = """                    {editingPets === appt.id && (
                      <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999, padding: '16px',
                      }} onClick={e => { if (e.target === e.currentTarget) setEditingPets(null); }}>
                      <div style={{
                        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500,
                        maxHeight: '90vh', overflowY: 'auto', padding: 24,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>✏️ Edit pets & prices</div>
                          <button onClick={() => setEditingPets(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>✕</button>
                        </div>"""

if old in content:
    content = content.replace(old, new)
    print("OK: editingPets convertido a modal")
else:
    print("NO ENCONTRADO")

open('src/App.jsx', 'w').write(content)