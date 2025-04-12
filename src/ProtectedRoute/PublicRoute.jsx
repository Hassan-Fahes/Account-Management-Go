// src/Private/PublicRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const PublicRoute = () => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div className="text-center mt-10 text-blue-900 font-bold">Loading...</div>;
  }

  return !user ? <Outlet /> : <Navigate to="/admin" />;
};

export default PublicRoute;
