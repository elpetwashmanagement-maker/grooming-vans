content = open('src/App.jsx').read()

content = content.replace(
    "{ id: 'modules', icon: '🧩', label: 'Modules', desc: 'Activar modulos por empresa' },",
    "{ id: 'modules', icon: '🧩', label: 'Modules', desc: 'Activar modulos por empresa' },\n    { id: 'tools', icon: '✂️', label: 'Blades y Combos', desc: 'Colores y medidas de blades y guardas' },"
)

content = content.replace(
    "    modules: <ModulesAdmin companies={companies} />,",
    "    modules: <ModulesAdmin companies={companies} />,\n    tools: <CombosAdmin />,"
)

open('src/App.jsx', 'w').write(content)
print("Listo")