content = open('src/App.jsx').read()

# 1. Reemplazar el array de sections con categorias
old_sections = """  const sections = [
    { id: 'companies', icon: '🏢', label: 'Companies & Teams', desc: 'Vans, groomers, companys' },
    { id: 'users', icon: '👥', label: 'Users & Access', desc: 'Admin, managers, permisos' },
    { id: 'fees', icon: '💰', label: 'Fees & Rates', desc: 'Comisión, card fee, gas fee, tax' },
    { id: 'services', icon: '🐾', label: 'Services & Prices', desc: 'Prices por size y tipo' },
    { id: 'categories', icon: '📂', label: 'Expense Categories', desc: 'Categorys de gastos' },
    { id: 'documents', icon: '📄', label: 'Documents', desc: 'Agreement, footer de invoice' },
    { id: 'preferences', icon: '🎨', label: 'Preferences', desc: 'Idioma, formato de fecha' },
    { id: 'security', icon: '🔐', label: 'Security', desc: 'Contraseña, sesión' },
    { id: 'modules', icon: '🧩', label: 'Modules', desc: 'Activar modulos por empresa' },
    { id: 'tools', icon: '✂️', label: 'Blades y Combos', desc: 'Colores y medidas de blades y guardas' },
    { id: 'raykota_pay', icon: '💳', label: 'Raykota Pay', desc: 'Métodos de pago, Square, tips, card fee' },
  ];"""

new_sections = """  const SECTION_GROUPS = [
    {
      category: 'Basic Settings',
      items: [
        { id: 'companies', icon: '🏢', label: 'Companies & Teams' },
        { id: 'users', icon: '👥', label: 'Users & Access' },
        { id: 'services', icon: '🐾', label: 'Services & Prices' },
        { id: 'categories', icon: '📂', label: 'Expense Categories' },
        { id: 'tools', icon: '✂️', label: 'Blades & Combos' },
        { id: 'documents', icon: '📄', label: 'Documents' },
        { id: 'preferences', icon: '🎨', label: 'Preferences' },
        { id: 'security', icon: '🔐', label: 'Security' },
      ],
    },
    {
      category: 'Payment Settings',
      items: [
        { id: 'raykota_pay', icon: '💳', label: 'Raykota Pay' },
        { id: 'fees', icon: '💰', label: 'Fees & Rates' },
      ],
    },
    {
      category: 'Advanced',
      items: [
        { id: 'modules', icon: '🧩', label: 'Modules' },
      ],
    },
  ];
  const sections = SECTION_GROUPS.flatMap(g => g.items);"""

if old_sections in content:
    content = content.replace(old_sections, new_sections)
    print("OK: sections con categorias")
else:
    print("NO ENCONTRADO: sections")

# 2. Reemplazar el render de sections para usar categorias
old_render = """      {!section ? (
        <div>
          {sections.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)} style={sectionBtnStyle(s.id)}>
              <span style={{ fontSize: 24, width: 36, textAlign: 'center' }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{s.label}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.desc}</div>
              </div>
              <span style={{ color: '#94a3b8', fontSize: 20 }}>›</span>
            </button>
          ))}
        </div>"""

new_render = """      {!section ? (
        <div>
          {SECTION_GROUPS.map(group => (
            <div key={group.category} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>
                {group.category}
              </div>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                {group.items.map((s, idx) => (
                  <button key={s.id} onClick={() => setSection(s.id)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', background: 'none', border: 'none',
                    borderBottom: idx < group.items.length - 1 ? '1px solid #f1f5f9' : 'none',
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{s.icon}</span>
                    <div style={{ flex: 1, fontWeight: 600, fontSize: 15, color: '#0f172a' }}>{s.label}</div>
                    <span style={{ color: '#c0c9d4', fontSize: 18 }}>›</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>"""

if old_render in content:
    content = content.replace(old_render, new_render)
    print("OK: render con categorias")
else:
    print("NO ENCONTRADO: render")

open('src/App.jsx', 'w').write(content)
print("Listo")