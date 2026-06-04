content = open('src/App.jsx').read()

# Encontrar el bloque editable del admin y reemplazarlo con solo lectura
old = """                            {/* Vista admin — editable */}
                            {isAdmin && appt.status !== 'completed' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {/* Selector service principal */}
                                <div>
                                  <label style={{ ...styles.lbl, fontSize: 10 }}>Service principal</label>
                                  <select defaultValue={ap.service}"""

new = """                            {/* Vista admin — solo lectura (editar via Edit pets & prices) */}
                            {isAdmin && appt.status !== 'completed' && (
                              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '1px solid #f1f5f9' }}>
                                {(ap.service || '').split(' + ').map((name, i) => {
                                  const isBase = i === 0;
                                  return (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: isBase ? 13 : 12, color: isBase ? '#0f172a' : '#64748b', marginBottom: 3 }}>
                                      <span>{isBase ? '✂️ ' : '+ '}{name}</span>
                                    </div>
                                  );
                                })}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: '#0f766e', paddingTop: 6, borderTop: '1px solid #e2e8f0', marginTop: 4 }}>
                                  <span>TOTAL</span>
                                  <span>${(ap.amount || 0).toFixed(2)}</span>
                                </div>
                              </div>
                            )}
                            {/* PLACEHOLDER_END */}
                            {isAdmin && appt.status !== 'completed' && false && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div>
                                  <label style={{ ...styles.lbl, fontSize: 10 }}>Service principal</label>
                                  <select defaultValue={ap.service}"""

if old in content:
    content = content.replace(old, new)
    print("OK: primera parte reemplazada")
else:
    print("NO ENCONTRADO: primera parte")
    # Buscar variacion
    idx = content.find("Vista admin — editable")
    if idx >= 0:
        print(f"Encontrado 'Vista admin — editable' en posicion {idx}")
        print(repr(content[idx-100:idx+200]))

open('src/App.jsx', 'w').write(content)