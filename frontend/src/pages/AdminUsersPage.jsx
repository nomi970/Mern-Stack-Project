import { useEffect, useState } from "react";
import { Users, Mail, ShieldCheck, UserCircle, ChevronDown, ChevronUp, Building2 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout/DashboardLayout";
import BlurText from "../bits/BlurText/BlurText";
import apiClient from "../services/apiClient";

const roleBadge = (role) =>
  role === "super_admin"
    ? { cls: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20", icon: <ShieldCheck className="h-3 w-3" />, label: "Super Admin" }
    : role === "visitor"
    ? { cls: "bg-blue-500/15 text-blue-400 border-blue-500/20", icon: <UserCircle className="h-3 w-3" />, label: "Visitor" }
    : { cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", icon: <UserCircle className="h-3 w-3" />, label: "Business Owner" };

const statusCls = {
  approved: "bg-emerald-500/15 text-emerald-400",
  pending:  "bg-amber-500/15 text-amber-400",
  rejected: "bg-red-500/15 text-red-400",
};

const UserRow = ({ u }) => {
  const [open, setOpen] = useState(false);
  const badge = roleBadge(u.role);
  const hasBusinesses = u.businesses?.length > 0;

  return (
    <>
      <div
        className={`flex items-center gap-4 px-5 py-4 transition-colors ${hasBusinesses ? "cursor-pointer hover:bg-white/5" : ""}`}
        onClick={() => hasBusinesses && setOpen(p => !p)}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-bold text-indigo-300">
          {u.name?.[0]?.toUpperCase() ?? "U"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white">{u.name}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Mail className="h-3 w-3" /> {u.email}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasBusinesses && (
            <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">
              <Building2 className="h-3 w-3" /> {u.businesses.length}
            </span>
          )}
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.cls}`}>
            {badge.icon} {badge.label}
          </span>
          {hasBusinesses && (
            open ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </div>

      {open && hasBusinesses && (
        <div className="border-t border-white/5 bg-slate-900/40 px-5 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Businesses</p>
          <div className="space-y-2">
            {u.businesses.map(b => (
              <div key={b._id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-xs font-bold text-indigo-400">
                    {b.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{b.name}</p>
                    {b.category && <p className="text-xs text-slate-500">{b.category}</p>}
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusCls[b.status] ?? statusCls.pending}`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/users").then(r => setUsers(r.data.data ?? [])).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const total      = users.length;
  const owners     = users.filter(u => u.role !== "super_admin").length;
  const admins     = users.filter(u => u.role === "super_admin").length;
  const totalBiz   = users.reduce((s, u) => s + (u.businesses?.length ?? 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <BlurText text="Users" className="text-2xl font-bold text-white" delay={50} />
          <p className="mt-1 text-sm text-slate-400">All registered users and their businesses.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Users",      value: total,    color: "text-white" },
            { label: "Business Owners",  value: owners,   color: "text-emerald-400" },
            { label: "Admins",           value: admins,   color: "text-indigo-400" },
            { label: "Total Businesses", value: totalBiz, color: "text-amber-400" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className={`text-3xl font-bold ${s.color}`}>{isLoading ? "—" : s.value}</p>
              <p className="mt-1 text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-400" /> All Users
            </h3>
            <span className="text-xs text-slate-500">{total} total</span>
          </div>
          {isLoading && <p className="px-5 py-8 text-center text-sm text-slate-500">Loading...</p>}
          {!isLoading && users.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-500">No users found.</p>}
          <div className="divide-y divide-white/5">
            {users.map(u => <UserRow key={u._id} u={u} />)}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsersPage;
