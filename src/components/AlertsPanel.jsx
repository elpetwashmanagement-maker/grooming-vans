// src/components/AlertsPanel.jsx
// Panel de alertas inteligentes para el Dashboard
// Muestra situaciones que necesitan atención inmediata

export function AlertsPanel({ appointments, vans, groomers, services, expenses, vanLocations = [] }) {
  const today = new Date().toISOString().slice(0, 10);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString().slice(0, 10);

  const alerts = [];

  // 1. Citas de hoy sin confirmar
  const unconfirmedToday = appointments.filter(a =>
    a.date === today && a.status === 'unconfirmed'
  );
  if (unconfirmedToday.length > 0) {
    alerts.push({
      level: 'warning',
      icon: '⚠️',
      title: `${unconfirmedToday.length} cita${unconfirmedToday.length > 1 ? 's' : ''} de hoy sin confirmar`,
      detail: unconfirmedToday.map(a => a.client?.name || 'Cliente').join(', '),
      action: 'Revisar Agenda',
    });
  }

  // 2. Citas de mañana sin confirmar
  const unconfirmedTomorrow = appointments.filter(a =>
    a.date === tomorrowISO && a.status === 'unconfirmed'
  );
  if (unconfirmedTomorrow.length > 0) {
    alerts.push({
      level: 'info',
      icon: '📅',
      title: `${unconfirmedTomorrow.length} cita${unconfirmedTomorrow.length > 1 ? 's' : ''} de mañana sin confirmar`,
      detail: unconfirmedTomorrow.map(a => a.client?.name || 'Cliente').join(', '),
      action: null,
    });
  }

  // 3. Vans sin citas hoy
  const vansWithAppts = new Set(
    appointments.filter(a => a.date === today && a.status !== 'cancelled').map(a => a.vanId)
  );
  const idleVans = vans.filter(v => v.active !== false && !vansWithAppts.has(v.id));
  if (idleVans.length > 0) {
    alerts.push({
      level: 'info',
      icon: '🚐',
      title: `${idleVans.length} van${idleVans.length > 1 ? 's' : ''} sin citas hoy`,
      detail: idleVans.map(v => v.name).join(', '),
      action: null,
    });
  }

  // 4. Groomers sin GPS activo hoy
  const activeGPS = new Set(
    vanLocations.filter(l => l.isActive).map(l => l.vanId)
  );
  const vansWorkingToday = vans.filter(v => vansWithAppts.has(v.id));
  const noGPS = vansWorkingToday.filter(v => !activeGPS.has(v.id));
  if (noGPS.length > 0) {
    alerts.push({
      level: 'warning',
      icon: '📍',
      title: `${noGPS.length} van${noGPS.length > 1 ? 's' : ''} trabajando sin GPS activo`,
      detail: noGPS.map(v => v.name).join(', '),
      action: null,
    });
  }

  // 5. Clientes recurrentes muy overdue (+14 días)
  const overdueRecurring = appointments.filter(a => {
    if (!a.recurrenceWeeks || a.status !== 'completed') return false;
    const lastDate = new Date(a.date + 'T12:00:00');
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + a.recurrenceWeeks * 7);
    const daysUntil = Math.round((nextDate - new Date()) / (1000 * 60 * 60 * 24));
    const alreadyScheduled = appointments.some(b =>
      String(b.clientId) === String(a.clientId) &&
      b.status !== 'cancelled' && b.status !== 'completed' &&
      Math.abs(new Date(b.date) - nextDate) < 14 * 24 * 60 * 60 * 1000
    );
    return daysUntil < -14 && !alreadyScheduled;
  });
  if (overdueRecurring.length > 0) {
    alerts.push({
      level: 'error',
      icon: '🔄',
      title: `${overdueRecurring.length} cliente${overdueRecurring.length > 1 ? 's' : ''} recurrente${overdueRecurring.length > 1 ? 's' : ''} con +14 días de retraso`,
      detail: overdueRecurring.map(a => a.client?.name || 'Cliente').slice(0, 5).join(', '),
      action: 'Ver Recurrentes',
    });
  }

  // 6. Citas canceladas hoy
  const cancelledToday = appointments.filter(a =>
    a.date === today && a.status === 'cancelled'
  );
  if (cancelledToday.length > 0) {
    alerts.push({
      level: 'warning',
      icon: '❌',
      title: `${cancelledToday.length} cancelación${cancelledToday.length > 1 ? 'es' : ''} hoy`,
      detail: cancelledToday.map(a => a.client?.name || 'Cliente').join(', '),
      action: null,
    });
  }

  if (alerts.length === 0) {
    return (
      <div style={{
        background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12,
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 16,
      }}>
        <span style={{ fontSize: 24 }}>✅</span>
        <div>
          <div style={{ fontWeight: 700, color: '#15803d', fontSize: 14 }}>Todo bajo control</div>
          <div style={{ fontSize: 12, color: '#16a34a' }}>No hay alertas pendientes para hoy</div>
        </div>
      </div>
    );
  }

  const levelStyles = {
    error:   { bg: '#fef2f2', border: '#fca5a5', color: '#dc2626', dot: '#dc2626' },
    warning: { bg: '#fffbeb', border: '#fcd34d', color: '#92400e', dot: '#f59e0b' },
    info:    { bg: '#eff6ff', border: '#93c5fd', color: '#1d4ed8', dot: '#3b82f6' },
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        🚨 Alertas — {alerts.length} pendiente{alerts.length > 1 ? 's' : ''}
      </div>
      {alerts.map((alert, i) => {
        const s = levelStyles[alert.level];
        return (
          <div key={i} style={{
            background: s.bg, border: `1px solid ${s.border}`,
            borderRadius: 10, padding: '12px 16px', marginBottom: 8,
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{alert.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: s.color }}>{alert.title}</div>
              {alert.detail && (
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{alert.detail}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
