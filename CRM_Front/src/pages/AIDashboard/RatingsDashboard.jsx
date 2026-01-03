// src/pages/ratings/RatingsDashboard.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import { ratingsService } from '../../lib/ratingsService';
import { format, parseISO, isValid as isValidDateFns, subDays } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import { RatingsTable, DrilldownPanel, Badge } from '../ReadRatings/RatingsHelpers';

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement);

const tSafe = (t, key, fallback) => {
  const v = t?.(key);
  return typeof v === 'string' && !v.includes('{{') ? v : fallback;
};
const safeDate = (v) => {
  try {
    if (!v) return null;
    const d = typeof v === 'string' ? parseISO(v) : new Date(v);
    return isValidDateFns(d) ? d : null;
  } catch { return null; }
};
const chartColor = (cssVar, fallback) => {
  const el = document.documentElement;
  const v = getComputedStyle(el).getPropertyValue(cssVar)?.trim();
  return v || fallback;
};

const RatingsDashboard = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');

  // filters
  const today = useMemo(() => new Date(), []);
  const [dateFrom, setDateFrom] = useState(format(subDays(today, 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(today, 'yyyy-MM-dd'));
  const [ratingFilter, setRatingFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [employeeIdFilter, setEmployeeIdFilter] = useState('');

  // drilldown
  const [drillOpen, setDrillOpen] = useState(false);
  const [drillTitle, setDrillTitle] = useState('');
  const [drillItems, setDrillItems] = useState([]);

  const canView = useMemo(() => {
    const required = [5000,1,2001,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011];
    return (authData?.privilege_ids || []).some((id) => required.includes(id));
  }, [authData]);

  const fetchData = useCallback(async () => {
    if (!authData?.access_token) return;
    setLoading(true);
    try {
      const res = await ratingsService.list(authData.org_id, {
        page: 1,
        per_page: 1000,
        sort: '-date_created',
        start_date: dateFrom,
        end_date: dateTo,
        rating: ratingFilter || undefined,
        location_id: locationFilter || undefined,
        employee_id: employeeIdFilter || undefined,
        q: search || undefined,
      }, authData.access_token);

      setItems(res.data || []);
      setErr('');
    } catch (e) {
      setErr(e.message || 'Failed to load ratings');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [authData, dateFrom, dateTo, ratingFilter, locationFilter, employeeIdFilter, search]);

  useEffect(() => {
    if (!authLoading && canView) fetchData();
  }, [authLoading, canView, fetchData]);

  if (authLoading || !authData || loading) return <LoadingSpinner />;

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

  // ============ Derived stats ============

  const counts = useMemo(() => {
    const map = { happy: 0, medium: 0, sad: 0 };
    items.forEach((x) => { if (map[x.rating] != null) map[x.rating] += 1; });
    const total = items.length;
    const pct = (n) => total ? Math.round((n/total)*100) : 0;
    return {
      total,
      happy: map.happy,
      medium: map.medium,
      sad: map.sad,
      happyPct: pct(map.happy),
      mediumPct: pct(map.medium),
      sadPct: pct(map.sad),
      today: items.filter(x => {
        const d = safeDate(x.date_created);
        if (!d) return false;
        const ymd = format(d, 'yyyy-MM-dd');
        return ymd === format(new Date(), 'yyyy-MM-dd');
      }).length,
    };
  }, [items]);

  const byLocation = useMemo(() => {
    const map = {};
    items.forEach((x) => {
      const loc = x.location_id || 'Unknown';
      if (!map[loc]) map[loc] = { happy:0, medium:0, sad:0 };
      if (map[loc][x.rating] != null) map[loc][x.rating] += 1;
    });
    const labels = Object.keys(map);
    return {
      labels,
      happy: labels.map(l => map[l].happy),
      medium: labels.map(l => map[l].medium),
      sad: labels.map(l => map[l].sad),
    };
  }, [items]);

  const topEmployees = useMemo(() => {
    const map = {};
    items.forEach((x) => {
      const id = x.employee_id || 'Unknown';
      if (!map[id]) map[id] = { happy:0, medium:0, sad:0, total:0 };
      if (map[id][x.rating] != null) map[id][x.rating] += 1;
      map[id].total += 1;
    });
    return Object.entries(map)
      .map(([k,v]) => ({ employee_id: k, ...v }))
      .sort((a,b)=> b.total - a.total)
      .slice(0, 12);
  }, [items]);

  const byDay = useMemo(() => {
    const map = {};
    items.forEach((x) => {
      const d = safeDate(x.date_created);
      if (!d) return;
      const key = format(d, 'yyyy-MM-dd');
      if (!map[key]) map[key] = { happy:0, medium:0, sad:0 };
      if (map[key][x.rating] != null) map[key][x.rating] += 1;
    });
    const labels = Object.keys(map).sort();
    return {
      labels,
      happy: labels.map(l => map[l].happy),
      medium: labels.map(l => map[l].medium),
      sad: labels.map(l => map[l].sad),
    };
  }, [items]);

  // ============ Charts ============

  const stackedOpts = {
    responsive:true,
    plugins:{ legend:{ position:'top' } },
    scales:{ x:{ stacked:true }, y:{ stacked:true, beginAtZero:true, ticks:{ stepSize:1 } } }
  };

  const locationChart = {
    labels: byLocation.labels,
    datasets: [
      { label: tSafe(t,'ratings.happy','Happy'),  data: byLocation.happy,  backgroundColor: chartColor('--color-green-500','#10B981') },
      { label: tSafe(t,'ratings.medium','Medium'), data: byLocation.medium, backgroundColor: chartColor('--color-amber-500','#F59E0B') },
      { label: tSafe(t,'ratings.sad','Sad'),      data: byLocation.sad,    backgroundColor: chartColor('--color-red-500','#EF4444') },
    ]
  };

  const employeeChart = {
    labels: topEmployees.map(x => String(x.employee_id)),
    datasets: [
      { label: tSafe(t,'ratings.happy','Happy'),  data: topEmployees.map(x=>x.happy),  backgroundColor: chartColor('--color-green-500','#10B981') },
      { label: tSafe(t,'ratings.medium','Medium'), data: topEmployees.map(x=>x.medium), backgroundColor: chartColor('--color-amber-500','#F59E0B') },
      { label: tSafe(t,'ratings.sad','Sad'),      data: topEmployees.map(x=>x.sad),    backgroundColor: chartColor('--color-red-500','#EF4444') },
    ]
  };

  const trendChart = {
    labels: byDay.labels,
    datasets: [
      { label: tSafe(t,'ratings.happy','Happy'),  data: byDay.happy,  borderColor: chartColor('--color-green-500','#10B981'),  backgroundColor: 'transparent' },
      { label: tSafe(t,'ratings.medium','Medium'), data: byDay.medium, borderColor: chartColor('--color-amber-500','#F59E0B'), backgroundColor: 'transparent' },
      { label: tSafe(t,'ratings.sad','Sad'),      data: byDay.sad,    borderColor: chartColor('--color-red-500','#EF4444'),    backgroundColor: 'transparent' },
    ]
  };

  // ============ Drilldowns ============
  const openDrill = (title, rows) => {
    setDrillTitle(title);
    setDrillItems(rows);
    setDrillOpen(true);
  };

  const onLocationClick = (_evt, el) => {
    if (!el?.length) return;
    const idx = el[0].index;
    const loc = locationChart.labels[idx];
    const rows = items.filter(x => (x.location_id || 'Unknown') === loc);
    openDrill(`${tSafe(t,'ratings.by_location','Ratings by Location')} · ${loc}`, rows);
  };

  const onEmployeeClick = (_evt, el) => {
    if (!el?.length) return;
    const idx = el[0].index;
    const emp = employeeChart.labels[idx];
    const rows = items.filter(x => String(x.employee_id) === String(emp));
    openDrill(`${tSafe(t,'ratings.by_employee','Ratings by Employee')} · ${emp}`, rows);
  };

  const onTrendClick = (_evt, el) => {
    if (!el?.length) return;
    const idx = el[0].index;
    const day = trendChart.labels[idx];
    const rows = items.filter(x => x.date_created && format(new Date(x.date_created),'yyyy-MM-dd') === day);
    openDrill(`${tSafe(t,'ratings.by_day','Ratings by Day')} · ${day}`, rows);
  };

  // ============ UI ============
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Top bar */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                {tSafe(t,'ratings.dashboard','Ratings Dashboard')}
              </h1>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <LanguageToggle />
                <ModalSearch onSearch={setSearch} />
                <ThemeToggle />
              </div>
            </div>

            {/* Error */}
            {err && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm relative mb-6" role="alert">
                <span>{err}</span>
                <button onClick={() => setErr('')} className="absolute top-0 right-0 px-4 py-3" aria-label={tSafe(t,'common.dismiss_error','Dismiss error')}>
                  <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20"><path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"/></svg>
                </button>
              </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">{tSafe(t,'ratings.total','Total Ratings')}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{counts.total}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">{tSafe(t,'ratings.happy','Happy')}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{counts.happy} <span className="text-base text-gray-500">({counts.happyPct}%)</span></div>
                <Badge className="mt-3 bg-green-600 text-white">{tSafe(t,'ratings.good','Good')}</Badge>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">{tSafe(t,'ratings.medium','Medium')}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{counts.medium} <span className="text-base text-gray-500">({counts.mediumPct}%)</span></div>
                <Badge className="mt-3 bg-amber-600 text-white">{tSafe(t,'ratings.ok','OK')}</Badge>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">{tSafe(t,'ratings.sad','Sad')}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{counts.sad} <span className="text-base text-gray-500">({counts.sadPct}%)</span></div>
                <Badge className="mt-3 bg-red-600 text-white">{tSafe(t,'ratings.needs_attention','Needs Attention')}</Badge>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{tSafe(t,'ratings.filters','Filters')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                  placeholder={tSafe(t,'ratings.search_placeholder','Search notes or location…')}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
                <select
                  value={ratingFilter}
                  onChange={(e)=>setRatingFilter(e.target.value)}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="">{tSafe(t,'ratings.all_ratings','All Ratings')}</option>
                  <option value="happy">{tSafe(t,'ratings.happy','Happy')}</option>
                  <option value="medium">{tSafe(t,'ratings.medium','Medium')}</option>
                  <option value="sad">{tSafe(t,'ratings.sad','Sad')}</option>
                </select>
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e)=>setLocationFilter(e.target.value)}
                  placeholder={tSafe(t,'ratings.location','Location')}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
                <input
                  type="number"
                  value={employeeIdFilter}
                  onChange={(e)=>setEmployeeIdFilter(e.target.value)}
                  placeholder={tSafe(t,'ratings.employee_id','Employee ID')}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo}
                  onChange={(e)=>setDateFrom(e.target.value)}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  aria-label="Date From"
                />
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom}
                  onChange={(e)=>setDateTo(e.target.value)}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  aria-label="Date To"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {tSafe(t,'ratings.filters_hint','Filters apply to the KPIs, charts and table.')}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={fetchData}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {tSafe(t,'ratings.apply','Apply')}
                </button>
                <button
                  onClick={()=>{
                    setSearch(''); setRatingFilter(''); setLocationFilter(''); setEmployeeIdFilter('');
                    setDateFrom(format(subDays(new Date(),30),'yyyy-MM-dd'));
                    setDateTo(format(new Date(),'yyyy-MM-dd'));
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  {tSafe(t,'ratings.reset','Reset')}
                </button>
              </div>
            </div>

            {/* Row 1: By Location + By Employee */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {tSafe(t,'ratings.by_location','Ratings by Location')}
                </h3>
                <div className="h-72">
                  <Bar data={locationChart} options={{ ...stackedOpts, onClick: onLocationClick }} />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {tSafe(t,'ratings.by_employee','Ratings by Employee (Top)')}
                </h3>
                <div className="h-72">
                  <Bar data={employeeChart} options={{ ...stackedOpts, onClick: onEmployeeClick }} />
                </div>
              </div>
            </div>

            {/* Row 2: Trend */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {tSafe(t,'ratings.trend','Ratings Trend by Day')}
              </h3>
              <div className="h-72">
                <Line
                  data={trendChart}
                  options={{
                    responsive: true,
                    onClick: onTrendClick,
                    plugins: { legend: { position: 'top' } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                  }}
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg mb-8">
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {tSafe(t,'ratings.latest','Latest Ratings')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {tSafe(t,'ratings.latest_hint','Click a row to open it in the drilldown panel.')}
                </p>
              </div>
              <RatingsTable
                items={items}
                t={t}
                toolbar={
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="text-sm text-gray-600 dark:text-gray-300">{items?.length || 0} {tSafe(t,'ratings.items','items')}</div>
                  </div>
                }
                onRowClick={(row) => openDrill(`${tSafe(t,'ratings.rating','Rating')} · ${row.employee_id}`, [row])}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Drilldown */}
      <DrilldownPanel
        open={drillOpen}
        onClose={() => setDrillOpen(false)}
        title={drillTitle}
        items={drillItems}
        t={t}
      />

      <AnimatePresence />
    </div>
  );
};

export default RatingsDashboard;
