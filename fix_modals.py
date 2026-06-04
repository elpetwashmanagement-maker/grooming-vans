content = open('src/App.jsx').read()

# 1. showNewAppt → modal real
old_appt = """      {showNewAppt && !isGroomer && (
        <div style={{ ...styles.card, marginBottom: 20, border: '1px solid var(--color-border-info)', background: 'var(--color-background-info)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ ...styles.cardH3, margin: 0, color: 'var(--color-text-info)' }}>📅 New Appointment</h3>
            <button onClick={() => setShowNewAppt(false)} style={styles.iconBtn}><X size={16} /></button>
          </div>"""

new_appt = """      {showNewAppt && !isGroomer && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px',
        }} onClick={e => { if (e.target === e.currentTarget) setShowNewAppt(false); }}>
        <div style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600,
          maxHeight: '90vh', overflowY: 'auto', padding: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ ...styles.cardH3, margin: 0 }}>📅 New Appointment</h3>
            <button onClick={() => setShowNewAppt(false)} style={styles.iconBtn}><X size={16} /></button>
          </div>"""

if old_appt in content:
    content = content.replace(old_appt, new_appt)
    print("OK: showNewAppt convertido a modal")
else:
    print("NO ENCONTRADO: showNewAppt")

# 2. showNewClient → modal real
old_client = """      {showNewClient && (
        <div style={{ ...styles.card, marginBottom: 16, border: '1px solid var(--color-border-warning)' }}>
          <h3 style={{ ...styles.cardH3, color: 'var(--color-text-warning)' }}>Client nuevo</h3>"""

new_client = """      {showNewClient && (
        <div style={{
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

if old_client in content:
    content = content.replace(old_client, new_client)
    print("OK: showNewClient convertido a modal")
else:
    print("NO ENCONTRADO: showNewClient")

open('src/App.jsx', 'w').write(content)
print("Listo")