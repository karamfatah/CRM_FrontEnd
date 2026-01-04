import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import { Printer, Trophy, AlertTriangle } from 'lucide-react';
import ratingsService from '../../lib/ratingsService';
import { locationsQaService } from '../../lib/locationsQaService';
import { format, subDays } from 'date-fns';

// Bar Chart Component for percentage cells
const PercentageBar = ({ value, color = 'bg-blue-500', maxValue = 100, showPercentage = true }) => {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  const colorClass = color.includes('green') ? 'bg-green-600' : 
                     color.includes('red') ? 'bg-red-600' : 
                     color.includes('yellow') ? 'bg-yellow-500' : 
                     'bg-blue-500';
  
  const displayValue = showPercentage ? `${Math.round(value)}%` : Math.round(value);
  
  return (
    <>
      {/* Screen version */}
      <div className="flex items-center gap-2 w-full no-print">
        <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
          <div
            className={`h-full ${colorClass} transition-all duration-300 rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-semibold min-w-[35px] text-right">{displayValue}</span>
      </div>
      {/* Print version */}
      <div className="print-bar print-only">
        <div className="print-bar-bg">
          <div 
            className={`print-bar-fill ${colorClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="print-bar-text">{displayValue}</span>
      </div>
    </>
  );
};

const NPSTable = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [ratings, setRatings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [org, setOrg] = useState({});
  const [userName, setUserName] = useState('');
  
  // Date filter state
  const today = useMemo(() => new Date(), []);
  const [dateFrom, setDateFrom] = useState(format(subDays(today, 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(today, 'yyyy-MM-dd'));

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch organization data
  useEffect(() => {
    const fetchOrg = async () => {
      if (!authData?.org_id) return;
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/api/orgs?org_id=${authData.org_id}`, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-tokens': token,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const orgData = Array.isArray(data) && data.length > 0 ? data[0] : data;
          setOrg({
            org_name_en: orgData.org_name_en || '',
            org_name_ar: orgData.org_name_ar || '',
          });
        }
      } catch (e) {
        console.error('Error fetching org:', e);
      }
    };
    fetchOrg();
  }, [authData?.org_id, API_BASE_URL]);

  // Fetch user name
  useEffect(() => {
    const fetchUserName = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        // Try cached profile
        const cachedProfile = localStorage.getItem('profile');
        if (cachedProfile) {
          const profile = JSON.parse(cachedProfile);
          setUserName(profile.name || 'Unknown User');
        }
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/users/profile?user_id=${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-tokens': token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserName(data.name || 'Unknown User');
          // Cache profile
          localStorage.setItem('profile', JSON.stringify({ name: data.name || 'Unknown User' }));
        } else {
          // Try cached profile
          const cachedProfile = localStorage.getItem('profile');
          if (cachedProfile) {
            const profile = JSON.parse(cachedProfile);
            setUserName(profile.name || 'Unknown User');
          }
        }
      } catch (e) {
        console.error('Error fetching user name:', e);
        // Try cached profile
        const cachedProfile = localStorage.getItem('profile');
        if (cachedProfile) {
          const profile = JSON.parse(cachedProfile);
          setUserName(profile.name || 'Unknown User');
        }
      }
    };
    fetchUserName();
  }, [API_BASE_URL]);

  // Fetch locations
  const fetchLocations = useCallback(async () => {
    if (!authData?.org_id) return;
    try {
      const data = await locationsQaService.getLocations(authData.org_id);
      setLocations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching locations:', e);
    }
  }, [authData]);

  // Fetch ratings
  const fetchRatings = useCallback(async () => {
    if (!authData?.access_token || !authData?.org_id) return;
    setLoading(true);
    setErr('');
    try {
      const params = {
        sort: '-date_created',
        start_date: dateFrom,
        end_date: dateTo,
      };
      const res = await ratingsService.fetchAll(authData.org_id, params, 50000, authData.access_token);
      setRatings(res?.data || []);
    } catch (e) {
      setErr(e?.message || 'Failed to load ratings');
    } finally {
      setLoading(false);
    }
  }, [authData, dateFrom, dateTo]);

  useEffect(() => {
    if (!authLoading && authData?.org_id) {
      fetchLocations();
      fetchRatings();
    }
  }, [authLoading, authData, fetchLocations, fetchRatings]);

  // Helper to get location name
  const getLocationName = useCallback((locationId) => {
    if (!locationId) return 'Unknown';
    const location = locations.find(loc => loc.locations_qa_id === locationId);
    return location ? (location.location_en || location.location_ar || locationId) : locationId;
  }, [locations]);

  // Calculate NPS stats per branch
  const branchStats = useMemo(() => {
    const map = new Map();
    
    ratings.forEach(r => {
      const branchId = r.location_id || 'Unknown';
      if (!map.has(branchId)) {
        map.set(branchId, { happy: 0, medium: 0, sad: 0 });
      }
      const stats = map.get(branchId);
      if (r.rating === 'happy') stats.happy++;
      else if (r.rating === 'medium') stats.medium++;
      else if (r.rating === 'sad') stats.sad++;
    });

    const rows = Array.from(map.entries()).map(([branchId, stats]) => {
      const total = stats.happy + stats.medium + stats.sad;
      const happyPct = total > 0 ? (stats.happy / total) * 100 : 0;
      const mediumPct = total > 0 ? (stats.medium / total) * 100 : 0;
      const sadPct = total > 0 ? (stats.sad / total) * 100 : 0;
      const nps = (happyPct - sadPct);
      
      return {
        branchId,
        branchName: getLocationName(branchId),
        total,
        happy: stats.happy,
        happyPct,
        medium: stats.medium,
        mediumPct,
        sad: stats.sad,
        sadPct,
        nps
      };
    }).sort((a, b) => b.nps - a.nps);

    // Calculate totals
    const totals = rows.reduce((acc, row) => {
      acc.total += row.total;
      acc.happy += row.happy;
      acc.medium += row.medium;
      acc.sad += row.sad;
      return acc;
    }, { total: 0, happy: 0, medium: 0, sad: 0 });

    const totalHappyPct = totals.total > 0 ? (totals.happy / totals.total) * 100 : 0;
    const totalMediumPct = totals.total > 0 ? (totals.medium / totals.total) * 100 : 0;
    const totalSadPct = totals.total > 0 ? (totals.sad / totals.total) * 100 : 0;
    const totalNps = totalHappyPct - totalSadPct;

    // Find best and worst branches
    const bestBranch = rows.length > 0 ? rows[0] : null;
    const worstBranch = rows.length > 0 ? rows[rows.length - 1] : null;

    // Find max total rate for bar chart scaling
    const maxTotalRate = rows.length > 0 ? Math.max(...rows.map(r => r.total), totals.total) : totals.total;

    return {
      rows,
      totals: {
        ...totals,
        happyPct: totalHappyPct,
        mediumPct: totalMediumPct,
        sadPct: totalSadPct,
        nps: totalNps
      },
      bestBranch,
      worstBranch,
      maxTotalRate
    };
  }, [ratings, getLocationName]);

  const formatPercent = (value) => {
    return `${Math.round(value)}%`;
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  const orgName = language === 'ar' ? org.org_name_ar : org.org_name_en;
  const exportDateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0.5cm;
          }
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            background: white;
            color: black;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #1e40af;
          }
          .print-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 24px;
            font-weight: 900;
            color: #1e40af;
          }
          .print-logo {
            width: 48px;
            height: 48px;
            object-fit: contain;
          }
          .print-org {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
          }
          .print-table {
            font-size: 10px;
            width: 100%;
            border-collapse: collapse;
          }
          .print-table th {
            background: #1e40af !important;
            color: white !important;
            padding: 6px 8px;
            font-size: 9px;
            font-weight: 700;
            border: 1px solid #1e3a8a;
          }
          .print-table td {
            padding: 5px 8px;
            border: 1px solid #d1d5db;
            font-size: 9px;
          }
          .print-bar {
            display: flex;
            align-items: center;
            gap: 4px;
            width: 100%;
          }
          .print-bar-bg {
            flex: 1;
            height: 12px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
          }
          .print-bar-fill {
            height: 100%;
            border-radius: 4px;
          }
          .print-bar-text {
            font-size: 8px;
            font-weight: 700;
            min-width: 30px;
            text-align: right;
          }
          .print-only {
            display: none !important;
          }
          @media print {
            .no-print {
              display: none !important;
            }
            .print-only {
              display: block !important;
            }
            .print-bar.print-only {
              display: flex !important;
            }
          }
          .print-table tr:nth-child(even) {
            background: #f9fafb;
          }
          .print-footer {
            margin-top: 1rem;
            padding-top: 0.5rem;
            border-top: 1px solid #d1d5db;
            font-size: 11px;
            color: #374151;
            font-weight: 600;
          }
          .print-footer-line {
            margin: 4px 0;
            font-weight: 600;
          }
          .print-footer-copyright {
            text-align: center;
            font-weight: 700;
            color: #1e40af;
            font-size: 12px;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #d1d5db;
          }
        }
      `}</style>

      <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          <main className="flex-1 p-6">
            <div className="max-w-full mx-auto">
              {/* Page Header */}
              <div className="mb-6 no-print">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    NPS Table Report
                  </h1>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <Printer className="w-5 h-5" />
                    Print Report
                  </button>
                </div>
                
                {/* Date Filters */}
                <div className="flex gap-4 items-center mb-4">
                  <div className="flex items-center gap-2">
                    <label className="text-base font-semibold text-gray-700 dark:text-gray-300">
                      From:
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base font-medium shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-base font-semibold text-gray-700 dark:text-gray-300">
                      To:
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base font-medium shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {err && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl no-print">
                  <p className="text-red-800 dark:text-red-200 font-medium">{err}</p>
                </div>
              )}

              {/* Loading Spinner */}
              {loading && <LoadingSpinner />}

              {/* Print Content */}
              {!loading && !err && (
                <div className="print-content">
                  {/* Print Header */}
                  <div className="print-header">
                    <div className="print-title">
                      <img src="/images/logo.png" alt="CRM HUB Manager" className="print-logo" />
                      <span>CRM HUB Manager</span>
                    </div>
                    {orgName && <div className="print-org">{orgName}</div>}
                  </div>

                  {/* Best/Worst Branch Indicators - Screen */}
                  {branchStats.bestBranch && branchStats.worstBranch && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 no-print">
                        {/* Best Branch */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800 shadow-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                              <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Best Branch (NPS)</h3>
                              <p className="text-2xl font-black text-green-600 dark:text-green-400 mt-1">
                                {branchStats.bestBranch.branchName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-green-600 dark:text-green-400">
                              {formatPercent(branchStats.bestBranch.nps)}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ({branchStats.bestBranch.total} ratings)
                            </span>
                          </div>
                        </div>

                        {/* Worst Branch */}
                        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800 shadow-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-md">
                              <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Worst Branch (NPS)</h3>
                              <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
                                {branchStats.worstBranch.branchName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-red-600 dark:text-red-400">
                              {formatPercent(branchStats.worstBranch.nps)}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ({branchStats.worstBranch.total} ratings)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Best/Worst Branch Indicators - Print */}
                      <div className="print-only mb-4">
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', fontSize: '10px' }}>
                          <div style={{ flex: 1, padding: '0.5rem', border: '2px solid #10b981', borderRadius: '4px', background: '#f0fdf4' }}>
                            <strong>Best Branch:</strong> {branchStats.bestBranch.branchName} - {formatPercent(branchStats.bestBranch.nps)} ({branchStats.bestBranch.total} ratings)
                          </div>
                          <div style={{ flex: 1, padding: '0.5rem', border: '2px solid #ef4444', borderRadius: '4px', background: '#fef2f2' }}>
                            <strong>Worst Branch:</strong> {branchStats.worstBranch.branchName} - {formatPercent(branchStats.worstBranch.nps)} ({branchStats.worstBranch.total} ratings)
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* NPS Table */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <div className="overflow-x-auto">
                      <table className="print-table w-full border-collapse">
                        {/* Header */}
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                            <th className="px-6 py-4 text-left text-base font-bold border-r border-blue-500/50">
                              BRANCH
                            </th>
                            <th className="px-6 py-4 text-center text-base font-bold border-r border-blue-500/50">
                              TOTAL RATE
                            </th>
                            <th className="px-6 py-4 text-center text-base font-bold border-r border-blue-500/50" colSpan="2">
                              HAPPY (PROMOTER)
                            </th>
                            <th className="px-6 py-4 text-center text-base font-bold border-r border-blue-500/50" colSpan="2">
                              Medium (PASSIVE)
                            </th>
                            <th className="px-6 py-4 text-center text-base font-bold border-r border-blue-500/50" colSpan="2">
                              SAD (DETRACTORS)
                            </th>
                            <th className="px-6 py-4 text-center text-base font-bold">
                              NPS
                            </th>
                          </tr>
                          <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                            <th className="px-6 py-3 border-r border-blue-400/50"></th>
                            <th className="px-6 py-3 border-r border-blue-400/50"></th>
                            <th className="px-6 py-3 text-center text-sm font-semibold border-r border-blue-400/50">
                              NUM
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold border-r border-blue-400/50">
                              %
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold border-r border-blue-400/50">
                              NUM
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold border-r border-blue-400/50">
                              %
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold border-r border-blue-400/50">
                              NUM
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold border-r border-blue-400/50">
                              %
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold"></th>
                          </tr>
                        </thead>
                        
                        {/* Body */}
                        <tbody>
                          {branchStats.rows.map((row, index) => (
                            <tr
                              key={row.branchId}
                              className={index % 2 === 0 
                                ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50' 
                                : 'bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/70'
                              }
                            >
                              <td className="px-6 py-4 text-base font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                                {row.branchName}
                              </td>
                              <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-600">
                                <PercentageBar 
                                  value={row.total} 
                                  maxValue={branchStats.maxTotalRate || 100}
                                  color="bg-blue-500"
                                  showPercentage={false}
                                />
                              </td>
                              <td className="px-6 py-4 text-base text-center text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 font-medium">
                                {row.happy}
                              </td>
                                  <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-600">
                                <PercentageBar 
                                  value={row.happyPct} 
                                  color={row.happyPct === 100 ? 'bg-green-600' : row.happyPct >= 80 ? 'bg-green-500' : 'bg-green-400'} 
                                />
                              </td>
                              <td className="px-6 py-4 text-base text-center text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 font-medium">
                                {row.medium}
                              </td>
                              <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-600">
                                <PercentageBar 
                                  value={row.mediumPct} 
                                  color="bg-yellow-500" 
                                />
                              </td>
                              <td className="px-6 py-4 text-base text-center text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 font-medium">
                                {row.sad}
                              </td>
                              <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-600">
                                <PercentageBar 
                                  value={row.sadPct} 
                                  color={row.sadPct > 0 ? 'bg-red-600' : 'bg-gray-400'} 
                                />
                              </td>
                                <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-600">
                                <PercentageBar 
                                  value={row.nps} 
                                  maxValue={100}
                                  color={
                                    row.nps >= 40 ? 'bg-green-600' : 
                                    row.nps >= 10 ? 'bg-yellow-500' : 
                                    'bg-red-600'
                                  } 
                                />
                              </td>
                            </tr>
                          ))}
                          
                          {/* Total Row */}
                          <tr className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 font-black border-t-4 border-blue-400 dark:border-blue-600">
                            <td className="px-6 py-4 text-base text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700 font-black">
                              TOTAL
                            </td>
                            <td className="px-6 py-4 border-r border-blue-300 dark:border-blue-700">
                              <PercentageBar 
                                value={branchStats.totals.total} 
                                maxValue={branchStats.maxTotalRate || branchStats.totals.total}
                                color="bg-blue-600"
                                showPercentage={false}
                              />
                            </td>
                            <td className="px-6 py-4 text-base text-center text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700 font-black">
                              {branchStats.totals.happy}
                            </td>
                            <td className="px-6 py-4 border-r border-blue-300 dark:border-blue-700">
                              <PercentageBar 
                                value={branchStats.totals.happyPct} 
                                color="bg-green-600" 
                              />
                            </td>
                            <td className="px-6 py-4 text-base text-center text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700 font-black">
                              {branchStats.totals.medium}
                            </td>
                            <td className="px-6 py-4 border-r border-blue-300 dark:border-blue-700">
                              <PercentageBar 
                                value={branchStats.totals.mediumPct} 
                                color="bg-yellow-500" 
                              />
                            </td>
                            <td className="px-6 py-4 text-base text-center text-gray-900 dark:text-white border-r border-blue-300 dark:border-blue-700 font-black">
                              {branchStats.totals.sad}
                            </td>
                            <td className="px-6 py-4 border-r border-blue-300 dark:border-blue-700">
                              <PercentageBar 
                                value={branchStats.totals.sadPct} 
                                color={branchStats.totals.sadPct > 0 ? 'bg-red-600' : 'bg-gray-400'} 
                              />
                            </td>
                            <td className="px-6 py-4">
                              <PercentageBar 
                                value={branchStats.totals.nps} 
                                maxValue={100}
                                color={
                                  branchStats.totals.nps >= 40 ? 'bg-green-600' : 
                                  branchStats.totals.nps >= 10 ? 'bg-yellow-500' : 
                                  'bg-red-600'
                                } 
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Print Footer */}
                  <div className="print-footer">
                    <div className="print-footer-line">
                      <strong>Report Exported at:</strong> {exportDateTime}
                    </div>
                    <div className="print-footer-line">
                      <strong>Report Prepared by:</strong> {userName || 'Unknown User'}
                    </div>
                    <div className="print-footer-copyright">
                      CRM HUB Manager is a product of Quantum-G App LLC "All Rights Reserved 2025"
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
        
        <ModalSearch />
        <ThemeToggle />
        <LanguageToggle />
      </div>
      </>
    );
  };

export default NPSTable;
