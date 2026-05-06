import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pencil, Trash2, MapPin, Tag, Building2 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout/DashboardLayout";
import ImageLightbox from "../components/ImageLightbox/ImageLightbox";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog";
import { businessService } from "../services/businessService";
import { BUSINESS_STATUS } from "../utils/constants";

const fmt = (iso) => new Date(iso).toLocaleDateString("en-US", {
  year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
});

const inputCls = "w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/25";

/* ── Image grid: big left + 2×2 right, 4th cell shows +N ── */
const ImageGrid = ({ images, onOpen }) => {
  const main = images[0];
  const side = images.slice(1, 5);
  const extra = images.length - 5;

  return (
    <div className="overflow-hidden rounded-xl" style={{ height: 320 }}>
      <div className="grid h-full gap-1" style={{ gridTemplateColumns: side.length ? "1.1fr 0.9fr" : "1fr" }}>
        {/* Big left */}
        <div className="relative cursor-pointer overflow-hidden" onClick={() => onOpen(0)}>
          <img src={main} alt="cover" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
        </div>

        {/* Right 2×2 */}
        {side.length > 0 && (
          <div className="grid grid-cols-2 gap-1">
            {[0, 1, 2, 3].map(i => {
              const src = side[i];
              if (!src) return <div key={i} className="bg-slate-100/5" />;
              const isLast = i === 3 && extra > 0;
              return (
                <div key={i} className="relative cursor-pointer overflow-hidden" onClick={() => onOpen(i + 1)}>
                  <img src={src} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                  {isLast && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-sm">
                      <span className="text-xl font-bold text-white">+{extra}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const BusinessDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    businessService.getMine()
      .then(list => {
        const found = list.find(b => b._id === id);
        if (!found) navigate("/dashboard/businesses", { replace: true });
        else { setBusiness(found); setEditForm({ name: found.name, category: found.category, businessType: found.businessType, city: found.city, location: found.location, description: found.description }); }
      })
      .catch(() => navigate("/dashboard/businesses", { replace: true }))
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    try { await businessService.deleteMine(business._id); navigate("/dashboard/businesses", { replace: true }); }
    catch (e) { setActionError(e.message); setShowDelete(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setIsSaving(true);
    try {
      const updated = await businessService.editMine(business._id, editForm);
      setBusiness(updated); setShowEdit(false);
    } catch (err) { setActionError(err.message); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex h-64 items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    </DashboardLayout>
  );

  if (!business) return null;

  const allImages = [business.coverImage, ...(business.images ?? [])].filter(Boolean);
  const statusMap = {
    [BUSINESS_STATUS.APPROVED]: { label: "Approved", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
    [BUSINESS_STATUS.PENDING]:  { label: "Pending Review", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
    [BUSINESS_STATUS.REJECTED]: { label: "Rejected", cls: "bg-red-500/15 text-red-400 border-red-500/20" },
  };
  const statusInfo = statusMap[business.status] ?? statusMap[BUSINESS_STATUS.PENDING];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-4">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/dashboard/businesses")}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> My Business Details
          </button>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.cls}`}>
              {statusInfo.label}
            </span>
            {/* Edit & Delete on top bar */}
            <button onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:bg-indigo-600/20 hover:text-indigo-300 hover:border-indigo-500/30">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button onClick={() => setShowDelete(true)}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>

        {actionError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{actionError}</p>
          </div>
        )}

        {/* Main white-style card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">

          {/* Image grid */}
          {allImages.length > 0 && (
            <div className="p-4 pb-0">
              <ImageGrid images={allImages} onOpen={(i) => setLightbox({ open: true, index: i })} />
            </div>
          )}

          <div className="p-6">
            {/* Title + badge */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-bold text-white">{business.name}</h1>
              {business.businessType && (
                <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
                  {business.businessType}
                </span>
              )}
            </div>

            {/* Location rows */}
            <div className="mt-3 space-y-1.5">
              {business.city && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-500" /> {business.city}
                </div>
              )}
              {business.location && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-500" /> {business.location}
                </div>
              )}
              {business.category && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Building2 className="h-4 w-4 shrink-0 text-slate-500" /> {business.category}
                </div>
              )}
            </div>

            <div className="my-5 border-t border-white/10" />

            {business.description && (
              <div>
                <p className="mb-2 text-sm font-bold text-white">Description</p>
                <p className="text-sm leading-relaxed text-slate-400">{business.description}</p>
              </div>
            )}

            {business.status === BUSINESS_STATUS.REJECTED && business.rejectionReason && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-400">Rejection Reason</p>
                <p className="text-sm text-red-300">{business.rejectionReason}</p>
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-3 border-t border-white/10 pt-5 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl bg-white/5 px-4 py-3">
                <Tag className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Submitted</p>
                  <p className="mt-0.5 text-sm text-slate-300">{fmt(business.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white/5 px-4 py-3">
                <Tag className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Last Updated</p>
                  <p className="mt-0.5 text-sm text-slate-300">{fmt(business.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {lightbox.open && (
        <ImageLightbox images={allImages} initialIndex={lightbox.index} onClose={() => setLightbox({ open: false, index: 0 })} />
      )}

      <ConfirmDialog
        open={showDelete} title="Delete Business?"
        message={`"${business.name}" will be permanently deleted.`}
        confirmLabel="Delete" cancelLabel="Cancel"
        onConfirm={handleDelete} onCancel={() => setShowDelete(false)}
        variant="danger"
      />

      <AnimatePresence>
        {showEdit && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowEdit(false)} />
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
                  <button type="button" onClick={() => setShowEdit(false)} className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10">Cancel</button>
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

export default BusinessDetailPage;
