import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth } = useAuthContext();

  if (isCheckingAuth) {
    return <p className="text-slate-600">Checking authentication...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
