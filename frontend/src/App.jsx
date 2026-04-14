import Layout from "./components/Layout";
import Button from "./components/Button";
import { ProtectedRoute } from "./components/Auth";
import { useAuthContext } from "./context/AuthContext";
import { Navigate, Route, Routes } from "react-router-dom";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SignupPage from "./pages/SignupPage";

const App = () => {
  const { isAuthenticated, isCheckingAuth, user, logout } = useAuthContext();

  const rightNode = isAuthenticated ? (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-700">{user?.email}</span>
      <Button variant="secondary" onClick={logout}>
        Logout
      </Button>
    </div>
  ) : null;

  return (
    <Layout rightNode={rightNode}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={isCheckingAuth ? <p className="text-slate-600">Loading...</p> : <LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
