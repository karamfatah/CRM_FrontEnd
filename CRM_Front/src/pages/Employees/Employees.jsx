import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import ModalSearch from "../../components/ModalSearch";
import LoadingSpinner from "../../components/LoadingSpinner";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { mainLocationService } from "../../lib/mainLocationService";
import { employeesService } from "../../lib/employeesService";

const Employees = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  // Access & Privileges
  const hasToken = !!authData?.access_token;
  const hasPrivilege = useMemo(
    () => Array.isArray(authData?.privilege_ids) && authData.privilege_ids.includes(5000),
    [authData]
  );
  // Collections
  const [mainLocations, setMainLocations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  // Filters
  const [selectedMainLocation, setSelectedMainLocation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  // Form state
  const [form, setForm] = useState({
    employee_id: "",
    name_en: "",
    name_ar: "",
    tag_number: "",
    main_location_id: "",
    location_id: "",
    imageFile: null,
  });

  // --- Bootstrap data
  useEffect(() => {
    if (authLoading) return;
    if (!hasToken) {
      setError(t("employees.no_permission") || "No permission");
      setLoading(false);
      return;
    }
    const boot = async () => {
      try {
        if (!authData?.org_id) throw new Error("Missing org_id");
        console.debug("Bootstrapping data with org_id:", authData?.org_id);
        const ml = await mainLocationService.getMainLocations(authData.org_id);
        setMainLocations(ml);
        const emps = await employeesService.getEmployees(authData.org_id);
        console.debug("Fetched employees:", emps);
        setEmployees(emps);
      } catch (e) {
        console.error("Error bootstrapping data:", e.message, e.stack);
        setError(e.message || t("employees.fetch_error"));
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [authLoading, hasToken, authData, t]);

  // When main location changes, load child locations
  useEffect(() => {
    const loadLocations = async () => {
      if (!selectedMainLocation || !authData?.org_id) {
        setLocations([]);
        setSelectedLocation("");
        return;
      }
      try {
        console.debug("Loading locations for main_location_id:", selectedMainLocation, "org_id:", authData.org_id);
        const locs = await employeesService.getLocationsByMain(selectedMainLocation, authData.org_id);
        setLocations(locs);
      } catch (e) {
        console.error("Error fetching locations:", e.message, e.stack);
        setError(e.message || t("employees.fetch_locations_error"));
      }
    };
    loadLocations();
  }, [selectedMainLocation, authData, t]);

  // Filter employees when location filter changes
  useEffect(() => {
    const refetch = async () => {
      if (!authData?.org_id) return;
      try {
        setLoading(true);
        console.debug("Refetching employees with org_id:", authData.org_id, "location_id:", selectedLocation);
        const emps = await employeesService.getEmployees(authData.org_id, selectedLocation || undefined);
        setEmployees(emps);
      } catch (e) {
        console.error("Error fetching employees:", e.message, e.stack);
        setError(e.message || t("employees.fetch_error"));
      } finally {
        setLoading(false);
      }
    };
    refetch();
  }, [selectedLocation, authData, t]);

  // --- Create flow
  const openCreate = async () => {
    if (!hasPrivilege) {
      setError(t("employees.no_permission") || "No permission");
      return;
    }
    try {
      // Auto-generate employee_id from database
      const nextId = await employeesService.getNextEmployeeId(authData.org_id);
      setForm({
        employee_id: String(nextId),
        name_en: "",
        name_ar: "",
        tag_number: "",
        main_location_id: selectedMainLocation || "",
        location_id: selectedLocation || "",
        imageFile: null,
      });
      setIsCreating(true);
    } catch (e) {
      console.error("Error fetching next employee ID:", e.message, e.stack);
      setError(e.message || "Failed to generate employee ID");
    }
  };

  const closeCreate = () => {
    setIsCreating(false);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) return;
    try {
      setLoading(true);
      const payload = {
        employee_id: Number(form.employee_id),
        org_id: Number(authData.org_id),
        name_en: form.name_en.trim(),
        name_ar: form.name_ar.trim(),
        tag_number: form.tag_number.trim(),
        location_id: form.location_id,
      };
      console.debug("Creating employee with payload:", payload);
      await employeesService.createEmployee(payload, form.imageFile);
      closeCreate();
      const emps = await employeesService.getEmployees(authData.org_id, selectedLocation || undefined);
      setEmployees(emps);
      setError("");
    } catch (e) {
      console.error("Error creating employee:", e.message, e.stack);
      setError(e.message || t("employees.create_error"));
    } finally {
      setLoading(false);
    }
  };

  // --- Edit flow
  const handleEdit = async (employee) => {
    if (!hasPrivilege) {
      setError(t("employees.no_permission") || "No permission");
      return;
    }
    try {
      // Use the record we already have; backend doesn't expose GET by _id
      setEditingEmployee(employee);
      setForm({
        employee_id: String(employee.employee_id ?? ""),
        name_en: employee.name_en ?? "",
        name_ar: employee.name_ar ?? "",
        tag_number: employee.tag_number ?? "",
        main_location_id: selectedMainLocation || "",
        location_id: employee.location_id ?? "",
        imageFile: null,
      });
      setIsEditing(true);
    } catch (e) {
      console.error("Error preparing employee for edit:", e.message, e.stack);
      setError(e.message || t("employees.fetch_edit_error"));
    }
  };

  const closeEdit = () => {
    setIsEditing(false);
    setEditingEmployee(null);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) return;
    try {
      setLoading(true);
      const payload = {
        name_en: form.name_en.trim(),
        name_ar: form.name_ar.trim(),
        tag_number: form.tag_number.trim(),
        location_id: form.location_id,
      };
      console.debug(
        "Updating employee with employee_id:",
        editingEmployee.employee_id,
        "org_id:",
        authData.org_id,
        "payload:",
        payload
      );
      await employeesService.updateEmployee(
        editingEmployee.employee_id,   // <-- use numeric employee_id
        payload,
        form.imageFile,
        authData.org_id                // <-- org_id is required by backend
      );
      closeEdit();
      const emps = await employeesService.getEmployees(authData.org_id, selectedLocation || undefined);
      setEmployees(emps);
      setError("");
    } catch (e) {
      console.error("Error updating employee:", e.message, e.stack);
      setError(e.message || t("employees.update_error"));
    } finally {
      setLoading(false);
    }
  };

  // --- Delete flow
  const handleDelete = async (employee) => {
    if (!hasPrivilege) {
      setError(t("employees.no_permission") || "No permission");
      return;
    }
    if (window.confirm(t("employees.delete_confirm") || "Are you sure you want to delete this employee?")) {
      try {
        setLoading(true);
        console.debug("Deleting employee with employee_id:", employee.employee_id, "org_id:", authData.org_id);
        await employeesService.deleteEmployee(employee.employee_id, authData.org_id); // <-- pass org_id in query
        const emps = await employeesService.getEmployees(authData.org_id, selectedLocation || undefined);
        setEmployees(emps);
        setError("");
      } catch (e) {
        console.error("Error deleting employee:", e.message, e.stack);
        setError(e.message || t("employees.delete_error"));
      } finally {
        setLoading(false);
      }
    }
  };

  // --- Image handling
  const [imageURLs, setImageURLs] = useState({});
  const getEmployeeImageURL = async (employeeId) => {
    try {
      const blob = await employeesService.fetchEmployeeImageBlob(employeeId); // <-- employee_id
      return URL.createObjectURL(blob);
    } catch (e) {
      console.debug("No image found for employee_id:", employeeId);
      return null;
    }
  };

  useEffect(() => {
    const go = async () => {
      const entries = await Promise.all(
        employees.map(async (emp) => {
          if (!emp.image) return [emp.employee_id, null];
          const url = await getEmployeeImageURL(emp.employee_id); // <-- use employee_id
          return [emp.employee_id, url]; // <-- key by employee_id
        })
      );
      setImageURLs(Object.fromEntries(entries));
    };
    if (employees?.length) go();
    return () => {
      Object.values(imageURLs || {}).forEach((u) => u && URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees]);

  if (authLoading || loading) return <LoadingSpinner />;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  {t("employees.title") || (language === "ar" ? "الموظفون" : "Employees")}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("employees.subtitle") || (language === "ar" ? "إدارة بيانات الموظفين وصورهم" : "Manage employees and their photos")}
                </p>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {hasPrivilege && (
                  <button
                    onClick={openCreate}
                    className="inline-flex items-center bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    {t("employees.add") || (language === "ar" ? "إضافة موظف" : "Add Employee")}
                  </button>
                )}
                <ModalSearch />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("employees.main_location") || (language === "ar" ? "الموقع الرئيسي" : "Main Location")}
                </label>
                <select
                  value={selectedMainLocation}
                  onChange={(e) => {
                    setSelectedMainLocation(e.target.value);
                    setSelectedLocation("");
                  }}
                  className="shadow border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">
                    {t("employees.select_main_location") || (language === "ar" ? "اختر الموقع الرئيسي" : "Select main location")}
                  </option>
                  {mainLocations.map((ml) => (
                    <option key={ml.id} value={ml.id}>
                      {language === "ar" ? ml.main_location_ar : ml.main_location_name_en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("employees.location") || (language === "ar" ? "الموقع" : "Location")}
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="shadow border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={!selectedMainLocation}
                >
                  <option value="">
                    {t("employees.select_location") || (language === "ar" ? "اختر الموقع" : "Select location")}
                  </option>
                  {locations.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      {language === "ar" ? (loc.name_ar || loc.name) : loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span>{error}</span>
                <button
                  onClick={() => setError("")}
                  className="absolute top-0 right-0 px-4 py-3"
                  aria-label={t("common.dismiss_error")}
                >
                  <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                  </svg>
                </button>
              </div>
            )}
            {employees.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300">
                {t("employees.no_employees") || (language === "ar" ? "لا يوجد موظفون" : "No employees found")}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((emp) => (
                  <div
                    key={emp._id}
                    className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
                    role="region"
                    aria-label={`${language === "ar" ? emp.name_ar : emp.name_en}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {imageURLs[emp.employee_id] ? (
                          <img
                            src={imageURLs[emp.employee_id]}
                            alt={emp.name_en}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">{t("employees.no_image") || "No image"}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {language === "ar" ? emp.name_ar : emp.name_en}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          #{emp.employee_id} • {t("employees.tag") || "Tag"}: {emp.tag_number}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {t("employees.location") || "Location"}: {emp.location_id}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
                        aria-label={t("employees.edit") || "Edit"}
                      >
                        <PencilIcon className="w-4 h-4 mr-1" />
                        {t("employees.edit") || "Edit"}
                      </button>
                      <button
                        onClick={() => handleDelete(emp)}
                        className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                        aria-label={t("employees.delete") || "Delete"}
                      >
                        <TrashIcon className="w-4 h-4 mr-1" />
                        {t("employees.delete") || "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {(isCreating || isEditing) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-lg shadow-2xl">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    {isCreating
                      ? t("employees.add_title") || (language === "ar" ? "إضافة موظف" : "Add Employee")
                      : t("employees.edit_title") || (language === "ar" ? "تعديل موظف" : "Edit Employee")}
                  </h2>
                  <form onSubmit={isCreating ? handleCreateSubmit : handleUpdateSubmit} className="space-y-5">
                    {/* Employee ID - Hidden when creating, shown but disabled when editing */}
                    {isEditing && (
                      <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                          {t("employees.employee_id") || "Employee ID"}
                        </label>
                        <input
                          type="number"
                          value={form.employee_id}
                          readOnly
                          disabled
                          className="shadow border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-500 dark:text-gray-400 dark:bg-gray-700 cursor-not-allowed"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                          {t("employees.tag_number") || "Tag Number"}
                        </label>
                        <input
                          type="text"
                          value={form.tag_number}
                          onChange={(e) => setForm({ ...form, tag_number: e.target.value })}
                          className="shadow border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                        {t("employees.name_en") || "Name (EN)"}
                      </label>
                      <input
                        type="text"
                        value={form.name_en}
                        onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                        className="shadow border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                        {t("employees.name_ar") || "Name (AR)"}
                      </label>
                      <input
                        type="text"
                        value={form.name_ar}
                        onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                        className="shadow border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        dir="rtl"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                          {t("employees.main_location") || "Main Location"}
                        </label>
                        <select
                          value={form.main_location_id}
                          onChange={async (e) => {
                            const v = e.target.value;
                            setForm({ ...form, main_location_id: v, location_id: "" });
                            setSelectedMainLocation(v);
                          }}
                          className="shadow border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        >
                          <option value="">
                            {t("employees.select_main_location") || "Select main location"}
                          </option>
                          {mainLocations.map((ml) => (
                            <option key={ml.id} value={ml.id}>
                              {language === "ar" ? ml.main_location_ar : ml.main_location_name_en}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                          {t("employees.location") || "Location"}
                        </label>
                        <select
                          value={form.location_id}
                          onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                          className="shadow border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                          disabled={!form.main_location_id}
                        >
                          <option value="">
                            {t("employees.select_location") || "Select location"}
                          </option>
                          {locations.map((loc) => (
                            <option key={loc.name} value={loc.name}>
                              {language === "ar" ? (loc.name_ar || loc.name) : loc.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                        {t("employees.image") || "Image"}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] || null })}
                        className="block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-gray-200"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={isCreating ? closeCreate : closeEdit}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
                      >
                        {t("employees.cancel") || "Cancel"}
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded"
                      >
                        {isCreating ? t("employees.create") || "Create" : t("employees.save") || "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Employees;
