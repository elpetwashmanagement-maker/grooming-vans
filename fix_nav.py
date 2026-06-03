content = open('src/App.jsx').read()

replacements = [
    (
        "{ id: 'inventory',      label: 'Inventory',     icon: '📦', show: !isViewer },",
        "{ id: 'inventory',      label: 'Inventory',     icon: '📦', show: !isViewer && isEnabled('inventory') },"
    ),
    (
        "{ id: 'boarding',       label: 'Boarding',      icon: '🏠', show: isAdmin || isManager },",
        "{ id: 'boarding',       label: 'Boarding',      icon: '🏠', show: (isAdmin || isManager) && isEnabled('boarding') },"
    ),
    (
        "{ id: 'van-tracker',    label: 'Van Tracker',   icon: '📍', show: isAdmin || isManager },",
        "{ id: 'van-tracker',    label: 'Van Tracker',   icon: '📍', show: (isAdmin || isManager) && isEnabled('gps_routes') },"
    ),
    (
        "{ id: 'payroll',        label: 'Payroll',       icon: '💸', show: isAdmin || isViewer },",
        "{ id: 'payroll',        label: 'Payroll',       icon: '💸', show: (isAdmin || isViewer) && isEnabled('payroll') },"
    ),
    (
        "{ id: 'auditoria',      label: 'Audit Log',     icon: '🔍', show: isAdmin },",
        "{ id: 'auditoria',      label: 'Audit Log',     icon: '🔍', show: isAdmin && isEnabled('audit') },"
    ),
]

for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        print(f"OK: {old[:40]}...")
    else:
        print(f"NO ENCONTRADO: {old[:40]}...")

open('src/App.jsx', 'w').write(content)
print("Listo")