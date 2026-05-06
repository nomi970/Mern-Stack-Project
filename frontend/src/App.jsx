import { ProtectedRoute } from "./components/Auth";
import { useAuthContext } from "./context/AuthContext";
import { Navigate, Route, Routes } from "react-router-dom";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SignupPage from "./pages/SignupPage";
import { ROLES } from "./utils/constants";

// Guest pages
import GuestDashboard from "./pages/GuestDashboard";
import BusinessesPage from "./pages/BusinessesPage";
import NewBusinessPage from "./pages/NewBusinessPage";
import BusinessDetailPage from "./pages/BusinessDetailPage";
import EditBusinessPage from "./pages/EditBusinessPage";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminBusinessesPage from "./pages/AdminBusinessesPage";
import AdminBusinessDetailPage from "./pages/AdminBusinessDetailPage";
import AdminEditBusinessPage from "./pages/AdminEditBusinessPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";

const G = ({ children }) => <ProtectedRoute requiredRole={ROLES.GUEST}>{children}</ProtectedRoute>;
const A = ({ children }) => <ProtectedRoute requiredRole={ROLES.SUPER_ADMIN}>{children}</ProtectedRoute>;

const App = () => {
  const { isAuthenticated, user } = useAuthContext();
  const knownRole = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.GUEST;
  const defaultRedirect = isAuthenticated && knownRole
    ? user?.role === ROLES.SUPER_ADMIN ? "/admin" : "/dashboard"
    : "/login";

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Guest */}
      <Route path="/dashboard"                        element={<G><GuestDashboard /></G>} />
      <Route path="/dashboard/businesses"             element={<G><BusinessesPage /></G>} />
      <Route path="/dashboard/new"                    element={<G><NewBusinessPage /></G>} />
      <Route path="/dashboard/businesses/:id"         element={<G><BusinessDetailPage /></G>} />
      <Route path="/dashboard/businesses/:id/edit"    element={<G><EditBusinessPage /></G>} />

      {/* Admin */}
      <Route path="/admin"                            element={<A><AdminDashboard /></A>} />
      <Route path="/admin/businesses"                 element={<A><AdminBusinessesPage /></A>} />
      <Route path="/admin/businesses/:id"             element={<A><AdminBusinessDetailPage /></A>} />
      <Route path="/admin/businesses/:id/edit"        element={<A><AdminEditBusinessPage /></A>} />
      <Route path="/admin/users"                      element={<A><AdminUsersPage /></A>} />
      <Route path="/admin/settings"                   element={<A><AdminSettingsPage /></A>} />

      <Route path="/" element={<Navigate to={defaultRedirect} replace />} />
      <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
    </Routes>
  );
};

export default App;
