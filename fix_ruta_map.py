content = open('src/App.jsx').read()

# Encontrar inicio y fin del bloque viewMode === 'ruta'
start_marker = "      {viewMode === 'ruta' && ("
end_marker = "      {viewMode === 'recurrentes'"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print(f"NO ENCONTRADO: start={start_idx}, end={end_idx}")
else:
    old_block = content[start_idx:end_idx]
    new_block = """      {viewMode === 'ruta' && (
        <RouteMapView
          appointments={appointments}
          vans={visibleVans}
          date={date}
          setDate={setDate}
          isGroomer={isGroomer}
          myVanId={myVanId}
          session={session}
          setSelectedAppt={setSelectedAppt}
          setViewMode={setViewMode}
        />
      )}
      """
    content = content[:start_idx] + new_block + content[end_idx:]
    print(f"OK: vista ruta reemplazada ({len(old_block)} chars -> {len(new_block)} chars)")

open('src/App.jsx', 'w').write(content)