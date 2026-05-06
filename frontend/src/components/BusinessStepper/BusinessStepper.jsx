import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { compressImage } from "../../utils/imageUtils";

const STEPS = [
  { id: 1, label: "Basic Info", description: "Name & category" },
  { id: 2, label: "Media", description: "Images & description" },
  { id: 3, label: "Review", description: "Confirm & submit" }
];

const MAX_SIZE = 5 * 1024 * 1024;

const CITIES = [
  { name: "Lahore", areas: ["DHA Phase 1-9", "Bahria Town", "Johar Town", "Gulberg", "Model Town", "Cantt"] },
  { name: "Karachi", areas: ["DHA Phase 1-8", "Clifton", "Gulshan-e-Iqbal", "North Nazimabad", "Saddar", "Malir"] },
  { name: "Islamabad", areas: ["F-6", "F-7", "F-8", "G-6", "G-7", "Blue Area", "Bahria Town", "DHA"] },
  { name: "Rawalpindi", areas: ["Bahria Town", "Saddar", "Satellite Town", "PWD", "Chaklala"] },
  { name: "Faisalabad", areas: ["D Ground", "Peoples Colony", "Samanabad", "Gulberg", "Madina Town"] },
  { name: "Multan", areas: ["Cantt", "Gulgasht Colony", "Bosan Road", "Shah Rukn-e-Alam Colony"] },
  { name: "Peshawar", areas: ["Hayatabad", "University Town", "Saddar", "Cantt"] },
  { name: "Quetta", areas: ["Satellite Town", "Cantt", "Jinnah Town", "Brewery Road"] }
];

/* ── City autocomplete field ── */
const CityField = ({ value, onChange }) => {
  const [input, setInput] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const filtered = CITIES.filter(c => c.name.toLowerCase().includes(input.toLowerCase()));

  const selectCity = (city) => {
    setInput(city.name);
    setSelectedCity(city);
    setShowDropdown(false);
    onChange(city.name, "");
  };

  const selectArea = (area) => {
    onChange(input, area);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">City</label>
      <input
        value={input}
        onChange={(e) => { setInput(e.target.value); setShowDropdown(true); setSelectedCity(null); }}
        onFocus={() => setShowDropdown(true)}
        placeholder="Select or type city..."
        className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/25"
      />
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
          <div className="absolute z-20 mt-1 w-full rounded-xl border border-white/10 bg-slate-900 shadow-2xl max-h-64 overflow-y-auto">
            {!selectedCity && filtered.length > 0 && (
              <div className="p-1">
                {filtered.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => selectCity(c)}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-white transition-colors hover:bg-indigo-600/20"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            {selectedCity && (
              <div className="p-1">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Popular areas in {selectedCity.name}</p>
                {selectedCity.areas.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => selectArea(a)}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-indigo-600/20"
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

/* ── Step progress bar ── */
const StepBar = ({ current }) => (
  <div className="mb-8">
    <div className="flex items-center">
      {STEPS.map((step, idx) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="relative flex flex-col items-center">
              <motion.div
                animate={{
                  backgroundColor: done || active ? "#6366f1" : "rgba(255,255,255,0.08)",
                  borderColor: done || active ? "#6366f1" : "rgba(255,255,255,0.15)",
                  scale: active ? 1.1 : 1
                }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2"
              >
                {done ? (
                  <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </motion.svg>
                ) : (
                  <span className={`text-xs font-bold ${active ? "text-white" : "text-slate-500"}`}>{step.id}</span>
                )}
              </motion.div>
              <div className="mt-1.5 text-center">
                <p className={`text-xs font-semibold ${active || done ? "text-white" : "text-slate-500"}`}>{step.label}</p>
                <p className="text-[10px] text-slate-600">{step.description}</p>
              </div>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="relative mx-2 mb-6 h-0.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-indigo-500"
                  initial={{ width: "0%" }}
                  animate={{ width: current > step.id ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

/* ── Single image dropzone ── */
const ImageDropzone = ({ value, onChange, onError, label, hint }) => {
  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      const err = rejected[0].errors[0];
      if (err.code === "file-too-large") {
        onError(`${label} must be under 5MB.`);
      } else {
        onError(`Invalid file for ${label}.`);
      }
      return;
    }
    if (accepted[0]) {
      onError("");
      compressImage(accepted[0]).then(onChange).catch(() => onError("Failed to process image."));
    }
  }, [onChange, onError, label]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    maxSize: MAX_SIZE
  });

  return (
    <div>
      {label && <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>}
      <div
        {...getRootProps()}
        className={[
          "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all",
          isDragActive ? "border-indigo-500 bg-indigo-500/10" : "border-white/15 bg-white/5 hover:border-indigo-500/50 hover:bg-white/8",
          value ? "h-40" : "h-32"
        ].join(" ")}
      >
        <input {...getInputProps()} />
        {value ? (
          <>
            <img src={value} alt={label} className="h-full w-full rounded-2xl object-cover" />
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <p className="text-xs font-medium text-white">Click to change</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 p-4 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15">
              <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-xs text-slate-400">{isDragActive ? "Drop here" : hint ?? "Drag & drop or click"}</p>
            <p className="text-[10px] text-slate-600">Max 5MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Multi image dropzone (detail images) ── */
const MultiImageDropzone = ({ values, onChange, onError }) => {
  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      const oversized = rejected.some(r => r.errors.some(e => e.code === "file-too-large"));
      onError(oversized ? "One or more images exceed 5MB limit." : "Invalid file type.");
      return;
    }
    onError("");
    Promise.all(accepted.map(f => compressImage(f)))
      .then(results => onChange([...values, ...results].slice(0, 6)))
      .catch(() => onError("Failed to process one or more images."));
  }, [values, onChange, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [] }, maxSize: MAX_SIZE, multiple: true
  });

  const remove = (idx) => onChange(values.filter((_, i) => i !== idx));

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Detail Images <span className="normal-case text-slate-600">(up to 6)</span></p>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {values.map((src, i) => (
          <div key={i} className="relative h-24 rounded-xl overflow-hidden group">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        {values.length < 6 && (
          <div
            {...getRootProps()}
            className={[
              "flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
              isDragActive ? "border-indigo-500 bg-indigo-500/10" : "border-white/15 bg-white/5 hover:border-indigo-500/50"
            ].join(" ")}
          >
            <input {...getInputProps()} />
            <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <p className="mt-1 text-[10px] text-slate-600">Add</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Review row ── */
const ReviewRow = ({ label, value }) => (
  <div className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3">
    <span className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
    <span className="text-sm text-slate-200">{value || <span className="text-slate-600">—</span>}</span>
  </div>
);

/* ── Main ── */
const BusinessStepper = ({ onSubmit, onCancel, isLoading, initialData }) => {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    category: initialData?.category ?? "",
    businessType: initialData?.businessType ?? "",
    city: initialData?.city ?? "",
    location: initialData?.location ?? "",
    description: initialData?.description ?? "",
    coverImage: initialData?.coverImage ?? "",
    images: initialData?.images ?? []
  });
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    setErrors(p => ({ ...p, [field]: "" }));
  };

  const setImgError = (field) => (msg) => setErrors(p => ({ ...p, [field]: msg }));

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Business name is required.";
    if (!form.category.trim()) e.category = "Category is required.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateStep2 = () => {
    if (errors.coverImage || errors.images) return false;
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setDir(1);
    setStep(p => Math.min(p + 1, 3));
  };

  const goBack = () => { setDir(-1); setStep(p => Math.max(p - 1, 1)); };

  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -40 : 40, opacity: 0 })
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <StepBar current={step} />

      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step} custom={dir} variants={slideVariants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {/* Step 1 — Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Business Name <span className="text-red-400">*</span>
                    </label>
                    <input value={form.name} onChange={e => set("name", e.target.value)}
                      placeholder="e.g. Acme Corporation"
                      className={["w-full rounded-xl border bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/25", errors.name ? "border-red-500/60" : "border-white/10"].join(" ")} />
                    {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <input value={form.category} onChange={e => set("category", e.target.value)}
                      placeholder="e.g. Technology, Retail..."
                      className={["w-full rounded-xl border bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/25", errors.category ? "border-red-500/60" : "border-white/10"].join(" ")} />
                    {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category}</p>}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Business Type</label>
                    <select value={form.businessType} onChange={e => set("businessType", e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition-all focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/25">
                      <option value="" className="bg-slate-900">Select type...</option>
                      {["Physical Business","Online Business","Hybrid","Freelance","Startup","Non-Profit"].map(t => (
                        <option key={t} value={t} className="bg-slate-900">{t}</option>
                      ))}
                    </select>
                  </div>
                  <CityField
                    value={form.city}
                    onChange={(city, location) => {
                      set("city", city);
                      if (location) set("location", location);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Location / Address</label>
                  <input value={form.location} onChange={e => set("location", e.target.value)}
                    placeholder="e.g. Phase 4, DHA, Lahore"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/25" />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                  <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)}
                    placeholder="Tell us about your business..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/25" />
                </div>
              </div>
            )}

            {/* Step 2 — Media */}
            {step === 2 && (
              <div className="space-y-5">
                <ImageDropzone
                  label="Cover Image"
                  hint="Main image shown in listings"
                  value={form.coverImage}
                  onChange={v => set("coverImage", v)}
                  onError={setImgError("coverImage")}
                />
                {errors.coverImage && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <svg className="h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <p className="text-sm text-red-400">{errors.coverImage}</p>
                  </div>
                )}

                <MultiImageDropzone
                  values={form.images}
                  onChange={v => set("images", v)}
                  onError={setImgError("images")}
                />
                {errors.images && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <svg className="h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <p className="text-sm text-red-400">{errors.images}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3 — Review */}
            {step === 3 && (
              <div className="space-y-3">
                <p className="mb-3 text-sm text-slate-400">Review your details before submitting.</p>
                {form.coverImage && (
                  <img src={form.coverImage} alt="Cover" className="mb-3 h-36 w-full rounded-2xl object-cover" />
                )}
                {form.images.length > 0 && (
                  <div className="mb-3 grid grid-cols-4 gap-2">
                    {form.images.map((src, i) => (
                      <img key={i} src={src} alt="" className="h-16 w-full rounded-xl object-cover" />
                    ))}
                  </div>
                )}
                <ReviewRow label="Name" value={form.name} />
                <ReviewRow label="Category" value={form.category} />
                <ReviewRow label="Type" value={form.businessType} />
                <ReviewRow label="City" value={form.city} />
                <ReviewRow label="Location" value={form.location} />
                <ReviewRow label="Description" value={form.description} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button" onClick={step === 1 ? onCancel : goBack}
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/10"
        >
          {step === 1 ? "Cancel" : "← Back"}
        </button>

        {step < 3 ? (
          <motion.button type="button" onClick={goNext} whileTap={{ scale: 0.97 }}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-blue-500">
            Next →
          </motion.button>
        ) : (
          <motion.button type="button" onClick={() => onSubmit(form)} disabled={isLoading} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60">
            {isLoading ? (
              <><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Submitting...</>
            ) : "Submit for Review ✓"}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default BusinessStepper;
