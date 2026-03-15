import { useState, useEffect, useRef } from 'react';
import type { Sugerencia } from '../../types';
import { PharmacyMap } from '../common/PharmacyMap';
import './ProductoDetalle.css';

const GATEWAY = import.meta.env.VITE_API_URL || '';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface PrecioFarmacia {
  farmaciaId:      string;
  farmaciaNombre:  string;
  farmaciaAddress: string;
  precio:          number;
  fecha:           string;
}

interface ProductoDetalleProps {
  medicamento:    Sugerencia;
  onBack:         () => void;
  onGoHome?:      () => void;
  onGoCategory?:  (cat: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  analgesico:       '#0B7DB8',
  antibiotico:      '#8B5CF6',
  antiinflamatorio: '#F59E0B',
  vitamina:         '#66B82E',
  suplemento:       '#66B82E',
  antiacido:        '#06B6D4',
  antihipertensivo: '#EF4444',
  cardiovascular:   '#EF4444',
  antidiabetico:    '#EC4899',
  respiratorio:     '#0EA5E9',
  corticosteroide:  '#6366F1',
  psicofarmaco:     '#A855F7',
  antialergico:     '#22C55E',
  gastrointestinal: '#F97316',
};

const getCategoryColor = (category?: string): string => {
  if (!category) return '#64748b';
  const key = Object.keys(CATEGORY_COLORS).find(k => category.toLowerCase().includes(k));
  return key ? CATEGORY_COLORS[key] : '#64748b';
};

// Normaliza el nombre de la estrategia para mostrarlo limpio
const formatEstrategia = (e: string): string => {
  const map: Record<string, string> = {
    coincidencia_parcial: 'Coincidencia parcial',
    similitud_basica:     'Similitud básica',
    por_categoria:        'Por categoría',
    categoria:            'Por categoría',
  };
  return map[e] ?? e.replace(/_/g, ' ');
};

const formatPrice = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return d; }
};

// La categoría puede venir en distintos campos según el origen (búsqueda vs categoría)
const getCategory = (med: Sugerencia): string =>
  med.category || med.categoria_nombre || '';

// ── Gráfico de barras SVG (sin dependencias externas) ────────────────────────

function PriceChart({ precios }: { precios: PrecioFarmacia[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setWidth(containerRef.current.offsetWidth);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (precios.length < 2) return null;

  const PAD_L = 16, PAD_R = 16, PAD_T = 28, PAD_B = 68;
  const chartW = width - PAD_L - PAD_R;
  const chartH = 160;
  const svgH   = chartH + PAD_T + PAD_B;

  const minP = Math.min(...precios.map(p => p.precio));
  const maxP = Math.max(...precios.map(p => p.precio));
  const base = minP * 0.75;
  const top  = maxP * 1.08;
  const avg  = precios.reduce((s, p) => s + p.precio, 0) / precios.length;

  const sorted = [...precios].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  const n      = sorted.length;
  const barW   = Math.min(52, (chartW / n) - 12);
  const gap    = (chartW - barW * n) / (n + 1);
  const getX   = (i: number) => PAD_L + gap + i * (barW + gap) + barW / 2;
  const getBarH = (p: number) => Math.max(4, ((p - base) / (top - base)) * chartH);
  const getY   = (p: number) => PAD_T + chartH - getBarH(p);
  const avgY   = getY(avg);

  const barColor = (p: number) =>
    p === minP ? '#66B82E' : p === maxP ? '#EF4444' : '#F59E0B';

  return (
    <div ref={containerRef} className="chart-wrap">
      <svg width={width} height={svgH} className="price-chart">
        {/* Líneas de cuadrícula */}
        {[0.25, 0.5, 0.75, 1].map(t => {
          const y = PAD_T + chartH * (1 - t);
          const v = base + (top - base) * t;
          return (
            <g key={t}>
              <line x1={PAD_L} y1={y} x2={width - PAD_R} y2={y}
                stroke="#f1f5f9" strokeWidth="1"/>
              <text x={PAD_L - 2} y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8">
                ${(v/1000).toFixed(0)}k
              </text>
            </g>
          );
        })}

        {/* Línea promedio */}
        <line x1={PAD_L} y1={avgY} x2={width - PAD_R} y2={avgY}
          stroke="#0B7DB8" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.7"/>
        <rect x={width - PAD_R - 58} y={avgY - 9} width={58} height={13} rx="3" fill="#EFF6FF"/>
        <text x={width - PAD_R - 29} y={avgY + 1} textAnchor="middle" fontSize="8" fill="#0B7DB8" fontWeight="600">
          Prom: {formatPrice(Math.round(avg))}
        </text>

        {/* Barras */}
        {sorted.map((p, i) => {
          const x    = getX(i);
          const barH = getBarH(p.precio);
          const y    = getY(p.precio);
          const col  = barColor(p.precio);

          return (
            <g key={i}>
              <rect x={x - barW / 2} y={y} width={barW} height={barH} rx="4" fill={col} opacity="0.82"/>
              <rect x={x - barW / 2} y={y} width={barW} height={Math.min(barH, 7)} rx="4" fill="white" opacity="0.18"/>
              <text x={x} y={y - 5} textAnchor="middle" fontSize="9" fill={col} fontWeight="700">
                ${(p.precio/1000).toFixed(1)}k
              </text>
              <text x={x} y={PAD_T + chartH + 13} textAnchor="end" fontSize="9" fill="#64748b"
                transform={`rotate(-38, ${x}, ${PAD_T + chartH + 13})`}>
                {p.farmaciaNombre.length > 13 ? p.farmaciaNombre.slice(0,12) + '…' : p.farmaciaNombre}
              </text>
              <text x={x} y={PAD_T + chartH + 44} textAnchor="middle" fontSize="8" fill="#94a3b8">
                {new Date(p.fecha).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
              </text>
            </g>
          );
        })}

        {/* Eje X */}
        <line x1={PAD_L} y1={PAD_T + chartH} x2={width - PAD_R} y2={PAD_T + chartH}
          stroke="#e2e8f0" strokeWidth="1"/>
      </svg>

      <div className="chart-legend">
        <span className="chart-leg"><span className="chart-leg-dot" style={{background:'#66B82E'}}/>Precio más bajo</span>
        <span className="chart-leg"><span className="chart-leg-dot" style={{background:'#F59E0B'}}/>Precio intermedio</span>
        <span className="chart-leg"><span className="chart-leg-dot" style={{background:'#EF4444'}}/>Precio más alto</span>
        <span className="chart-leg"><span className="chart-leg-dash"/>Precio promedio</span>
      </div>

      <div className="chart-summary">
        <div className="chart-stat">
          <span>Precio más bajo</span>
          <strong style={{color:'#66B82E'}}>{formatPrice(minP)}</strong>
        </div>
        <div className="chart-stat">
          <span>Promedio</span>
          <strong style={{color:'#0B7DB8'}}>{formatPrice(Math.round(avg))}</strong>
        </div>
        <div className="chart-stat">
          <span>Precio más alto</span>
          <strong style={{color:'#EF4444'}}>{formatPrice(maxP)}</strong>
        </div>
        <div className="chart-stat">
          <span>Diferencia</span>
          <strong style={{color:'#64748b'}}>{formatPrice(maxP - minP)}</strong>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export function ProductoDetalle({ medicamento, onBack, onGoHome, onGoCategory }: ProductoDetalleProps) {
  const [precios, setPrecios]               = useState<PrecioFarmacia[]>([]);
  const [loadingPrecios, setLoadingPrecios] = useState(true);
  const [showMap, setShowMap]               = useState(false);
  const [showChart, setShowChart]           = useState(false);
  const [sortOrder, setSortOrder]           = useState<'asc' | 'desc'>('asc');
  const [imgSrc, setImgSrc]                 = useState(`/medicamentos/${medicamento._id}.png`);
  const [imgTried, setImgTried]             = useState<'png' | 'jpg' | 'placeholder'>('png');
  const [selectedFarmacia, setSelectedFarmacia] = useState<PrecioFarmacia | null>(null);

  const category = getCategory(medicamento);
  const catColor = getCategoryColor(category);
  const farmaciaIds = precios.map(p => Number(p.farmaciaId)).filter(n => !isNaN(n) && n > 0);

  const handleImgError = () => {
    if (imgTried === 'png') {
      setImgSrc(`/medicamentos/${medicamento._id}.jpg`);
      setImgTried('jpg');
    } else {
      setImgSrc('/medicamentos/placeholder.svg');
      setImgTried('placeholder');
    }
  };

  useEffect(() => {
    setImgSrc(`/medicamentos/${medicamento._id}.png`);
    setImgTried('png');
    setSelectedFarmacia(null);
    setShowChart(false);
    setShowMap(false);

    const fetchPrecios = async () => {
      setLoadingPrecios(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `${GATEWAY}/api/precios/comparar/${medicamento._id}?orden=asc`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (res.ok) {
          const data = await res.json();
          const lista = data.listaOrdenada ?? data.data ?? [];
          setPrecios(lista.map((item: any) => ({
            farmaciaId:      item.farmaciaId?._id ?? '',
            farmaciaNombre:  item.farmaciaNombre ?? item.farmaciaId?.name ?? 'Farmacia',
            farmaciaAddress: item.farmaciaId?.address ?? '',
            precio:          item.precio,
            fecha:           item.fecha,
          })));
        }
      } catch (err) {
        console.error('Error precios:', err);
      } finally {
        setLoadingPrecios(false);
      }
    };
    fetchPrecios();
  }, [medicamento._id]);

  const sorted    = [...precios].sort((a, b) => sortOrder === 'asc' ? a.precio - b.precio : b.precio - a.precio);
  const minPrecio = precios.length > 0 ? Math.min(...precios.map(p => p.precio)) : null;
  const maxPrecio = precios.length > 0 ? Math.max(...precios.map(p => p.precio)) : null;
  const heroPrice = selectedFarmacia ? selectedFarmacia.precio : minPrecio;
  const heroSavings = (heroPrice !== null && maxPrecio !== null && maxPrecio !== heroPrice)
    ? Math.round(((maxPrecio - heroPrice) / maxPrecio) * 100) : 0;

  return (
    <div className="pd-view view active">

      {/* ── Breadcrumb ── */}
      <nav className="pd-breadcrumb container" aria-label="Ruta de navegación">
        <button className="pd-crumb-btn" onClick={onGoHome ?? onBack}>Inicio</button>
        <span className="pd-crumb-sep" aria-hidden="true">›</span>
        <button className="pd-crumb-btn" onClick={onBack}>Buscar</button>
        {category && (
          <>
            <span className="pd-crumb-sep" aria-hidden="true">›</span>
            {onGoCategory
              ? <button className="pd-crumb-btn" onClick={() => onGoCategory(category)}>{category}</button>
              : <span className="pd-crumb-inactive">{category}</span>
            }
          </>
        )}
        <span className="pd-crumb-sep" aria-hidden="true">›</span>
        <span className="pd-crumb-current" title={medicamento.name}>{medicamento.name}</span>
      </nav>

      {/* ── Hero ── */}
      <div className="container pd-hero">

        {/* Imagen */}
        <div className="pd-img-wrap">
          <img className="pd-img" src={imgSrc} alt={medicamento.name} onError={handleImgError}/>
          {category && (
            <span className="pd-img-badge" style={{ background: catColor }}>{category}</span>
          )}
        </div>

        {/* Info */}
        <div className="pd-info">
          <p className="pd-lab">{medicamento.lab}</p>
          <h1 className="pd-name">{medicamento.name}</h1>

          {/* Precio hero */}
          {loadingPrecios && <div className="pd-price-skeleton"/>}

          {!loadingPrecios && heroPrice !== null && (
            <div className="pd-price-hero">
              {selectedFarmacia ? (
                <p className="pd-price-context">
                  Precio en <strong>{selectedFarmacia.farmaciaNombre}</strong>
                  <button className="pd-clear-sel" onClick={() => setSelectedFarmacia(null)}>
                    Volver al mejor precio
                  </button>
                </p>
              ) : (
                maxPrecio !== minPrecio && (
                  <span className="pd-old-price">{formatPrice(maxPrecio!)} <em>(precio más alto)</em></span>
                )
              )}
              <div className="pd-price-row">
                <span className={`pd-main-price ${selectedFarmacia ? 'pd-main-price--selected' : ''}`}>
                  {formatPrice(heroPrice)}
                </span>
                {heroSavings > 0 && (
                  <span className="pd-discount-pill">{heroSavings}% menos</span>
                )}
              </div>
            </div>
          )}

          {/* Disponibilidad */}
          {!loadingPrecios && (
            <div className="pd-availability">
              <span className={`pd-avail-dot ${precios.length > 0 ? 'dot-green' : 'dot-gray'}`}/>
              {precios.length > 0
                ? <span>Disponible en <strong>{precios.length} farmacia{precios.length !== 1 ? 's' : ''}</strong></span>
                : <span>Sin stock registrado</span>
              }
            </div>
          )}

          <hr className="pd-divider"/>

          {/* Descripción */}
          {medicamento.description && (
            <div className="pd-desc-block">
              <h3>Descripción</h3>
              <p>{medicamento.description}</p>
            </div>
          )}

          {/* Ficha técnica */}
          <div className="pd-specs">
            <div className="pd-spec">
              <span className="pd-spec-label">Laboratorio fabricante</span>
              <span className="pd-spec-value">{medicamento.lab}</span>
            </div>
            {category && (
              <div className="pd-spec">
                <span className="pd-spec-label">Categoría terapéutica</span>
                <span className="pd-spec-value">{category}</span>
              </div>
            )}
            <div className="pd-spec">
              <span className="pd-spec-label">Búsqueda realizada con</span>
              <span className="pd-spec-value pd-strategy">
                {formatEstrategia(medicamento.estrategiaUsada)}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pd-action-btns">
            {precios.length > 1 && (
              <button className={`pd-action-btn pd-chart-btn ${showChart ? 'active' : ''}`}
                onClick={() => setShowChart(v => !v)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
                </svg>
                {showChart ? 'Ocultar gráfico' : 'Ver comparativa de precios'}
              </button>
            )}
            {precios.length > 0 && (
              <button className={`pd-action-btn pd-map-btn ${showMap ? 'active' : ''}`}
                onClick={() => setShowMap(v => !v)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                  <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
                </svg>
                {showMap ? 'Ocultar mapa' : `Ver ${precios.length} farmacias en el mapa`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Gráfico ── */}
      {showChart && precios.length > 1 && (
        <div className="container pd-chart-section">
          <div className="pd-section-header">
            <h2>Comparativa de precios por farmacia</h2>
            <p>Precio registrado en cada farmacia disponible</p>
          </div>
          <PriceChart precios={precios}/>
        </div>
      )}

      {/* ── Mapa ── */}
      {showMap && (
        <div className="container pd-map-section">
          <div className="pd-section-header">
            <h2>Farmacias que venden este medicamento</h2>
            <p>Solo se muestran las {precios.length} farmacias donde puedes comprar este producto</p>
          </div>
          <PharmacyMap filterPharmacyIds={farmaciaIds}/>
        </div>
      )}

      {/* ── Tabla de precios ── */}
      <div className="container pd-prices-section">
        <div className="pd-prices-hd">
          <div>
            <h2>
              Comparar precios por farmacia
              {precios.length > 0 && <span className="pd-count-badge">{precios.length}</span>}
            </h2>
            {!selectedFarmacia && precios.length > 0 && (
              <p className="pd-hint">Selecciona una farmacia para ver su precio destacado</p>
            )}
            {selectedFarmacia && (
              <p className="pd-hint">
                Mostrando precio de <strong>{selectedFarmacia.farmaciaNombre}</strong> ·
                <button className="pd-hint-btn" onClick={() => setSelectedFarmacia(null)}>Mostrar mejor precio</button>
              </p>
            )}
          </div>
          {precios.length > 1 && (
            <button className="pd-sort-btn"
              onClick={() => setSortOrder(v => v === 'asc' ? 'desc' : 'asc')}>
              {sortOrder === 'asc' ? 'Mayor precio primero' : 'Menor precio primero'}
            </button>
          )}
        </div>

        {loadingPrecios && (
          <div className="pd-skeletons">{[1,2,3].map(i => <div key={i} className="pd-skel"/>)}</div>
        )}

        {!loadingPrecios && precios.length === 0 && (
          <div className="pd-empty">
            <p>No hay precios registrados para este medicamento.</p>
            <small>Los precios se actualizan periódicamente.</small>
          </div>
        )}

        {!loadingPrecios && sorted.length > 0 && (
          <div className="pd-price-list">
            {sorted.map((p, idx) => {
              const isBest     = p.precio === minPrecio;
              const isSelected = selectedFarmacia?.farmaciaId === p.farmaciaId;
              const savings    = maxPrecio && maxPrecio !== minPrecio
                ? Math.round(((maxPrecio - p.precio) / maxPrecio) * 100) : 0;

              return (
                <div key={idx}
                  className={`pd-card ${isBest ? 'pd-card--best' : ''} ${isSelected ? 'pd-card--selected' : ''}`}
                  onClick={() => setSelectedFarmacia(prev => prev?.farmaciaId === p.farmaciaId ? null : p)}
                  title="Clic para ver este precio destacado arriba">

                  {isBest && !isSelected && <div className="pd-best-tag">Mejor precio disponible</div>}
                  {isSelected && <div className="pd-best-tag pd-selected-tag">Seleccionada</div>}

                  <div className="pd-card-left">
                    <div className="pd-farm-avatar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    </div>
                    <div className="pd-farm-info">
                      <h4>{p.farmaciaNombre}</h4>
                      {p.farmaciaAddress && (
                        <p className="pd-addr">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {p.farmaciaAddress}
                        </p>
                      )}
                      <p className="pd-date">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Precio registrado el {formatDate(p.fecha)}
                      </p>
                    </div>
                  </div>

                  <div className="pd-card-right">
                    <span className="pd-price">{formatPrice(p.precio)}</span>
                    {isBest && savings > 0 && (
                      <span className="pd-save">Ahorra {savings}%</span>
                    )}
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
