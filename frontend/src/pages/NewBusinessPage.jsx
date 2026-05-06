import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout/DashboardLayout";
import BusinessStepper from "../components/BusinessStepper/BusinessStepper";
import BlurText from "../bits/BlurText/BlurText";
import { businessService } from "../services/businessService";
import { useState } from "react";

const NewBusinessPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (form) => {
    setIsLoading(true);
    setError("");
    try {
      await businessService.create(form);
      navigate("/dashboard/businesses");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <BlurText text="Create New Business" className="text-2xl font-bold text-white" delay={50} />
          <p className="mt-1 text-sm text-slate-400">Fill in the steps below to submit your business for review.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <BusinessStepper
          onSubmit={handleSubmit}
          onCancel={() => navigate("/dashboard/businesses")}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
};

export default NewBusinessPage;
