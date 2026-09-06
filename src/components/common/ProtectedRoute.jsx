// src/components/common/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function ProtectedRoute() {
  const { session } = useAuth();

  // Se não houver sessão, redireciona para o login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Se houver sessão, renderiza a rota filha (Outlet)
  return <Outlet />;
}