import { useState, useEffect, useCallback, useRef } from 'react';
import logoBusqueda from '../../assets/icon-busqueda.png';
import logoIA from '../../assets/icon-ia.png';
import logoMapa from '../../assets/icon-mapa.png';
import logoPrecios from '../../assets/icon-precios.png';
import logoFarmalink from '../../assets/logo-farmalink.png';
import iconDashFarmacias from '../../assets/icon-dash-farmacias.png';
import './Slider.css';

interface Slide {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaAction: string;
  accent: string;
  img: string;
  imgAlt: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tag: 'Novedad',
    title: 'Compara precios en tiempo real',
    subtitle: 'Más de 200 medicamentos en farmacias de Bogotá. Encuentra la mejor oferta a un clic.',
    cta: 'Buscar ahora',
    ctaAction: 'buscar',
    accent: '#3e800e',
    img: logoPrecios,
    imgAlt: 'Comparador de precios de medicamentos',
  },
  {
    id: 2,
    tag: 'Inteligencia Artificial',
    title: 'Recomendaciones personalizadas con IA',
    subtitle: 'Nuestro motor de IA analiza tu historial y sugiere alternativas genéricas que te ahorran hasta un 60%.',
    cta: 'Conocer más',
    ctaAction: 'buscar',
    accent: '#0B7DB8',
    img: logoIA,
    imgAlt: 'Recomendaciones inteligentes con IA',
  },
  {
    id: 3,
    tag: 'Mapa interactivo',
    title: 'Encuentra farmacias cerca de ti',
    subtitle: 'Visualiza en el mapa todas las farmacias aliadas en Bogotá con horarios, contacto y disponibilidad.',
    cta: 'Ver mapa',
    ctaAction: 'mapa',
    accent: '#00A896',
    img: logoMapa,
    imgAlt: 'Mapa interactivo de farmacias en Bogotá',
  },
  {
    id: 4,
    tag: 'Ahorro garantizado',
    title: 'Ahorra en cada compra de medicamentos',
    subtitle: 'Usuarios de FarmaLink ahorran en promedio $15.000 por mes comparando precios antes de comprar.',
    cta: 'Empezar a ahorrar',
    ctaAction: 'buscar',
    accent: '#3e800e',
    img: logoBusqueda,
    imgAlt: 'Ahorro en medicamentos',
  },
  {
    id: 5,
    tag: 'Red de farmacias',
    title: 'Aliados en toda Bogotá',
    subtitle: 'Trabajamos con las principales cadenas y droguerías independientes para ofrecerte siempre el mejor precio.',
    cta: 'Ver farmacias',
    ctaAction: 'dashboard',
    accent: '#0B7DB8',
    img: iconDashFarmacias,
    imgAlt: 'Red de farmacias aliadas en Bogotá',
  },
  {
    id: 6,
    tag: 'FarmaLink',
    title: 'Salud accesible para todos',
    subtitle: 'Nuestra misión es democratizar el acceso a información farmacéutica transparente en Colombia.',
    cta: 'Quiénes somos',
    ctaAction: 'quienes-somos',
    accent: '#3e800e',
    img: logoFarmalink,
    imgAlt: 'FarmaLink - Plataforma de salud',
  },
];

interface SliderProps {
  onNavigate: (view: string) => void;
}

export function Slider({ onNavigate }: SliderProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animDir, setAnimDir] = useState<'next' | 'prev'>('next');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = SLIDES.length;

  const goTo = useCallback((index: number, dir: 'next' | 'prev' = 'next') => {
    setAnimDir(dir);
    setCurrent((index + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1, 'next'), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, 'prev'), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next]);

  const slide = SLIDES[current];

  return (
    <section
      className="slider-section"
      aria-label="Publicidad y novedades de FarmaLink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="slider-track" style={{ '--accent': slide.accent } as React.CSSProperties}>
        <div className={`slider-slide slider-slide--${animDir}`} key={slide.id}>
          <div className="container slider-inner">
            <div className="slider-content">
              <span className="slider-tag" style={{ background: slide.accent }}>{slide.tag}</span>
              <h2 className="slider-title">{slide.title}</h2>
              <p className="slider-subtitle">{slide.subtitle}</p>
              <button
                className="slider-cta"
                style={{ background: slide.accent }}
                onClick={() => onNavigate(slide.ctaAction)}
              >
                {slide.cta}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
            <div className="slider-img-wrap">
              <img src={slide.img} alt={slide.imgAlt} className="slider-img" />
            </div>
          </div>
        </div>
      </div>

      <button
        className="slider-arrow slider-arrow--prev"
        onClick={() => { prev(); setPaused(true); }}
        aria-label="Diapositiva anterior"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button
        className="slider-arrow slider-arrow--next"
        onClick={() => { next(); setPaused(true); }}
        aria-label="Siguiente diapositiva"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      <div className="slider-dots" role="tablist" aria-label="Ir a diapositiva">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === current}
            aria-label={`Diapositiva ${i + 1}: ${s.title}`}
            className={`slider-dot ${i === current ? 'slider-dot--active' : ''}`}
            onClick={() => { goTo(i, i > current ? 'next' : 'prev'); setPaused(true); }}
          />
        ))}
      </div>

      <div className="slider-progress" aria-hidden="true">
        <div
          className={`slider-progress-bar ${!paused ? 'slider-progress-bar--running' : ''}`}
          style={{ '--accent': slide.accent } as React.CSSProperties}
        />
      </div>
    </section>
  );
}
