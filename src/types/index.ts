/**
 * Tipos del dominio FarmaLink
 * @package Farmalink
 * @description Definiciones de tipos interfaces para el frontend de FarmaLink
 */

/**
 * Representa una farmacia registrada en el sistema
 * @interface Farmacia
 */
export interface Farmacia {
  /** Identificador único de la farmacia */
  _id: string;
  /** Nombre comercial de la farmacia */
  name: string;
  /** Dirección física de la farmacia */
  address?: string;
  /** Teléfono de contacto */
  phone?: string;
  /** Latitud para coordenadas geográficas */
  lat?: number;
  /** Longitud para coordenadas geográficas */
  lng?: number;
}

/**
 * Representa un medicamento en el sistema
 * @interface Medicamento
 */
export interface Medicamento {
  /** Identificador único del medicamento */
  _id: string;
  /** Nombre comercial del medicamento */
  name: string;
  /** Laboratorio fabricante */
  lab: string;
  /** Indica si el medicamento está activo/disponible */
  active: boolean;
  /** Descripción detallada del medicamento */
  description?: string;
  /** Categoría terapéutica del medicamento */
  category?: string;
  /** FK a la farmacia que ofrece este medicamento */
  farmaciaId?: Farmacia | string;
}

/**
 * Representa el precio de un medicamento en una farmacia específica
 * @interface Precio
 */
export interface Precio {
  /** Identificador único del precio */
  _id: string;
  /** Valor monetario del medicamento */
  precio: number;
  /** FK al medicamento */
  medicamentoId?: Medicamento;
  /** FK a la farmacia */
  farmaciaId?: Farmacia;
  /** Fecha de vigencia del precio */
  fecha: string;
}

/**
 * Datos agregados del dashboard
 * @interface DashboardData
 */
export interface DashboardData {
  /** Lista de farmacias disponibles */
  farmacias: Farmacia[];
  /** Lista de medicamentos disponibles */
  medicamentos: Medicamento[];
  /** Lista de precios registrados */
  precios: Precio[];
}

/**
 * Sugerencia de búsqueda retornada por el API
 * @interface Sugerencia
 */
export interface Sugerencia {
  /** Identificador único */
  _id: string;
  /** Nombre del medicamento */
  name: string;
  /** Laboratorio */
  lab: string;
  /** Categoría terapéutica */
  category?: string;
  /** Descripción del medicamento */
  description?: string;
  /** Estrategia utilizada para la sugerencia */
  estrategiaUsada: string;
}

/**
 * Vistas disponibles en la aplicación
 * @typedef {'home' | 'buscar' | 'dashboard' | 'admin'} View
 */
export type View = 'home' | 'buscar' | 'dashboard' | 'admin' | 'login' | 'producto' | 'mapa';

/**
 * Pestañas del dashboard
 * @typedef {'farmacias' | 'medicamentos' | 'precios'} Tab
 */
export type Tab = 'farmacias' | 'medicamentos' | 'precios';

/**
 * Resultado de búsqueda con precios por farmacia
 * @interface SearchResult
 */
export interface SearchResult {
  /** Medicamento encontrado */
  medicamento: Medicamento;
  /** Lista de precios por farmacia */
  precios: Array<{
    farmacia: Farmacia;
    precio: number;
    fecha: string;
  }>;
  /** Precio más bajo encontrado */
  mejorPrecio?: number;
}
