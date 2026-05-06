import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MoreVertical, Pencil, Trash2, CheckCircle, XCircle, Eye, Building2, Search } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout/DashboardLayout";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog";
import BlurText from "../bits/BlurText/BlurText";
import { businessService } from "../services/businessService";
import { BUSINESS_STATUS } from "../utils/constants";

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
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white">
              <Eye className="h-3.5 w-3.5 text-slate-400" /> View
            </button>
            {business.status === BUSINESS_STATUS.PENDING && (<>
              <button onClick={e => { e.stopPropagation(); setOpen(false); onApprove(); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/15">
                <CheckCircle className="h-3.5 w-3.5" /> Approve
              </button>
              <button onClick={e => { e.stopPropagation(); setOpen(false); onReject(); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-amber-400 hover:bg-amber-500/15">
                <XCircle className="h-3.5 w-3.5" /> Reject
              </button>
            </>)}
            <button onClick={e => { e.stopPropagation(); setOpen(false); onEdit(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-600/20 hover:text-white">
              <Pencil className="h-3.5 w-3.5 text-indigo-400" /> Edit
            </button>
            <button onClick={e => { e.stopPropagation(); setOpen(false); onDelete(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/15">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminBusinessesPage = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const notify = (msg, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 3000);
  };

  useEffect(() => {
    businessService.getAll().then(setBusinesses).catch(e => setError(e.message)).finally(() => setIsLoading(false));
  }, []);

  const handleApprove = async (id) => {
    try {
      const updated = await businessService.approve(id);
      setBusinesses(p => p.map(b => b._id === id ? updated : b));
      notify("Business approved.");
    } catch (e) { notify(e.message, true); }
  };

  const handleReject = async () => {
    try {
      const updated = await businessService.reject(rejectModal.id, rejectReason);
      setBusinesses(p => p.map(b => b._id === rejectModal.id ? updated : b));
      setRejectModal(null); setRejectReason("");
      notify("Business rejected.");
    } catch (e) { notify(e.message, true); }
  };

  const handleDelete = async () => {
    try {
      await businessService.delete(deleteTarget._id);
      setBusinesses(p => p.filter(b => b._id !== deleteTarget._id));
      setDeleteTarget(null); notify("Business deleted.");
    } catch (e) { notify(e.message, true); }
  };

  const filtered = businesses.filter(b => {
    const mf = filter === "all" || b.status === filter;
    const ms = !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.owner?.name?.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <BlurText text="All Businesses" className="text-2xl font-bold text-white" delay={50} />
          <p className="mt-1 text-sm text-slate-400">Review and manage all submitted businesses.</p>
        </div>

        {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"><p className="text-sm text-red-400">{error}</p></div>}
        {success && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3"><p className="text-sm text-emerald-400">{success}</p></div>}

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-white">
              Businesses <span className="ml-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-400">{businesses.length}</span>
            </h3>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-900/60 pl-9 pr-4 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/25" />
              </div>
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
                  {["Business", "Owner", "Category", "Status", "Date", "Action"].map(h => (
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
                        {b.coverImage || b.image ? (
                          <img src={b.coverImage || b.image} alt={b.name} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
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
                        onDelete={() => setDeleteTarget(b)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog open={!!deleteTarget} title="Delete Business?"
        message={`"${deleteTarget?.name}" will be permanently deleted.`}
        confirmLabel="Delete" cancelLabel="Cancel"
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} variant="danger" />

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Reject "{rejectModal.name}"</h3>
            <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason (optional)..."
              className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20" />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10">Cancel</button>
              <button onClick={handleReject}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminBusinessesPage;
