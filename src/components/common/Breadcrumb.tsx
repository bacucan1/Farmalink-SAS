/**
 * Breadcrumb.tsx — Migajas de pan globales (Punto 4)
 * Se renderiza desde App.tsx para todas las secciones
 * excepto home, login, producto y categoria (tienen la suya propia).
 */

import type { View } from '../../types';
import './Breadcrumb.css';

const LABELS: Partial<Record<View, string>> = {
  buscar:    'Buscar medicamentos',
  dashboard: 'Dashboard',
  admin:     'Administración',
  mapa:      'Mapa de farmacias',
};

interface BreadcrumbProps {
  view: View;
  onGoHome: () => void;
}

export function Breadcrumb({ view, onGoHome }: BreadcrumbProps) {
  const label = LABELS[view];
  if (!label) return null;

  return (
    <nav className="app-breadcrumb" aria-label="Ruta de navegación">
      <div className="container app-breadcrumb-inner">
        <button className="app-crumb-btn" onClick={onGoHome}>Inicio</button>
        <span className="app-crumb-sep" aria-hidden="true">›</span>
        <span className="app-crumb-current">{label}</span>
      </div>
    </nav>
  );
}
