// src/components/RouteMapView.jsx
// Vista de Ruta fullscreen con mapa interactivo estilo MoeGo

import { useEffect, useRef, useState } from 'react';

export function RouteMapView({ appointments, vans, date, setDate, isGroomer, myVanId, session, setSelectedAppt, setViewMode, updateApptStatus }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);
  const infoWindowRef = useRef(null);

  const [selectedVan, setSelectedVan] = useState(isGroomer ? myVanId : (vans.find(v => v.active !== false)?.id || vans[0]?.id));
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [optimized, setOptimized] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  // Citas del día para la van seleccionada
  const rutaAppts = appointments
    .filter(a => a.date === date && a.vanId === selectedVan && a.status !== 'cancelled')
    .sort((a, b) => (a.timeStart || '').localeCompare(b.timeStart || ''));

  const rutaVan = vans.find(v => v.id === selectedVan);

  // Stats del día
  const totalExpected = rutaAppts.reduce((s, a) => s + (a.pets || []).reduce((ss, ap) => ss + (ap.amount || 0), 0), 0);
  const totalPets = rutaAppts.reduce((s, a) => s + (a.pets || []).length, 0);

  // Navegar día
  const changeDay = (dir) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + dir);
    const tz = d.getTimezoneOffset() * 60000;
    setDate(new Date(d - tz).toISOString().slice(0, 10));
    setSelectedCard(null);
    setOptimized(false);
  };

  const formatDay = (iso) => {
    const d = new Date(iso + 'T12:00:00');
    if (iso === today) return 'Today';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const STATUS_COLORS = {
    unconfirmed: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', dot: '#f59e0b', label: 'Unconfirmed' },
    confirmed:   { bg: '#f0fdfa', border: '#6ee7b7', text: '#065f46', dot: '#10b981', label: 'Confirmed' },
    in_progress: { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', dot: '#3b82f6', label: 'In Progress' },
    completed:   { bg: '#f8fafc', border: '#cbd5e1', text: '#475569', dot: '#94a3b8', label: 'Completed' },
  };

  // Inicializar mapa
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google?.maps) return;
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 26.1224, lng: -80.1373 },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_CENTER },
        styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
      });
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: { strokeColor: '#0f766e', strokeWeight: 5, strokeOpacity: 0.8 },
      });
      directionsRendererRef.current.setMap(mapInstanceRef.current);
      infoWindowRef.current = new window.google.maps.InfoWindow();
      setMapLoaded(true);
    };
    if (window.google?.maps) { initMap(); }
    else {
      const interval = setInterval(() => { if (window.google?.maps) { clearInterval(interval); initMap(); } }, 300);
      return () => clearInterval(interval);
    }
  }, []);

  // Actualizar marcadores
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (rutaAppts.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    const geocoder = new window.google.maps.Geocoder();
    let geocoded = 0;
    const total = rutaAppts.filter(a => a.client?.address).length;

    rutaAppts.forEach((appt, idx) => {
      if (!appt.client?.address) return;
      geocoder.geocode({ address: appt.client.address }, (results, status) => {
        if (status !== 'OK' || !results[0]) { geocoded++; return; }
        const position = results[0].geometry.location;
        bounds.extend(position);

        const sc = STATUS_COLORS[appt.status] || STATUS_COLORS.unconfirmed;
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          label: { text: String(idx + 1), color: '#fff', fontWeight: 'bold', fontSize: '13px' },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 18,
            fillColor: sc.dot,
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2.5,
          },
          title: appt.client?.name || '',
          zIndex: idx + 1,
        });

        marker.addListener('click', () => {
          setSelectedCard(appt);
          if (infoWindowRef.current) infoWindowRef.current.close();
          mapInstanceRef.current.panTo(position);
        });

        markersRef.current.push(marker);
        geocoded++;

        if (geocoded === total) {
          mapInstanceRef.current.fitBounds(bounds);
        }
      });
    });

    // Trazar ruta
    const addresses = rutaAppts.filter(a => a.client?.address).map(a => a.client.address);
    if (addresses.length >= 2) {
      const ds = new window.google.maps.DirectionsService();
      ds.route({
        origin: addresses[0],
        destination: addresses[addresses.length - 1],
        waypoints: addresses.slice(1, -1).map(a => ({ location: a, stopover: true })),
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: optimized,
      }, (result, status) => {
        if (status === 'OK') directionsRendererRef.current.setDirections(result);
      });
    }
  }, [rutaAppts, mapLoaded, optimized]);

  const openMaps = (address) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
  };

  const openFullRoute = () => {
    const addresses = rutaAppts.filter(a => a.client?.address).map(a => a.client.address);
    if (addresses.length > 0) {
      window.open(`https://www.google.com/maps/dir/${addresses.map(a => encodeURIComponent(a)).join('/')}`, '_blank');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', minHeight: 550, borderRadius: 0, overflow: 'hidden', border: 'none', background: '#fff' }}>

      {/* Barra superior */}
      <div style={{ padding: '10px 14px', background: '#fff', borderBottom: '1px solid #f1f5f9', zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {/* Navegación de día */}
          <button onClick={() => changeDay(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#0f766e', padding: '0 4px' }}>‹</button>
          <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 15, color: '#0f172a' }}>
            {formatDay(date)}
          </div>
          <button onClick={() => changeDay(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#0f766e', padding: '0 4px' }}>›</button>
          {date !== today && (
            <button onClick={() => { setDate(today); setSelectedCard(null); }} style={{ fontSize: 12, color: '#0f766e', fontWeight: 700, background: '#f0fdfa', border: '1px solid #0f766e', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>
              Today
            </button>
          )}
        </div>

        {/* Stats del día */}
        {rutaAppts.length > 0 && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f766e' }}>{rutaAppts.length}</div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Appts</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f766e' }}>{totalPets}</div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Pets</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f766e' }}>${totalExpected.toFixed(0)}</div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>Expected</div>
            </div>
          </div>
        )}

        {/* Botones de acción ruta */}
        {rutaAppts.length > 0 && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setOptimized(!optimized); }} style={{
              flex: 1, padding: '8px', borderRadius: 10, border: `1.5px solid ${optimized ? '#0f766e' : '#e2e8f0'}`,
              background: optimized ? '#f0fdfa' : '#fff',
              color: optimized ? '#0f766e' : '#64748b', fontWeight: 700, fontSize: 12, cursor: 'pointer',
            }}>
              ⚡ {optimized ? 'Optimized!' : 'Optimize'}
            </button>
            <button onClick={openFullRoute} style={{
              flex: 1, padding: '8px', borderRadius: 10, border: 'none',
              background: '#1a73e8', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
            }}>
              📍 Navigate
            </button>
          </div>
        )}

        {/* Selector de van */}
        {!isGroomer && vans.filter(v => v.active !== false).length > 1 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {vans.filter(v => v.active !== false).map(v => {
              const count = appointments.filter(a => a.date === date && a.vanId === v.id && a.status !== 'cancelled').length;
              return (
                <button key={v.id} onClick={() => { setSelectedVan(v.id); setSelectedCard(null); }} style={{
                  padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 11,
                  background: selectedVan === v.id ? '#0f766e' : '#f1f5f9',
                  color: selectedVan === v.id ? '#fff' : '#64748b',
                  fontWeight: selectedVan === v.id ? 700 : 400,
                }}>
                  {v.name} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mapa */}
      <div style={{ flex: 1, position: 'relative', minHeight: 200 }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Panel inferior — cards horizontales */}
      <div style={{ background: '#fff', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
        {rutaAppts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, padding: '16px' }}>
            No appointments for {rutaVan?.name || 'this van'}
          </div>
        ) : selectedCard ? (
          /* Vista detalle de cita seleccionada */
          <div style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{selectedCard.client?.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  ⏰ {selectedCard.timeStart}{selectedCard.timeEnd ? ` → ${selectedCard.timeEnd}` : ''}
                  {' · '}
                  <span style={{ color: STATUS_COLORS[selectedCard.status]?.dot || '#94a3b8', fontWeight: 600 }}>
                    {STATUS_COLORS[selectedCard.status]?.label || selectedCard.status}
                  </span>
                </div>
                {selectedCard.client?.address && (
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>📍 {selectedCard.client.address}</div>
                )}
              </div>
              <button onClick={() => setSelectedCard(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}>✕</button>
            </div>
            {(selectedCard.pets || []).length > 0 && (
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                {selectedCard.pets.map(ap => `🐾 ${ap.pet?.name || ''} — ${ap.service || ''}`).join(' · ')}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              {selectedCard.client?.phone && !isGroomer && (
                <a href={`tel:${selectedCard.client.phone}`} style={{
                  flex: 1, padding: '10px 8px', background: '#f0fdfa', border: '1.5px solid #0f766e',
                  borderRadius: 10, color: '#0f766e', fontWeight: 700, fontSize: 13, textAlign: 'center', textDecoration: 'none',
                }}>📞 Contact</a>
              )}
              {selectedCard.client?.address && (
                <button onClick={() => openMaps(selectedCard.client.address)} style={{
                  flex: 1, padding: '10px 8px', background: '#eff6ff', border: '1.5px solid #3b82f6',
                  borderRadius: 10, color: '#1d4ed8', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}>🗺️ Directions</button>
              )}
              <button onClick={() => { setDate(selectedCard.date); setSelectedAppt(selectedCard.id); setViewMode('lista'); }} style={{
                flex: 1, padding: '10px 8px', background: '#0f766e', border: 'none',
                borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>✅ Details</button>
            </div>
          </div>
        ) : (
          /* Lista horizontal de cards */
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 12px', paddingBottom: 12 }}>
            {rutaAppts.map((appt, idx) => {
              const sc = STATUS_COLORS[appt.status] || STATUS_COLORS.unconfirmed;
              return (
                <div key={appt.id} onClick={() => setSelectedCard(appt)} style={{
                  minWidth: 170, padding: '10px 12px',
                  background: sc.bg, border: `1.5px solid ${sc.border}`,
                  borderRadius: 12, cursor: 'pointer', flexShrink: 0,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', background: sc.dot, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, flexShrink: 0,
                    }}>{idx + 1}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: sc.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {appt.client?.name?.split(' ')[0] || 'Cliente'}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 3 }}>
                    ⏰ {appt.timeStart || ''}{appt.timeEnd ? ` — ${appt.timeEnd}` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: sc.dot, fontWeight: 600, marginBottom: 3 }}>{sc.label}</div>
                  <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    🐾 {(appt.pets || []).map(ap => ap.pet?.name).filter(Boolean).join(', ') || '—'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
