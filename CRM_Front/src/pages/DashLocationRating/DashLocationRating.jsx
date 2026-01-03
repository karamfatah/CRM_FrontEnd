// src/pages/DashLocationRating/DashLocationRating.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import ratingsService from '../../lib/ratingsService';
import { motion } from 'framer-motion';
import { MapPin, AlertCircle, Smile, Frown, Send, CheckCircle, XCircle } from 'lucide-react';

// NovaKit components
import { GlassCard, GradientText, PageHeader } from '../../components/ratings/NovaKitComponents';

import {
  format,
  subDays,
} from 'date-fns';

// ----------------------------------
// Helper functions
// ----------------------------------
const tSafe = (t, key, fallback) => {
  const val = t?.(key);
  return (typeof val === 'string' && !val.includes('{{')) ? val : fallback;
};

const percent = (n, d) => (d ? Math.round((n / d) * 100) : 0);

// ----------------------------------
// MAIN PAGE
// ----------------------------------
const DashLocationRating = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [sendingReport, setSendingReport] = useState(false);
  const [reportMessage, setReportMessage] = useState({ type: '', text: '' });

  // Dataset
  const [ratings, setRatings] = useState([]);

  // Date filters (default: last 30 days)
  const today = useMemo(() => new Date(), []);
  const [dateFrom, setDateFrom] = useState(format(subDays(today, 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(today, 'yyyy-MM-dd'));

  const canView = useMemo(() => {
    const required = [5000, 1, 2001, 1001, 1002, 1003, 1004];
    return (authData?.privilege_ids || []).some(id => required.includes(id));
  }, [authData]);

  const fetchData = useCallback(async () => {
    if (!authData?.access_token) return;
    setLoading(true);
    setErr('');
    try {
      // Use fetchAll to get ALL documents within the date range
      const res = await ratingsService.fetchAll(authData.org_id, {
        sort: '-date_created',
        start_date: dateFrom,
        end_date: dateTo,
      }, 50000, authData.access_token);
      setRatings(res?.data || []);
    } catch (e) {
      setErr(e.message || 'Failed to load ratings');
      setRatings([]);
    } finally {
      setLoading(false);
    }
  }, [authData, dateFrom, dateTo]);

  useEffect(() => { 
    if (!authLoading && canView) fetchData(); 
  }, [authLoading, canView, fetchData]);

  // Send report function
  const handleSendReport = async () => {
    if (!authData?.access_token) {
      setReportMessage({ type: 'error', text: 'No access token found. Please log in.' });
      return;
    }

    setSendingReport(true);
    setReportMessage({ type: '', text: '' });

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_URL}/api/ratings/send-location-rating-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': authData.access_token,
        },
      });

      if (response.status === 401) {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshResponse.ok) {
            const { access_token, refresh_token } = await refreshResponse.json();
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            
            // Retry with new token
            const retryResponse = await fetch(`${API_URL}/api/ratings/send-location-rating-report`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-access-tokens': access_token,
              },
            });

            if (!retryResponse.ok) {
              const errorData = await retryResponse.json().catch(() => ({}));
              throw new Error(errorData.error || 'Failed to send report');
            }

            const retryData = await retryResponse.json();
            setReportMessage({ type: 'success', text: retryData.message || 'Report sent successfully!' });
            return;
          }
        }
        localStorage.clear();
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send report');
      }

      const data = await response.json();
      setReportMessage({ type: 'success', text: data.message || 'Report sent successfully!' });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setReportMessage({ type: '', text: '' });
      }, 5000);
    } catch (error) {
      console.error('Error sending report:', error);
      setReportMessage({ type: 'error', text: error.message || 'Failed to send report. Please try again.' });
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setReportMessage({ type: '', text: '' });
      }, 5000);
    } finally {
      setSendingReport(false);
    }
  };

  // Location × Rating matrix
  const matrix = useMemo(() => {
    const locSet = new Set();
    const ratingsSet = new Set(['happy', 'medium', 'sad']);
    const grid = {};
    
    ratings.forEach(r => {
      const loc = r.location_id || 'Unknown';
      locSet.add(loc);
      if (!grid[loc]) grid[loc] = { happy: 0, medium: 0, sad: 0, total: 0 };
      if (r.rating && ratingsSet.has(r.rating)) {
        grid[loc][r.rating]++;
        grid[loc].total++;
      }
    });
    
    const rows = [...locSet].sort();
    const cols = ['happy', 'medium', 'sad'];
    return { rows, cols, grid };
  }, [ratings]);

  // Top 3 Sad Locations
  const top3Sad = useMemo(() => {
    return Object.entries(matrix.grid)
      .map(([location, data]) => ({
        location,
        sad: data.sad || 0,
        total: data.total || 0,
        sadPct: percent(data.sad, data.total)
      }))
      .filter(item => item.sad > 0)
      .sort((a, b) => b.sad - a.sad)
      .slice(0, 3);
  }, [matrix.grid]);

  // Top 3 Happy Locations
  const top3Happy = useMemo(() => {
    return Object.entries(matrix.grid)
      .map(([location, data]) => ({
        location,
        happy: data.happy || 0,
        total: data.total || 0,
        happyPct: percent(data.happy, data.total)
      }))
      .filter(item => item.happy > 0)
      .sort((a, b) => b.happy - a.happy)
      .slice(0, 3);
  }, [matrix.grid]);

  if (authLoading || loading) return <LoadingSpinner />;

  if (!canView) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="px-6 py-10">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {tSafe(t, 'ratings.no_permission', 'No permission to view ratings')}
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

            {/* Title & actions */}
            <PageHeader
              title={<><GradientText>{tSafe(t, 'location_rating.title', 'Location × Rating Dashboard')}</GradientText></>}
              actions={
                <>
                  <button
                    onClick={handleSendReport}
                    disabled={sendingReport}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-md ${
                      sendingReport
                        ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg'
                    }`}
                    title="Send Location Rating Report via Email"
                  >
                    {sendingReport ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Report</span>
                      </>
                    )}
                  </button>
                  <LanguageToggle />
                  <ThemeToggle />
                </>
              }
            />

            {/* Report sending status message */}
            {reportMessage.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 px-4 py-3 rounded-lg shadow-sm flex items-center gap-2 ${
                  reportMessage.type === 'success'
                    ? 'bg-green-100 border border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                    : 'bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                }`}
              >
                {reportMessage.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <span>{reportMessage.text}</span>
                <button
                  onClick={() => setReportMessage({ type: '', text: '' })}
                  className="ml-auto"
                  aria-label="Dismiss"
                >
                  <svg className="fill-current h-5 w-5" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"/>
                  </svg>
                </button>
              </motion.div>
            )}

            {/* Error */}
            {err && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm relative mb-6"
              >
                <span>{err}</span>
                <button onClick={() => setErr('')} className="absolute top-0 right-0 px-4 py-3" aria-label="Dismiss">
                  <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"/>
                  </svg>
                </button>
              </motion.div>
            )}

            {/* Date Filter - Top of Page */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <GlassCard className="p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      {tSafe(t, 'location_rating.date_range', 'Date Range Filter')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {tSafe(t, 'location_rating.date_from', 'Date From')}
                        </label>
                        <input
                          type="date"
                          value={dateFrom}
                          max={dateTo}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {tSafe(t, 'location_rating.date_to', 'Date To')}
                        </label>
                        <input
                          type="date"
                          value={dateTo}
                          min={dateFrom}
                          max={format(today, 'yyyy-MM-dd')}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setDateFrom(format(subDays(today, 30), 'yyyy-MM-dd'));
                          setDateTo(format(today, 'yyyy-MM-dd'));
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
                      >
                        {tSafe(t, 'location_rating.last_30_days', 'Last 30 Days')}
                      </button>
                      <button
                        onClick={() => {
                          setDateFrom(format(subDays(today, 7), 'yyyy-MM-dd'));
                          setDateTo(format(today, 'yyyy-MM-dd'));
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        {tSafe(t, 'location_rating.last_7_days', 'Last 7 Days')}
                      </button>
                      <button
                        onClick={() => {
                          setDateFrom(format(subDays(today, 90), 'yyyy-MM-dd'));
                          setDateTo(format(today, 'yyyy-MM-dd'));
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        {tSafe(t, 'location_rating.last_90_days', 'Last 90 Days')}
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Top 3 Indicators */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top 3 Sad */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-red-600 text-white shadow-lg">
                      <Frown className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {tSafe(t, 'location_rating.top_3_sad', 'Top 3 Sad Locations')}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{tSafe(t, 'location_rating.sad_desc', 'Locations with most sad ratings')}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {top3Sad.length > 0 ? (
                      top3Sad.map((item, index) => (
                        <motion.div
                          key={item.location}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{item.location}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{item.total} {tSafe(t, 'location_rating.total_ratings', 'total ratings')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{item.sad}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.sadPct}% {tSafe(t, 'location_rating.sad', 'sad')}</p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>{tSafe(t, 'location_rating.no_sad_ratings', 'No sad ratings found')}</p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>

              {/* Top 3 Happy */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 text-white shadow-lg">
                      <Smile className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {tSafe(t, 'location_rating.top_3_happy', 'Top 3 Happy Locations')}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{tSafe(t, 'location_rating.happy_desc', 'Locations with most happy ratings')}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {top3Happy.length > 0 ? (
                      top3Happy.map((item, index) => (
                        <motion.div
                          key={item.location}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{item.location}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{item.total} {tSafe(t, 'location_rating.total_ratings', 'total ratings')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{item.happy}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.happyPct}% {tSafe(t, 'location_rating.happy', 'happy')}</p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>{tSafe(t, 'location_rating.no_happy_ratings', 'No happy ratings found')}</p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* Location × Rating Matrix */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <GlassCard className="p-6 overflow-x-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {tSafe(t, 'location_rating.matrix_title', 'Location × Rating Matrix')}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">
                          {tSafe(t, 'location_rating.location', 'Location')}
                        </th>
                        {matrix.cols.map(c => (
                          <th key={c} className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">
                            <span className="capitalize">{c}</span>
                          </th>
                        ))}
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">
                          {tSafe(t, 'location_rating.total', 'Total')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {matrix.rows.map((rk, idx) => {
                        const rowData = matrix.grid[rk];
                        const total = rowData?.total || 0;
                        return (
                          <motion.tr
                            key={rk}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 + idx * 0.05 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                              {rk}
                            </td>
                            {matrix.cols.map(ck => {
                              const v = rowData?.[ck] || 0;
                              const shade = v === 0
                                ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                                : ck === 'happy'
                                  ? (v < 3 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                                     v < 6 ? 'bg-emerald-200 dark:bg-emerald-800/40 text-emerald-800 dark:text-emerald-200' :
                                     'bg-emerald-300 dark:bg-emerald-700/50 text-emerald-900 dark:text-emerald-100')
                                  : ck === 'medium'
                                    ? (v < 3 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                       v < 6 ? 'bg-amber-200 dark:bg-amber-800/40 text-amber-800 dark:text-amber-200' :
                                       'bg-amber-300 dark:bg-amber-700/50 text-amber-900 dark:text-amber-100')
                                    : (v < 3 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' :
                                       v < 6 ? 'bg-rose-200 dark:bg-rose-800/40 text-rose-800 dark:text-rose-200' :
                                       'bg-rose-300 dark:bg-rose-700/50 text-rose-900 dark:text-rose-100');
                              return (
                                <td
                                  key={ck}
                                  className={`px-6 py-4 text-center font-semibold ${shade} transition-all ${v > 0 ? 'cursor-pointer hover:scale-105' : ''}`}
                                  title={v > 0 ? `${rk} × ${ck}: ${v}` : undefined}
                                >
                                  {v}
                                </td>
                              );
                            })}
                            <td className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800/30">
                              {total}
                            </td>
                          </motion.tr>
                        );
                      })}
                      {matrix.rows.length === 0 && (
                        <tr>
                          <td colSpan={matrix.cols.length + 2} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>{tSafe(t, 'location_rating.no_data', 'No data available for the selected date range')}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashLocationRating;

