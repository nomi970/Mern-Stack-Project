import { Settings } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout/DashboardLayout";
import BlurText from "../bits/BlurText/BlurText";

const AdminSettingsPage = () => (
  <DashboardLayout>
    <div className="space-y-6">
      <div>
        <BlurText text="Settings" className="text-2xl font-bold text-white" delay={50} />
        <p className="mt-1 text-sm text-slate-400">System configuration and preferences.</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 py-20">
        <Settings className="h-12 w-12 text-slate-600 mb-3" />
        <p className="text-slate-500">Settings coming soon.</p>
      </div>
    </div>
  </DashboardLayout>
);

export default AdminSettingsPage;
