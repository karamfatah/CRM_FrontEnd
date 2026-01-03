import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';

// NovaKit components
import { GlassCard, StatCard, GradientText, FilterSection, ChartContainer, PageHeader, Chip, RatingBadge } from '../../components/ratings/NovaKitComponents';

// Icons
import { BuildingOfficeIcon, UserGroupIcon, TrophyIcon, ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Send } from 'lucide-react';

// IMPORTANT: ensure your ratingsService has a default export
import ratingsService from '../../lib/ratingsService';
import { formatEmployeeDisplay, getEmployeeLabel } from '../ReadRatings/RatingsHelpers';

import {
  format,
  parseISO,
  subDays,
  isValid as isValidDateFns
} from 'date-fns';

// Chart.js
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { AnimatePresence, motion } from 'framer-motion';

ChartJS.register(
  ArcElement,
  BarElement, LineElement, PointElement,
  CategoryScale, LinearScale,
  Tooltip, Legend, Filler
);

// ---------- helpers ----------
const chartColor = (cssVar, fallback) => {
  const el = document.documentElement;
  const v = getComputedStyle(el).getPropertyValue(cssVar)?.trim();
  return v || fallback;
};
const tSafe = (t, key, fallback) => {
  const val = t?.(key);
  return (typeof val === 'string' && !val.includes('{{')) ? val : fallback;
};
const safeDate = (v) => {
  try {
    if (!v) return null;
    const d = typeof v === 'string' ? parseISO(v) : new Date(v);
    return isValidDateFns(d) ? d : null;
  } catch { return null; }
};
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const pct = (num, den) => den > 0 ? (num / den) : 0;

// Draw a “needle” on a doughnut to look like a gauge
const NeedlePlugin = {
  id: 'nps-needle',
  afterDraw: (chart, args, opts) => {
    const { ctx, chartArea: { width, height }, data } = chart;
    if (!opts || typeof opts.value !== 'number') return;
    // opts.value ∈ [-100, 100]
    const val = clamp(opts.value, -100, 100);
    // map [-100..100] -> [Math.PI, 2*Math.PI] (half-doughnut gauge)
    const angle = Math.PI + (val + 100) / 200 * Math.PI;

    const meta = chart.getDatasetMeta(0);
    const xC = meta.data[0].x;
    const yC = meta.data[0].y;
    const r = meta.data[0].outerRadius;
    const r2 = (meta.data[0].innerRadius + r) / 2;

    ctx.save();
    ctx.translate(xC, yC);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r * 0.9, 0);
    ctx.lineWidth = 3;
    ctx.strokeStyle = opts.needleColor || '#111827';
    ctx.stroke();

    // hub
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, 2 * Math.PI);
    ctx.fillStyle = opts.hubColor || '#111827';
    ctx.fill();
    ctx.restore();

    // value text
    ctx.save();
    ctx.font = 'bold 14px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu';
    ctx.fillStyle = opts.textColor || '#111827';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(val)} NPS`, xC, yC + r2 * 0.7);
    ctx.restore();
  }
};
ChartJS.register(NeedlePlugin);

// simple badge
const Badge = ({ children, className='' }) => (
  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${className}`}>{children}</span>
);

// ==========================
// MAIN NPS DASHBOARD
// ==========================
const NPSDashboard = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [sendingReport, setSendingReport] = useState(false);
  const [reportMessage, setReportMessage] = useState({ type: '', text: '' });

  // Server filter state
  const today = useMemo(() => new Date(), []);
  const [dateFrom, setDateFrom] = useState(format(subDays(today, 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(today, 'yyyy-MM-dd'));
  const [locContains, setLocContains] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [q, setQ] = useState('');
  const [ratingFilter, setRatingFilter] = useState(''); // 'happy' | 'medium' | 'sad' | ''

  // Client filter state
  const [branchMulti, setBranchMulti] = useState([]);
  const [employeeMulti, setEmployeeMulti] = useState([]);
  const [quickSearch, setQuickSearch] = useState('');

  const [ratings, setRatings] = useState([]); // raw docs from API
  const [samplesGuard, setSamplesGuard] = useState(20); // low-n flag

  // permissions (reuse your existing privileges if any)
  const canView = useMemo(() => true, []);

  // fetch from API - Use fetchAll to get ALL documents within the date range
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
      if (locContains) params.location_id = locContains;
      if (employeeId) params.employee_id = employeeId;
      if (q) params.q = q;
      if (ratingFilter) params.rating = ratingFilter;

      // Use fetchAll to get ALL documents within the date range (handles pagination automatically)
      const res = await ratingsService.fetchAll(authData.org_id, params, 50000, authData.access_token);
      setRatings(res?.data || []);
    } catch (e) {
      setErr(e?.message || 'Failed to load ratings');
    } finally {
      setLoading(false);
    }
  }, [authData, dateFrom, dateTo, locContains, employeeId, q, ratingFilter]);

  useEffect(() => {
    if (!authLoading && canView) fetchRatings();
  }, [authLoading, canView, fetchRatings]);

  // domain helpers
  const groupedByBranch = useMemo(() => {
    const map = new Map();
    ratings.forEach(r => {
      const branch = r.location_id || 'Unknown';
      if (!map.has(branch)) map.set(branch, []);
      map.get(branch).push(r);
    });
    return map;
  }, [ratings]);

  const groupedByEmployee = useMemo(() => {
    const map = new Map();
    ratings.forEach(r => {
      // Normalize employee_id: 0, null, undefined, empty string all become "0" (Branch)
      const empId = r.employee_id;
      const emp = (empId === null || empId === undefined || empId === '' || empId === 0) ? '0' : String(empId);
      if (!map.has(emp)) map.set(emp, []);
      map.get(emp).push(r);
    });
    return map;
  }, [ratings]);

  // client filter application
  const clientFilteredRatings = useMemo(() => {
    let list = ratings;
    if (branchMulti.length) {
      const set = new Set(branchMulti);
      list = list.filter(r => set.has(r.location_id || 'Unknown'));
    }
    if (employeeMulti.length) {
      const set = new Set(employeeMulti);
      list = list.filter(r => {
        const empId = r.employee_id;
        const emp = (empId === null || empId === undefined || empId === '' || empId === 0) ? '0' : String(empId);
        return set.has(emp);
      });
    }
    if (quickSearch.trim()) {
      const q = quickSearch.trim().toLowerCase();
      list = list.filter(r => {
        const h = [
          r.location_id, r.employee_id, r.notes, r.notes_phone, r.rating
        ].filter(Boolean).join(' ').toLowerCase();
        return h.includes(q);
      });
    }
    return list;
  }, [ratings, branchMulti, employeeMulti, quickSearch]);

  // distinct lists for pickers
  const allBranches = useMemo(() => Array.from(new Set(ratings.map(r => r.location_id || 'Unknown'))).sort(), [ratings]);
  const allEmployees = useMemo(() => {
    const employees = Array.from(new Set(ratings.map(r => {
      const empId = r.employee_id;
      // Convert 0, null, undefined to "0" for filtering, but display will show "Branch"
      if (empId === null || empId === undefined || empId === '' || empId === 0) {
        return '0';
      }
      return String(empId);
    }))).sort((a, b) => {
      // Sort "0" (Branch) to the end
      if (a === '0') return 1;
      if (b === '0') return -1;
      return Number(a) - Number(b);
    });
    return employees;
  }, [ratings]);

  // rollup tallies
  const tallies = useMemo(() => {
    const T = { happy: 0, medium: 0, sad: 0, total: 0 };
    clientFilteredRatings.forEach(r => {
      if (r.rating === 'happy') T.happy++;
      else if (r.rating === 'medium') T.medium++;
      else if (r.rating === 'sad') T.sad++;
    });
    T.total = T.happy + T.medium + T.sad;
    return T;
  }, [clientFilteredRatings]);

  // org-level NPS (weighted)
  const orgPctHappy = pct(tallies.happy, tallies.total);
  const orgPctSad = pct(tallies.sad, tallies.total);
  const orgNPS = (orgPctHappy - orgPctSad) * 100; // −100..+100
  const balancedCSAT = tallies.total ? ((tallies.happy - tallies.sad) / tallies.total) * 100 : 0;

  // daily trend (NPS + volume)
  const dailyTrend = useMemo(() => {
    const bucket = new Map();
    clientFilteredRatings.forEach(r => {
      const d = safeDate(r.date_created) || safeDate(r.created_at) || new Date();
      const k = format(d, 'yyyy-MM-dd');
      if (!bucket.has(k)) bucket.set(k, { happy:0, medium:0, sad:0 });
      const o = bucket.get(k);
      if (r.rating === 'happy') o.happy++;
      else if (r.rating === 'medium') o.medium++;
      else if (r.rating === 'sad') o.sad++;
    });
    const dates = Array.from(bucket.keys()).sort();
    const labels = dates;
    const totals = dates.map(k => {
      const o = bucket.get(k);
      return (o.happy + o.medium + o.sad);
    });
    const nps = dates.map(k => {
      const o = bucket.get(k);
      const tot = o.happy + o.medium + o.sad;
      return tot ? ((o.happy / tot) - (o.sad / tot)) * 100 : 0;
    });
    return { labels, totals, nps };
  }, [clientFilteredRatings]);

  // per-branch stats
  const branchStats = useMemo(() => {
    const map = new Map();
    clientFilteredRatings.forEach(r => {
      const b = r.location_id || 'Unknown';
      if (!map.has(b)) map.set(b, { happy:0, medium:0, sad:0 });
      const t = map.get(b);
      t[r.rating] = (t[r.rating] || 0) + 1;
    });
    const rows = Array.from(map.entries()).map(([branch, v]) => {
      const total = v.happy + v.medium + v.sad;
      const ph = pct(v.happy, total), ps = pct(v.sad, total), pm = pct(v.medium, total);
      const nps = (ph - ps) * 100;
      const band = total < samplesGuard
        ? 'low'
        : (nps >= 40 ? 'green' : (nps >= 10 ? 'watch' : 'red'));
      return { branch, ...v, total, nps, ph, pm, ps, band };
    }).sort((a,b) => b.nps - a.nps);
    const weighted = (() => {
      const H = rows.reduce((s,r)=>s+r.happy,0);
      const S = rows.reduce((s,r)=>s+r.sad,0);
      const T = rows.reduce((s,r)=>s+r.total,0);
      return T ? ((H/T)-(S/T))*100 : 0;
    })();
    const simpleAvg = rows.length ? rows.reduce((s,r)=>s+r.nps,0)/rows.length : 0;
    return { rows, weighted, simpleAvg };
  }, [clientFilteredRatings, samplesGuard]);

  // per-employee stats
  const employeeStats = useMemo(() => {
    const map = new Map();
    clientFilteredRatings.forEach(r => {
      // Normalize employee_id: 0, null, undefined, empty string all become "0" (Branch)
      const empId = r.employee_id;
      const emp = (empId === null || empId === undefined || empId === '' || empId === 0) ? '0' : String(empId);
      if (!map.has(emp)) map.set(emp, { happy:0, medium:0, sad:0 });
      map.get(emp)[r.rating] += 1;
    });
    return Array.from(map.entries()).map(([emp, v]) => {
      const tot = v.happy + v.medium + v.sad;
      const nps = tot ? ((v.happy/tot)-(v.sad/tot))*100 : 0;
      return { employee: emp, ...v, total: tot, nps };
    }).sort((a,b)=>b.nps - a.nps).slice(0, 12);
  }, [clientFilteredRatings]);

  // channel heuristic (store/phone/whatsapp/web)
  const channelStats = useMemo(() => {
    const map = { Store:{happy:0,medium:0,sad:0}, Phone:{happy:0,medium:0,sad:0}, WhatsApp:{happy:0,medium:0,sad:0}, Web:{happy:0,medium:0,sad:0} };
    clientFilteredRatings.forEach(r => {
      const notes = (r.notes || '').toLowerCase();
      let ch = 'Store';
      if (r.notes_phone) ch = 'Phone';
      else if (notes.includes('whatsapp')) ch = 'WhatsApp';
      else if (notes.includes('web') || notes.includes('online')) ch = 'Web';
      map[ch][r.rating] += 1;
    });
    const roll = Object.entries(map).map(([k,v])=>{
      const tot = v.happy+v.medium+v.sad;
      const nps = tot ? ((v.happy/tot)-(v.sad/tot))*100 : 0;
      return { channel:k, ...v, total:tot, nps };
    });
    return { map, rows: roll };
  }, [clientFilteredRatings]);

  // ---------- CHART DATA ----------

  // Org Gauges
  const gaugeBg = [
    chartColor('--color-rose-500', '#F43F5E'),
    chartColor('--color-amber-500', '#F59E0B'),
    chartColor('--color-green-500', '#10B981')
  ];

  const gaugeData = {
    labels: ['Detractors', 'Passives', 'Promoters'],
    datasets: [{
      data: [50, 60, 50], // just to create colored segments for gauge arc
      backgroundColor: [
        gaugeBg[0] + 'B3', // 70% alpha
        gaugeBg[1] + 'B3',
        gaugeBg[2] + 'B3'
      ],
      borderWidth: 0,
      circumference: 180,
      rotation: 180,
      cutout: '70%'
    }]
  };
  const gaugeOptions = (value, theme='light') => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      'nps-needle': {
        value,
        needleColor: theme === 'dark' ? '#E5E7EB' : '#111827',
        hubColor: theme === 'dark' ? '#E5E7EB' : '#111827',
        textColor: theme === 'dark' ? '#E5E7EB' : '#111827'
      }
    }
  });

  // Distribution Doughnut
  const distData = {
    labels: ['Happy', 'Medium', 'Sad'],
    datasets: [{
      data: [tallies.happy, tallies.medium, tallies.sad],
      backgroundColor: [
        chartColor('--color-green-500', '#10B981'),
        chartColor('--color-sky-500', '#0EA5E9'),
        chartColor('--color-rose-500', '#F43F5E')
      ],
      borderColor: [
        chartColor('--color-green-700', '#047857'),
        chartColor('--color-sky-700', '#0369A1'),
        chartColor('--color-rose-700', '#BE123C')
      ],
      borderWidth: 1
    }]
  };

  // Daily trend (mixed feel: bar totals + line NPS)
  const trendData = {
    labels: dailyTrend.labels,
    datasets: [
      {
        type: 'bar',
        label: tSafe(t,'ratings.count_happy','Happy') + '/' + tSafe(t,'ratings.count_medium','Medium') + '/' + tSafe(t,'ratings.count_sad','Sad') + ' total',
        data: dailyTrend.totals,
        backgroundColor: chartColor('--color-indigo-400','#818CF8'),
        borderWidth: 0,
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: 'NPS',
        data: dailyTrend.nps,
        borderColor: chartColor('--color-emerald-500','#10B981'),
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.25,
        yAxisID: 'y1'
      }
    ]
  };
  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top' }
    },
    scales: {
      y: { beginAtZero: true, stacked: false, title: { display: true, text: 'Total' } },
      y1: { beginAtZero: true, position: 'right', title: { display: true, text: 'NPS' }, suggestedMin: -100, suggestedMax: 100, grid: { drawOnChartArea: false } }
    }
  };

  // Per-branch bar
  const branchBar = useMemo(() => {
    const labels = branchStats.rows.map(r=>r.branch);
    const data = branchStats.rows.map(r=>r.nps);
    const colors = branchStats.rows.map(r => r.band==='green'
      ? chartColor('--color-green-500','#10B981')
      : r.band==='watch'
        ? chartColor('--color-amber-500','#F59E0B')
        : r.band==='low'
          ? chartColor('--color-sky-400','#60A5FA')
          : chartColor('--color-rose-500','#F43F5E')
    );
    return {
      labels,
      datasets: [{
        label: tSafe(t,'ratings.branch_nps','Branch NPS'),
        data,
        backgroundColor: colors,
        borderWidth: 0
      }]
    };
  }, [branchStats, t]);

  // Employee leaderboard doughnut grid (top 4 by volume)
  const employeeTop4 = useMemo(() => {
    const byVol = employeeStats.slice().sort((a,b)=>b.total-a.total).slice(0,4);
    return byVol.map(e => ({
      title: formatEmployeeDisplay(e.employee),
      data: {
        labels: ['Happy','Medium','Sad'],
        datasets: [{
          data: [e.happy, e.medium, e.sad],
          backgroundColor: [
            chartColor('--color-green-500','#10B981'),
            chartColor('--color-sky-500','#0EA5E9'),
            chartColor('--color-rose-500','#F43F5E')
          ],
          borderWidth: 0
        }]
      },
      nps: Math.round(e.nps),
      n: e.total
    }));
  }, [employeeStats, t]);

  // Channel doughnuts
  const channelDoughnuts = useMemo(() => {
    return channelStats.rows.map(row => ({
      title: `${row.channel} · NPS ${Math.round(row.nps)}`,
      n: row.total,
      data: {
        labels: ['Happy','Medium','Sad'],
        datasets: [{
          data: [row.happy, row.medium, row.sad],
          backgroundColor: [
            chartColor('--color-green-500','#10B981'),
            chartColor('--color-sky-500','#0EA5E9'),
            chartColor('--color-rose-500','#F43F5E')
          ],
          borderWidth: 0
        }]
      }
    }));
  }, [channelStats]);

  // Drilldown
  const [drillOpen, setDrillOpen] = useState(false);
  const [drillTitle, setDrillTitle] = useState('');
  const [drillRows, setDrillRows] = useState([]);

  const openDrillForBranch = (branch) => {
    const rows = clientFilteredRatings.filter(r => (r.location_id||'Unknown') === branch);
    setDrillRows(rows);
    setDrillTitle(`${tSafe(t,'ratings.table.branch','Branch')}: ${branch}`);
    setDrillOpen(true);
  };
  const openDrillForEmployee = (emp) => {
    // Normalize the employee ID for filtering
    const empNormalized = (emp === null || emp === undefined || emp === '' || emp === '0' || Number(emp) === 0) ? '0' : String(emp);
    const rows = clientFilteredRatings.filter(r => {
      const empId = r.employee_id;
      const rEmp = (empId === null || empId === undefined || empId === '' || empId === 0) ? '0' : String(empId);
      return rEmp === empNormalized;
    });
    setDrillRows(rows);
    setDrillTitle(formatEmployeeDisplay(emp));
    setDrillOpen(true);
  };

  // theme detection for needle color
  const prefersDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

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
      const response = await fetch(`${API_URL}/api/ratings/send-nps-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': authData.access_token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setReportMessage({ 
          type: 'success', 
          text: data.message || 'PDF generation and email sending initiated. The report will be sent shortly.' 
        });
        setTimeout(() => setReportMessage({ type: '', text: '' }), 5000);
      } else {
        setReportMessage({ type: 'error', text: data.error || 'Failed to send report' });
      }
    } catch (error) {
      console.error('Error sending report:', error);
      setReportMessage({ type: 'error', text: error.message || 'Failed to send report' });
    } finally {
      setSendingReport(false);
    }
  };

  // UI
  if (authLoading || loading) return <LoadingSpinner />;

  if (!canView) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="px-6 py-10">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {tSafe(t,'ratings.no_permission','No permission to view ratings')}
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
        <main className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
          {/* Gradient background effect */}
          <div className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute left-1/2 top-[-12rem] -translate-x-1/2 transform">
              <div className="aspect-[1108/632] w-[72rem] bg-gradient-to-tr from-indigo-500/20 via-fuchsia-500/20 to-cyan-400/20 opacity-30 blur-3xl" />
            </div>
          </div>

          {/* Top bar */}
          <PageHeader
            title={<><GradientText>{tSafe(t,'ratings.nps_dashboard','Ratings NPS Dashboard')}</GradientText></>}
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
                  title="Send NPS Dashboard Report via Email"
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
                      <span>{tSafe(t, 'location_rating.send_report', 'Send Report')}</span>
                    </>
                  )}
                </button>
                <LanguageToggle />
                <ModalSearch onSearch={setQuickSearch} />
                <ThemeToggle />
              </>
            }
          />

          {/* info / error */}
          {err && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm relative mb-6" role="alert"
            >
              <span>{tSafe(t,'ratings.errors.load_failed','Failed to load ratings')}: {err}</span>
              <button onClick={() => setErr('')} className="absolute top-0 right-0 px-4 py-3" aria-label={tSafe(t,'ratings.errors.dismiss','Dismiss')}>
                <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20"><path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"/></svg>
              </button>
            </motion.div>
          )}

          {/* Report message */}
          {reportMessage.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${
                reportMessage.type === 'success'
                  ? 'bg-green-100 border border-green-400 text-green-700'
                  : 'bg-red-100 border border-red-400 text-red-700'
              } px-4 py-3 rounded-lg shadow-sm relative mb-6`}
              role="alert"
            >
              <span>{reportMessage.text}</span>
              <button
                onClick={() => setReportMessage({ type: '', text: '' })}
                className="absolute top-0 right-0 px-4 py-3"
                aria-label="Dismiss"
              >
                <svg className="fill-current h-6 w-6" viewBox="0 0 20 20">
                  <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
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
                    <MapPinIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
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
                        className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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
                      {tSafe(t, 'ratings.last_30_days', 'Last 30 Days')}
                    </button>
                    <button
                      onClick={() => {
                        setDateFrom(format(subDays(today, 7), 'yyyy-MM-dd'));
                        setDateTo(format(today, 'yyyy-MM-dd'));
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      {tSafe(t, 'ratings.last_7_days', 'Last 7 Days')}
                    </button>
                    <button
                      onClick={() => {
                        setDateFrom(format(subDays(today, 90), 'yyyy-MM-dd'));
                        setDateTo(format(today, 'yyyy-MM-dd'));
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      {tSafe(t, 'ratings.last_90_days', 'Last 90 Days')}
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Server Filters */}
          <FilterSection title={tSafe(t,'ratings.server_filters','Server Filters')}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                value={locContains}
                onChange={(e)=>setLocContains(e.target.value)}
                placeholder={tSafe(t,'ratings.location_contains','Location contains…')}
                className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
              <input
                value={employeeId}
                onChange={(e)=>setEmployeeId(e.target.value)}
                placeholder={tSafe(t,'ratings.employee_id','Employee ID')}
                className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
              <select
                value={ratingFilter}
                onChange={(e)=>setRatingFilter(e.target.value)}
                className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="">{tSafe(t,'ratings.all_ratings','All Ratings')}</option>
                <option value="happy">happy</option>
                <option value="medium">medium</option>
                <option value="sad">sad</option>
              </select>
              <input
                value={q}
                onChange={(e)=>setQ(e.target.value)}
                placeholder={tSafe(t,'ratings.q_placeholder','q: location/notes/phone/employee')}
                className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={fetchRatings}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {tSafe(t,'ratings.apply','Apply')}
              </button>
              <button
                onClick={() => { 
                  setLocContains(''); 
                  setEmployeeId(''); 
                  setQ(''); 
                  setRatingFilter('');
                  setDateFrom(format(subDays(today, 30), 'yyyy-MM-dd'));
                  setDateTo(format(today, 'yyyy-MM-dd'));
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
              >
                {tSafe(t,'ratings.reset','Reset')}
              </button>
            </div>
          </FilterSection>

          {/* Client Filters */}
          <FilterSection title={tSafe(t,'ratings.client_filters','Client Filters')}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs mb-1 text-gray-500 dark:text-gray-400">{tSafe(t,'ratings.branches','Branches')}</label>
                <select
                  multiple
                  value={branchMulti}
                  onChange={(e)=> setBranchMulti(Array.from(e.target.selectedOptions, o=>o.value))}
                  className="w-full min-h-[9rem] py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  {allBranches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{tSafe(t,'ratings.multi_hint','Hold Ctrl/Cmd to select multiple.')}</div>
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-500 dark:text-gray-400">{tSafe(t,'ratings.employees','Employees')}</label>
                <select
                  multiple
                  value={employeeMulti}
                  onChange={(e)=> setEmployeeMulti(Array.from(e.target.selectedOptions, o=>o.value))}
                  className="w-full min-h-[9rem] py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  {allEmployees.map(e => <option key={e} value={e}>{formatEmployeeDisplay(e)}</option>)}
                </select>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{tSafe(t,'ratings.multi_hint','Hold Ctrl/Cmd to select multiple.')}</div>
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-500 dark:text-gray-400">{tSafe(t,'ratings.quick_search','Quick Search')}</label>
                <input
                  value={quickSearch}
                  onChange={(e)=>setQuickSearch(e.target.value)}
                  placeholder={tSafe(t,'ratings.quick_search','Quick Search')}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-500 dark:text-gray-400">Sample Guard (n)</label>
                <input
                  type="number"
                  value={samplesGuard}
                  onChange={(e)=> setSamplesGuard(parseInt(e.target.value || '0', 10))}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  {tSafe(t,'ratings.guardrail_hint','Guardrail: sample size < {{n}} = low confidence').replace('{{n}}', samplesGuard)}
                </div>
              </div>
            </div>
          </FilterSection>

          {/* KPI Counters + Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">{tSafe(t,'ratings.sample_n','n={{n}}').replace('{{n}}', tallies.total)}</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{tallies.total}</div>
              <Chip variant="default" className="mt-3">Total Responses</Chip>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">Happy / Medium / Sad</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {tallies.happy} / {tallies.medium} / {tallies.sad}
              </div>
              <Chip variant="success" className="mt-3">{Math.round(orgPctHappy*100)}% Happy</Chip>
            </GlassCard>

            <GlassCard className="p-0">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{tSafe(t,'ratings.org_nps_weighted','Org NPS (weighted)')}</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{Math.round(orgNPS)}</div>
                </div>
                <Badge className={`ml-2 ${orgNPS>=40?'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100':orgNPS>=10?'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-100':'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-100'}`}>
                  {orgNPS>=40 ? tSafe(t,'ratings.band_green','Green') : orgNPS>=10 ? tSafe(t,'ratings.band_watch','Watch') : tSafe(t,'ratings.band_red','Red')}
                </Badge>
              </div>
              <div className="h-36 px-3 pb-3">
                <Doughnut data={gaugeData} options={gaugeOptions(orgNPS, prefersDark ? 'dark' : 'light')} />
              </div>
            </GlassCard>

            <GlassCard className="p-0">
              <div className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Balanced CSAT (0–100)</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{Math.round((balancedCSAT+100)/2)}</div>
              </div>
              <div className="h-36 px-3 pb-3">
                <Doughnut
                  data={{
                    labels:['Score','Gap'],
                    datasets:[{
                      data:[Math.max(0, (balancedCSAT+100)/2), Math.max(0, 100 - (balancedCSAT+100)/2)],
                      backgroundColor:[chartColor('--color-emerald-500','#10B981'), chartColor('--color-gray-300','#D1D5DB')],
                      borderWidth:0,
                      circumference: 180,
                      rotation: 180,
                      cutout: '70%'
                    }]
                  }}
                  options={{
                    responsive:true,
                    maintainAspectRatio:false,
                    plugins:{ legend:{ display:false } }
                  }}
                />
              </div>
            </GlassCard>
          </div>

          {/* Row: Distribution + Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <ChartContainer title={tSafe(t,'ratings.daily_trend_title','Daily NPS proxy (bar = total, line = NPS)')}>
              <div className="h-64">
                <Line data={trendData} options={trendOptions} />
              </div>
            </ChartContainer>

            <ChartContainer title={tSafe(t,'ratings.channel_nps','Channel NPS (proxy)')}>
              <div className="grid grid-cols-2 gap-4">
                {channelDoughnuts.map((c, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-full h-40">
                      <Doughnut data={c.data} options={{ plugins:{legend:{display:false}}, maintainAspectRatio:false, responsive:true }} />
                    </div>
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">{c.title} · n={c.n}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{tSafe(t,'ratings.channel_heuristic_hint','Channel detection is heuristic (Phone if notes_phone present, WhatsApp/Web if notes mention them, else Store).')}</div>
            </ChartContainer>

            <ChartContainer title={tSafe(t,'ratings.branch_nps','Branch NPS')}>
              <div className="h-64">
                <Bar
                  data={branchBar}
                  options={{
                    responsive:true,
                    maintainAspectRatio:false,
                    onClick: (evt, elems) => {
                      if (!elems?.length) return;
                      const idx = elems[0].index;
                      const branch = branchBar.labels[idx];
                      openDrillForBranch(branch);
                    },
                    scales:{ y:{ suggestedMin:-100, suggestedMax:100 } },
                    plugins:{ legend:{ display:false } }
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {tSafe(t,'ratings.simple_avg_hint','Also showing simple average of branch NPS (equal weight): {{value}} — for reference only. Weighted is recommended.').replace('{{value}}', Math.round(branchStats.simpleAvg*10)/10)}
              </div>
            </ChartContainer>
          </div>

          {/* NPS by Branch - Enhanced Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg">
                <BuildingOfficeIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  <GradientText>{tSafe(t,'ratings.nps_by_branch','NPS by Branch')}</GradientText>
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {tSafe(t,'ratings.branch_nps_desc','Performance metrics across all branches')}
                </p>
              </div>
            </div>

            {/* Top Branches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {branchStats.rows.slice(0, 8).map((branch, idx) => (
                <motion.div
                  key={branch.branch}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <GlassCard 
                    className="p-5 cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => openDrillForBranch(branch.branch)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BuildingOfficeIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {branch.branch}
                        </h3>
                      </div>
                      {idx < 3 && (
                        <TrophyIcon className={`h-5 w-5 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {Math.round(branch.nps)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">NPS</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {branch.nps >= 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-rose-500" />
                        )}
                        <span className={`text-xs font-medium ${branch.nps >= 40 ? 'text-emerald-500' : branch.nps >= 10 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {branch.band === 'green' ? tSafe(t,'ratings.band_green','Excellent') : 
                           branch.band === 'watch' ? tSafe(t,'ratings.band_watch','Good') : 
                           branch.band === 'low' ? tSafe(t,'ratings.band_low','Low Sample') : 
                           tSafe(t,'ratings.band_red','Needs Improvement')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                        <div className="font-semibold text-emerald-700 dark:text-emerald-300">{branch.happy}</div>
                        <div className="text-emerald-600 dark:text-emerald-400">{tSafe(t,'ratings.count_happy','Happy')}</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                        <div className="font-semibold text-amber-700 dark:text-amber-300">{branch.medium}</div>
                        <div className="text-amber-600 dark:text-amber-400">{tSafe(t,'ratings.count_medium','Medium')}</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20">
                        <div className="font-semibold text-rose-700 dark:text-rose-300">{branch.sad}</div>
                        <div className="text-rose-600 dark:text-rose-400">{tSafe(t,'ratings.count_sad','Sad')}</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">{tSafe(t,'ratings.total_responses','Total')}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{branch.total}</span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* All Branches Table */}
            {branchStats.rows.length > 8 && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {tSafe(t,'ratings.all_branches','All Branches')}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gradient-to-r from-indigo-50 to-fuchsia-50 dark:from-indigo-900/30 dark:to-fuchsia-900/30">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {tSafe(t,'ratings.table.branch','Branch')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {tSafe(t,'ratings.table.nps_proxy','NPS')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {tSafe(t,'ratings.table.happy','Happy')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {tSafe(t,'ratings.table.medium','Medium')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {tSafe(t,'ratings.table.sad','Sad')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {tSafe(t,'ratings.table.total','Total')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {tSafe(t,'ratings.table.status','Status')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {branchStats.rows.slice(8).map((branch) => (
                        <tr
                          key={branch.branch}
                          className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 cursor-pointer transition-colors"
                          onClick={() => openDrillForBranch(branch.branch)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <BuildingOfficeIcon className="h-4 w-4 text-indigo-500" />
                              <span className="font-medium text-gray-900 dark:text-white">{branch.branch}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${branch.nps >= 40 ? 'text-emerald-600' : branch.nps >= 10 ? 'text-amber-600' : 'text-rose-600'}`}>
                                {Math.round(branch.nps)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-emerald-700 dark:text-emerald-300 font-medium">{branch.happy}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-amber-700 dark:text-amber-300 font-medium">{branch.medium}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-rose-700 dark:text-rose-300 font-medium">{branch.sad}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-900 dark:text-white font-medium">{branch.total}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Chip 
                              variant={branch.band === 'green' ? 'success' : branch.band === 'watch' ? 'warning' : 'danger'}
                            >
                              {branch.band === 'green' ? tSafe(t,'ratings.band_green','Excellent') : 
                               branch.band === 'watch' ? tSafe(t,'ratings.band_watch','Good') : 
                               branch.band === 'low' ? tSafe(t,'ratings.band_low','Low Sample') : 
                               tSafe(t,'ratings.band_red','Needs Improvement')}
                            </Chip>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </div>

          {/* NPS by Employees - Enhanced Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-fuchsia-600 text-white shadow-lg">
                <UserGroupIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  <GradientText>{tSafe(t,'ratings.nps_by_employees','NPS by Employees')}</GradientText>
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {tSafe(t,'ratings.employee_nps_desc','Individual employee performance metrics')}
                </p>
              </div>
            </div>

            {/* Top Employees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {employeeStats.slice(0, 8).map((emp, idx) => (
                <motion.div
                  key={emp.employee}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <GlassCard 
                    className="p-5 cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => openDrillForEmployee(emp.employee)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {formatEmployeeDisplay(emp.employee)}
                        </h3>
                      </div>
                      {idx < 3 && (
                        <TrophyIcon className={`h-5 w-5 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {Math.round(emp.nps)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">NPS</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {emp.nps >= 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-rose-500" />
                        )}
                        <span className={`text-xs font-medium ${emp.nps >= 40 ? 'text-emerald-500' : emp.nps >= 10 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {emp.nps >= 40 ? tSafe(t,'ratings.band_green','Excellent') : 
                           emp.nps >= 10 ? tSafe(t,'ratings.band_watch','Good') : 
                           tSafe(t,'ratings.band_red','Needs Improvement')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                        <div className="font-semibold text-emerald-700 dark:text-emerald-300">{emp.happy}</div>
                        <div className="text-emerald-600 dark:text-emerald-400">{tSafe(t,'ratings.count_happy','Happy')}</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                        <div className="font-semibold text-amber-700 dark:text-amber-300">{emp.medium}</div>
                        <div className="text-amber-600 dark:text-amber-400">{tSafe(t,'ratings.count_medium','Medium')}</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20">
                        <div className="font-semibold text-rose-700 dark:text-rose-300">{emp.sad}</div>
                        <div className="text-rose-600 dark:text-rose-400">{tSafe(t,'ratings.count_sad','Sad')}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">{tSafe(t,'ratings.total_responses','Total')}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{emp.total}</span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* Top 4 Employees with Mini Charts */}
            {employeeTop4.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {tSafe(t,'ratings.top_performers','Top Performers by Volume')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {employeeTop4.map((e, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                    >
                      <GlassCard 
                        className="p-4 cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={() => {
                          // Extract employee ID from title (formatEmployeeDisplay returns "Branch" or "Employee #ID")
                          const empId = e.title === 'Branch' ? '0' : e.title.replace('Employee #', '');
                          openDrillForEmployee(empId);
                        }}
                      >
                        <div className="h-32 mb-3">
                          <Doughnut data={e.data} options={{ plugins:{legend:{display:false}}, responsive:true, maintainAspectRatio:false }} />
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{e.title}</div>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{e.nps}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">NPS</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">n={e.n}</div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* All Employees Table */}
            {employeeStats.length > 8 && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {tSafe(t,'ratings.all_employees','All Employees')}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gradient-to-r from-cyan-50 to-fuchsia-50 dark:from-cyan-900/30 dark:to-fuchsia-900/30">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {tSafe(t,'ratings.table.employee','Employee')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {tSafe(t,'ratings.table.nps_proxy','NPS')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {tSafe(t,'ratings.table.happy','Happy')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {tSafe(t,'ratings.table.medium','Medium')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {tSafe(t,'ratings.table.sad','Sad')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {tSafe(t,'ratings.table.total','Total')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {employeeStats.slice(8).map((emp) => (
                        <tr
                          key={emp.employee}
                          className="hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 cursor-pointer transition-colors"
                          onClick={() => openDrillForEmployee(emp.employee)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <UserGroupIcon className="h-4 w-4 text-cyan-500" />
                              <span className="font-medium text-gray-900 dark:text-white">{formatEmployeeDisplay(emp.employee)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${emp.nps >= 40 ? 'text-emerald-600' : emp.nps >= 10 ? 'text-amber-600' : 'text-rose-600'}`}>
                                {Math.round(emp.nps)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-emerald-700 dark:text-emerald-300 font-medium">{emp.happy}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-amber-700 dark:text-amber-300 font-medium">{emp.medium}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-rose-700 dark:text-rose-300 font-medium">{emp.sad}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-900 dark:text-white font-medium">{emp.total}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}
          </div>

          {/* Distribution Chart */}
          <div className="mb-8">
            <ChartContainer title={`${tSafe(t,'ratings.count_happy','Happy')}/${tSafe(t,'ratings.count_medium','Medium')}/${tSafe(t,'ratings.count_sad','Sad')} ${tSafe(t,'ratings.distribution','Distribution')}`}>
              <div className="h-64">
                <Doughnut data={distData} options={{ responsive:true, maintainAspectRatio:false }} />
              </div>
            </ChartContainer>
          </div>

          {/* Worked examples / rationale box */}
          <GlassCard className="p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {tSafe(t,'ratings.nps_explain_title','NPS-style from your 3-point scale')}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{tSafe(t,'ratings.nps_explain_body','We map happy → Promoter, medium → Passive, sad → Detractor and compute NPS_proxy = %Promoters − %Detractors = %happy − %sad. Scores range roughly from −100 to +100. This is a practical proxy using your current data.')}</p>
          </GlassCard>

          {/* Drilldown Panel */}
          <AnimatePresence>
            {drillOpen && (
              <motion.aside
                initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
                transition={{ type:'tween', duration:.25 }}
                className="fixed top-0 right-0 h-full w-full sm:w-[48rem] bg-white dark:bg-gray-900 z-50 shadow-2xl border-l border-gray-200 dark:border-gray-700 overflow-y-auto"
              >
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{drillTitle}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // export CSV
                        const rows = drillRows.map(r => ({
                          location: r.location_id,
                          employee: r.employee_id,
                          rating: r.rating,
                          notes: r.notes || '',
                          notes_phone: r.notes_phone || '',
                          date: r.date_created ? format(new Date(r.date_created),'yyyy-MM-dd HH:mm') : ''
                        }));
                        const headers = Object.keys(rows[0] || { location:'', employee:'', rating:'', notes:'', notes_phone:'', date:'' });
                        const csv = [
                          headers.join(','),
                          ...rows.map(r=> headers.map(h => {
                            const val = String(r[h] ?? '').replace(/"/g,'""');
                            return /[",\n]/.test(val) ? `"${val}"` : val;
                          }).join(','))
                        ].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = `${drillTitle.replace(/[^\w\-]+/g,'_')}.csv`;
                        a.click();
                        URL.revokeObjectURL(a.href);
                      }}
                      className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      ⬇️ {tSafe(t,'ratings.drilldown.export_csv','Export CSV')}
                    </button>
                    <button onClick={()=>setDrillOpen(false)} className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">✕</button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-indigo-50 dark:bg-indigo-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
                            {tSafe(t,'ratings.drilldown.col_location','Location')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
                            {tSafe(t,'ratings.drilldown.col_employee','Employee')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
                            {tSafe(t,'ratings.drilldown.col_rating','Rating')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
                            {tSafe(t,'ratings.drilldown.col_notes','Notes')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
                            {tSafe(t,'ratings.drilldown.col_phone_notes','Phone Notes')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
                            {tSafe(t,'ratings.drilldown.col_date','Date')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {drillRows.map((r, idx) => (
                          <tr key={idx} className="hover:bg-indigo-50 dark:hover:bg-indigo-900">
                            <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-100">{r.location_id || tSafe(t,'ratings.drilldown.empty','—')}</td>
                            <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-100">{formatEmployeeDisplay(r.employee_id)}</td>
                            <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-100">{r.rating}</td>
                            <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-100">{r.notes || tSafe(t,'ratings.drilldown.empty','—')}</td>
                            <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-100">{r.notes_phone || tSafe(t,'ratings.drilldown.empty','—')}</td>
                            <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-100">
                              {r.date_created ? format(new Date(r.date_created),'yyyy-MM-dd HH:mm') : tSafe(t,'ratings.drilldown.empty','—')}
                            </td>
                          </tr>
                        ))}
                        {!drillRows.length && (
                          <tr><td colSpan={6} className="px-6 py-6 text-center text-gray-500 dark:text-gray-400">—</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default NPSDashboard;
