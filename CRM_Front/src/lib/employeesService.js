const API_BASE = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE) throw new Error("VITE_API_BASE_URL is not defined");
const API_EMPLOYEES = `${API_BASE}/api/employees`;
const API_LOCATIONS = `${API_BASE}/locations_qa`;
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

export const employeesService = {
  async getNextEmployeeId(org_id) {
    const url = new URL(`${API_EMPLOYEES}/next-id`);
    url.searchParams.set("org_id", org_id);
    if (isDev) {
      console.debug("Fetching next employee_id for org_id:", org_id, "URL:", url.toString());
    }
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-tokens": checkToken(),
      },
    });
    const data = await handleResponse(res);
    if (isDev) {
      console.debug("Backend response for getNextEmployeeId:", data);
    }
    return data?.next_id || 1;
  },

  async getEmployees(org_id, location_id) {
    const url = new URL(API_EMPLOYEES);
    url.searchParams.set("org_id", org_id);
    if (location_id) url.searchParams.set("location_id", location_id);
    if (isDev) {
      console.debug(
        "Fetching employees for org_id:",
        org_id,
        "location_id:",
        location_id || "all",
        "URL:",
        url.toString()
      );
    }
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-tokens": checkToken(),
      },
    });
    const data = await handleResponse(res);
    if (isDev) {
      console.debug("Backend response for getEmployees:", data);
    }
    return (data?.employees || []).map((e) => ({
      _id: e._id,
      employee_id: e.employee_id,
      org_id: e.org_id,
      name_en: e.name_en,
      name_ar: e.name_ar,
      image: e.image,
      tag_number: e.tag_number,
      location_id: e.location_id,
      status: e.status,
      date_created: e.date_created,
    }));
  },

  // (Kept for compatibility, but your backend doesn't expose GET /employees/:_id)
  // If you still call this elsewhere, consider refactoring to use getEmployees + filter.
  async getEmployee(id) {
    const url = new URL(`${API_EMPLOYEES}/${encodeURIComponent(id)}`);
    if (isDev) {
      console.debug("Fetching employee by id (note: backend may not support this):", id, "URL:", url.toString());
    }
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-tokens": checkToken(),
      },
    });
    const data = await handleResponse(res);
    if (isDev) {
      console.debug("Backend response for getEmployee:", data);
    }
    return {
      _id: data._id,
      employee_id: data.employee_id,
      org_id: data.org_id,
      name_en: data.name_en,
      name_ar: data.name_ar,
      image: data.image,
      tag_number: data.tag_number,
      location_id: data.location_id,
      status: data.status,
      date_created: data.date_created,
    };
  },

  async createEmployee(payload, imageFile) {
    const url = new URL(API_EMPLOYEES);
    const fd = new FormData();
    fd.append("employee_id", String(payload.employee_id));
    fd.append("org_id", String(payload.org_id));
    fd.append("name_en", payload.name_en);
    fd.append("name_ar", payload.name_ar);
    fd.append("tag_number", payload.tag_number);
    fd.append("location_id", payload.location_id);
    if (imageFile) fd.append("image", imageFile);
    if (isDev) {
      console.debug(
        "Creating employee with payload:",
        payload,
        "image:",
        imageFile,
        "URL:",
        url.toString()
      );
    }
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "x-access-tokens": checkToken(),
      },
      body: fd,
    });
    const created = await handleResponse(res);
    if (isDev) {
      console.debug("Backend response for createEmployee:", created);
    }
    return created?.employee || created;
  },

  // id must be numeric employee_id; backend requires ?org_id=
  async updateEmployee(id, payload, imageFile, org_id) {
    const url = new URL(`${API_EMPLOYEES}/${encodeURIComponent(id)}`);
    url.searchParams.set("org_id", org_id);
    const fd = new FormData();
    if (payload.name_en) fd.append("name_en", payload.name_en);
    if (payload.name_ar) fd.append("name_ar", payload.name_ar);
    if (payload.tag_number) fd.append("tag_number", payload.tag_number);
    if (payload.location_id) fd.append("location_id", payload.location_id);
    if (imageFile) fd.append("image", imageFile);
    if (isDev) {
      console.debug(
        "Updating employee with employee_id:",
        id,
        "payload:",
        payload,
        "image:",
        imageFile,
        "URL:",
        url.toString()
      );
    }
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "x-access-tokens": checkToken(),
      },
      body: fd,
    });
    const updated = await handleResponse(res);
    if (isDev) {
      console.debug("Backend response for updateEmployee:", updated);
    }
    return updated?.employee || updated;
  },

  // Requires org_id query to match backend: DELETE /api/employees/:employeeId?org_id=
  async deleteEmployee(id, org_id) {
    const url = new URL(`${API_EMPLOYEES}/${encodeURIComponent(id)}`);
    if (org_id != null) url.searchParams.set("org_id", org_id);
    if (isDev) {
      console.debug("Deleting employee with employee_id:", id, "org_id:", org_id, "URL:", url.toString());
    }
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-access-tokens": checkToken(),
      },
    });
    const data = await handleResponse(res);
    if (isDev) {
      console.debug("Backend response for deleteEmployee:", data);
    }
    return data;
  },

  async getLocationsByMain(main_location_id, org_id) {
    const url = new URL(API_LOCATIONS);
    url.searchParams.set("org_id", org_id);
    url.searchParams.set("main_location_id", main_location_id);
    if (isDev) {
      console.debug(
        "Fetching locations for main_location_id:",
        main_location_id,
        "org_id:",
        org_id,
        "URL:",
        url.toString()
      );
    }
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-tokens": checkToken(),
      },
    });
    const data = await handleResponse(res);
    if (isDev) {
      console.debug("Backend response for getLocationsByMain:", data);
    }
    const arr = Array.isArray(data) ? data : data?.locations || [];
    return arr.map((l) => ({
      name: l.location_en || "",
      name_ar: l.location_ar || "",
    }));
  },

  // GET /api/employees/:employeeId/image
  async fetchEmployeeImageBlob(id) {
    const url = new URL(`${API_EMPLOYEES}/${encodeURIComponent(id)}/image`);
    if (isDev) {
      console.debug("Fetching image for employee_id:", id, "URL:", url.toString());
    }
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-access-tokens": checkToken(),
      },
    });
    if (!res.ok) throw new Error("Image not found");
    const blob = await res.blob();
    if (isDev) {
      console.debug("Fetched image blob for employee_id:", id);
    }
    return blob;
  },
};
