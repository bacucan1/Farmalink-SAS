import { useState, useEffect } from 'react';
import type { Sugerencia } from '../../types';
import { PharmacyMap } from '../common/PharmacyMap';
import './ProductoDetalle.css';

const GATEWAY = import.meta.env.VITE_API_URL || '';

interface PrecioFarmacia {
  farmaciaId: string;
  farmaciaNombre: string;
  farmaciaAddress: string;
  precio: number;
  fecha: string;
}

interface ProductoDetalleProps {
  medicamento: Sugerencia;
  onBack: () => void;
}

const CATEGORY_META: Record<string, { icon: string; color: string; label: string }> = {
  analgesico:       { icon: '💊', color: '#0B7DB8', label: 'Analgésico' },
  antibiotico:      { icon: '🦠', color: '#8B5CF6', label: 'Antibiótico' },
  antiinflamatorio: { icon: '🔥', color: '#F59E0B', label: 'Antiinflamatorio' },
  vitamina:         { icon: '✨', color: '#66B82E', label: 'Vitamina' },
  suplemento:       { icon: '✨', color: '#66B82E', label: 'Suplemento' },
  antiacido:        { icon: '🫧', color: '#06B6D4', label: 'Antiácido' },
  antihipertensivo: { icon: '❤️', color: '#EF4444', label: 'Antihipertensivo' },
  cardiovascular:   { icon: '❤️', color: '#EF4444', label: 'Cardiovascular' },
  antidiabetico:    { icon: '🩸', color: '#EC4899', label: 'Antidiabético' },
  respiratorio:     { icon: '🌬️', color: '#0EA5E9', label: 'Respiratorio' },
  corticosteroide:  { icon: '💉', color: '#6366F1', label: 'Corticosteroide' },
  psicofarmaco:     { icon: '🧠', color: '#A855F7', label: 'Psicofármaco' },
  antialergico:     { icon: '🌿', color: '#22C55E', label: 'Antialérgico' },
  gastrointestinal: { icon: '🫃', color: '#F97316', label: 'Gastrointestinal' },
};

const getCategoryMeta = (category?: string) => {
  if (!category) return { icon: '💉', color: '#64748b', label: 'Medicamento' };
  const key = Object.keys(CATEGORY_META).find(k => category.toLowerCase().includes(k));
  return key ? CATEGORY_META[key] : { icon: '💉', color: '#64748b', label: category };
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
};

export function ProductoDetalle({ medicamento, onBack }: ProductoDetalleProps) {
  const [precios, setPrecios]                   = useState<PrecioFarmacia[]>([]);
  const [loadingPrecios, setLoadingPrecios]     = useState(true);
  const [showMap, setShowMap]                   = useState(false);
  const [sortOrder, setSortOrder]               = useState<'asc' | 'desc'>('asc');
  const [imgSrc, setImgSrc]                     = useState(`/medicamentos/${medicamento._id}.png`);
  const [imgTried, setImgTried]                 = useState<'png' | 'jpg' | 'placeholder'>('png');
  // Farmacia seleccionada — null significa "mostrar el mejor precio global"
  const [selectedFarmacia, setSelectedFarmacia] = useState<PrecioFarmacia | null>(null);

  const catMeta = getCategoryMeta(medicamento.category);

  // IDs de farmacias con este producto para filtrar el mapa
  const farmaciaIdsConProducto = precios
    .map(p => Number(p.farmaciaId))
    .filter(n => !isNaN(n) && n > 0);

  // Manejo de fallback de imagen: .png → .jpg → placeholder
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

  const sorted = [...precios].sort((a, b) =>
    sortOrder === 'asc' ? a.precio - b.precio : b.precio - a.precio
  );

  // Precio que se muestra en el hero
  const minPrecio    = precios.length > 0 ? Math.min(...precios.map(p => p.precio)) : null;
  const maxPrecio    = precios.length > 0 ? Math.max(...precios.map(p => p.precio)) : null;
  const heroPrice    = selectedFarmacia ? selectedFarmacia.precio : minPrecio;
  const heroSavings  = (heroPrice !== null && maxPrecio !== null && maxPrecio !== heroPrice)
    ? Math.round(((maxPrecio - heroPrice) / maxPrecio) * 100)
    : 0;

  const handleSelectFarmacia = (p: PrecioFarmacia) => {
    // Toggle: si ya está seleccionada la misma, deseleccionar
    setSelectedFarmacia(prev => prev?.farmaciaId === p.farmaciaId ? null : p);
  };

  return (
    <div className="pd-view view active">

      {/* Breadcrumb */}
      <div className="pd-breadcrumb container">
        <button className="pd-back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Volver a búsqueda
        </button>
        <span className="pd-sep">›</span>
        <span className="pd-current">{medicamento.name}</span>
      </div>

      {/* Hero */}
      <div className="container pd-hero">

        {/* Imagen */}
        <div className="pd-img-wrap">
          <img
            className="pd-img"
            src={imgSrc}
            alt={medicamento.name}
            onError={handleImgError}
          />
          <span className="pd-img-badge" style={{ background: catMeta.color }}>
            {catMeta.icon} {catMeta.label}
          </span>
        </div>

        {/* Info */}
        <div className="pd-info">
          <p className="pd-lab">{medicamento.lab}</p>
          <h1 className="pd-name">{medicamento.name}</h1>

          {/* Precio hero — cambia al seleccionar farmacia */}
          {loadingPrecios && <div className="pd-price-skeleton"/>}

          {!loadingPrecios && heroPrice !== null && (
            <div className="pd-price-hero">
              {/* Contexto de selección */}
              {selectedFarmacia ? (
                <p className="pd-price-context">
                  Precio en <strong>{selectedFarmacia.farmaciaNombre}</strong>
                  <button className="pd-clear-sel" onClick={() => setSelectedFarmacia(null)}>
                    ✕ Ver mejor precio
                  </button>
                </p>
              ) : (
                maxPrecio !== minPrecio && (
                  <span className="pd-old-price">
                    {formatPrice(maxPrecio!)} <em>(precio más alto)</em>
                  </span>
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
            {medicamento.category && (
              <div className="pd-spec">
                <span className="pd-spec-label">Categoría terapéutica</span>
                <span className="pd-spec-value">{medicamento.category}</span>
              </div>
            )}
            <div className="pd-spec">
              <span className="pd-spec-label">Búsqueda realizada con</span>
              <span className="pd-spec-value pd-strategy">
                {medicamento.estrategiaUsada.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Botón mapa */}
          {precios.length > 0 && (
            <button
              className={`pd-map-btn ${showMap ? 'pd-map-btn--on' : ''}`}
              onClick={() => setShowMap(v => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                <line x1="9" y1="3" x2="9" y2="18"/>
                <line x1="15" y1="6" x2="15" y2="21"/>
              </svg>
              {showMap
                ? 'Ocultar mapa'
                : `Ver las ${precios.length} farmacias con este producto en el mapa`}
            </button>
          )}
        </div>
      </div>

      {/* Mapa filtrado */}
      {showMap && (
        <div className="container pd-map-section">
          <div className="pd-map-header">
            <h2>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                <line x1="9" y1="3" x2="9" y2="18"/>
                <line x1="15" y1="6" x2="15" y2="21"/>
              </svg>
              Farmacias que venden «{medicamento.name}»
            </h2>
            <p>Solo se muestran las {precios.length} farmacias donde puedes comprar este medicamento</p>
          </div>
          <PharmacyMap filterPharmacyIds={farmaciaIdsConProducto} />
        </div>
      )}

      {/* Comparar precios */}
      <div className="container pd-prices-section">
        <div className="pd-prices-hd">
          <div>
            <h2>
              Comparar precios por farmacia
              {precios.length > 0 && <span className="pd-count-badge">{precios.length}</span>}
            </h2>
            {selectedFarmacia && (
              <p className="pd-hint">
                Haz clic en una farmacia para ver su precio arriba · 
                <button className="pd-hint-btn" onClick={() => setSelectedFarmacia(null)}>
                  Mostrar mejor precio
                </button>
              </p>
            )}
            {!selectedFarmacia && precios.length > 0 && (
              <p className="pd-hint">Haz clic en una farmacia para ver su precio</p>
            )}
          </div>
          {precios.length > 1 && (
            <button className="pd-sort-btn" onClick={() => setSortOrder(v => v === 'asc' ? 'desc' : 'asc')}>
              {sortOrder === 'asc' ? '↑ Mayor precio primero' : '↓ Menor precio primero'}
            </button>
          )}
        </div>

        {loadingPrecios && (
          <div className="pd-skeletons">{[1,2,3].map(i => <div key={i} className="pd-skel"/>)}</div>
        )}

        {!loadingPrecios && precios.length === 0 && (
          <div className="pd-empty">
            <span>🔍</span>
            <p>No hay precios registrados aún para este medicamento.</p>
            <small>Los precios se actualizan periódicamente.</small>
          </div>
        )}

        {!loadingPrecios && sorted.length > 0 && (
          <div className="pd-price-list">
            {sorted.map((p, idx) => {
              const isBest    = p.precio === minPrecio;
              const isSelected = selectedFarmacia?.farmaciaId === p.farmaciaId;
              const savings   = maxPrecio && maxPrecio !== minPrecio
                ? Math.round(((maxPrecio - p.precio) / maxPrecio) * 100) : 0;

              return (
                <div
                  key={idx}
                  className={`pd-card ${isBest ? 'pd-card--best' : ''} ${isSelected ? 'pd-card--selected' : ''}`}
                  onClick={() => handleSelectFarmacia(p)}
                  title="Haz clic para ver este precio arriba"
                >
                  {isBest && !isSelected && <div className="pd-best-tag">💰 Mejor precio disponible</div>}
                  {isSelected && <div className="pd-best-tag pd-selected-tag">✓ Seleccionada</div>}

                  <div className="pd-card-left">
                    <div className="pd-farm-avatar">🏪</div>
                    <div className="pd-farm-info">
                      <h4>{p.farmaciaNombre}</h4>
                      {p.farmaciaAddress && (
                        <p className="pd-addr">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {p.farmaciaAddress}
                        </p>
                      )}
                      <p className="pd-date">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
