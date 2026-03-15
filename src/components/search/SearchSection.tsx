import { useState } from 'react';
import { SearchAutocomplete } from '../SearchAutocomplete';
import { FiltrosBusqueda } from './FiltrosBusqueda';
import type { Sugerencia } from '../../types';
import './SearchSection.css';

interface SearchSectionProps {
  onSelect?: (medicamento: Sugerencia) => void;
  isAuthenticated?: boolean;
  onLoginRequired?: () => void;
}

export function SearchSection({ onSelect, isAuthenticated = false, onLoginRequired }: SearchSectionProps) {
  const [query, setQuery] = useState('');

  const handleSelect = (med: Sugerencia) => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }
    onSelect?.(med);
  };

  return (
    <div className="view active search-section">
      <div className="search-hero">
        <div className="container">
          <div className="section-tag">Búsqueda inteligente</div>
          <h1 className="section-title">
            ¿Qué medicamento<br />estás buscando?
          </h1>
          <p className="section-desc">
            Escribe al menos 2 caracteres. El sistema selecciona automáticamente
            la mejor estrategia de búsqueda.
          </p>

          {!isAuthenticated && (
            <div className="search-login-notice">
              🔒 Inicia sesión para ver el detalle y comparar precios
            </div>
          )}

          <SearchAutocomplete
            placeholder="Ej: Acetaminofén, antibiótico, Genfar..."
            onSelect={handleSelect}
            onQueryChange={setQuery}
          />
          <FiltrosBusqueda query={query} onSelect={handleSelect} />
        </div>
      </div>
    </div>
  );
}