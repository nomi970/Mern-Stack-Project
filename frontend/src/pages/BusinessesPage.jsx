import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, MapPin, Plus, MoreVertical,
  Pencil, Trash2, CheckCircle2, Clock, XCircle, ChevronRight
} from "lucide-react";
import Button from "../components/Button";
import DashboardLayout from "../components/DashboardLayout/DashboardLayout";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog";
import { businessService } from "../services/businessService";
import { BUSINESS_STATUS } from "../utils/constants";
import BlurText from "../bits/BlurText/BlurText";

const statusConfig = {
  [BUSINESS_STATUS.PENDING]:  { label: "Pending",  icon: Clock,         cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  [BUSINESS_STATUS.APPROVED]: { label: "Approved", icon: CheckCircle2,  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  [BUSINESS_STATUS.REJECTED]: { label: "Rejected", icon: XCircle,       cls: "bg-red-500/15 text-red-400 border-red-500/20" }
};

const SkeletonCard = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/5">
    <div className="h-44 bg-white/8" />
    <div className="p-4 space-y-3">
      <div className="h-4 w-2/3 rounded bg-white/10" />
      <div className="h-3 w-1/2 rounded bg-white/10" />
      <div className="h-3 w-1/3 rounded bg-white/10" />
    </div>
  </div>
);

/* ── 3-dot dropdown menu ── */
const ActionMenu = ({ business, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative" onClick={e => e.preventDefault()}>
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(p => !p); }}
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
            className="absolute right-0 top-9 z-50 w-40 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl"
          >
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(false); onEdit(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-indigo-600/20 hover:text-white"
            >
              <Pencil className="h-3.5 w-3.5 text-indigo-400" />
              Edit
            </button>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(false); onDelete(); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/15"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const inputCls = "w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/25";

const BusinessCard = ({ business, onEdit, onDelete }) => {
  const cfg = statusConfig[business.status] ?? statusConfig.pending;
  const StatusIcon = cfg.icon;
  const thumb = business.coverImage || business.images?.[0] || null;

  return (
    <div className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10">
      {/* 3-dot menu — top right of card, outside Link */}
      <div className="absolute right-2 top-2 z-10">
        <ActionMenu business={business} onEdit={onEdit} onDelete={onDelete} />
      </div>

      <Link to={`/dashboard/businesses/${business._id}`} className="flex flex-1 flex-col">
        {/* Cover image */}
        <div className="relative h-44 shrink-0 overflow-hidden bg-white/5">
          {thumb ? (
            <img src={thumb} alt={business.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500/10 to-blue-500/10">
              <Building2 className="h-12 w-12 text-indigo-400/30" />
            </div>
          )}
          {/* Status badge */}
          <div className="absolute bottom-3 left-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>
              <StatusIcon className="h-3 w-3" />
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="truncate pr-2 text-sm font-bold text-white">{business.name}</h3>

          {business.businessType && (
            <span className="mt-1.5 inline-block w-fit rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-medium text-indigo-400">
              {business.businessType}
            </span>
          )}

          {(business.city || business.location) && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{[business.location, business.city].filter(Boolean).join(", ")}</span>
            </div>
          )}

          {business.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{business.description}</p>
          )}

          <div className="flex-1" />

          <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3">
            <p className="text-xs text-slate-600">
              {new Date(business.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <span className="flex items-center gap-1 text-xs font-medium text-indigo-400">
              View Details <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

const BusinessesPage = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    businessService.getMine()
      .then(setBusinesses)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async () => {
    try {
      await businessService.deleteMine(deleteTarget._id);
      setBusinesses(p => p.filter(b => b._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (e) { setError(e.message); setDeleteTarget(null); }
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
    } catch (err) { setError(err.message); }
    finally { setIsSaving(false); }
  };

  const filtered = filter === "all" ? businesses : businesses.filter(b => b.status === filter);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <BlurText text="My Businesses" className="text-2xl font-bold text-white" delay={50} />
            <p className="mt-1 text-sm text-slate-400">Manage all your business applications.</p>
          </div>
          <Button onClick={() => navigate("/dashboard/new")}>
            <span className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> New Business</span>
          </Button>
        </div>

        {/* Filter tabs */}
        {!isLoading && businesses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {["all", BUSINESS_STATUS.PENDING, BUSINESS_STATUS.APPROVED, BUSINESS_STATUS.REJECTED].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={["rounded-xl px-4 py-2 text-xs font-semibold capitalize transition-all",
                  filter === f ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                ].join(" ")}>
                {f === "all" ? `All (${businesses.length})` : `${f} (${businesses.filter(b => b.status === f).length})`}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 py-16 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10">
              <Building2 className="h-7 w-7 text-indigo-400" />
            </div>
            <p className="text-slate-400">{filter === "all" ? "No businesses yet." : `No ${filter} businesses.`}</p>
            {filter === "all" && (
              <button onClick={() => navigate("/dashboard/new")} className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                Submit your first business →
              </button>
            )}
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b, i) => (
              <motion.div key={b._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <BusinessCard business={b} onEdit={() => navigate(`/dashboard/businesses/${b._id}/edit`)} onDelete={() => setDeleteTarget(b)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Business?"
        message={`"${deleteTarget?.name}" will be permanently deleted.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />

      {/* Edit modal */}
      <AnimatePresence>
        {editTarget && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditTarget(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
            >
              <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
                <Pencil className="h-4 w-4 text-indigo-400" /> Edit Business
              </h3>
              <form onSubmit={handleEdit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Name</label>
                    <input className={inputCls} value={editForm.name ?? ""} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Category</label>
                    <input className={inputCls} value={editForm.category ?? ""} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Business Type</label>
                    <select className={inputCls} value={editForm.businessType ?? ""} onChange={e => setEditForm(p => ({ ...p, businessType: e.target.value }))}>
                      <option value="" className="bg-slate-900">Select...</option>
                      {["Physical Business","Online Business","Hybrid","Freelance","Startup","Non-Profit"].map(t => (
                        <option key={t} value={t} className="bg-slate-900">{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">City</label>
                    <input className={inputCls} value={editForm.city ?? ""} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Location / Address</label>
                  <input className={inputCls} value={editForm.location ?? ""} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
                  <textarea rows={3} className={`${inputCls} resize-none`} value={editForm.description ?? ""} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setEditTarget(null)} className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">
                    {isSaving ? "Saving..." : <><Pencil className="h-3.5 w-3.5" /> Save Changes</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default BusinessesPage;
