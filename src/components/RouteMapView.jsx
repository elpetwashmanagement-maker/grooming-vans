// src/components/RouteMapView.jsx
// Vista de Ruta con mapa fullscreen, marcadores y ventanas emergentes

import { useEffect, useRef, useState } from 'react';

export function RouteMapView({ appointments, vans, date, setDate, isGroomer, myVanId, session, setSelectedAppt, setViewMode }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);
  const infoWindowRef = useRef(null);

  const [selectedVan, setSelectedVan] = useState(isGroomer ? myVanId : vans[0]?.id);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Citas del día para la van seleccionada
  const rutaAppts = appointments
    .filter(a => a.date === date && a.vanId === selectedVan && a.status !== 'cancelled')
    .sort((a, b) => (a.timeStart || '').localeCompare(b.timeStart || ''));

  const rutaVan = vans.find(v => v.id === selectedVan);

  // Navegar día
  const changeDay = (direction) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + direction);
    const tz = d.getTimezoneOffset() * 60000;
    setDate(new Date(d - tz).toISOString().slice(0, 10));
  };

  // Inicializar mapa
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google?.maps) return;

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 26.1224, lng: -80.1373 }, // Plantation, FL
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],
      });

      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: { strokeColor: '#0f766e', strokeWeight: 4, strokeOpacity: 0.8 },
      });
      directionsRendererRef.current.setMap(mapInstanceRef.current);

      infoWindowRef.current = new window.google.maps.InfoWindow();
      setMapLoaded(true);
    };

    if (window.google?.maps) {
      initMap();
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps) { clearInterval(interval); initMap(); }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  // Actualizar marcadores cuando cambian las citas
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    if (rutaAppts.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    const geocoder = new window.google.maps.Geocoder();

    // STATUS colors
    const STATUS_COLORS_MAP = {
      unconfirmed: '#f59e0b',
      confirmed: '#0f766e',
      in_progress: '#3b82f6',
      completed: '#64748b',
    };

    rutaAppts.forEach((appt, idx) => {
      if (!appt.client?.address) return;

      geocoder.geocode({ address: appt.client.address }, (results, status) => {
        if (status !== 'OK' || !results[0]) return;

        const position = results[0].geometry.location;
        bounds.extend(position);

        const statusColor = STATUS_COLORS_MAP[appt.status] || '#94a3b8';

        // Marcador con número de orden
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
            scale: 18,
            fillColor: statusColor,
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
          title: appt.client?.name || '',
        });

        // Info window al hacer click
        marker.addListener('click', () => {
          const petNames = (appt.pets || []).map(ap => ap.pet?.name).filter(Boolean).join(', ');
          const content = `
            <div style="font-family: Manrope, sans-serif; min-width: 200px; padding: 4px;">
              <div style="font-weight: 800; font-size: 15px; margin-bottom: 4px;">${appt.client?.name || 'Cliente'}</div>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">⏰ ${appt.timeStart || ''} ${appt.timeEnd ? '— ' + appt.timeEnd : ''}</div>
              ${petNames ? `<div style="font-size: 12px; margin-bottom: 8px;">🐾 ${petNames}</div>` : ''}
              <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">📍 ${appt.client?.address || ''}</div>
              <button onclick="window.raykotaOpenAppt('${appt.id}')" style="background: #0f766e; color: #fff; border: none; border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: 700; cursor: pointer; width: 100%;">
                Ver detalles →
              </button>
            </div>
          `;
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);

        // Ajustar bounds
        if (markersRef.current.length === rutaAppts.filter(a => a.client?.address).length) {
          mapInstanceRef.current.fitBounds(bounds);
        }
      });
    });

    // Trazar ruta con Directions API
    const addresses = rutaAppts.filter(a => a.client?.address).map(a => a.client.address);
    if (addresses.length >= 2) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route({
        origin: addresses[0],
        destination: addresses[addresses.length - 1],
        waypoints: addresses.slice(1, -1).map(a => ({ location: a, stopover: true })),
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      }, (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
        }
      });
    }
  }, [rutaAppts, mapLoaded]);

  // Estado para mini modal de cita seleccionada en el mapa
  const [selectedApptData, setSelectedApptData] = useState(null);

  // Exponer función global para el botón en InfoWindow
  useEffect(() => {
    window.raykotaOpenAppt = (apptId) => {
      if (infoWindowRef.current) infoWindowRef.current.close();
      const appt = appointments.find(a => a.id === apptId);
      if (appt) setSelectedApptData(appt);
    };
    return () => { delete window.raykotaOpenAppt; };
  }, [setSelectedAppt, setViewMode, appointments]);

  // Formatear fecha
  const formatDay = (iso) => {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 200px)', minHeight: 500, borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>

      {/* Mapa fullscreen */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Barra superior — navegación de día + selector de van */}
      <div style={{
        position: 'absolute', top: 12, left: 12, right: 12, zIndex: 10,
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        {/* Navegación de día */}
        <div style={{
          background: '#fff', borderRadius: 12, padding: '8px 12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <button onClick={() => changeDay(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#0f766e', padding: '0 4px' }}>‹</button>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
            {date === today ? '📅 Today' : formatDay(date)}
          </div>
          <button onClick={() => changeDay(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#0f766e', padding: '0 4px' }}>›</button>
        </div>

        {/* Selector de van (solo admin) */}
        {!isGroomer && (
          <div style={{
            background: '#fff', borderRadius: 12, padding: '4px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            display: 'flex', gap: 4, flexWrap: 'wrap',
          }}>
            {vans.filter(v => v.active !== false).map(v => (
              <button key={v.id} onClick={() => setSelectedVan(v.id)} style={{
                padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: selectedVan === v.id ? '#0f766e' : 'transparent',
                color: selectedVan === v.id ? '#fff' : '#64748b',
                fontWeight: selectedVan === v.id ? 700 : 400, fontSize: 12,
              }}>
                {v.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Panel inferior — lista de citas */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid #e2e8f0',
        padding: '12px 16px',
        maxHeight: '35%',
        overflowY: 'auto',
      }}>
        {rutaAppts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, padding: '8px 0' }}>
            No appointments for {rutaVan?.name || 'this van'} today
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {rutaAppts.map((appt, idx) => {
              const STATUS_COLORS_MAP = {
                unconfirmed: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
                confirmed: { bg: '#f0fdfa', border: '#6ee7b7', text: '#065f46' },
                in_progress: { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
                completed: { bg: '#f8fafc', border: '#cbd5e1', text: '#475569' },
              };
              const sc = STATUS_COLORS_MAP[appt.status] || STATUS_COLORS_MAP.unconfirmed;
              return (
                <div key={appt.id}
                  onClick={() => setSelectedApptData(appt)}
                  style={{
                    minWidth: 160, padding: '10px 12px',
                    background: sc.bg, border: `1.5px solid ${sc.border}`,
                    borderRadius: 10, cursor: 'pointer', flexShrink: 0,
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: '#0f766e', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, flexShrink: 0,
                    }}>{idx + 1}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: sc.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {appt.client?.name?.split(' ')[0] || 'Cliente'}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>⏰ {appt.timeStart || ''}</div>
                  <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    🐾 {(appt.pets || []).map(ap => ap.pet?.name).filter(Boolean).join(', ') || '—'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mini modal de cita seleccionada */}
      {selectedApptData && (
        <div style={{
          position: 'absolute', left: 12, right: 12, bottom: '38%', zIndex: 20,
          background: '#fff', borderRadius: 14, padding: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{selectedApptData.client?.name}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>⏰ {selectedApptData.timeStart}{selectedApptData.timeEnd ? ` — ${selectedApptData.timeEnd}` : ''}</div>
            </div>
            <button onClick={() => setSelectedApptData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8' }}>✕</button>
          </div>
          {selectedApptData.client?.address && (
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>📍 {selectedApptData.client.address}</div>
          )}
          {(selectedApptData.pets || []).length > 0 && (
            <div style={{ fontSize: 13, marginBottom: 12 }}>
              {selectedApptData.pets.map(ap => (
                <div key={ap.id}>🐾 <strong>{ap.pet?.name}</strong> — {ap.service || '—'} · ${ap.amount || 0}</div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            {selectedApptData.client?.address && (
              <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedApptData.client.address)}`, '_blank')}
                style={{ flex: 1, padding: '8px', background: '#1a73e8', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                🗺️ Maps
              </button>
            )}
            <button onClick={() => { setSelectedApptData(null); setSelectedAppt(selectedApptData.id); setViewMode('lista'); }}
              style={{ flex: 2, padding: '8px', background: '#0f766e', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Ver detalles completos →
            </button>
          </div>
        </div>
      )}

      {/* Contador */}
      {rutaAppts.length > 0 && (
        <div style={{
          position: 'absolute', top: 60, right: 12, zIndex: 10,
          background: '#0f766e', color: '#fff',
          borderRadius: 20, padding: '6px 14px',
          fontSize: 12, fontWeight: 700,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}>
          {rutaAppts.length} stops · {rutaVan?.name}
        </div>
      )}
    </div>
  );
}
