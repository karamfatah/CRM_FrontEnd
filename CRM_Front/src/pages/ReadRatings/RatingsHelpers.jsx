// src/pages/Ratings/RatingsHelpers.jsx
import React, { useMemo } from "react";
import { format } from "date-fns";

// ----- small UI helpers ------------------------------------------------------
export const Badge = ({ value }) => {
  const cls =
    value === "happy"
      ? "bg-green-600 text-white"
      : value === "medium"
      ? "bg-yellow-600 text-white"
      : value === "sad"
      ? "bg-red-600 text-white"
      : "bg-gray-600 text-white";
  return (
    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${cls}`}>
      {value || "N/A"}
    </span>
  );
};

// Helper function to format employee display
// If employee_id is 0, null, undefined, or empty, it means the rating is for the Branch
export const formatEmployeeDisplay = (employeeId) => {
  if (employeeId === null || employeeId === undefined || employeeId === '' || employeeId === 0 || String(employeeId).trim() === '' || String(employeeId) === '0') {
    return 'Branch';
  }
  return `Employee #${employeeId}`;
};

// Helper function to get employee label (for labels like "Employee:" or "Branch:")
export const getEmployeeLabel = (employeeId) => {
  if (employeeId === null || employeeId === undefined || employeeId === '' || employeeId === 0 || String(employeeId).trim() === '' || String(employeeId) === '0') {
    return 'Branch';
  }
  return 'Employee';
};

// ----- table (client filter row only; server filters live in the page) -------
export const RatingsTable = ({ items, onRowClick }) => {
  const [filters, setFilters] = React.useState({
    employee_id: "",
    location_id: "",
    rating: "",
    notes: "",
    notes_phone: "",
    date_created: "",
  });

  const handleColFilter = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const rows = useMemo(() => {
    const f = filters;
    return items.filter((x) => {
      const dc = x.date_created ? format(new Date(x.date_created), "PPP") : "";
      return (
        String(x.employee_id || "").toLowerCase().includes(f.employee_id.toLowerCase()) &&
        (x.location_id || "").toLowerCase().includes(f.location_id.toLowerCase()) &&
        (x.rating || "").toLowerCase().includes(f.rating.toLowerCase()) &&
        (x.notes || "").toLowerCase().includes(f.notes.toLowerCase()) &&
        (x.notes_phone || "").toLowerCase().includes(f.notes_phone.toLowerCase()) &&
        dc.toLowerCase().includes(f.date_created.toLowerCase())
      );
    });
  }, [items, filters]);

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-indigo-50 dark:bg-indigo-900">
          <tr>
            {["Employee ID","Location","Rating","Notes","Phone Notes","Date"].map((h) => (
              <th key={h} className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
          <tr className="bg-gray-50 dark:bg-gray-700">
            {["employee_id","location_id","rating","notes","notes_phone","date_created"].map((name) => (
              <td key={name} className="px-6 py-2">
                <input
                  type="text"
                  name={name}
                  value={filters[name]}
                  onChange={handleColFilter}
                  placeholder={`Filter ${name.replace("_"," ")}`}
                  className="w-full py-1 px-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </td>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700" role="rowgroup">
          {rows.map((r) => {
            const key = r._id?.$oid || r._id || `${r.org_id}-${r.employee_id}-${r.date_created}`;
            return (
              <tr
                key={key}
                className="hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer transition-colors duration-200"
                onClick={() => onRowClick?.(r)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onRowClick?.(r)}
                aria-label={`Rating for ${formatEmployeeDisplay(r.employee_id)}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">{formatEmployeeDisplay(r.employee_id)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">{r.location_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100"><Badge value={r.rating} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">{r.notes || "—"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">{r.notes_phone || "—"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {r.date_created ? format(new Date(r.date_created), "PPP") : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ----- simple drilldown: counts per rating + top locations -------------------
export const DrilldownPanel = ({ items }) => {
  const { ratingCounts, topLocations } = useMemo(() => {
    const rc = { happy: 0, medium: 0, sad: 0, unknown: 0 };
    const locs = new Map();
    for (const r of items) {
      if (r.rating === "happy") rc.happy++;
      else if (r.rating === "medium") rc.medium++;
      else if (r.rating === "sad") rc.sad++;
      else rc.unknown++;
      if (r.location_id) locs.set(r.location_id, (locs.get(r.location_id) || 0) + 1);
    }
    const top = [...locs.entries()].sort((a,b) => b[1]-a[1]).slice(0, 8);
    return { ratingCounts: rc, topLocations: top };
  }, [items]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Totals</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 rounded bg-green-600 text-white text-sm">Happy: {ratingCounts.happy}</span>
          <span className="px-2 py-1 rounded bg-yellow-600 text-white text-sm">Medium: {ratingCounts.medium}</span>
          <span className="px-2 py-1 rounded bg-red-600 text-white text-sm">Sad: {ratingCounts.sad}</span>
          {ratingCounts.unknown > 0 && (
            <span className="px-2 py-1 rounded bg-gray-600 text-white text-sm">Unknown: {ratingCounts.unknown}</span>
          )}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border border-gray-200 dark:border-gray-700 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Top Locations</h3>
        {topLocations.length === 0 ? (
          <div className="text-gray-600 dark:text-gray-300">No data</div>
        ) : (
          <ul className="space-y-2">
            {topLocations.map(([loc, cnt]) => (
              <li key={loc} className="flex items-center justify-between text-gray-800 dark:text-gray-100">
                <span>{loc}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-sm">{cnt}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// ----- details modal ---------------------------------------------------------
export const RatingDetailsModal = ({ item, onClose }) => {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Rating Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3 text-gray-800 dark:text-gray-100">
          <div><span className="font-medium">{getEmployeeLabel(item.employee_id)}:</span> {formatEmployeeDisplay(item.employee_id)}</div>
          <div><span className="font-medium">Location:</span> {item.location_id}</div>
          <div><span className="font-medium">Rating:</span> <span className="ml-2"><Badge value={item.rating} /></span></div>
          {item.notes && <div><span className="font-medium">Notes:</span> {item.notes}</div>}
          {item.notes_phone && <div><span className="font-medium">Phone Notes:</span> {item.notes_phone}</div>}
          <div><span className="font-medium">Date:</span> {item.date_created ? format(new Date(item.date_created), "PPpp") : "—"}</div>
        </div>
      </div>
    </div>
  );
};

export default {
  Badge,
  RatingsTable,
  DrilldownPanel,
  RatingDetailsModal,
  formatEmployeeDisplay,
  getEmployeeLabel,
};
