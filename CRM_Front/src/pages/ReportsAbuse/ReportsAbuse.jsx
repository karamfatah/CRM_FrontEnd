import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { GlassCard, PageHeader, RatingBadge } from '../../components/ratings/NovaKitComponents';
import { locationsQaService } from '../../lib/locationsQaService';
import { Calendar, MapPin, Filter, X, ChevronLeft, ChevronRight, Camera, AlertCircle, RefreshCw, Star, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055';

const ReportsAbuse = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    branch: '',
    rating: '',
  });
  const [syncLocation, setSyncLocation] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  
  // Track filter changes to ensure proper re-fetching
  const [filterKey, setFilterKey] = useState(0);

  const hasPrivilegeCheck = (required) =>
    authData?.privilege_ids?.some((id) => required.includes(id)) || false;

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      if (!authData?.org_id || !hasPrivilege) return;
      try {
        const locations = await locationsQaService.getLocations(authData.org_id);
        const uniqueBranches = Array.from(
          new Set(locations.map((loc) => loc.location_en || loc.location_ar || '').filter(Boolean))
        ).sort();
        setBranches(uniqueBranches);
      } catch (err) {
        console.error('Error fetching branches:', err);
      }
    };
    if (hasPrivilege && authData?.org_id) {
      fetchBranches();
    }
  }, [authData, hasPrivilege]);

  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setHasPrivilege(false);
      setError(t('reports_abuse.no_permission') || 'No permission to view abuse reports');
      setLoading(false);
      return;
    }

    const allowed = hasPrivilegeCheck([5000, 1]);
    setHasPrivilege(allowed);
    if (!allowed) {
      setError(t('reports_abuse.no_permission') || 'No permission to view abuse reports');
      setLoading(false);
      return;
    }
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authData, authLoading, page, perPage, filters.dateFrom, filters.dateTo, filters.branch, filters.rating, filterKey]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('[ReportsAbuse] Fetching abuse reports...');
      console.log('[ReportsAbuse] API_URL:', API_URL);
      console.log('[ReportsAbuse] org_id:', authData?.org_id);
      console.log('[ReportsAbuse] page:', page, 'per_page:', perPage);
      
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      if (!accessToken) {
        console.error('[ReportsAbuse] No access token found');
        throw new Error(t('reports_abuse.error_no_token') || 'No access token found. Please log in.');
      }

      const url = new URL(`${API_URL}/api/ratings/abuse-reports`);
      url.searchParams.append('org_id', authData.org_id);
      url.searchParams.append('page', page);
      url.searchParams.append('per_page', perPage);
      
      // Date filters - ensure proper format
      if (filters.dateFrom) {
        // Ensure date is in YYYY-MM-DD format
        const dateFromFormatted = filters.dateFrom.split('T')[0];
        url.searchParams.append('start_date', dateFromFormatted);
        console.log('[ReportsAbuse] Filter - Date From:', dateFromFormatted);
      }
      if (filters.dateTo) {
        // Ensure date is in YYYY-MM-DD format
        const dateToFormatted = filters.dateTo.split('T')[0];
        url.searchParams.append('end_date', dateToFormatted);
        console.log('[ReportsAbuse] Filter - Date To:', dateToFormatted);
      }
      if (filters.branch) {
        url.searchParams.append('location_id', filters.branch);
        console.log('[ReportsAbuse] Filter - Branch:', filters.branch);
      }
      if (filters.rating) {
        url.searchParams.append('rating', filters.rating);
        console.log('[ReportsAbuse] Filter - Rating:', filters.rating);
      }
      
      console.log('[ReportsAbuse] Request URL:', url.toString());
      console.log('[ReportsAbuse] Active Filters:', {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        branch: filters.branch,
        rating: filters.rating
      });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-access-tokens': accessToken,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('[ReportsAbuse] Response status:', response.status);
      console.log('[ReportsAbuse] Response ok:', response.ok);

      if (response.status === 401) {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const { access_token } = await refreshRes.json();
            localStorage.setItem('access_token', access_token);
            // Retry with new token
            const retryUrl = new URL(`${API_URL}/api/ratings/abuse-reports`);
            retryUrl.searchParams.append('org_id', authData.org_id);
            retryUrl.searchParams.append('page', page);
            retryUrl.searchParams.append('per_page', perPage);
            if (filters.dateFrom) {
              const dateFromFormatted = filters.dateFrom.split('T')[0];
              retryUrl.searchParams.append('start_date', dateFromFormatted);
            }
            if (filters.dateTo) {
              const dateToFormatted = filters.dateTo.split('T')[0];
              retryUrl.searchParams.append('end_date', dateToFormatted);
            }
            if (filters.branch) retryUrl.searchParams.append('location_id', filters.branch);
            if (filters.rating) retryUrl.searchParams.append('rating', filters.rating);
            
            const retryResponse = await fetch(retryUrl.toString(), {
              method: 'GET',
              headers: {
                'x-access-tokens': access_token,
                'Content-Type': 'application/json',
              },
            });
            if (!retryResponse.ok) {
              throw new Error(`Failed to fetch abuse reports: ${retryResponse.status}`);
            }
            const retryData = await retryResponse.json();
            setReports(Array.isArray(retryData.data) ? retryData.data : []);
            setTotalPages(retryData.pagination?.total_pages || 1);
            return;
          }
        }
        throw new Error(t('reports_abuse.error_unauthorized') || 'Unauthorized. Please log in again.');
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Failed to fetch abuse reports: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('[ReportsAbuse] Response data:', data);
      console.log('[ReportsAbuse] Reports count:', data.data?.length || 0);
      setReports(Array.isArray(data.data) ? data.data : []);
      setTotalPages(data.pagination?.total_pages || 1);
      console.log('[ReportsAbuse] Successfully loaded reports');
    } catch (err) {
      console.error('[ReportsAbuse] Error fetching abuse reports:', err);
      console.error('[ReportsAbuse] Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
      });
      setError(t('reports_abuse.fetch_error', { message: err.message }) || `Error: ${err.message}`);
      setReports([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    return `${API_URL}${photoPath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.na') || 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return t('common.na') || 'N/A';
    }
  };

  const handleDeleteRating = async (ratingId, event) => {
    // Stop event propagation to prevent opening the modal
    event.stopPropagation();
    
    // Confirm deletion
    if (!window.confirm(t('reports_abuse.confirm_delete') || 'Are you sure you want to delete this rating and its photo? This action cannot be undone.')) {
      return;
    }

    setDeletingId(ratingId);
    try {
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found. Please log in.');
      }

      const response = await fetch(`${API_URL}/api/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: {
          'x-access-tokens': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const { access_token } = await refreshRes.json();
            localStorage.setItem('access_token', access_token);
            // Retry with new token
            const retryResponse = await fetch(`${API_URL}/api/ratings/${ratingId}`, {
              method: 'DELETE',
              headers: {
                'x-access-tokens': access_token,
                'Content-Type': 'application/json',
              },
            });

            if (!retryResponse.ok) {
              const errorData = await retryResponse.json();
              throw new Error(errorData.error || `Failed to delete: ${retryResponse.status}`);
            }
            
            // Close modal if the deleted report was selected
            if (selectedReport && (selectedReport._id === ratingId || selectedReport.rating_id === ratingId)) {
              setSelectedReport(null);
            }
            
            // Refresh the reports list
            await fetchReports();
            return;
          }
        }
        throw new Error(t('reports_abuse.error_unauthorized') || 'Unauthorized. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete: ${response.status}`);
      }

      // Close modal if the deleted report was selected
      if (selectedReport && (selectedReport._id === ratingId || selectedReport.rating_id === ratingId)) {
        setSelectedReport(null);
      }
      
      // Refresh the reports list
      await fetchReports();
    } catch (err) {
      console.error('[ReportsAbuse] Error deleting rating:', err);
      alert(t('reports_abuse.delete_error', { message: err.message }) || `Error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleForceSync = async () => {
    if (!authData?.org_id) {
      setSyncMessage(t('reports_abuse.error_org_id') || 'Error: Organization ID not found');
      return;
    }

    setSyncing(true);
    setSyncMessage('');

    try {
      const accessToken = authData?.access_token || localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found. Please log in.');
      }

      const response = await fetch(`${API_URL}/api/ratings/force-sync`, {
        method: 'POST',
        headers: {
          'x-access-tokens': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          org_id: authData.org_id,
          location_id: syncLocation || undefined,
        }),
      });

      if (response.status === 401) {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const { access_token } = await refreshRes.json();
            localStorage.setItem('access_token', access_token);
            // Retry with new token
            const retryResponse = await fetch(`${API_URL}/api/ratings/force-sync`, {
              method: 'POST',
              headers: {
                'x-access-tokens': access_token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                org_id: authData.org_id,
                location_id: syncLocation || undefined,
              }),
            });

            if (!retryResponse.ok) {
              const errorData = await retryResponse.json();
              throw new Error(errorData.error || `Failed to sync: ${retryResponse.status}`);
            }

            const retryData = await retryResponse.json();
            setSyncMessage(t('reports_abuse.sync_success', { count: retryData.sent }) || `✅ Sync command sent to ${retryData.sent} device(s) successfully!`);
            return;
          }
        }
        throw new Error(t('reports_abuse.error_unauthorized') || 'Unauthorized. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to sync: ${response.status}`);
      }

      const data = await response.json();
      setSyncMessage(t('reports_abuse.sync_success', { count: data.sent }) || `✅ Sync command sent to ${data.sent} device(s) successfully!`);
      
      // Clear message after 5 seconds
      setTimeout(() => setSyncMessage(''), 5000);
    } catch (err) {
      console.error('[ReportsAbuse] Error forcing sync:', err);
      setSyncMessage(t('reports_abuse.sync_error', { message: err.message }) || `❌ Error: ${err.message}`);
      setTimeout(() => setSyncMessage(''), 5000);
    } finally {
      setSyncing(false);
    }
  };

  if (loading && !hasPrivilege) {
    return <LoadingSpinner />;
  }

  if (!hasPrivilege) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 p-6">
            <GlassCard className="p-6">
              <p className="text-red-500">{error}</p>
            </GlassCard>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-[#0b0b12] dark:via-[#1a1a2e] dark:to-[#0b0b12]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-6">
          {/* Glowy gradient backdrop */}
          <div className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute left-1/2 top-[-12rem] -translate-x-1/2 transform">
              <div className="aspect-[1108/632] w-[72rem] bg-gradient-to-tr from-indigo-500/20 via-fuchsia-500/20 to-cyan-400/20 dark:from-[#ff80b5] dark:to-[#9089fc] opacity-30 dark:opacity-20 blur-3xl" />
            </div>
          </div>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <GlassCard className="relative overflow-hidden p-6">
              <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-fuchsia-600/10 dark:bg-fuchsia-600/20 blur-3xl" />
              <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-600/10 dark:bg-indigo-600/20 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                      {t('reports_abuse.title') || 'Reports Abuse'}
                    </h1>
                    <p className="text-gray-600 dark:text-white/70 mt-1">
                      {t('reports_abuse.subtitle') || 'View ratings with captured photos'}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <GlassCard className="p-4 border-red-500/50 dark:border-red-500/50">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Force Sync Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-6"
          >
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className={`h-5 w-5 text-gray-700 dark:text-white/70 ${syncing ? 'animate-spin' : ''}`} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('reports_abuse.force_sync') || 'Force Sync Mobile Devices'}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <MapPin className="h-4 w-4" />
                    {t('reports_abuse.sync_location') || 'Location (Optional)'}
                  </label>
                  <select
                    value={syncLocation}
                    onChange={(e) => setSyncLocation(e.target.value)}
                    disabled={syncing}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-white dark:bg-gray-900">
                      {t('reports_abuse.all_locations') || 'All Locations'}
                    </option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch} className="bg-white dark:bg-gray-900">
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleForceSync}
                    disabled={syncing}
                    className="w-full px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing 
                      ? (t('reports_abuse.syncing') || 'Syncing...')
                      : (t('reports_abuse.sync_now') || 'Sync Now')
                    }
                  </button>
                </div>
                {syncMessage && (
                  <div className="flex items-center">
                    <p className={`text-sm font-medium ${
                      syncMessage.startsWith('✅') 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {syncMessage}
                    </p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-white/50 mt-3">
                {t('reports_abuse.sync_description') || 'This will force all mobile devices to sync offline photos and ratings, then clear offline storage.'}
              </p>
            </GlassCard>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-700 dark:text-white/70" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('reports_abuse.filters') || 'Filters'}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <Calendar className="h-4 w-4" />
                    {t('reports_abuse.date_from') || 'Date From'}
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => {
                      const newDateFrom = e.target.value;
                      setFilters({ ...filters, dateFrom: newDateFrom });
                      setPage(1);
                      setFilterKey(prev => prev + 1);
                      console.log('[ReportsAbuse] Date From changed to:', newDateFrom);
                    }}
                    max={filters.dateTo || undefined}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <Calendar className="h-4 w-4" />
                    {t('reports_abuse.date_to') || 'Date To'}
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => {
                      const newDateTo = e.target.value;
                      setFilters({ ...filters, dateTo: newDateTo });
                      setPage(1);
                      setFilterKey(prev => prev + 1);
                      console.log('[ReportsAbuse] Date To changed to:', newDateTo);
                    }}
                    min={filters.dateFrom || undefined}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <MapPin className="h-4 w-4" />
                    {t('reports_abuse.branch') || 'Branch'}
                  </label>
                  <select
                    value={filters.branch}
                    onChange={(e) => {
                      const newBranch = e.target.value;
                      setFilters({ ...filters, branch: newBranch });
                      setPage(1);
                      setFilterKey(prev => prev + 1);
                      console.log('[ReportsAbuse] Branch changed to:', newBranch);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  >
                    <option value="" className="bg-white dark:bg-gray-900">{t('reports_abuse.all_branches') || 'All Branches'}</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch} className="bg-white dark:bg-gray-900">
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <Star className="h-4 w-4" />
                    {t('reports_abuse.rating') || 'Rating'}
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => {
                      const newRating = e.target.value;
                      setFilters({ ...filters, rating: newRating });
                      setPage(1);
                      setFilterKey(prev => prev + 1);
                      console.log('[ReportsAbuse] Rating changed to:', newRating);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  >
                    <option value="" className="bg-white dark:bg-gray-900">{t('reports_abuse.all_ratings') || 'All Ratings'}</option>
                    <option value="happy" className="bg-white dark:bg-gray-900">{t('reports_abuse.rating_happy') || 'Happy'}</option>
                    <option value="medium" className="bg-white dark:bg-gray-900">{t('reports_abuse.rating_medium') || 'Medium'}</option>
                    <option value="sad" className="bg-white dark:bg-gray-900">{t('reports_abuse.rating_sad') || 'Sad'}</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilters({ dateFrom: '', dateTo: '', branch: '', rating: '' });
                      setPage(1);
                      setFilterKey(prev => prev + 1);
                      console.log('[ReportsAbuse] Filters reset');
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 text-white hover:from-gray-600 hover:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all shadow-lg font-semibold"
                  >
                    {t('reports_abuse.reset') || 'Reset'}
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : reports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <GlassCard className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 dark:text-white/40 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-white/70 text-lg">
                  {t('reports_abuse.no_reports') || 'No abuse reports found'}
                </p>
              </GlassCard>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {reports.map((report, index) => (
                  <motion.div
                    key={report._id || report.rating_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <GlassCard 
                      className="p-5 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group relative"
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-fuchsia-500/5 to-indigo-500/5 pointer-events-none" />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600/20 to-fuchsia-600/20 text-indigo-700 dark:text-white/80">
                                <AlertCircle className="h-4 w-4" />
                              </div>
                              <p className="text-xs font-mono text-gray-600 dark:text-white/60">
                                {t('reports_abuse.id') || 'ID'}: {report.rating_id?.substring(0, 8) || (t('common.na') || 'N/A')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-gray-500 dark:text-white/50" />
                              <p className="text-sm text-gray-700 dark:text-white/70">
                                {report.location_id || (t('common.na') || 'N/A')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <RatingBadge rating={report.rating} />
                            <button
                              onClick={(e) => handleDeleteRating(report._id || report.rating_id, e)}
                              disabled={deletingId === (report._id || report.rating_id)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-20 relative"
                              title={t('reports_abuse.delete') || 'Delete rating'}
                            >
                              <Trash2 className={`h-4 w-4 ${deletingId === (report._id || report.rating_id) ? 'animate-pulse' : ''}`} />
                            </button>
                          </div>
                        </div>
                        {report.photo_path && (
                          <div className="mt-4 relative overflow-hidden rounded-xl">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                            <img
                              src={getPhotoUrl(report.photo_path)}
                              alt={t('reports_abuse.rating_photo') || 'Rating photo'}
                              className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div className="absolute bottom-2 right-2 z-20">
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm">
                                <Camera className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/50">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(report.date_created)}</span>
                          </div>
                          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600/20 to-fuchsia-600/20 text-indigo-700 dark:text-white/80 text-xs font-semibold">
                            {t('reports_abuse.view_details') || 'View Details'}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <GlassCard className="p-5">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {t('common.previous') || 'Previous'}
                      </button>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-white/5 border border-gray-300 dark:border-white/10">
                        <span className="text-gray-900 dark:text-white font-semibold">
                          {t('common.page') || 'Page'} {page}
                        </span>
                        <span className="text-gray-500 dark:text-white/50">/</span>
                        <span className="text-gray-700 dark:text-white/70">{totalPages}</span>
                      </div>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all"
                      >
                        {t('common.next') || 'Next'}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </>
          )}

          {/* Modal for viewing report details */}
          {selectedReport && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedReport(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <GlassCard className="max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto relative">
                  <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-fuchsia-600/10 dark:bg-fuchsia-600/20 blur-3xl" />
                  <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-600/10 dark:bg-indigo-600/20 blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg">
                          <AlertCircle className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {t('reports_abuse.report_details') || 'Report Details'}
                        </h2>
                      </div>
                      <button
                        onClick={() => setSelectedReport(null)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-white transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                          <p className="text-xs text-gray-600 dark:text-white/60 mb-1">{t('reports_abuse.id') || 'ID'}</p>
                          <p className="text-gray-900 dark:text-white font-mono text-sm">{selectedReport.rating_id}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                          <p className="text-xs text-gray-600 dark:text-white/60 mb-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {t('reports_abuse.branch') || 'Branch'}
                          </p>
                          <p className="text-gray-900 dark:text-white">{selectedReport.location_id}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                        <p className="text-xs text-gray-600 dark:text-white/60 mb-2">{t('reports_abuse.rating') || 'Rating'}</p>
                        <RatingBadge rating={selectedReport.rating} />
                      </div>
                      {selectedReport.notes && (
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                          <p className="text-xs text-gray-600 dark:text-white/60 mb-2">{t('reports_abuse.notes') || 'Notes'}</p>
                          <p className="text-gray-900 dark:text-white/90">{selectedReport.notes}</p>
                        </div>
                      )}
                      {selectedReport.photo_path && (
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                          <p className="text-xs text-gray-600 dark:text-white/60 mb-3 flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            {t('reports_abuse.photo') || 'Photo'}
                          </p>
                          <div className="relative overflow-hidden rounded-xl">
                            <img
                              src={getPhotoUrl(selectedReport.photo_path)}
                              alt={t('reports_abuse.rating_photo') || 'Rating photo'}
                              className="w-full rounded-xl shadow-2xl"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                        <p className="text-xs text-gray-600 dark:text-white/60 mb-1 flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {t('reports_abuse.date') || 'Date'}
                        </p>
                        <p className="text-gray-900 dark:text-white">{formatDate(selectedReport.date_created)}</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ReportsAbuse;

