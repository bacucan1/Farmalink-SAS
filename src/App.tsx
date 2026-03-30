import { useState } from 'react';
import type { View, Tab, Sugerencia } from './types';
import { useDashboard, useScrollEffect } from './hooks/useDashboard';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/home/Hero';
import { Features } from './components/home/Features';
import { SearchSection } from './components/search/SearchSection';
import { Dashboard } from './components/dashboard/Dashboard';
import { LoadingState, ErrorState } from './components/common/LoadingError';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { AdminMedicamentos } from './components/AdminMedicamentos';
import { ProductoDetalle } from './components/product/ProductoDetalle';
import { MapView } from './components/map/MapView';
import { CategoryView } from './components/category/CategoryView';
// PUNTO 4: breadcrumb global
import { Breadcrumb } from './components/common/Breadcrumb';
import { ProtectedRoute } from './components/common/ProtectedRoute';
// PUNTO 5: módulo de cuenta de usuario
import MiCuenta from './components/settings/MiCuenta';
import './App.css';

// Vistas que ya tienen su propio breadcrumb interno o no lo necesitan
const VIEWS_SIN_BREADCRUMB: View[] = ['home', 'login', 'producto', 'categoria'];

function App() {
  const [view, setView] = useState<View>('home');
  const [prevView, setPrevView] = useState<View>('home'); // vista antes del login
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

  const handleLoginSuccess = () => {
    const user = localStorage.getItem('user');
    const role = user ? JSON.parse(user).role : '';
    setUserRole(role);
    setIsAuthenticated(true);
    // Volver a la vista anterior si venía de una sección protegida
    if (prevView && prevView !== 'login' && prevView !== 'home') {
      setView(prevView);
    } else {
      setView(role === 'admin' ? 'admin' : 'dashboard');
    }
  };

  const goToLogin = (from: View) => {
    setPrevView(from);
    setView('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserRole('');
    setIsAuthenticated(false);
    setView('home');
  };

  const handleSelectMed = (med: Sugerencia) => {
    console.log('Medicamento seleccionado:', med);
    if (!isAuthenticated) {
      setView('login');
      return;
    }
    setSelectedMed(med);
    setView('producto');
  };

  const handleTabChange = (tab: Tab) => {
    setDashboardTab(tab);
  };

  if (loading) {
    return (
      <>
        <Header 
          currentView={view} 
          onViewChange={setView} 
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
          onViewChange={setView} 
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
        onViewChange={setView} 
        isAuthenticated={isAuthenticated} 
        userRole={userRole} 
        onLogout={handleLogout}
        onCategorySelect={setSelectedCategory}
      />

      {/* PUNTO 4: breadcrumb global — aparece en todas las secciones excepto
          home, login, producto y categoria (que tienen el suyo propio) */}
      {!VIEWS_SIN_BREADCRUMB.includes(view) && (
        <Breadcrumb view={view} onGoHome={() => setView('home')} />
      )}

      {view === 'home' && (
        <div className="view active">
          <Hero
            data={data}
            onSearchClick={() => setView('buscar')}
            onDashboardClick={() => {
              if (!isAuthenticated) { setView('login'); return; }
              setView('dashboard');
              setDashboardTab('farmacias');
            }}
          />
          <Features farmCount={data?.farmacias.length ?? 0} />
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
        <ProtectedRoute isAuthenticated={isAuthenticated} onGoLogin={() => goToLogin('categoria')} onGoHome={() => setView('home')} viewLabel="Categorías">
          <CategoryView 
            categoriaInicial={selectedCategory} 
            onSelect={handleSelectMed}
            onGoHome={() => setView('home')}
          />
        </ProtectedRoute>
      )}

      {view === 'dashboard' && (
        <ProtectedRoute isAuthenticated={isAuthenticated} onGoLogin={() => goToLogin('dashboard')} onGoHome={() => setView('home')} viewLabel="Dashboard">
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
        <ProtectedRoute isAuthenticated={isAuthenticated} onGoLogin={() => goToLogin('admin')} onGoHome={() => setView('home')} requireRole="admin" userRole={userRole} viewLabel="Panel de Administración">
          <AdminMedicamentos />
        </ProtectedRoute>
      )}

      {view === 'mapa' && (
        <ProtectedRoute isAuthenticated={isAuthenticated} onGoLogin={() => goToLogin('mapa')} onGoHome={() => setView('home')} viewLabel="Mapa">
          <MapView />
        </ProtectedRoute>
      )}

      {view === 'producto' && selectedMed && (
        <ProtectedRoute isAuthenticated={isAuthenticated} onGoLogin={() => goToLogin('producto')} onGoHome={() => setView('home')} viewLabel="Detalle del Medicamento">
          <ProductoDetalle
            medicamento={selectedMed}
            onBack={() => setView('buscar')}
            onGoHome={() => setView('home')}
            onGoCategory={(cat) => { setSelectedCategory(cat); setView('categoria'); }}
          />
        </ProtectedRoute>
      )}

      {view === 'login' && (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onNavigateToRegister={() => setView('registro')} 
        />
      )}

      {view === 'registro' && (
        <Register
          onRegisterSuccess={handleLoginSuccess}
          onNavigateToLogin={() => setView('login')}
        />
      )}

      {/* PUNTO 5: vista de gestión de cuenta */}
      {view === 'settings' && (
        <ProtectedRoute isAuthenticated={isAuthenticated} onGoLogin={() => goToLogin('settings')} onGoHome={() => setView('home')} viewLabel="Mi cuenta">
          <MiCuenta onGoHome={() => setView('home')} />
        </ProtectedRoute>
      )}

      <Footer onNavigate={(viewName) => setView(viewName as View)} />
    </>
  );
}

export default App;
