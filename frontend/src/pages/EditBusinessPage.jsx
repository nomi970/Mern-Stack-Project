import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout/DashboardLayout";
import BusinessStepper from "../components/BusinessStepper/BusinessStepper";
import BlurText from "../bits/BlurText/BlurText";
import { businessService } from "../services/businessService";

const EditBusinessPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    businessService.getMine()
      .then(list => {
        const found = list.find(b => b._id === id);
        if (!found) navigate("/dashboard/businesses", { replace: true });
        else setBusiness(found);
      })
      .catch(() => navigate("/dashboard/businesses", { replace: true }))
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (form) => {
    setIsSaving(true);
    setError("");
    try {
      await businessService.editMine(id, form);
      navigate(`/dashboard/businesses/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
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

  return (
    <DashboardLayout>
      <div className=" space-y-6">
        <div>
          <BlurText text="Edit Business" className="text-2xl font-bold text-white" delay={50} />
          <p className="mt-1 text-sm text-slate-400">Update your business details below.</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {business && (
          <BusinessStepper
            initialData={business}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/dashboard/businesses/${id}`)}
            isLoading={isSaving}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditBusinessPage;
