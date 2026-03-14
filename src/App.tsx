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
import { AdminMedicamentos } from './components/AdminMedicamentos';
import { ProductoDetalle } from './components/product/ProductoDetalle';
import { MapView } from './components/map/MapView';
import './App.css';

/**
 * Componente principal de la aplicación FarmaLink
 * @component
 * @description Aplicación principal que gestiona las vistas, carga de datos y navegación
 * @returns {JSX.Element} Aplicación completa de FarmaLink
 */
function App() {
  const [view, setView] = useState<View>('home');
  const [dashboardTab, setDashboardTab] = useState<Tab>('farmacias');
  const [selectedMed, setSelectedMed] = useState<Sugerencia | null>(null);
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
    setView(role === 'admin' ? 'admin' : 'dashboard');
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
        <Header currentView={view} onViewChange={setView} isAuthenticated={isAuthenticated} userRole={userRole} onLogout={handleLogout} />
        <LoadingState />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header currentView={view} onViewChange={setView} isAuthenticated={isAuthenticated} userRole={userRole} onLogout={handleLogout} />
        <ErrorState message={error} onRetry={refetch} />
      </>
    );
  }

  return (
    <>
      <Header currentView={view} onViewChange={setView} isAuthenticated={isAuthenticated} userRole={userRole} onLogout={handleLogout} />

      {view === 'home' && (
        <div className="view active">
          <Hero
            data={data}
            onSearchClick={() => {
              if (!isAuthenticated) { setView('login'); return; }
              setView('buscar');
            }}
            onDashboardClick={() => {
              if (!isAuthenticated) { setView('login'); return; }
              setView('dashboard');
              setDashboardTab('farmacias');
            }}
          />
          <Features farmCount={data?.farmacias.length ?? 0} />
        </div>
      )}

      {view === 'buscar' && isAuthenticated && (
        <SearchSection onSelect={handleSelectMed} />
      )}

      {view === 'dashboard' && data && isAuthenticated && (
        <Dashboard
          data={data}
          activeTab={dashboardTab}
          onTabChange={handleTabChange}
        />
      )}

      {view === 'admin' && userRole === 'admin' && isAuthenticated && (
        <AdminMedicamentos />
      )}

      {view === 'mapa' && (
        <MapView />
      )}

      {view === 'producto' && selectedMed && (
        <ProductoDetalle
          medicamento={selectedMed}
          onBack={() => setView('buscar')}
        />
      )}

      {view === 'login' && (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onNavigateToRegister={() => {}} 
        />
      )}

      <Footer onNavigate={(viewName) => setView(viewName as View)} />
    </>
  );
}

export default App;
