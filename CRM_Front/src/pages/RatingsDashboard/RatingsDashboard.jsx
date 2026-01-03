// src/pages/Ratings/RatingsDashboard.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import ratingsService from '../../lib/ratingsService';
import { formatEmployeeDisplay } from '../ReadRatings/RatingsHelpers';

// NovaKit components
import { GlassCard, StatCard, GradientText, FilterSection, ChartContainer, PageHeader, Chip, RatingBadge } from '../../components/ratings/NovaKitComponents';

import {
  format,
  parseISO,
  isValid as isValidDateFns,
  subDays,
  addDays,
} from 'date-fns';

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { AnimatePresence, motion } from 'framer-motion';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// ----------------------------------
// tiny helpers
// ----------------------------------
const tSafe = (t, key, fallback) => {
  const val = t?.(key);
  return (typeof val === 'string' && !val.includes('{{')) ? val : fallback;
};
const safeDate = (v) => {
  if (!v) return null;
  try {
    const d = typeof v === 'string' ? parseISO(v) : new Date(v);
    return isValidDateFns(d) ? d : null;
  } catch { return null; }
};
const chartColor = (cssVar, fallback) => {
  const el = document.documentElement;
  const v = getComputedStyle(el).getPropertyValue(cssVar)?.trim();
  return v || fallback;
};
const normalizeId = (x) => x?._id?.$oid || x?._id || x?.id;
const countBy = (arr, fn) => arr.reduce((m, x) => { const k = fn(x); m[k] = (m[k] || 0) + 1; return m; }, {});
const percent = (n, d) => (d ? Math.round((n / d) * 100) : 0);
const clamp = (n, min, max) => Math.max(min, Math.min(n, max));

// ----------------------------------
// Drilldown with Export + Table
// ----------------------------------
const DrilldownPanel = ({ open, onClose, title, rows }) => {
  const [q, setQ] = useState('');
  const visible = useMemo(() => {
    const query = q.toLowerCase().trim();
    if (!query) return rows;
    return rows.filter(r =>
      [
        r.employee_id,
        r.location_id,
        r.rating,
        r.notes,
        r.notes_phone,
        r.date_created ? new Date(r.date_created).toLocaleString() : ''
      ]
        .map(x => String(x || '')?.toLowerCase())
        .some(s => s.includes(query))
    );
  }, [q, rows]);

  const exportCsv = () => {
    const headers = [
      'employee_id',
      'location_id',
      'rating',
      'notes',
      'notes_phone',
      'date_created',
      '_id'
    ];
    const csv = [
      headers.join(','),
      ...visible.map(r => headers.map(h => {
        const val = (h === 'date_created' && r.date_created)
          ? format(new Date(r.date_created), 'yyyy-MM-dd HH:mm')
          : (r[h] ?? '');
        const v = String(val).replace(/"/g, '""');
        return /[",\n]/.test(v) ? `"${v}"` : v;
      }).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(title || 'export').replace(/[^\w\-]+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: .25 }}
          className="fixed top-0 right-0 h-full w-full sm:w-[48rem] bg-white dark:bg-gray-900 z-50 shadow-2xl border-l border-gray-200 dark:border-gray-700 overflow-y-auto"
        >
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={exportCsv}
                className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                ⬇️ Export CSV
              </button>
              <button onClick={onClose} className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">✕</button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search in results…"
              className="w-full py-2 px-3 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            />

            <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-indigo-50 dark:bg-indigo-900">
                  <tr>
                    {['Employee', 'Location', 'Rating', 'Notes', 'Phone Notes', 'Date'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm text-gray-800 dark:text-gray-100">
                  {visible.map((r, i) => (
                    <tr key={normalizeId(r) || i} className="hover:bg-indigo-50 dark:hover:bg-indigo-900">
                      <td className="px-6 py-3">{formatEmployeeDisplay(r.employee_id)}</td>
                      <td className="px-6 py-3">{r.location_id}</td>
                      <td className="px-6 py-3">
                        <span className={
                          `inline-block px-2 py-1 rounded text-xs font-semibold ` +
                          (r.rating === 'happy' ? 'bg-green-600 text-white' :
                           r.rating === 'medium' ? 'bg-yellow-600 text-white' :
                           r.rating === 'sad' ? 'bg-red-600 text-white' : 'bg-gray-600 text-white')
                        }>
                          {r.rating}
                        </span>
                      </td>
                      <td className="px-6 py-3">{r.notes || '—'}</td>
                      <td className="px-6 py-3">{r.notes_phone || '—'}</td>
                      <td className="px-6 py-3">{r.date_created ? format(new Date(r.date_created), 'PPpp') : '—'}</td>
                    </tr>
                  ))}
                  {visible.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-6 text-center text-gray-500 dark:text-gray-400">—</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

// ----------------------------------
// MAIN PAGE
// ----------------------------------
const RatingsDashboard = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // dataset
  const [ratings, setRatings] = useState([]);

  // filters (server-side)
  const today = useMemo(() => new Date(), []);
  const [dateFrom, setDateFrom] = useState(format(subDays(today, 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(today, 'yyyy-MM-dd'));
  const [ratingFilter, setRatingFilter] = useState(''); // happy|medium|sad|''
  const [locationQ, setLocationQ] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [q, setQ] = useState('');

  // client filters
  const [quick, setQuick] = useState('');
  const [selBranches, setSelBranches] = useState([]);   // multi
  const [selEmployees, setSelEmployees] = useState([]); // multi

  // drilldown panel
  const [drillOpen, setDrillOpen] = useState(false);
  const [drillTitle, setDrillTitle] = useState('');
  const [drillRows, setDrillRows] = useState([]);

  const canView = useMemo(() => {
    const required = [5000, 1, 2001, 1001, 1002, 1003, 1004];
    return (authData?.privilege_ids || []).some(id => required.includes(id));
  }, [authData]);

  const fetchData = useCallback(async () => {
    if (!authData?.access_token) return;
    setLoading(true);
    setErr('');
    try {
      // Use fetchAll to get ALL documents within the date range (handles pagination automatically)
      const res = await ratingsService.fetchAll(authData.org_id, {
        sort: '-date_created',
        start_date: dateFrom,
        end_date: dateTo,
        rating: ratingFilter || undefined,
        location_id: locationQ || undefined,
        employee_id: employeeId || undefined,
        q: q || undefined,
      }, 50000, authData.access_token); // max 50k items, should be enough for most cases
      setRatings(res?.data || []);
    } catch (e) {
      setErr(e.message || 'Failed to load ratings');
      setRatings([]);
    } finally {
      setLoading(false);
    }
  }, [authData, dateFrom, dateTo, ratingFilter, locationQ, employeeId, q]);

  useEffect(() => { if (!authLoading && canView) fetchData(); }, [authLoading, canView, fetchData]);

  // value lists
  const allBranches = useMemo(() => {
    const s = new Set((ratings || []).map(r => r.location_id || 'Unknown'));
    return Array.from(s).sort((a,b)=>a.localeCompare(b));
  }, [ratings]);
  const allEmployees = useMemo(() => {
    const s = new Set((ratings || []).map(r => {
      const empId = r.employee_id;
      // Normalize employee_id: 0, null, undefined, empty string all become "0" (Branch)
      if (empId === null || empId === undefined || empId === '' || empId === 0) {
        return '0';
      }
      return String(empId);
    }));
    return Array.from(s).sort((a, b) => {
      // Sort "0" (Branch) to the end
      if (a === '0') return 1;
      if (b === '0') return -1;
      return Number(a) - Number(b);
    });
  }, [ratings]);

  // client-side refinement (quick, branch, employee)
  const visibleBase = useMemo(() => {
    const s = quick.toLowerCase().trim();
    return (ratings || []).filter(r => {
      if (selBranches.length && !selBranches.includes(r.location_id || 'Unknown')) return false;
      if (selEmployees.length) {
        const empId = r.employee_id;
        const emp = (empId === null || empId === undefined || empId === '' || empId === 0) ? '0' : String(empId);
        if (!selEmployees.includes(emp)) return false;
      }
      if (!s) return true;
      return [
        r.location_id,
        r.rating,
        r.notes,
        r.notes_phone,
        String(r.employee_id),
        r.date_created ? new Date(r.date_created).toLocaleDateString() : ''
      ].filter(Boolean).map(v => String(v).toLowerCase()).some(v => v.includes(s));
    });
  }, [ratings, quick, selBranches, selEmployees]);

  // KPIs
  const totals = useMemo(() => {
    const total = visibleBase.length;
    const happy = visibleBase.filter(r => r.rating === 'happy').length;
    const medium = visibleBase.filter(r => r.rating === 'medium').length;
    const sad = visibleBase.filter(r => r.rating === 'sad').length;
    const happyPct = percent(happy, total);
    const sadPct = percent(sad, total);
    const uniqBranches = new Set(visibleBase.map(r => r.location_id || 'Unknown')).size;
    const uniqEmployees = new Set(visibleBase.map(r => {
      const empId = r.employee_id;
      return (empId === null || empId === undefined || empId === '' || empId === 0) ? '0' : String(empId);
    })).size;

    // busiest day/hour
    const byWeekday = countBy(visibleBase, r => (safeDate(r.date_created)?.getDay() ?? 0)); // 0 Sun..6 Sat
    const busiestDayIdx = Object.entries(byWeekday).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? '—';
    const byHour = countBy(visibleBase, r => safeDate(r.date_created)?.getHours() ?? 0);
    const busiestHour = Object.entries(byHour).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? '—';

    // rolling 7-day window end at dateTo
    const toD = parseISO(dateTo + 'T00:00:00');
    const fromD = subDays(toD, 6);
    const roll = visibleBase.filter(r => {
      const d = safeDate(r.date_created);
      return d && d >= fromD && d <= addDays(toD, 1);
    });
    const rollHappy = roll.filter(r => r.rating === 'happy').length;

    return {
      total, happy, medium, sad, happyPct, sadPct,
      uniqBranches, uniqEmployees,
      busiestDayIdx, busiestHour,
      roll7Total: roll.length,
      roll7Happy: rollHappy,
      npsLike: happy - sad,
    };
  }, [visibleBase, dateTo]);

  const weekdayName = (idx) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][Number(idx) || 0];

  // Top Locations by volume & happy rate
  const topLocations = useMemo(() => {
    const m = {};
    visibleBase.forEach(r => {
      const loc = r.location_id || 'Unknown';
      if (!m[loc]) m[loc] = { total: 0, happy: 0, medium: 0, sad: 0 };
      m[loc].total++;
      if (r.rating === 'happy') m[loc].happy++;
      else if (r.rating === 'medium') m[loc].medium++;
      else if (r.rating === 'sad') m[loc].sad++;
    });
    return Object.entries(m).map(([label, v]) => ({
      label, ...v, happyPct: percent(v.happy, v.total)
    }));
  }, [visibleBase]);

  const topEmployees = useMemo(() => {
    const m = {};
    visibleBase.forEach(r => {
      // Normalize employee_id: 0, null, undefined, empty string all become "0" (Branch)
      const empId = r.employee_id;
      const id = (empId === null || empId === undefined || empId === '' || empId === 0) ? '0' : String(empId);
      if (!m[id]) m[id] = { total: 0, happy: 0, medium: 0, sad: 0 };
      m[id].total++;
      if (r.rating === 'happy') m[id].happy++;
      else if (r.rating === 'medium') m[id].medium++;
      else if (r.rating === 'sad') m[id].sad++;
    });
    return Object.entries(m).map(([id, v]) => ({
      id, ...v, happyPct: percent(v.happy, v.total)
    }));
  }, [visibleBase]);

  // Trend per day (stacked)
  const trend = useMemo(() => {
    const days = {};
    visibleBase.forEach(r => {
      const d = safeDate(r.date_created);
      if (!d) return;
      const key = format(d, 'yyyy-MM-dd');
      if (!days[key]) days[key] = { happy: 0, medium: 0, sad: 0, total: 0 };
      days[key][r.rating] = (days[key][r.rating] || 0) + 1;
      days[key].total++;
    });
    const labels = Object.keys(days).sort();

    // compute happy rate as line
    const happyRate = labels.map(l => {
      const v = days[l];
      return v.total ? Math.round((v.happy / v.total) * 100) : 0;
    });

    return {
      labels,
      datasets: [
        { type: 'bar', label: 'Happy', data: labels.map(l => days[l].happy || 0), backgroundColor: chartColor('--color-green-500', '#10B981'), stack: 'ratings' },
        { type: 'bar', label: 'Medium', data: labels.map(l => days[l].medium || 0), backgroundColor: chartColor('--color-amber-500', '#F59E0B'), stack: 'ratings' },
        { type: 'bar', label: 'Sad', data: labels.map(l => days[l].sad || 0), backgroundColor: chartColor('--color-rose-500', '#F43F5E'), stack: 'ratings' },
        { type: 'line', label: 'Happy Rate %', data: happyRate, yAxisID: 'y1', borderWidth: 2, pointRadius: 3 }
      ]
    };
  }, [visibleBase]);

  // Hour-of-day & Weekday distributions
  const byHour = useMemo(() => {
    const arr = Array.from({ length: 24 }, () => ({ happy: 0, medium: 0, sad: 0, total: 0 }));
    visibleBase.forEach(r => {
      const h = safeDate(r.date_created)?.getHours();
      if (h == null) return;
      arr[h][r.rating] = (arr[h][r.rating] || 0) + 1;
      arr[h].total++;
    });
    return arr.map((v, i) => ({ hour: i, ...v, happyPct: percent(v.happy, v.total) }));
  }, [visibleBase]);

  const byWeekday = useMemo(() => {
    const arr = Array.from({ length: 7 }, (_, i) => ({ day: i, happy: 0, medium: 0, sad: 0, total: 0 }));
    visibleBase.forEach(r => {
      const d = safeDate(r.date_created)?.getDay();
      if (d == null) return;
      arr[d][r.rating] = (arr[d][r.rating] || 0) + 1;
      arr[d].total++;
    });
    return arr.map(v => ({ ...v, happyPct: percent(v.happy, v.total) }));
  }, [visibleBase]);

  // Location × Rating matrix
  const matrix = useMemo(() => {
    const locSet = new Set();
    const ratingsSet = new Set(['happy', 'medium', 'sad']);
    const grid = {};
    visibleBase.forEach(r => {
      const loc = r.location_id || 'Unknown';
      locSet.add(loc);
      if (!grid[loc]) grid[loc] = { happy: 0, medium: 0, sad: 0 };
      if (r.rating && ratingsSet.has(r.rating)) grid[loc][r.rating]++;
    });
    const rows = [...locSet];
    const cols = ['happy', 'medium', 'sad'];
    return { rows, cols, grid };
  }, [visibleBase]);

  // Drilldown helpers
  const openDrill = (title, rows) => { setDrillTitle(title); setDrillRows(rows || []); setDrillOpen(true); };

  // CHART DATA + CLICK HANDLERS
  const topLocByHappyRate = useMemo(() => {
    // only branches with >= 5 total for stability
    const rows = topLocations
      .filter(x => x.total >= 5)
      .sort((a, b) => b.happyPct - a.happyPct)
      .slice(0, 15);
    return {
      labels: rows.map(x => x.label),
      datasets: [{
        label: 'Happy Rate %',
        data: rows.map(x => x.happyPct),
        backgroundColor: chartColor('--color-emerald-500', '#10B981')
      }]
    };
  }, [topLocations]);

  const onTopLocHappyClick = (evt, els) => {
    if (!els?.length) return;
    const label = topLocByHappyRate.labels[els[0].index];
    openDrill(`Branch · ${label}`, visibleBase.filter(r => (r.location_id || 'Unknown') === label));
  };

  const topEmpByHappyRate = useMemo(() => {
    const rows = topEmployees
      .filter(x => x.total >= 5)
      .sort((a, b) => b.happyPct - a.happyPct)
      .slice(0, 15);
    return {
      labels: rows.map(x => `#${x.id}`),
      datasets: [{
        label: 'Happy Rate %',
        data: rows.map(x => x.happyPct),
        backgroundColor: chartColor('--color-sky-500', '#0EA5E9')
      }]
    };
  }, [topEmployees]);

  const onTopEmpHappyClick = (evt, els) => {
    if (!els?.length) return;
    const label = topEmpByHappyRate.labels[els[0].index];
    const id = String(label).slice(1);
    const displayLabel = formatEmployeeDisplay(id);
    openDrill(displayLabel, visibleBase.filter(r => String(r.employee_id || 'Unknown') === id));
  };

  const trendOptions = useMemo(() => ({
    responsive: true,
    onClick: (evt, els) => {
      if (!els?.length) return;
      // For trend we drill by day label
      const idx = els[0].index;
      const day = trend.labels[idx];
      openDrill(`Day · ${day}`, visibleBase.filter(r => format(new Date(r.date_created), 'yyyy-MM-dd') === day));
    },
    plugins: { legend: { position: 'top' } },
    scales: {
      x: { stacked: true },
      y: { beginAtZero: true, stacked: true, title: { display: true, text: 'Count' } },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { callback: (v) => `${v}%` },
        title: { display: true, text: 'Happy Rate %' }
      }
    }
  }), [trend, visibleBase]);

  const hoursChart = useMemo(() => ({
    labels: byHour.map(v => String(v.hour).padStart(2, '0')),
    datasets: [{
      label: 'Total',
      data: byHour.map(v => v.total),
      backgroundColor: chartColor('--color-indigo-500', '#6366F1')
    }]
  }), [byHour]);

  const onHourClick = (evt, els) => {
    if (!els?.length) return;
    const hour = Number(hoursChart.labels[els[0].index]);
    const rows = visibleBase.filter(r => safeDate(r.date_created)?.getHours() === hour);
    openDrill(`Hour · ${String(hour).padStart(2, '0')}:00`, rows);
  };

  const weekdayChart = useMemo(() => ({
    labels: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    datasets: [{
      label: 'Total',
      data: byWeekday.map(v => v.total),
      backgroundColor: chartColor('--color-violet-500', '#8B5CF6')
    }]
  }), [byWeekday]);

  const onWeekdayClick = (evt, els) => {
    if (!els?.length) return;
    const idx = els[0].index;
    const rows = visibleBase.filter(r => (safeDate(r.date_created)?.getDay() ?? 0) === idx);
    openDrill(`Weekday · ${weekdayChart.labels[idx]}`, rows);
  };

  const distributionChart = useMemo(() => {
    const happy = visibleBase.filter(r => r.rating === 'happy').length;
    const medium = visibleBase.filter(r => r.rating === 'medium').length;
    const sad = visibleBase.filter(r => r.rating === 'sad').length;
    return {
      labels: ['Happy','Medium','Sad'],
      datasets: [{
        label: 'Count',
        data: [happy, medium, sad],
        backgroundColor: [
          chartColor('--color-green-500', '#10B981'),
          chartColor('--color-amber-500', '#F59E0B'),
          chartColor('--color-rose-500', '#F43F5E')
        ]
      }]
    };
  }, [visibleBase]);

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
              title={<><GradientText>{tSafe(t, 'ratings.dashboard_title', 'Ratings Dashboard')}</GradientText></>}
              actions={
                <>
                  <LanguageToggle />
                  <ModalSearch onSearch={setQuick} />
                  <ThemeToggle />
                </>
              }
            />

            {/* Error */}
            {err && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm relative mb-6">
                <span>{err}</span>
                <button onClick={() => setErr('')} className="absolute top-0 right-0 px-4 py-3" aria-label="Dismiss">
                  <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20"><path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"/></svg>
                </button>
              </div>
            )}

            {/* Date Filter - Top of Page */}
            <GlassCard className="p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {tSafe(t, 'ratings.date_range', 'Date Range Filter')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {tSafe(t, 'ratings.date_from', 'Date From')}
                      </label>
                      <input
                        type="date"
                        value={dateFrom}
                        max={dateTo}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {tSafe(t, 'ratings.date_to', 'Date To')}
                      </label>
                      <input
                        type="date"
                        value={dateTo}
                        min={dateFrom}
                        max={format(today, 'yyyy-MM-dd')}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setDateFrom(format(subDays(today, 30), 'yyyy-MM-dd'));
                        setDateTo(format(today, 'yyyy-MM-dd'));
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                    >
                      {tSafe(t, 'ratings.last_30_days', 'Last 30 Days')}
                    </button>
                    <button
                      onClick={() => {
                        setDateFrom(format(subDays(today, 7), 'yyyy-MM-dd'));
                        setDateTo(format(today, 'yyyy-MM-dd'));
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium"
                    >
                      {tSafe(t, 'ratings.last_7_days', 'Last 7 Days')}
                    </button>
                    <button
                      onClick={() => {
                        setDateFrom(format(subDays(today, 90), 'yyyy-MM-dd'));
                        setDateTo(format(today, 'yyyy-MM-dd'));
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium"
                    >
                      {tSafe(t, 'ratings.last_90_days', 'Last 90 Days')}
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* KPI Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              <GlassCard className="p-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totals.total}</div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">Happy</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totals.happy}</div>
                <Chip variant="success" className="mt-3">{totals.happyPct}%</Chip>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">Medium</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totals.medium}</div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">Sad</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totals.sad}</div>
                <Chip variant="danger" className="mt-3">{totals.sadPct}%</Chip>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">Unique Branches</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totals.uniqBranches}</div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">Unique Employees</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totals.uniqEmployees}</div>
              </GlassCard>
            </div>

            {/* KPI Row 2 (insights) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <GlassCard className="p-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">Busiest Day</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{weekdayName(totals.busiestDayIdx)}</div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">Busiest Hour</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{`${String(totals.busiestHour).padStart(2, '0')}:00`}</div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">Rolling 7d Total</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totals.roll7Total}</div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="text-sm text-gray-500 dark:text-gray-400">H - S (signal)</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totals.npsLike}</div>
              </GlassCard>
            </div>

            {/* Server Filters */}
            <FilterSection title={tSafe(t, 'ratings.filters', 'Server Filters')}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="">{tSafe(t, 'ratings.all', 'All Ratings')}</option>
                  <option value="happy">Happy</option>
                  <option value="medium">Medium</option>
                  <option value="sad">Sad</option>
                </select>
                <input
                  type="text"
                  value={locationQ}
                  onChange={(e) => setLocationQ(e.target.value)}
                  placeholder={tSafe(t, 'ratings.location_contains', 'Location contains…')}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
                <input
                  type="number"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder={tSafe(t, 'ratings.employee_id', 'Employee ID')}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={tSafe(t, 'ratings.q_search', 'q: location/notes/phone/employee')}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  {tSafe(t, 'ratings.apply', 'Apply')}
                </button>
                <button
                  onClick={() => {
                    setRatingFilter('');
                    setLocationQ('');
                    setEmployeeId('');
                    setQ('');
                    setDateFrom(format(subDays(today, 30), 'yyyy-MM-dd'));
                    setDateTo(format(today, 'yyyy-MM-dd'));
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
                >
                  {tSafe(t, 'ratings.reset', 'Reset')}
                </button>
              </div>
            </FilterSection>

            {/* Client Filters (Branch/Employee multi) */}
            <FilterSection title={tSafe(t, 'ratings.client_filters', 'Client Filters (live)')}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Branches</label>
                  <select
                    multiple
                    value={selBranches}
                    onChange={(e) => setSelBranches(Array.from(e.target.selectedOptions, o => o.value))}
                    className="w-full min-h-[10rem] py-2 px-3 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    {allBranches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hold Ctrl/Cmd to multi-select.</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Employees</label>
                  <select
                    multiple
                    value={selEmployees}
                    onChange={(e) => setSelEmployees(Array.from(e.target.selectedOptions, o => o.value))}
                    className="w-full min-h-[10rem] py-2 px-3 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    {allEmployees.map(eid => <option key={eid} value={eid}>{formatEmployeeDisplay(eid)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Quick Search</label>
                  <input
                    type="text"
                    value={quick}
                    onChange={(e) => setQuick(e.target.value)}
                    placeholder={tSafe(t, 'ratings.quick_search', 'Quick search (client-side)…')}
                    className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>
            </FilterSection>

            {/* Row: Trend with happy rate overlay + Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <ChartContainer title={tSafe(t, 'ratings.trend', 'Ratings Trend (Daily)')} className="lg:col-span-2">
                <div className="h-80">
                  <Bar data={trend} options={trendOptions} />
                </div>
              </ChartContainer>
              <ChartContainer title={tSafe(t, 'ratings.distribution', 'Distribution')}>
                <div className="h-80">
                  <Bar
                    data={distributionChart}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      indexAxis: 'y',
                      scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {tSafe(t, 'ratings.distribution_hint', 'Snapshot of happy/medium/sad in the current filter window.')}
                </p>
              </ChartContainer>
            </div>

            {/* Row: Happy Rate by Branch + Happy Rate by Employee */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartContainer title={tSafe(t, 'ratings.happy_rate_branch', 'Happy Rate by Branch (Top 15 by rate, min 5)')}>
                <div className="h-80">
                  <Bar
                    data={topLocByHappyRate}
                    options={{
                      responsive: true,
                      indexAxis: 'y',
                      onClick: onTopLocHappyClick,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { beginAtZero: true, max: 100, ticks: { callback: v => `${v}%` } }
                      }
                    }}
                  />
                </div>
              </ChartContainer>

              <ChartContainer title={tSafe(t, 'ratings.happy_rate_employee', 'Happy Rate by Employee (Top 15 by rate, min 5)')}>
                <div className="h-80">
                  <Bar
                    data={topEmpByHappyRate}
                    options={{
                      responsive: true,
                      indexAxis: 'y',
                      onClick: onTopEmpHappyClick,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { beginAtZero: true, max: 100, ticks: { callback: v => `${v}%` } }
                      }
                    }}
                  />
                </div>
              </ChartContainer>
            </div>

            {/* Row: Hour of Day + Weekday + Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <ChartContainer title={tSafe(t, 'ratings.by_hour', 'Ratings by Hour of Day')}>
                <div className="h-64">
                  <Bar
                    data={hoursChart}
                    options={{
                      responsive: true,
                      onClick: onHourClick,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { title: { display: true, text: 'Hour' } },
                        y: { beginAtZero: true, ticks: { stepSize: 1 } }
                      }
                    }}
                  />
                </div>
              </ChartContainer>

              <ChartContainer title={tSafe(t, 'ratings.by_weekday', 'Ratings by Weekday')}>
                <div className="h-64">
                  <Bar
                    data={weekdayChart}
                    options={{
                      responsive: true,
                      onClick: onWeekdayClick,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } }
                      }
                    }}
                  />
                </div>
              </ChartContainer>

              <GlassCard className="p-6 overflow-x-auto">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {tSafe(t, 'ratings.location_rating_matrix', 'Location × Rating')}
                </h3>
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="px-4 py-2 text-left">{tSafe(t, 'ratings.location', 'Location')}</th>
                      {matrix.cols.map(c => (
                        <th key={c} className="px-4 py-2 text-left capitalize">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-100">
                    {matrix.rows.map(rk => (
                      <tr key={rk}>
                        <td className="px-4 py-2 font-semibold">{rk}</td>
                        {matrix.cols.map(ck => {
                          const v = matrix.grid[rk]?.[ck] || 0;
                          const shade = v === 0
                            ? 'bg-gray-50 dark:bg-gray-800'
                            : ck === 'happy'
                              ? (v < 3 ? 'bg-green-100 dark:bg-green-900' : v < 6 ? 'bg-green-200 dark:bg-green-800' : 'bg-green-300 dark:bg-green-700')
                              : ck === 'medium'
                                ? (v < 3 ? 'bg-amber-100 dark:bg-amber-900' : v < 6 ? 'bg-amber-200 dark:bg-amber-800' : 'bg-amber-300 dark:bg-amber-700')
                                : (v < 3 ? 'bg-rose-100 dark:bg-rose-900' : v < 6 ? 'bg-rose-200 dark:bg-rose-800' : 'bg-rose-300 dark:bg-rose-700');
                          return (
                            <td
                              key={ck}
                              className={`px-4 py-2 ${v > 0 ? 'cursor-pointer hover:ring-2 hover:ring-indigo-400/60' : ''} ${shade}`}
                              onClick={() => v > 0 && openDrill(`${rk} × ${ck}`, visibleBase.filter(r => (r.location_id || 'Unknown') === rk && r.rating === ck))}
                              title={v > 0 ? `${rk} × ${ck}: ${v}` : undefined}
                            >
                              {v}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {matrix.rows.length === 0 && (
                      <tr><td colSpan={matrix.cols.length + 1} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">—</td></tr>
                    )}
                  </tbody>
                </table>
              </GlassCard>
            </div>

            {/* Tiny footer */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {tSafe(t, 'ratings.data_hint', 'Charts and KPIs reflect server filters + client filters (branch/employee/quick).')}
            </div>
          </div>
        </main>
      </div>

      {/* Drilldown */}
      <DrilldownPanel
        open={drillOpen}
        onClose={() => setDrillOpen(false)}
        title={drillTitle}
        rows={drillRows}
      />
    </div>
  );
};

export default RatingsDashboard;
