import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MoreVertical, Pencil, Trash2, CheckCircle, XCircle, Eye } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import Button from "../components/Button";
import DashboardLayout from "../components/DashboardLayout/DashboardLayout";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog";
import { businessService } from "../services/businessService";
import { BUSINESS_STATUS } from "../utils/constants";
import BlurText from "../bits/BlurText/BlurText";
import ShinyText from "../bits/ShinyText/ShinyText";
import apiClient from "../services/apiClient";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const buildMonthlyData = (businesses) => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const month = d.getMonth(), year = d.getFullYear();
    const inMonth = businesses.filter(b => {
      const c = new Date(b.createdAt);
      return c.getMonth() === month && c.getFullYear() === year;
    });
    return {
      month: MONTHS[month],
      total: inMonth.length,
      approved: inMonth.filter(b => b.status === BUSINESS_STATUS.APPROVED).length,
      pending:  inMonth.filter(b => b.status === BUSINESS_STATUS.PENDING).length,
      rejected: inMonth.filter(b => b.status === BUSINESS_STATUS.REJECTED).length,
    };
  });
};

const PIE_COLORS = { approved: "#34d399", pending: "#fbbf24", rejected: "#f87171" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="mb-2 text-xs font-semibold text-slate-400">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
          <span className="capitalize text-slate-300">{p.dataKey}:</span>
          <span className="font-semibold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const statusConfig = {
  [BUSINESS_STATUS.PENDING]:  { label: "Pending",  cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  [BUSINESS_STATUS.APPROVED]: { label: "Approved", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  [BUSINESS_STATUS.REJECTED]: { label: "Rejected", cls: "bg-red-500/15 text-red-400 border-red-500/20" }
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] ?? statusConfig.pending;
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
};

const ActionMenu = ({ business, onApprove, onReject, onEdit, onDelete, onView }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative flex justify-center">
      <button onClick={e => { e.stopPropagation(); setOpen(p => !p); }}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white">
        <MoreVertical className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.92, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-9 z-50 w-40 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl">
            <button onClick={e => { e.stopPropagation(); setOpen(false); onView(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
              <Eye className="h-3.5 w-3.5 text-slate-400" /> View
            </button>
            {business.status === BUSINESS_STATUS.PENDING && (<>
              <button onClick={e => { e.stopPropagation(); setOpen(false); onApprove(); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-400 transition-colors hover:bg-emerald-500/15">
                <CheckCircle className="h-3.5 w-3.5" /> Approve
              </button>
              <button onClick={e => { e.stopPropagation(); setOpen(false); onReject(); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-amber-400 transition-colors hover:bg-amber-500/15">
                <XCircle className="h-3.5 w-3.5" /> Reject
              </button>
            </>)}
            <button onClick={e => { e.stopPropagation(); setOpen(false); onEdit(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-indigo-600/20 hover:text-white">
              <Pencil className="h-3.5 w-3.5 text-indigo-400" /> Edit
            </button>
            <button onClick={e => { e.stopPropagation(); setOpen(false); onDelete(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/15">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses]   = useState([]);
  const [users, setUsers]             = useState([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");
  const [filter, setFilter]           = useState("all");
  const [search, setSearch]           = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const [biz, usr] = await Promise.all([
        businessService.getAll(),
        apiClient.get("/users").then(r => r.data.data ?? [])
      ]);
      setBusinesses(biz);
      setUsers(usr);
    } catch (e) { setError(e.message); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const notify = (msg, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 3000);
  };

  const handleApprove = async (id) => {
    try {
      const updated = await businessService.approve(id);
      setBusinesses(p => p.map(b => b._id === id ? updated : b));
      notify("Business approved.");
    } catch (e) { notify(e.message, true); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      const updated = await businessService.reject(rejectModal.id, rejectReason);
      setBusinesses(p => p.map(b => b._id === rejectModal.id ? updated : b));
      setRejectModal(null); setRejectReason("");
      notify("Business rejected.");
    } catch (e) { notify(e.message, true); }
  };

  const handleDelete = async (id) => {
    try {
      await businessService.delete(id);
      setBusinesses(p => p.filter(b => b._id !== id));
      setDeleteTarget(null);
      notify("Business deleted.");
    } catch (e) { notify(e.message, true); }
  };

  const filtered = businesses.filter(b => {
    const matchFilter = filter === "all" || b.status === filter;
    const matchSearch = !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.owner?.name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const approved = businesses.filter(b => b.status === BUSINESS_STATUS.APPROVED).length;
  const pending  = businesses.filter(b => b.status === BUSINESS_STATUS.PENDING).length;
  const rejected = businesses.filter(b => b.status === BUSINESS_STATUS.REJECTED).length;
  const owners   = users.filter(u => u.role !== "super_admin").length;

  const stats = [
    { label: "Total Businesses", value: businesses.length, color: "text-white",        border: "border-white/10" },
    { label: "Pending Review",   value: pending,           color: "text-amber-400",    border: "border-amber-500/20" },
    { label: "Approved",         value: approved,          color: "text-emerald-400",  border: "border-emerald-500/20" },
    { label: "Rejected",         value: rejected,          color: "text-red-400",      border: "border-red-500/20" },
    { label: "Total Users",      value: users.length,      color: "text-indigo-400",   border: "border-indigo-500/20" },
    { label: "Business Owners",  value: owners,            color: "text-blue-400",     border: "border-blue-500/20" },
  ];

  const monthlyData = buildMonthlyData(businesses);
  const pieData = [
    { name: "Approved", value: approved },
    { name: "Pending",  value: pending },
    { name: "Rejected", value: rejected },
  ].filter(d => d.value > 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <BlurText text="Admin Dashboard" className="text-2xl font-bold text-white" delay={50} />
          <ShinyText text="Manage and review all business applications." className="mt-1 text-sm" color="#64748b" shineColor="#94a3b8" speed={4} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map(s => (
            <div key={s.label} className={`rounded-2xl border ${s.border} bg-white/5 p-5 backdrop-blur-sm`}>
              <p className={`text-3xl font-bold ${s.color}`}>{isLoading ? "—" : s.value}</p>
              <p className="mt-1 text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        {!isLoading && businesses.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Bar chart */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Business Activity (Last 6 Months)</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" />Approved</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />Pending</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" />Rejected</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} barSize={10} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="approved" fill="#34d399" radius={[4,4,0,0]} />
                  <Bar dataKey="pending"  fill="#fbbf24" radius={[4,4,0,0]} />
                  <Bar dataKey="rejected" fill="#f87171" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <h3 className="mb-4 text-sm font-semibold text-white">Status Breakdown</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {pieData.map(entry => (
                        <Cell key={entry.name} fill={PIE_COLORS[entry.name.toLowerCase()]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-slate-500">No data yet</div>
              )}
            </div>
          </div>
        )}

        {/* Feedback */}
        {error   && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"><p className="text-sm text-red-400">{error}</p></div>}
        {success && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3"><p className="text-sm text-emerald-400">{success}</p></div>}

        {/* Businesses Table */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-white">All Businesses</h3>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input type="text" placeholder="Search name or owner..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/25" />
              <div className="flex gap-1">
                {["all", BUSINESS_STATUS.PENDING, BUSINESS_STATUS.APPROVED, BUSINESS_STATUS.REJECTED].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={["rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all",
                      filter === f ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-white/10 hover:text-white"
                    ].join(" ")}>{f}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  {["Business","Owner","Category","Status","Date","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>}
                {!isLoading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No businesses found.</td></tr>}
                {filtered.map(b => (
                  <tr key={b._id} onClick={() => navigate(`/admin/businesses/${b._id}`)}
                    className="cursor-pointer transition-colors hover:bg-white/5">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {b.coverImage ? (
                          <img src={b.coverImage} alt={b.name} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-sm font-bold text-indigo-400">{b.name[0]}</div>
                        )}
                        <div>
                          <p className="font-medium text-white">{b.name}</p>
                          {b.description && <p className="mt-0.5 max-w-xs text-xs text-slate-500 line-clamp-1">{b.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-300">{b.owner?.name ?? "—"}</p>
                      <p className="text-xs text-slate-500">{b.owner?.email ?? ""}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-400">{b.category || "—"}</td>
                    <td className="px-4 py-4"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <ActionMenu business={b}
                        onView={() => navigate(`/admin/businesses/${b._id}`)}
                        onApprove={() => handleApprove(b._id)}
                        onReject={() => setRejectModal({ id: b._id, name: b.name })}
                        onEdit={() => navigate(`/admin/businesses/${b._id}/edit`)}
                        onDelete={() => setDeleteTarget(b)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Reject "{rejectModal.name}"</h3>
            <p className="mt-1 text-sm text-slate-400">Provide a reason for rejection (optional).</p>
            <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20" />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setRejectModal(null); setRejectReason(""); }}>Cancel</Button>
              <Button variant="danger" onClick={handleReject}>Confirm Reject</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Business?"
        message={`"${deleteTarget?.name}" will be permanently deleted.`}
        confirmLabel="Delete" cancelLabel="Cancel"
        onConfirm={() => handleDelete(deleteTarget._id)}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </DashboardLayout>
  );
};

export default AdminDashboard;
