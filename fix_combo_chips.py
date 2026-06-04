content = open('src/App.jsx').read()

old = """                      <div>
                        <label style={{ ...styles.lbl, fontSize: 10 }}>Herramienta</label>
                        <select value={groomingRecord[toolKey]} onChange={e => setGroomingRecord(r => ({...r, [toolKey]: e.target.value}))} style={{ ...styles.input, fontSize: 12 }}>
                          <option value="">Sin herramienta</option>
                          <optgroup label="Blades">
                            {BLADES.map(b => <option key={b} value={b}>Blade {b}</option>)}
                          </optgroup>
                          <optgroup label="Combos">
                            {COMBOS.map(c => <option key={c} value={c}>Combo {c}</option>)}
                          </optgroup>
                          <option value="Tijeras">✂️ Tijeras</option>
                          <option value="Tijeras curvas">✂️ Tijeras curvas</option>
                          <option value="Navaja">🪒 Navaja</option>
                        </select>
                      </div>"""

new = """                      <div>
                        <label style={{ ...styles.lbl, fontSize: 10 }}>Herramienta</label>
                        <select value={groomingRecord[toolKey]} onChange={e => setGroomingRecord(r => ({...r, [toolKey]: e.target.value}))} style={{ ...styles.input, fontSize: 12 }}>
                          <option value="">Sin herramienta</option>
                          <optgroup label="Blades">
                            {BLADES.map(b => <option key={b} value={b}>Blade {b}</option>)}
                          </optgroup>
                          <optgroup label="Combos">
                            {COMBOS.map(c => <option key={c} value={c}>Combo {c}</option>)}
                          </optgroup>
                          <option value="Tijeras">✂️ Tijeras</option>
                          <option value="Tijeras curvas">✂️ Tijeras curvas</option>
                          <option value="Navaja">🪒 Navaja</option>
                        </select>
                        {(() => {
                          const val = groomingRecord[toolKey];
                          if (!val) return null;
                          const comboNum = val.match(/^#?(\\d+)$/)?.[1];
                          const combo = comboNum ? DEFAULT_COMBOS.find(c => c.number === comboNum) : null;
                          const blade = DEFAULT_BLADES.find(b => b.label === val || b.label === '#' + val.replace('#',''));
                          if (combo) return <div style={{ marginTop: 4 }}><ComboChip label={combo.label} color={combo.color} textColor={combo.textColor} mm={combo.mm} size="sm" /></div>;
                          if (blade) return <div style={{ marginTop: 4 }}><ComboChip label={blade.label} color={blade.color} textColor={blade.textColor} mm={blade.mm} size="sm" /></div>;
                          return null;
                        })()}
                      </div>"""

if old in content:
    content = content.replace(old, new)
    print("OK: chips agregados")
else:
    print("NO ENCONTRADO")

open('src/App.jsx', 'w').write(content)