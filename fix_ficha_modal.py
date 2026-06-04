content = open('src/App.jsx').read()

# 1. Convertir el contenedor de la ficha a modal real
old_container = """      {/* Modal ficha de grooming */}
      {showGroomingForm && (
        <div style={{ position: 'relative', marginTop: 20 }}>
          <div style={{ ...styles.card, border: '1px solid var(--color-border-info)' }}>"""

new_container = """      {/* Modal ficha de grooming */}
      {showGroomingForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px',
        }} onClick={e => { if (e.target === e.currentTarget) setShowGroomingForm(null); }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto',
            padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>"""

if old_container in content:
    content = content.replace(old_container, new_container)
    print("OK: contenedor convertido a modal")
else:
    print("NO ENCONTRADO: contenedor")

# 2. Agregar import de ComboChip si no existe
if 'ComboChip' not in content:
    content = content.replace(
        'import { CombosAdmin } from "./components/CombosAdmin";',
        'import { CombosAdmin, ComboChip, DEFAULT_COMBOS, DEFAULT_BLADES } from "./components/CombosAdmin";'
    )
    print("OK: import ComboChip agregado")
else:
    content = content.replace(
        'import { CombosAdmin } from "./components/CombosAdmin";',
        'import { CombosAdmin, ComboChip, DEFAULT_COMBOS, DEFAULT_BLADES } from "./components/CombosAdmin";'
    )
    print("OK: import actualizado")

open('src/App.jsx', 'w').write(content)
print("Listo")