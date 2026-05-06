import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Trash2, MapPin, Building2, Clock, User } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout/DashboardLayout";
import ImageLightbox from "../components/ImageLightbox/ImageLightbox";
import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog";
import { businessService } from "../services/businessService";
import { BUSINESS_STATUS } from "../utils/constants";

const fmt = (iso) => new Date(iso).toLocaleDateString("en-US", {
  year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
});

/* -- Smart Image Grid --
   1 img  : full width left only
   2 imgs : left + right (1 image full height)
   3 imgs : left + right (top full width + bottom 2 side by side)
   4+ imgs: left + right (top full width + bottom 2, 4th shows +N)
-- */
/* -- Image grid: responsive layout based on image count -- */
/* -- Smart Image Grid --
   1 img  ? full width left only
   2 imgs ? left + right (1 full height)
   3 imgs ? left + right top (full width) + right bottom 2 (side by side)
   4+ imgs ? left + right 2x2 (4th cell shows +N)
-- */
/* -- Image grid: responsive layout based on image count -- */
const ImageGrid = ({ images, onOpen }) => {
  const total = images.length;
  const imgCls = "h-full w-full object-cover transition-transform duration-500 hover:scale-105";

  if (total === 1) return (
    <div className="overflow-hidden rounded-xl">
      <div className="relative cursor-pointer overflow-hidden" style={{ height: 320 }} onClick={() => onOpen(0)}>
        <img src={images[0]} alt="cover" className={imgCls} />
      </div>
    </div>
  );

  if (total === 2) return (
    <div className="overflow-hidden rounded-xl">
      <div className="flex gap-1" style={{ height: 320 }}>
        <div className="relative flex-1 cursor-pointer overflow-hidden" onClick={() => onOpen(0)}>
          <img src={images[0]} alt="cover" className={imgCls} />
        </div>
        <div className="relative cursor-pointer overflow-hidden" style={{ width: "45%" }} onClick={() => onOpen(1)}>
          <img src={images[1]} alt="" className={imgCls} />
        </div>
      </div>
    </div>
  );

  if (total === 3) return (
    <div className="overflow-hidden rounded-xl">
      <div className="flex gap-1" style={{ height: 320 }}>
        {/* Left main */}
        <div className="relative cursor-pointer overflow-hidden" style={{ width: "55%" }} onClick={() => onOpen(0)}>
          <img src={images[0]} alt="cover" className={imgCls} />
        </div>
        {/* Right: two images side by side 1fr 1fr */}
        <div className="flex gap-1" style={{ flex: 1 }}>
          <div className="relative flex-1 cursor-pointer overflow-hidden" onClick={() => onOpen(1)}>
            <img src={images[1]} alt="" className={imgCls} />
          </div>
          <div className="relative flex-1 cursor-pointer overflow-hidden" onClick={() => onOpen(2)}>
            <img src={images[2]} alt="" className={imgCls} />
          </div>
        </div>
      </div>
    </div>
  );

    // 4+ images: right side = top full width + bottom two halves
  const remaining = images.length - 4;
  return (
    <div className="overflow-hidden rounded-xl">
      <div className="flex gap-1" style={{ height: 320 }}>
        {/* Left main image */}
        <div className="relative cursor-pointer overflow-hidden" style={{ width: "55%" }} onClick={() => onOpen(0)}>
          <img src={images[0]} alt="cover" className={imgCls} />
        </div>
        {/* Right: top full + bottom two */}
        <div className="flex flex-col gap-1" style={{ flex: 1 }}>
          {/* Top: image[1] full width */}
          <div className="relative cursor-pointer overflow-hidden" style={{ flex: 1, minHeight: 0 }} onClick={() => onOpen(1)}>
            <img src={images[1]} alt="" className={imgCls} />
          </div>
          {/* Bottom: image[2] + image[3] side by side */}
          <div className="flex gap-1" style={{ flex: 1, minHeight: 0 }}>
            <div className="relative flex-1 cursor-pointer overflow-hidden" onClick={() => onOpen(2)}>
              <img src={images[2]} alt="" className={imgCls} />
            </div>
            <div className="relative flex-1 cursor-pointer overflow-hidden" onClick={() => onOpen(3)}>
              {images[3] ? (
                <>
                  <img src={images[3]} alt="" className={imgCls} />
                  {remaining > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                      <span className="text-2xl font-bold text-white">+{remaining}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full bg-slate-800/40" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminBusinessDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [showDelete, setShowDelete] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    businessService.getAll()
      .then(list => {
        const found = list.find(b => b._id === id);
        if (!found) navigate("/admin", { replace: true });
        else setBusiness(found);
      })
      .catch(() => navigate("/admin", { replace: true }))
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    try { await businessService.delete(id); navigate("/admin", { replace: true }); }
    catch (e) { setActionError(e.message); setShowDelete(false); }
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
    [BUSINESS_STATUS.APPROVED]: { label: "Approved",       cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
    [BUSINESS_STATUS.PENDING]:  { label: "Pending Review", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
    [BUSINESS_STATUS.REJECTED]: { label: "Rejected",       cls: "bg-red-500/15 text-red-400 border-red-500/20" },
  };
  const statusInfo = statusMap[business.status] ?? statusMap[BUSINESS_STATUS.PENDING];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/admin")}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Business Details
          </button>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.cls}`}>
              {statusInfo.label}
            </span>
            <button onClick={() => navigate(`/admin/businesses/${id}/edit`)}
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

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          {allImages.length > 0 && (
            <div className="p-4 pb-0">
              <ImageGrid images={allImages} onOpen={(i) => setLightbox({ open: true, index: i })} />
            </div>
          )}
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-bold text-white">{business.name}</h1>
              {business.businessType && (
                <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
                  {business.businessType}
                </span>
              )}
            </div>

            {/* Owner info — admin only */}
            {business.owner && (
              <div className="mt-2 flex items-center gap-2 text-sm text-indigo-400">
                <User className="h-4 w-4 shrink-0" />
                {business.owner.name} · {business.owner.email}
              </div>
            )}

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
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Submitted</p>
                  <p className="mt-0.5 text-sm text-slate-300">{fmt(business.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white/5 px-4 py-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
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
    </DashboardLayout>
  );
};

export default AdminBusinessDetailPage;

