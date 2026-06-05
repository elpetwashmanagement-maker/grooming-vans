content = open('src/App.jsx').read()

old = "onClick={() => setExpandedAppt(expandedAppt === appt.id ? null : appt.id)}"
new = "onClick={() => setSelectedAppt(selectedAppt === appt.id ? null : appt.id)}"

if old in content:
    content = content.replace(old, new)
    print("OK: click en Week conectado al modal")
else:
    print("NO ENCONTRADO")

open('src/App.jsx', 'w').write(content)