import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // If role does not match, redirect to their role dashboard or home
      if (user.role === 'admin') return <Navigate to="/admin" replace />;
      if (user.role === 'employer') return <Navigate to="/community" replace />;
      if (user.role === 'student') return <Navigate to="/dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  } catch (err) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
