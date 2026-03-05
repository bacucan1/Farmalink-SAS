import { SearchAutocomplete } from '../SearchAutocomplete';
import type { Sugerencia } from '../../types';
import './SearchSection.css';

/**
 * Props para el componente SearchSection
 * @interface SearchSectionProps
 */
interface SearchSectionProps {
  /** Callback cuando se selecciona un medicamento */
  onSelect?: (medicamento: Sugerencia) => void;
}

/**
 * SearchSection - Sección de búsqueda de medicamentos
 * @component
 * @description Página de búsqueda con autocompletado inteligente
 * @param {SearchSectionProps} props - Propiedades del componente
 * @returns {JSX.Element} Sección de búsqueda
 */
export function SearchSection({ onSelect }: SearchSectionProps) {
  const handleSelect = (med: Sugerencia) => {
    console.log('Medicamento seleccionado:', med);
    onSelect?.(med);
  };

  return (
    <div className="view active search-section">
      <div className="search-hero">
        <div className="container">
          <div className="section-tag">Búsqueda inteligente</div>
          <h1 className="section-title">¿Qué medicamento<br />estás buscando?</h1>
          <p className="section-desc">
            Escribe al menos 2 caracteres. El sistema selecciona automáticamente 
            la mejor estrategia de búsqueda.
          </p>
          <SearchAutocomplete
            placeholder="Ej: Acetaminofén, antibiótico, Genfar..."
            onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}
