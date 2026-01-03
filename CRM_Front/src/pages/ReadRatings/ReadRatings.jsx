// src/pages/Ratings/ReadRatings.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import LoadingSpinner from "../../components/LoadingSpinner";
import ModalSearch from "../../components/ModalSearch";
import ThemeToggle from "../../components/ThemeToggle";
import LanguageToggle from "../../components/LanguageToggle";
import ratingsService from "../../lib/ratingsService";
import { RatingsTable, RatingDetailsModal, DrilldownPanel, Badge, formatEmployeeDisplay } from "./RatingsHelpers";

// NovaKit components
import { GlassCard, GradientText, FilterSection, PageHeader, Chip, RatingBadge } from "../../components/ratings/NovaKitComponents";

const ReadRatings = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [hasPrivilege, setHasPrivilege] = React.useState(false);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [items, setItems] = React.useState([]);
  const [selected, setSelected] = React.useState(null);

  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);

  // server filters (mapped to backend)
  const [filters, setFilters] = React.useState({
    rating: "",
    location_id: "",
    employee_id: "",
    q: "",
    start_date: "",
    end_date: "",
    sort: "-date_created",
  });

  const [view, setView] = React.useState("cards"); // "cards" | "table"
  const [quickSearch, setQuickSearch] = React.useState("");

  const hasPrivilegeCheck = (required) =>
    authData?.privilege_ids?.some((id) => required.includes(id)) || false;

  React.useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setHasPrivilege(false);
      setError(t("ratings.no_permission") || "No permission to view ratings");
      setLoading(false);
      return;
    }
    const allowed = hasPrivilegeCheck([5000, 1, 2001, 1001, 1002, 1003, 1004]);
    setHasPrivilege(allowed);
    if (!allowed) {
      setError(t("ratings.no_permission") || "No permission to view ratings");
      setLoading(false);
      return;
    }
    fetchRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authData, authLoading, page, perPage, filters.rating, filters.sort]);

  async function fetchRatings() {
    try {
      setLoading(true);
      const resp = await ratingsService.getRatings(authData.org_id, {
        page,
        per_page: perPage,
        rating: filters.rating || undefined,
        location_id: filters.location_id || undefined,
        employee_id: filters.employee_id || undefined,
        q: filters.q || undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        sort: filters.sort || "-date_created",
      });
      setItems(Array.isArray(resp.data) ? resp.data : []);
      setTotalPages(resp.pagination?.total_pages || 1);
    } catch (err) {
      setError(t("ratings.fetch_error", { message: err.message }) || `Error: ${err.message}`);
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  // quick, client-side search on the page’s result set
  const visibleItems = React.useMemo(() => {
    if (!quickSearch) return items;
    const q = quickSearch.toLowerCase();
    return items.filter((r) =>
      [
        r.location_id,
        r.rating,
        r.notes,
        r.notes_phone,
        String(r.employee_id),
        r?.date_created ? new Date(r.date_created).toLocaleDateString() : "",
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
        .some((v) => v.includes(q))
    );
  }, [items, quickSearch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
    setPage(1);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
    setPage(1);
  };

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) {
      setPage(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;

  if (!hasPrivilege) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main>
            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                {error || (t("ratings.no_permission") || "No permission to view ratings")}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Gradient background effect */}
            <div className="pointer-events-none fixed inset-0 -z-10">
              <div className="absolute left-1/2 top-[-12rem] -translate-x-1/2 transform">
                <div className="aspect-[1108/632] w-[72rem] bg-gradient-to-tr from-indigo-500/20 via-fuchsia-500/20 to-cyan-400/20 opacity-30 blur-3xl" />
              </div>
            </div>

            {/* Title + actions */}
            <PageHeader
              title={<><GradientText>{t("ratings.view") || "Read Ratings"}</GradientText></>}
              actions={
                <>
                  <LanguageToggle />
                  <ModalSearch onSearch={(q) => setQuickSearch(q)} />
                  <ThemeToggle />
                </>
              }
            />

            {/* Quick drilldown */}
            <DrilldownPanel items={visibleItems} />

            {/* Top search + view switch */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder={t("ratings.search_placeholder") || "Quick search..."}
                  className="w-full py-3 px-4 pl-12 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  aria-label={t("ratings.search_placeholder") || "Search ratings"}
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setView(view === "cards" ? "table" : "cards")}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                aria-label={view === "cards" ? "Switch to table view" : "Switch to card view"}
              >
                {view === "cards" ? (t("ratings.table_view") || "Table View") : (t("ratings.card_view") || "Card View")}
              </button>
            </div>

            {/* Server-side filter form */}
            <FilterSection title={t("ratings.filters") || "Filters"}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
                  <select
                    name="rating"
                    value={filters.rating}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">{t("ratings.all") || "All"}</option>
                    <option value="happy">Happy</option>
                    <option value="medium">Medium</option>
                    <option value="sad">Sad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                  <input
                    type="text"
                    name="location_id"
                    value={filters.location_id}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Contains..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employee ID</label>
                  <input
                    type="number"
                    name="employee_id"
                    value={filters.employee_id}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Exact match"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search (q)</label>
                  <input
                    type="text"
                    name="q"
                    value={filters.q}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="location/notes/phone/employee"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleDateChange}
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleDateChange}
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sort</label>
                  <select
                    name="sort"
                    value={filters.sort}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="-date_created">Newest First</option>
                    <option value="date_created">Oldest First</option>
                    <option value="-employee_id">Employee (Desc)</option>
                    <option value="employee_id">Employee (Asc)</option>
                    <option value="-rating">Rating (Desc)</option>
                    <option value="rating">Rating (Asc)</option>
                  </select>
                </div>
              </div>
            </FilterSection>

            {/* Content */}
            {items.length === 0 ? (
              <div className="text-center text-gray-600 dark:text-gray-300 py-12">
                <svg className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg">{t("ratings.no_items") || "No ratings found"}</p>
              </div>
            ) : (
              <>
                {view === "cards" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleItems.map((r) => {
                      const key = r._id?.$oid || r._id || `${r.org_id}-${r.employee_id}-${r.date_created}`;
                      return (
                        <GlassCard
                          key={key}
                          className="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                          onClick={() => setSelected(r)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelected(r)}
                          aria-label={`Rating card for ${formatEmployeeDisplay(r.employee_id)}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200">
                              {formatEmployeeDisplay(r.employee_id)}
                            </h3>
                            <Badge value={r.rating} />
                          </div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Location</span>
                              <p className="text-gray-800 dark:text-gray-100">{r.location_id}</p>
                            </div>
                            {r.notes && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Notes</span>
                                <p className="text-gray-800 dark:text-gray-100">{r.notes}</p>
                              </div>
                            )}
                            {r.notes_phone && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Phone Notes</span>
                                <p className="text-gray-800 dark:text-gray-100">{r.notes_phone}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Date</span>
                              <p className="text-gray-800 dark:text-gray-100">
                                {r.date_created ? new Date(r.date_created).toLocaleString() : "—"}
                              </p>
                            </div>
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
                ) : (
                  <RatingsTable items={visibleItems} onRowClick={setSelected} />
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-8">
                    <button
                      type="button"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label={t("ratings.previous") || "Previous"}
                    >
                      {t("ratings.previous") || "Previous"}
                    </button>
                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(8, totalPages) }, (_, i) => {
                        const start = Math.max(1, page - 3);
                        const end = Math.min(totalPages, start + 7);
                        const p = start + i;
                        return p <= end ? (
                          <button
                            type="button"
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`px-4 py-2 rounded-lg ${
                              p === page
                                ? "bg-indigo-500 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            aria-current={p === page ? "page" : undefined}
                          >
                            {p}
                          </button>
                        ) : null;
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label={t("ratings.next") || "Next"}
                    >
                      {t("ratings.next") || "Next"}
                    </button>
                    <select
                      value={page}
                      onChange={(e) => handlePageChange(Number(e.target.value))}
                      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label={t("ratings.jump_to_page") || "Jump to page"}
                    >
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <option key={p} value={p}>{(t("ratings.page") || "Page") + " " + p}</option>
                      ))}
                    </select>
                    <select
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value));
                        setPage(1);
                      }}
                      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label={t("ratings.items_per_page") || "Items per page"}
                    >
                      {[5, 10, 15, 25, 50, 100].map((n) => (
                        <option key={n} value={n}>{n} {(t("ratings.items") || "items")}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {/* Details modal */}
            {selected && <RatingDetailsModal item={selected} onClose={() => setSelected(null)} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReadRatings;
