import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, Building2, Plus, Users, Settings, LogOut, ChevronLeft, ChevronRight, ShieldCheck, UserCircle } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";

const guestLinks = [
  { to: "/dashboard",            label: "Overview",      icon: Home },
  { to: "/dashboard/businesses", label: "My Businesses", icon: Building2 },
  { to: "/dashboard/new",        label: "New Business",  icon: Plus },
];

const adminLinks = [
  { to: "/admin",            label: "Dashboard",  icon: Home },
  { to: "/admin/businesses", label: "Businesses", icon: Building2 },
  { to: "/admin/users",      label: "Users",      icon: Users },
  { to: "/admin/settings",   label: "Settings",   icon: Settings },
];

const Sidebar = () => {
  const { user, logout } = useAuthContext();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isAdmin = user?.role === ROLES.SUPER_ADMIN;
  const isVisitor = user?.role === "visitor";
  const links = isAdmin ? adminLinks : guestLinks;
  const handleLogout = () => { setShowLogoutConfirm(false); logout(); };

  return (
    <aside className={["flex h-screen flex-col border-r border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all duration-300", collapsed ? "w-[68px]" : "w-56"].join(" ")}>
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Biznest</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600">
            <Building2 className="h-4 w-4 text-white" />
          </div>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="absolute left-[68px] top-5 z-10 rounded-full border border-white/10 bg-slate-900 p-1 text-slate-400 shadow-lg transition-colors hover:text-white">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="px-4 py-3">
          <span className={["inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", isAdmin ? "bg-indigo-500/15 text-indigo-400" : "bg-emerald-500/15 text-emerald-400"].join(" ")}>
            {isAdmin ? <ShieldCheck className="h-3 w-3" /> : <UserCircle className="h-3 w-3" />}
            {isAdmin ? "Super Admin" : isVisitor ? "Visitor" : "Business Owner"}
          </span>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink key={link.to} to={link.to} end
              className={({ isActive }) => ["flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive ? "bg-indigo-600/20 text-indigo-300" : "text-slate-400 hover:bg-white/8 hover:text-white"
              ].join(" ")}>
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
            <button onClick={() => setShowLogoutConfirm(true)} className="shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-red-400">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button onClick={() => setShowLogoutConfirm(true)} className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-white/10 hover:text-red-400">
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Sign out?"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign out"
        cancelLabel="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        variant="danger"
      />
    </aside>
  );
};

export default Sidebar;
