import { useEffect, useRef, useState, useMemo } from 'react';

const GOOGLE_KEY = 'AIzaSyDjIrZHfloSCZHo4wOi9p0t3VFwIiPY2dI';

const STATUS_COLORS = {
  unconfirmed: { bg: '#fff7ed', text: '#9a3412', border: '#f97316', dot: '#f97316', label: 'Unconfirmed' },
  confirmed:   { bg: '#f0fdfa', text: '#065f46', border: '#10b981', dot: '#10b981', label: 'Confirmed' },
  in_progress: { bg: '#eff6ff', text: '#1e40af', border: '#3b82f6', dot: '#3b82f6', label: 'In Progress' },
  completed:   { bg: '#f8fafc', text: '#475569', border: '#94a3b8', dot: '#94a3b8', label: 'Completed' },
  admin_review:{ bg: '#fff7ed', text: '#9a3412', border: '#f97316', dot: '#f97316', label: 'Pending Review' },
};

export function RouteMapView({ appointments, vans, date, setDate, isGroomer, myVanId, session, setSelectedAppt, setViewMode }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedVan, setSelectedVan] = useState(isGroomer ? myVanId : (vans[0]?.id || ''));
  const cardScrollRef = useRef(null);

  const today = new Date().toISOString().slice(0, 10);

  const rutaAppts = useMemo(() => appointments
    .filter(a => a.date === date && a.vanId === selectedVan && a.status !== 'cancelled')
    .sort((a, b) => (a.timeStart || '').localeCompare(b.timeStart || '')),
    [appointments, date, selectedVan]);

  const changeDay = (dir) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + dir);
    setDate(new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10));
    setSelectedCard(null);
  };

  const openMaps = (address) => {
    if (!address) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
  };

  // Init map
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google?.maps) return;
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 26.1224, lng: -80.1373 },
        zoom: 11,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_CENTER },
        styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
      });
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: { strokeColor: '#0f766e', strokeWeight: 4, strokeOpacity: 0.8 },
      });
      directionsRendererRef.current.setMap(mapInstanceRef.current);
      setMapLoaded(true);
    };
    if (window.google?.maps) initMap();
    else {
      const interval = setInterval(() => {
        if (window.google?.maps) { clearInterval(interval); initMap(); }
      }, 300);
      return () => clearInterval(interval);
    }
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (rutaAppts.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    const geocoder = new window.google.maps.Geocoder();
    const positions = [];

    rutaAppts.forEach((appt, idx) => {
      if (!appt.client?.address) return;
      geocoder.geocode({ address: appt.client.address }, (results, status) => {
        if (status !== 'OK' || !results[0]) return;
        const position = results[0].geometry.location;
        bounds.extend(position);
        positions.push({ position, idx });

        const isSelected = selectedCard?.id === appt.id;
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          label: {
            text: String(idx + 1),
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '13px',
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: isSelected ? '#f97316' : '#0f172a',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
            scale: 18,
          },
          title: appt.client?.name || '',
        });

        marker.addListener('click', () => {
          setSelectedCard(appt);
          // Scroll to card
          if (cardScrollRef.current) {
            const cardEl = cardScrollRef.current.children[idx];
            if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
        });

        markersRef.current.push(marker);
        if (positions.length === rutaAppts.filter(a => a.client?.address).length) {
          mapInstanceRef.current.fitBounds(bounds);
        }
      });
    });

    // Draw route
    if (rutaAppts.filter(a => a.client?.address).length >= 2) {
      const addresses = rutaAppts.filter(a => a.client?.address).map(a => a.client.address);
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route({
        origin: addresses[0],
        destination: addresses[addresses.length - 1],
        waypoints: addresses.slice(1, -1).map(a => ({ location: a, stopover: true })),
        travelMode: 'DRIVING',
        optimizeWaypoints: false,
      }, (result, status) => {
        if (status === 'OK') directionsRendererRef.current.setDirections(result);
      });
    }
  }, [mapLoaded, rutaAppts, selectedCard]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', background: '#000' }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
        <button onClick={() => setViewMode('lista')}
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: 10, padding: '8px 12px', color: '#fff', cursor: 'pointer', fontSize: 18 }}>
          ✕
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 10, padding: '6px 12px' }}>
          <button onClick={() => changeDay(-1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}>‹</button>
          <div style={{ flex: 1, textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
            {date === today ? 'Today' : new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <button onClick={() => changeDay(1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}>›</button>
        </div>
        {!isGroomer && (
          <select value={selectedVan} onChange={e => setSelectedVan(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: 10, padding: '8px 12px', color: '#fff', cursor: 'pointer', fontSize: 13 }}>
            {vans.filter(v => v.active !== false).map(v => (
              <option key={v.id} value={v.id} style={{ color: '#000' }}>{v.groomer || v.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ flex: 1, width: '100%' }} />

      {/* Stats bar */}
      <div style={{ position: 'absolute', bottom: 200, left: 16, right: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <div style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '6px 14px', color: '#fff', fontSize: 13, fontWeight: 600 }}>
          {rutaAppts.length} stops · ${rutaAppts.reduce((s, a) => s + (a.pets || []).reduce((ps, ap) => ps + (ap.amount || 0), 0), 0).toFixed(0)}
        </div>
      </div>

      {/* Cards */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 20 }}>
        {rutaAppts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#fff', padding: 20, background: 'rgba(0,0,0,0.5)', margin: '0 16px', borderRadius: 16 }}>
            No appointments for this day
          </div>
        ) : (
          <div ref={cardScrollRef} style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 16px', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            {rutaAppts.map((appt, idx) => {
              const sc = STATUS_COLORS[appt.status] || STATUS_COLORS.unconfirmed;
              const isSelected = selectedCard?.id === appt.id;
              const subtotal = (appt.pets || []).reduce((s, ap) => s + (ap.amount || 0), 0);
              return (
                <div key={appt.id} onClick={() => setSelectedCard(isSelected ? null : appt)}
                  style={{ minWidth: 280, maxWidth: 300, background: '#fff', borderRadius: 20, padding: 16, scrollSnapAlign: 'center', cursor: 'pointer', border: `2px solid ${isSelected ? '#0f766e' : 'transparent'}`, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', flexShrink: 0 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                        {idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{appt.client?.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{appt.timeStart}{appt.timeEnd ? ` — ${appt.timeEnd}` : ''}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: sc.bg, color: sc.text }}>
                      {sc.label}
                    </div>
                  </div>
                  {/* Pets */}
                  {appt.pets?.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      {appt.pets.map(ap => (
                        <div key={ap.id} style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>
                          🐾 {ap.pet?.name} — {ap.service} · ${ap.amount || 0}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Address */}
                  {appt.client?.address && (
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>📍 {appt.client.address}</div>
                  )}
                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {appt.client?.address && (
                      <button onClick={e => { e.stopPropagation(); openMaps(appt.client.address); }}
                        style={{ flex: 1, padding: '8px', background: '#eff6ff', border: 'none', borderRadius: 10, color: '#1d4ed8', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                        🗺️ Directions
                      </button>
                    )}
                    {!isGroomer && appt.client?.phone && (
                      <a href={`tel:${appt.client.phone}`} onClick={e => e.stopPropagation()}
                        style={{ flex: 1, padding: '8px', background: '#f0fdfa', border: 'none', borderRadius: 10, color: '#0f766e', fontWeight: 700, fontSize: 12, textAlign: 'center', textDecoration: 'none' }}>
                        📞 Contact
                      </a>
                    )}
                    <button onClick={e => { e.stopPropagation(); setDate(appt.date); setSelectedAppt(appt.id); setViewMode('lista'); }}
                      style={{ flex: 1, padding: '8px', background: '#0f766e', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      ✅ Details
                    </button>
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
