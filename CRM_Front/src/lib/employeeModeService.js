const API_BASE = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE) throw new Error("VITE_API_BASE_URL is not defined");
const API_EMPLOYEE_MODE = `${API_BASE}/api/employee-mode`;
const isDev = import.meta.env.DEV;

const checkToken = () => {
  const t = localStorage.getItem("access_token");
  if (!t) throw new Error("No access token found. Please log in.");
  return t;
};

const handleResponse = async (response) => {
  if (response.ok) {
    const text = await response.text();
    return text ? JSON.parse(text) : undefined;
  }
  let msg = "Failed";
  try {
    const e = await response.json();
    msg = e.message || e.error || msg;
  } catch (_) {}
  switch (response.status) {
    case 401:
      throw new Error("Unauthorized: Please log in again.");
    case 403:
      throw new Error("Forbidden: You lack the required permissions.");
    case 404:
      throw new Error(`Not Found: ${msg} (URL: ${response.url})`);
    case 400:
      throw new Error(`Bad Request: ${msg}`);
    default:
      throw new Error(`Failed: ${response.status} - ${msg}`);
  }
};

export const employeeModeService = {
  // Get all employee mode settings for an organization
  async getEmployeeModeSettings(org_id) {
    const url = new URL(API_EMPLOYEE_MODE);
    url.searchParams.set("org_id", org_id);
    if (isDev) {
      console.debug("Fetching employee mode settings for org_id:", org_id, "URL:", url.toString());
    }
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-tokens": checkToken(),
        },
      });
      const data = await handleResponse(res);
      if (isDev) {
        console.debug("Backend response for getEmployeeModeSettings:", data);
      }
      return data?.settings || [];
    } catch (error) {
      // If API doesn't exist yet, return empty array (fallback to localStorage)
      if (isDev) {
        console.warn("Employee mode API not available, using localStorage fallback:", error.message);
      }
      return this.getEmployeeModeSettingsFromLocal(org_id);
    }
  },

  // Get employee mode setting for a specific branch
  async getEmployeeModeForBranch(org_id, branch) {
    const settings = await this.getEmployeeModeSettings(org_id);
    const setting = settings.find((s) => s.branch === branch);
    return setting?.enabled ?? false;
  },

  // Update employee mode setting for a branch
  async updateEmployeeMode(org_id, branch, enabled) {
    const url = new URL(API_EMPLOYEE_MODE);
    if (isDev) {
      console.debug("Updating employee mode:", { org_id, branch, enabled }, "URL:", url.toString());
    }
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-tokens": checkToken(),
        },
        body: JSON.stringify({
          org_id,
          branch,
          enabled,
        }),
      });
      const data = await handleResponse(res);
      if (isDev) {
        console.debug("Backend response for updateEmployeeMode:", data);
      }
      // Also save to localStorage as backup
      this.saveEmployeeModeToLocal(org_id, branch, enabled);
      return data;
    } catch (error) {
      // If API doesn't exist, use localStorage
      if (isDev) {
        console.warn("Employee mode API not available, using localStorage:", error.message);
      }
      this.saveEmployeeModeToLocal(org_id, branch, enabled);
      return { success: true, branch, enabled };
    }
  },

  // LocalStorage fallback methods
  getEmployeeModeSettingsFromLocal(org_id) {
    try {
      const key = `employee_mode_settings_${org_id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error("Error reading employee mode settings from localStorage:", error);
      return [];
    }
  },

  saveEmployeeModeToLocal(org_id, branch, enabled) {
    try {
      // Save in React format (array of settings)
      const key = `employee_mode_settings_${org_id}`;
      const settings = this.getEmployeeModeSettingsFromLocal(org_id);
      const existingIndex = settings.findIndex((s) => s.branch === branch);
      if (existingIndex >= 0) {
        settings[existingIndex].enabled = enabled;
      } else {
        settings.push({ branch, enabled });
      }
      localStorage.setItem(key, JSON.stringify(settings));
      
      // ALSO save in Dart-compatible format (individual boolean keys)
      // Format: employee_mode_{branch} (e.g., employee_mode_Golf)
      const dartKey = branch ? `employee_mode_${branch}` : 'employee_mode';
      localStorage.setItem(dartKey, String(enabled));
      
      if (isDev) {
        console.debug("Saved employee mode setting to localStorage:", { org_id, branch, enabled, dartKey });
      }
    } catch (error) {
      console.error("Error saving employee mode setting to localStorage:", error);
    }
  },
};

