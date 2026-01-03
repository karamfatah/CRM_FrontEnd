import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import LoadingSpinner from "../../components/LoadingSpinner";
import { employeeModeService } from "../../lib/employeeModeService";
import { locationsQaService } from "../../lib/locationsQaService";
import { Cog6ToothIcon, CheckCircleIcon, XCircleIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

// Glass Card Component (similar to NovaKitShowcase)
const GlassCard = ({ className = "", children }) => (
  <div
    className={`rounded-2xl border border-white/10 dark:border-gray-700 bg-white/5 dark:bg-gray-800/50 backdrop-blur-xl shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset,0_20px_50px_-20px_rgba(0,0,0,0.4)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_20px_50px_-20px_rgba(0,0,0,0.6)] ${className}`}
  >
    <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/5 dark:from-gray-800/80 dark:to-gray-900/50">{children}</div>
  </div>
);

// Gradient Text Component
const GradientText = ({ children }) => (
  <span className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">
    {children}
  </span>
);

const EmployeeMode = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [branches, setBranches] = useState([]);
  const [employeeModeSettings, setEmployeeModeSettings] = useState({});
  const [updating, setUpdating] = useState({});

  // Access & Privileges
  const hasToken = !!authData?.access_token;
  const hasPrivilege = useMemo(
    () => Array.isArray(authData?.privilege_ids) && authData.privilege_ids.includes(5000),
    [authData]
  );

  // Check if dark mode is enabled
  const isDark = useMemo(() => {
    return document.documentElement.classList.contains("dark") || 
           window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, []);

  // Fetch all unique branches from locations
  useEffect(() => {
    if (authLoading) return;
    if (!hasToken || !hasPrivilege) {
      setError(t("employee_mode.no_permission") || "No permission");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        if (!authData?.org_id) throw new Error("Missing org_id");
        setLoading(true);
        setError("");

        // Get all locations to extract unique branches
        const locations = await locationsQaService.getLocations(authData.org_id);
        const uniqueBranches = Array.from(
          new Set(locations.map((loc) => loc.location_en || loc.location_ar || "").filter(Boolean))
        ).sort();

        // Also try to get branches from employee mode settings
        const settings = await employeeModeService.getEmployeeModeSettings(authData.org_id);
        const settingsMap = {};
        settings.forEach((setting) => {
          settingsMap[setting.branch] = setting.enabled;
        });

        // Merge: add branches from settings that might not be in locations
        settings.forEach((setting) => {
          if (!uniqueBranches.includes(setting.branch)) {
            uniqueBranches.push(setting.branch);
          }
        });

        setBranches(uniqueBranches.sort());
        setEmployeeModeSettings(settingsMap);
      } catch (e) {
        console.error("Error fetching employee mode data:", e.message, e.stack);
        setError(e.message || t("employee_mode.fetch_error") || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, hasToken, hasPrivilege, authData, t]);

  const handleToggle = async (branch) => {
    if (!authData?.org_id) return;

    const currentValue = employeeModeSettings[branch] || false;
    const newValue = !currentValue;

    setUpdating((prev) => ({ ...prev, [branch]: true }));

    try {
      await employeeModeService.updateEmployeeMode(authData.org_id, branch, newValue);
      setEmployeeModeSettings((prev) => ({
        ...prev,
        [branch]: newValue,
      }));
      setError("");
    } catch (e) {
      console.error("Error updating employee mode:", e.message);
      setError(e.message || t("employee_mode.update_error") || "Failed to update setting");
    } finally {
      setUpdating((prev) => ({ ...prev, [branch]: false }));
    }
  };

  const enabledCount = useMemo(() => {
    return Object.values(employeeModeSettings).filter(Boolean).length;
  }, [employeeModeSettings]);

  if (authLoading || loading) return <LoadingSpinner />;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0b0b12]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg">
                  <Cog6ToothIcon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                    {t("employee_mode.title") || (language === "ar" ? "وضع الموظف" : "Employee Mode")}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t("employee_mode.subtitle") || 
                      (language === "ar" 
                        ? "إدارة تفعيل وضع اختيار الموظف لكل فرع" 
                        : "Manage employee selection mode for each branch")}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg">
                    <BuildingOfficeIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 dark:text-white/60">
                      {t("employee_mode.total_branches") || "Total Branches"}
                    </p>
                    <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                      {branches.length}
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                    <CheckCircleIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 dark:text-white/60">
                      {t("employee_mode.enabled") || "Enabled"}
                    </p>
                    <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                      {enabledCount}
                    </p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg">
                    <XCircleIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 dark:text-white/60">
                      {t("employee_mode.disabled") || "Disabled"}
                    </p>
                    <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                      {branches.length - enabledCount}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg relative" role="alert">
                <span>{error}</span>
                <button
                  onClick={() => setError("")}
                  className="absolute top-0 right-0 px-4 py-3"
                  aria-label={t("common.dismiss_error") || "Dismiss"}
                >
                  <svg className="fill-current h-6 w-6 text-red-500 dark:text-red-400" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Branches List */}
            {branches.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-300">
                  {t("employee_mode.no_branches") || 
                    (language === "ar" ? "لا توجد فروع" : "No branches found")}
                </p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {branches.map((branch, index) => {
                  const isEnabled = employeeModeSettings[branch] || false;
                  const isUpdating = updating[branch] || false;

                  return (
                    <motion.div
                      key={branch}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <GlassCard className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <BuildingOfficeIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {branch}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                              {isEnabled
                                ? (t("employee_mode.enabled_desc") || 
                                    (language === "ar" 
                                      ? "سيتم عرض اختيار الموظف في صفحة التقييم" 
                                      : "Employee selection will be shown on rate page"))
                                : (t("employee_mode.disabled_desc") || 
                                    (language === "ar" 
                                      ? "سيتم إخفاء اختيار الموظف في صفحة التقييم" 
                                      : "Employee selection will be hidden on rate page"))}
                            </p>
                            <Badge
                              className={`${
                                isEnabled
                                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"
                              }`}
                            >
                              {isEnabled
                                ? (t("employee_mode.status_enabled") || "Enabled")
                                : (t("employee_mode.status_disabled") || "Disabled")}
                            </Badge>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={() => handleToggle(branch)}
                              disabled={isUpdating}
                            />
                            {isUpdating && (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 dark:border-gray-600 border-t-indigo-600"></div>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Info Card */}
            <GlassCard className="p-6 mt-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-fuchsia-600 text-white shadow-lg flex-shrink-0">
                  <Cog6ToothIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                    {t("employee_mode.info_title") || "How it works"}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span>
                        {t("employee_mode.info_1") || 
                          "When enabled for a branch, users from that branch will see employee selection on the rate page"}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span>
                        {t("employee_mode.info_2") || 
                          "When disabled, employee selection will be hidden and ratings will use default location"}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span>
                        {t("employee_mode.info_3") || 
                          "Settings are saved per branch and apply to all users in that branch"}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeMode;

