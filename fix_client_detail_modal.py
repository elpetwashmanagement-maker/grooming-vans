content = open('src/App.jsx').read()

# 1. Cambiar el grid a una sola columna (quitar el split panel)
old_grid = """      <div style={{ display: 'grid', gridTemplateColumns: selectedClient ? '1fr 1.5fr' : '1fr', gap: 20 }}>"""
new_grid = """      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>"""

if old_grid in content:
    content = content.replace(old_grid, new_grid)
    print("OK: grid cambiado a columna simple")
else:
    print("NO ENCONTRADO: grid")

# 2. Convertir el panel de selectedClient a modal
old_panel = """        {selectedClient && (
          <div>
            {/* Formulario editar client */}"""

new_panel = """        {selectedClient && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9998, padding: '16px',
          }} onClick={e => { if (e.target === e.currentTarget) setSelectedClient(null); }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600,
            maxHeight: '90vh', overflowY: 'auto', padding: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>👤 {selectedClient.name}</div>
              <button onClick={() => setSelectedClient(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748b' }}>✕</button>
            </div>
            {/* Formulario editar client */}"""

if old_panel in content:
    content = content.replace(old_panel, new_panel)
    print("OK: panel de cliente convertido a modal")
else:
    print("NO ENCONTRADO: panel de cliente")

open('src/App.jsx', 'w').write(content)
print("Listo")