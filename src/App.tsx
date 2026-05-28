import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import type { View, Tab, Sugerencia } from './types';
import { useDashboard, useScrollEffect } from './hooks/useDashboard';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/home/Hero';
import { Features } from './components/home/Features';
import { Slider } from './components/home/Slider';
import { SearchSection } from './components/search/SearchSection';
import { Dashboard } from './components/dashboard/Dashboard';
import { LoadingState, ErrorState } from './components/common/LoadingError';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { AdminMedicamentos } from './components/AdminMedicamentos';
import { ProductoDetalle } from './components/product/ProductoDetalle';
import { MapView } from './components/map/MapView';
import { CategoryView } from './components/category/CategoryView';
import { Breadcrumb } from './components/common/Breadcrumb';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import PrivacyBanner from './components/common/PrivacyBanner';
import MiCuenta from './components/settings/MiCuenta';
import { CartView } from './components/cart/CartView';
import { CheckoutView } from './components/checkout/CheckoutView';
import { QuienesSomos } from './components/QuienesSomos';
import { DevelopersView } from './components/developers/DevelopersView';
import { ValidadorView } from './components/developers/ValidadorView';
import { FaqView } from './components/help/FaqView';

const VIEWS_SIN_BREADCRUMB: View[] = ['home', 'login', 'producto', 'categoria', 'checkout', 'validador'];



function normPath(p: string): string {
  const x = p.replace(/\/$/, '') || '/';
  return x === '/settings' ? '/settings' : x;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState<View>(() => {
    if (typeof window !== 'undefined' && normPath(window.location.pathname) === '/settings') return 'settings';
    return 'home';
  });
  const [prevView, setPrevView] = useState<View>('home');
  const [dashboardTab, setDashboardTab] = useState<Tab>('farmacias');
  const [selectedMed, setSelectedMed] = useState<Sugerencia | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem('token');
    return !!token;
  });
  const [userRole, setUserRole] = useState<string>(() => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).role : '';
  });
  const { data, loading, error, refetch } = useDashboard();

  useScrollEffect();

  // Inicializar Google Analytics una sola vez al cargar la app
  useEffect(() => {
    ReactGA.initialize('G-1GW8DFN2PV');
  }, []);

  // Registrar cada cambio de vista (view) en Google Analytics
  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: `/${view}`, title: view.toUpperCase() });
  }, [view]);

  const goView = useCallback((v: View) => {
    if (v === 'settings') {
      navigate('/settings');
    } else if (normPath(location.pathname) === '/settings') {
      navigate('/', { replace: true });
    }
    setView(v);
  }, [navigate, location.pathname]);

  useEffect(() => {
    const path = normPath(location.pathname);
    if (path === '/settings') {
      setView((prev) => (prev === 'settings' ? prev : 'settings'));
    } else {
      setView((prev) => (prev === 'settings' ? 'home' : prev));
    }
  }, [location.pathname]);

  const handleLoginSuccess = () => {
    const user = localStorage.getItem('user');
    const role = user ? JSON.parse(user).role : '';
    setUserRole(role);
    setIsAuthenticated(true);
    const VIEWS_SIN_RETORNO: View[] = ['login'];
    if (prevView && !VIEWS_SIN_RETORNO.includes(prevView)) {
      goView(prevView);
    } else {
      goView(role === 'admin' ? 'admin' : 'dashboard');
    }
  };

  const goToLogin = (from: View) => {
    setPrevView(from);
    goView('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserRole('');
    setIsAuthenticated(false);
    goView('home');
  };

  const handleSelectMed = (med: Sugerencia) => {
    if (!isAuthenticated) {
      goView('login');
      return;
    }
    setSelectedMed(med);
    goView('producto');
  };

  const handleTabChange = (tab: Tab) => {
    setDashboardTab(tab);
  };

  if (loading) {
    return (
      <>
        <Header
          currentView={view}
          onViewChange={goView}
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          onLogout={handleLogout}
          onCategorySelect={setSelectedCategory}
        />
        <LoadingState />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          currentView={view}
          onViewChange={goView}
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          onLogout={handleLogout}
          onCategorySelect={setSelectedCategory}
        />
        <ErrorState message={error} onRetry={refetch} />
      </>
    );
  }

  return (
    <>
      <Header
        currentView={view}
        onViewChange={(v) => {
          if (v === 'login') {
            goToLogin(view);
          } else {
            goView(v);
          }
        }}
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        onLogout={handleLogout}
        onCategorySelect={setSelectedCategory}
      />

      {!VIEWS_SIN_BREADCRUMB.includes(view) && (
        <Breadcrumb view={view} onGoHome={() => goView('home')} />
      )}

      <PrivacyBanner />

      {view === 'home' && (
        <div className="view active">
          <Hero
            data={data}
            onSearchClick={() => goView('buscar')}
            onDashboardClick={() => {
              if (!isAuthenticated) {
                goView('login');
                return;
              }
              goView('dashboard');
              setDashboardTab('farmacias');
            }}
          />
          <Features farmCount={data?.farmacias.length ?? 0} />
          <Slider onNavigate={(v) => goView(v as any)} />
        </div>
      )}

      {view === 'buscar' && (
        <SearchSection
          onSelect={handleSelectMed}
          isAuthenticated={isAuthenticated}
          onLoginRequired={() => goToLogin('buscar')}
        />
      )}

      {view === 'categoria' && (
        <ProtectedRoute isAuthenticated={isAuthenticated} onGoLogin={() => goToLogin('categoria')} onGoHome={() => goView('home')} viewLabel="Categorías">
          <CategoryView
            categoriaInicial={selectedCategory}
            onSelect={handleSelectMed}
            onGoHome={() => goView('home')}
          />
        </ProtectedRoute>
      )}

      {view === 'dashboard' && (
        <ProtectedRoute isAuthenticated={isAuthenticated} onGoLogin={() => goToLogin('dashboard')} onGoHome={() => goView('home')} viewLabel="Dashboard">
          {data && (
            <Dashboard
              data={data}
              activeTab={dashboardTab}
              onTabChange={handleTabChange}
            />
          )}
        </ProtectedRoute>
      )}

      {view === 'admin' && (
        <ProtectedRoute isAuthenticated={isAuthenticated} onGoLogin={() => goToLogin('admin')} onGoHome={() => goView('home')} requireRole="admin" userRole={userRole} viewLabel="Panel de Administración">
          <AdminMedicamentos />
        </ProtectedRoute>
      )}

      {view === 'mapa' && (
        <ProtectedRoute isAuthenticated={isAuthenticated} onGoLogin={() => goToLogin('mapa')} onGoHome={() => goView('home')} viewLabel="Mapa">
          <MapView />
        </ProtectedRoute>
      )}

      {view === 'producto' && selectedMed && (
        <ProtectedRoute isAuthenticated={isAuthenticated} onGoLogin={() => goToLogin('producto')} onGoHome={() => goView('home')} viewLabel="Detalle del Medicamento">
          <ProductoDetalle
            medicamento={selectedMed}
            onBack={() => goView('buscar')}
            onGoHome={() => goView('home')}
            onGoCategory={(cat) => { setSelectedCategory(cat); goView('categoria'); }}
          />
        </ProtectedRoute>
      )}

      {view === 'login' && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => goView('registro')}
        />
      )}

      {view === 'registro' && (
        <Register
          onRegisterSuccess={handleLoginSuccess}
          onNavigateToLogin={() => goView('login')}
        />
      )}

      {view === 'settings' && (
        <ProtectedRoute isAuthenticated={isAuthenticated} onGoLogin={() => goToLogin('settings')} onGoHome={() => goView('home')} viewLabel="Mi cuenta">
          <MiCuenta onGoHome={() => goView('home')} />
        </ProtectedRoute>
      )}
      {view === 'quienes-somos' && (
        <div className="view active">
          <QuienesSomos />
        </div>
      )}

      {view === 'cart' && (
        <CartView 
          onGoHome={() => goView('home')} 
          onGoSearch={() => goView('buscar')}
          onGoCheckout={() => {
            if (!isAuthenticated) {
              goToLogin('checkout');
            } else {
              goView('checkout');
            }
          }}
        />
      )}

      {view === 'checkout' && (
        <ProtectedRoute isAuthenticated={isAuthenticated} onGoLogin={() => goToLogin('checkout')} onGoHome={() => goView('home')} viewLabel="Checkout">
          <CheckoutView 
            onGoHome={() => goView('home')}
            onGoCart={() => goView('cart')}
          />
        </ProtectedRoute>
      )}

      {view === 'desarrolladores' && (
        <div className="view active">
          <DevelopersView 
            isAuthenticated={isAuthenticated}
            userRole={userRole}
            onGoSettings={() => goView('settings')}
            onGoValidator={() => goView('validador')}
          />
        </div>
      )}

      {view === 'validador' && (
        <div className="view active">
          <ValidadorView onGoBack={() => goView('desarrolladores')} />
        </div>
      )}

      {view === 'faq' && (
        <div className="view active">
          <FaqView />
        </div>
      )}

      <Footer onNavigate={(viewName) => goView(viewName as View)} />
    </>
  );
}

export default App;
