import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { MoreVertical, Pencil, Trash2, Building2, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "../components/Button";
import DashboardLayout from "../components/DashboardLayout/DashboardLayout";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog";
import { useAuthContext } from "../context/AuthContext";
import { businessService } from "../services/businessService";
import { BUSINESS_STATUS } from "../utils/constants";
import BlurText from "../bits/BlurText/BlurText";
import ShinyText from "../bits/ShinyText/ShinyText";

/* ── helpers ── */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const buildMonthlyData = (businesses) => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = MONTHS[d.getMonth()];
    const month = d.getMonth();
    const year = d.getFullYear();
    const inMonth = businesses.filter(b => {
      const c = new Date(b.createdAt);
      return c.getMonth() === month && c.getFullYear() === year;
    });
    return {
      month: label,
      total: inMonth.length,
      approved: inMonth.filter(b => b.status === BUSINESS_STATUS.APPROVED).length,
      pending: inMonth.filter(b => b.status === BUSINESS_STATUS.PENDING).length,
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

const StatusBadge = ({ status }) => {
  const map = {
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/15 text-red-400 border-red-500/20",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/20"
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] ?? map.pending}`}>
      {status}
    </span>
  );
};

const TableActionMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative flex justify-center">
      <button
        onClick={e => { e.stopPropagation(); setOpen(p => !p); }}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-9 z-50 w-36 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl"
          >
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

const inputCls = "w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/25";

const GuestDashboard = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    businessService.getMine()
      .then(setBusinesses)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async () => {
    try {
      await businessService.deleteMine(deleteTarget._id);
      setBusinesses(p => p.filter(b => b._id !== deleteTarget._id));
    } catch (e) { console.error(e); }
    finally { setDeleteTarget(null); }
  };

  const openEdit = (b) => {
    setEditTarget(b);
    setEditForm({ name: b.name, category: b.category, businessType: b.businessType, city: b.city, location: b.location, description: b.description });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await businessService.editMine(editTarget._id, editForm);
      setBusinesses(p => p.map(b => b._id === editTarget._id ? updated : b));
      setEditTarget(null);
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const approved = businesses.filter(b => b.status === BUSINESS_STATUS.APPROVED).length;
  const pending  = businesses.filter(b => b.status === BUSINESS_STATUS.PENDING).length;
  const rejected = businesses.filter(b => b.status === BUSINESS_STATUS.REJECTED).length;

  const stats = [
    { label: "Total Businesses", value: businesses.length, icon: "🏢", color: "text-white", border: "border-white/10" },
    { label: "Approved",         value: approved,           icon: "✅", color: "text-emerald-400", border: "border-emerald-500/20" },
    { label: "Pending Review",   value: pending,            icon: "⏳", color: "text-amber-400",   border: "border-amber-500/20" },
    { label: "Rejected",         value: rejected,           icon: "❌", color: "text-red-400",     border: "border-red-500/20" },
  ];

  const monthlyData = buildMonthlyData(businesses);

  const pieData = [
    { name: "Approved", value: approved },
    { name: "Pending",  value: pending },
    { name: "Rejected", value: rejected },
  ].filter(d => d.value > 0);

  const recent = [...businesses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <>
    <DashboardLayout>
      <div className="space-y-6">

        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-600/20 via-blue-600/10 to-transparent p-6">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent" />
          <div className="relative">
            <BlurText text={`Good day, ${user?.name ?? ""}!`} className="text-2xl font-bold text-white" delay={60} />
            <ShinyText text="Here's your Biznest dashboard � manage and track your listed businesses." className="mt-1 text-sm" color="#64748b" shineColor="#94a3b8" speed={4} />
            <Button className="mt-4" onClick={() => navigate("/dashboard/new")}>+ New Business</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className={`rounded-2xl border ${s.border} bg-white/5 p-5 backdrop-blur-sm transition-all hover:bg-white/8`}>
              <div className="flex items-center justify-between">
                <span className="text-xl">{s.icon}</span>
              </div>
              <p className={`mt-2 text-3xl font-bold ${s.color}`}>{isLoading ? "—" : s.value}</p>
              <p className="mt-1 text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        {!isLoading && businesses.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-3">

            {/* Bar chart — 6 months */}
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
                  <Bar dataKey="approved" fill="#34d399" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending"  fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rejected" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart — status breakdown */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <h3 className="mb-4 text-sm font-semibold text-white">Status Breakdown</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={PIE_COLORS[entry.name.toLowerCase()]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-slate-500">No data yet</div>
              )}
            </div>
          </div>
        )}

        {/* Recent businesses table */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h3 className="text-sm font-semibold text-white">
              Recent Businesses
              {!isLoading && <span className="ml-2 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-400">{businesses.length}</span>}
            </h3>
            <button onClick={() => navigate("/dashboard/businesses")} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all →
            </button>
          </div>

          {isLoading && (
            <div className="divide-y divide-white/5">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                  <div className="h-10 w-10 rounded-xl bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded bg-white/10" />
                    <div className="h-2.5 w-1/4 rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && recent.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-slate-500 text-sm">No businesses yet.</p>
              <button onClick={() => navigate("/dashboard/new")} className="mt-2 text-sm text-indigo-400 hover:text-indigo-300">
                Submit your first business →
              </button>
            </div>
          )}

          {!isLoading && recent.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Business</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">City</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recent.map(b => (
                    <tr
                      key={b._id}
                      onClick={() => navigate(`/dashboard/businesses/${b._id}`)}
                      className="cursor-pointer transition-colors hover:bg-white/5"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {b.coverImage || b.image ? (
                            <img src={b.coverImage || b.image} alt={b.name} className="h-9 w-9 rounded-lg object-cover" />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-sm font-bold text-indigo-400">{b.name[0]}</div>
                          )}
                          <span className="font-medium text-white">{b.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-400">{b.category || "—"}</td>
                      <td className="px-5 py-3 text-slate-400">{b.city || "—"}</td>
                      <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3">
                        <TableActionMenu onEdit={() => navigate(`/dashboard/businesses/${b._id}/edit`)} onDelete={() => setDeleteTarget(b)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Business?"
        message={`"${deleteTarget?.name}" will be permanently deleted.`}
        confirmLabel="Delete" cancelLabel="Cancel"
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />

      <AnimatePresence>
        {editTarget && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditTarget(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
              <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
                <Pencil className="h-4 w-4 text-indigo-400" /> Edit Business
              </h3>
              <form onSubmit={handleEdit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Name</label>
                    <input className={inputCls} value={editForm.name ?? ""} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /></div>
                  <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Category</label>
                    <input className={inputCls} value={editForm.category ?? ""} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))} /></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Business Type</label>
                    <select className={inputCls} value={editForm.businessType ?? ""} onChange={e => setEditForm(p => ({ ...p, businessType: e.target.value }))}>
                      <option value="" className="bg-slate-900">Select...</option>
                      {["Physical Business","Online Business","Hybrid","Freelance","Startup","Non-Profit"].map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                    </select></div>
                  <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">City</label>
                    <input className={inputCls} value={editForm.city ?? ""} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} /></div>
                </div>
                <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Location</label>
                  <input className={inputCls} value={editForm.location ?? ""} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} /></div>
                <div><label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
                  <textarea rows={3} className={`${inputCls} resize-none`} value={editForm.description ?? ""} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} /></div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setEditTarget(null)} className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">
                    {isSaving ? "Saving..." : <><Pencil className="h-3.5 w-3.5" /> Save</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GuestDashboard;
