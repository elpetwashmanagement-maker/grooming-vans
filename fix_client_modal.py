content = open('src/App.jsx').read()

old = """        <div style={{ ...styles.card, marginBottom: 16, border: '1px solid var(--color-border-warning)' }}>
          <h3 style={{ ...styles.cardH3, color: 'var(--color-text-warning)' }}>Client nuevo</h3>"""

new = """        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px',
        }} onClick={e => { if (e.target === e.currentTarget) setShowNewClient(false); }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto', padding: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ ...styles.cardH3, margin: 0 }}>👤 Client nuevo</h3>
            <button onClick={() => setShowNewClient(false)} style={styles.iconBtn}><X size={16} /></button>
          </div>"""

if old in content:
    content = content.replace(old, new)
    print("OK")
else:
    print("NO ENCONTRADO")

open('src/App.jsx', 'w').write(content)