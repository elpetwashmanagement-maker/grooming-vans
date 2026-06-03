// ModuleGuard.jsx
// Envuelve cualquier tab o feature con este componente.
// Si el módulo no está activo, no renderiza nada (o muestra un upgrade prompt).
//
// USO:
//   <ModuleGuard module="gps_routes">
//     <VanTrackerTab />
//   </ModuleGuard>
//
//   <ModuleGuard module="boarding" fallback={<UpgradePrompt module="boarding" />}>
//     <BoardingTab />
//   </ModuleGuard>

import { useModulesContext } from '../context/ModulesContext';

const MODULE_LABELS = {
  gps_routes:     'Rastreo GPS & Rutas',
  reminders:      'Recordatorios Automáticos',
  invoicing:      'Facturación',
  multi_company:  'Multi-Empresa',
  payroll:        'Nómina & Comisiones',
  finances:       'Finanzas & P&L',
  boarding:       'Boarding',
  inventory:      'Inventario',
  square:         'Pagos Square',
  audit:          'Auditoría',
  booking_portal: 'Portal de Reservas',
};

const PLAN_REQUIRED = {
  gps_routes:     'Pro',
  reminders:      'Pro',
  invoicing:      'Pro',
  multi_company:  'Business',
  payroll:        'Business',
  finances:       'Business',
  boarding:       'Enterprise',
  inventory:      'Enterprise',
  square:         'Enterprise',
  audit:          'Enterprise',
  booking_portal: 'Enterprise',
};

function DefaultFallback({ module }) {
  const label = MODULE_LABELS[module] || module;
  const plan  = PLAN_REQUIRED[module] || 'Pro';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      gap: 12,
    }}>
      <span style={{ fontSize: 48 }}>🔒</span>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
        {label}
      </h3>
      <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
        Este módulo requiere el plan <strong>{plan}</strong>.
        Contacta a tu administrador para activarlo.
      </p>
    </div>
  );
}

export function ModuleGuard({ module, children, fallback }) {
  const { isEnabled, loading } = useModulesContext();

  if (loading) return null;
  if (!isEnabled(module)) {
    return fallback !== undefined ? fallback : <DefaultFallback module={module} />;
  }

  return children;
}

// Versión para esconder tabs del menú de navegación
export function useTabVisible(module) {
  const { isEnabled } = useModulesContext();
  return isEnabled(module);
}
