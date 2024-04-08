import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { Context } from '../context/AuthContext';

export function Protected({ children }) {
  const location = useLocation();

  const { user } = useContext(Context);
  if (user) {
    if (location.pathname === '/login') {
      return <Navigate to="/dashboard" />;
    }
    return children;
  }

  return <Navigate to="/login" />;
}
