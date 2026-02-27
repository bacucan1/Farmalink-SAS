import type { DashboardData, Tab } from '../../types';
import './Dashboard.css';

/**
 * Props para el componente Dashboard
 * @interface DashboardProps
 */
interface DashboardProps {
  /** Datos del dashboard */
  data: DashboardData | null;
  /** Pestaña activa */
  activeTab: Tab;
  /** Callback para cambiar de pestaña */
  onTabChange: (tab: Tab) => void;
}

/**
 * Dashboard - Panel de control con estadísticas y datos
 * @component
 * @description Panel de administración con stats, tabs y tablas de datos
 * @param {DashboardProps} props - Propiedades del componente
 * @returns {JSX.Element} Dashboard con información de farmacias, medicamentos y precios
 */
export function Dashboard({ data, activeTab, onTabChange }: DashboardProps) {
  if (!data) return null;

  return (
    <div className="view active dashboard-section">
      <div className="dashboard-header">
        <div className="container">
          <div>
            <h1 className="dashboard-title">Dashboard FarmaLink</h1>
            <p className="dashboard-subtitle">
              {data.farmacias.length} farmacias · {data.medicamentos.length} medicamentos · {data.precios.length} precios
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        <StatsStrip 
          farmCount={data.farmacias.length}
          medCount={data.medicamentos.length}
          priceCount={data.precios.length}
        />

        <Tabs activeTab={activeTab} onTabChange={onTabChange} data={data} />

        {activeTab === 'farmacias' && (
          <FarmaciasPanel farmacias={data.farmacias} />
        )}

        {activeTab === 'medicamentos' && (
          <MedicamentosPanel medicamentos={data.medicamentos} />
        )}

        {activeTab === 'precios' && (
          <PreciosPanel precios={data.precios} />
        )}
      </div>
    </div>
  );
}

/**
 * StatsStrip - Tarjetas de estadísticas
 * @component
 */
function StatsStrip({ farmCount, medCount, priceCount }: { 
  farmCount: number; 
  medCount: number; 
  priceCount: number; 
}) {
  const stats = [
    { icon: '🏪', value: farmCount, label: 'Farmacias' },
    { icon: '💊', value: medCount, label: 'Medicamentos' },
    { icon: '💰', value: priceCount, label: 'Precios' }
  ];

  return (
    <div className="stats-strip">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-val">{stat.value}</div>
          <div className="stat-lbl">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Tabs - Pestañas de navegación del dashboard
 * @component
 */
function Tabs({ activeTab, onTabChange, data }: { 
  activeTab: Tab; 
  onTabChange: (tab: Tab) => void;
  data: DashboardData;
}) {
  return (
    <div className="tabs">
      <button
        className={`tab-btn ${activeTab === 'farmacias' ? 'active' : ''}`}
        onClick={() => onTabChange('farmacias')}
      >
        🏪 Farmacias <span className="tab-count">{data.farmacias.length}</span>
      </button>
      <button
        className={`tab-btn ${activeTab === 'medicamentos' ? 'active' : ''}`}
        onClick={() => onTabChange('medicamentos')}
      >
        💊 Medicamentos <span className="tab-count">{data.medicamentos.length}</span>
      </button>
      <button
        className={`tab-btn ${activeTab === 'precios' ? 'active' : ''}`}
        onClick={() => onTabChange('precios')}
      >
        💰 Precios <span className="tab-count">{data.precios.length}</span>
      </button>
    </div>
  );
}

/**
 * FarmaciasPanel - Panel de lista de farmacias
 * @component
 */
function FarmaciasPanel({ farmacias }: { farmacias: Array<{ _id: string; name: string; address?: string; phone?: string }> }) {
  return (
    <div id="panel-farmacias" className="tab-panel active">
      <div className="cards-grid">
        {farmacias.map((farmacia, i) => (
          <div key={farmacia._id} className="farmacia-card">
            <div className="farmacia-num">#{i + 1}</div>
            <div className="farmacia-name">{farmacia.name}</div>
            <div className="farmacia-address">{farmacia.address || 'Sin dirección'}</div>
            <div className="farmacia-phone">📞 {farmacia.phone || 'Sin teléfono'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * MedicamentosPanel - Panel de lista de medicamentos
 * @component
 */
function MedicamentosPanel({ medicamentos }: { medicamentos: Array<{ 
  _id: string; 
  name: string; 
  lab: string; 
  active: boolean; 
  category?: string 
}> }) {
  return (
    <div id="panel-medicamentos" className="tab-panel active">
      <div className="cards-grid">
        {medicamentos.map((med) => (
          <div key={med._id} className="med-card">
            <div className="med-card-top">
              <div className="med-name">{med.name}</div>
              <div className={`med-status ${med.active ? 'active' : 'inactive'}`}></div>
            </div>
            <div className="med-lab">{med.lab}</div>
            <div className="med-tags">
              <span className="med-tag cat">{med.category || 'Sin categoría'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * PreciosPanel - Panel de tabla de precios
 * @component
 */
function PreciosPanel({ precios }: { precios: Array<{ 
  _id: string; 
  precio: number; 
  fecha: string;
  medicamentoId?: { name: string };
  farmaciaId?: { name: string };
}> }) {
  return (
    <div id="panel-precios" className="tab-panel active">
      <div className="precios-table">
        <div className="precios-table-header">
          <span>Medicamento</span>
          <span>Farmacia</span>
          <span>Precio</span>
          <span>Fecha</span>
        </div>
        <div>
          {precios.slice(0, 20).map((precio) => (
            <div key={precio._id} className="precio-row">
              <div className="precio-med-name">{precio.medicamentoId?.name || 'N/A'}</div>
              <div className="precio-farmacia">{precio.farmaciaId?.name || 'N/A'}</div>
              <div className="precio-val-cell">${precio.precio.toLocaleString()}</div>
              <div className="precio-fecha">{new Date(precio.fecha).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
