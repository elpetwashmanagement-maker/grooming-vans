content = open('src/App.jsx').read()

OVERLAY = """style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px',
        }}"""

CARD = """style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto', padding: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}"""

# 1. showEditClient
old1 = """            {showEditClient && editingClient?.id === selectedClient.id ? (
              <div style={{ ...styles.card, border: '1px solid var(--color-border-warning)', background: 'var(--color-background-warning)', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ ...styles.cardH3, margin: 0 }}>✏️ Edit client</h3>
                  <button onClick={() => { setShowEditClient(false); setEditingClient(null); }} style={styles.iconBtn}><X size={16} /></button>
                </div>"""

new1 = """            {showEditClient && editingClient?.id === selectedClient.id ? (
              <div """ + OVERLAY + """ onClick={e => { if (e.target === e.currentTarget) { setShowEditClient(false); setEditingClient(null); } }}>
              <div """ + CARD + """>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ ...styles.cardH3, margin: 0 }}>✏️ Edit client</h3>
                  <button onClick={() => { setShowEditClient(false); setEditingClient(null); }} style={styles.iconBtn}><X size={16} /></button>
                </div>"""

if old1 in content:
    content = content.replace(old1, new1)
    print("OK: showEditClient convertido")
else:
    print("NO ENCONTRADO: showEditClient")

# 2. showEditPet
old2 = """            {showEditPet && editingPet && (
              <div style={{ ...styles.card, border: '1px solid var(--color-border-warning)', background: 'var(--color-background-warning)', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ ...styles.cardH3, margin: 0 }}>✏️ Edit pet — {editingPet.name}</h3>
                  <button onClick={() => { setShowEditPet(false); setEditingPet(null); }} style={styles.iconBtn}><X size={16} /></button>
                </div>"""

new2 = """            {showEditPet && editingPet && (
              <div """ + OVERLAY + """ onClick={e => { if (e.target === e.currentTarget) { setShowEditPet(false); setEditingPet(null); } }}>
              <div """ + CARD + """>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ ...styles.cardH3, margin: 0 }}>✏️ Edit pet — {editingPet.name}</h3>
                  <button onClick={() => { setShowEditPet(false); setEditingPet(null); }} style={styles.iconBtn}><X size={16} /></button>
                </div>"""

if old2 in content:
    content = content.replace(old2, new2)
    print("OK: showEditPet convertido")
else:
    print("NO ENCONTRADO: showEditPet")

# 3. showNewPetForm
old3 = """              {showNewPetForm && (
                <div style={{ padding: '12px', background: '#f0fdfa', borderRadius: 10, border: '1px solid #ccfbf1', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f766e', marginBottom: 10 }}>➕ New Pet</div>"""

new3 = """              {showNewPetForm && (
                <div """ + OVERLAY + """ onClick={e => { if (e.target === e.currentTarget) setShowNewPetForm(false); }}>
                <div """ + CARD + """>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>➕ New Pet</div>
                    <button onClick={() => setShowNewPetForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>✕</button>
                  </div>"""

if old3 in content:
    content = content.replace(old3, new3)
    print("OK: showNewPetForm convertido")
else:
    print("NO ENCONTRADO: showNewPetForm")

open('src/App.jsx', 'w').write(content)
print("Listo")