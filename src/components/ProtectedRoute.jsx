import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    const role = user.role?.ID_role ?? user.ID_role;
    
    if (allowedRoles && !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
