import { useState, useEffect, useCallback } from 'react';
import type { DashboardData } from '../types';

/**
 * Configuración del API
 */
const GATEWAY = import.meta.env.VITE_API_URL 
  || `http://localhost:${import.meta.env.VITE_API_PORT || 4000}`;

const TOKEN_KEY = 'farmalink_token';

/**
 * Obtiene el token de autenticación
 * Si no existe, realiza login automático
 * @returns {Promise<string>} Token de autenticación
 */
async function getToken(): Promise<string> {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    const res = await fetch(`${GATEWAY}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@farmalink.com', password: 'admin123' })
    });
    const data = await res.json();
    token = data.token;
    localStorage.setItem(TOKEN_KEY, token!);
  }
  return token!;
}

/**
 * Hook personalizado para manejar datos del dashboard
 * @returns {Object} Estado y funciones del hook
 */
export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      const res = await fetch(`${GATEWAY}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error('Error fetching data');
      }
      
      const dashboardData = await res.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook para manejar scroll y aplicar clase al header
 * @returns {void}
 */
export function useScrollEffect(): void {
  useEffect(() => {
    const handleScroll = () => {
      const header = document.getElementById('header');
      if (header) {
        header.classList.toggle('scrolled', window.scrollY > 50);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}
