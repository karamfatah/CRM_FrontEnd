import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import escalateReportService from '../../lib/escalateReportService';
import { format } from 'date-fns';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import DoughnutChart from '../../charts/DoughnutChart';
import LineChart from '../../charts/LineChart01';
import { chartAreaGradient } from '../../charts/ChartjsConfig';
import { adjustColorOpacity, getCssVariable } from '../../utils/Utils';

// Register Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Placeholder user images
import UserImage01 from '../../assets/images/user-36-01.jpg';
import UserImage02 from '../../assets/images/user-36-01.jpg';
import UserImage03 from '../../assets/images/user-36-01.jpg';
import UserImage04 from '../../assets/images/user-36-01.jpg';
import UserImage05 from '../../assets/images/user-36-01.jpg';

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ViewTopSummary = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);
  const [reportNames, setReportNames] = useState([]);
  const [selectedReportName, setSelectedReportName] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    reportType: '',
    search: '',
    sort: '-created_at',
  });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 1000);
  const [qaSectionFilter, setQaSectionFilter] = useState('All');

  // Aggregated data states
  const [statusData, setStatusData] = useState({ counts: {}, total: 0, maxStatus: '' });
  const [severityData, setSeverityData] = useState({ counts: {}, total: 0, highPercent: 0 });
  const [timeData, setTimeData] = useState({ labels: [], counts: [], total: 0, change: 0 });
  const [followUpData, setFollowUpData] = useState({ counts: {}, total: 0, openPercent: 0 });
  const [locationData, setLocationData] = useState({ counts: {}, total: 0, maxLocation: '' });
  const [correctiveTable, setCorrectiveTable] = useState({ rows: [], total: 0, openPercent: 0 });
  const [reportTypeData, setReportTypeData] = useState({ counts: {}, total: 0, maxType: '' });
  const [qaSectionData, setQaSectionData] = useState({ counts: {}, total: 0, maxSection: '' });
  const [userData, setUserData] = useState({ rows: [], total: 0, maxUser: '' });
  const [rejectCases, setRejectCases] = useState({ rows: [], total: 0, percent: 0 });

  // Colors for charts (from DynamicReportAdvanced)
  const chartColors = [
    '#4F46E5', // Indigo
    '#14B8A6', // Teal
    '#F43F5E', // Rose
    '#A78BFA', // Purple
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#8B5CF6', // Violet
  ];

  // Fallback translation
  const translate = (key, fallback) => {
    const translation = t(key);
    return translation.includes('{{') || translation === key ? fallback : translation;
  };

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(translate('reports.no_permission', 'No permission to view reports'));
      setLoading(false);
      return;
    }

    if (authData.privilege_ids?.includes(1)) {
      setHasPrivilege(true);
      fetchReports();
    } else {
      setError(translate('reports.no_permission', 'No permission to view reports'));
      setHasPrivilege(false);
      setLoading(false);
    }
  }, [authData, authLoading, filters, language, t, qaSectionFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let allReports = [];
      let currentPage = 1;
      const perPage = 100;
      let totalPages = 1;

      while (currentPage <= totalPages) {
        const response = await escalateReportService.getReports(authData.org_id, {
          page: currentPage,
          perPage,
          reportType: filters.reportType,
          sort: filters.sort,
          lang: language || 'en',
        });
        const reports = Array.isArray(response.data) ? response.data : [];
        allReports = [...allReports, ...reports];
        totalPages = response.pagination?.total_pages || 1;
        currentPage += 1;
      }

      setReports(allReports);

      // Set report types
      const uniqueReportTypes = allReports
        ? [...new Set(allReports.map((report) => report.reportType).filter(Boolean))]
        : [];
      setReportTypes(uniqueReportTypes.map((type) => ({ _id: type, name: type })));

      // Set report names
      const uniqueReportNames = [...new Set(allReports.map((report) => report.name && report.name.trim()))].filter(Boolean);
      setReportNames(uniqueReportNames);
      if (uniqueReportNames.length > 0 && !selectedReportName) {
        setSelectedReportName(uniqueReportNames[0]);
      }

      // Apply filters
      let filtered = allReports;
      if (selectedReportName) {
        filtered = allReports.filter((report) => report.name && report.name.trim() === selectedReportName);
      }
      if (filters.search) {
        const queryLower = filters.search.toLowerCase();
        filtered = filtered.filter((report) =>
          [
            report.name,
            report.reportType,
            report.user_created_name,
            report.main_location_name,
            report.qa_section,
            report.qa_sub_section,
          ]
            .filter(Boolean)
            .map((field) => field.toLowerCase())
            .some((field) => field.includes(queryLower))
        );
      }
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filtered = filtered.filter((report) => {
          const createdAt = new Date(report.created_at);
          return createdAt >= startDate;
        });
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter((report) => {
          const createdAt = new Date(report.created_at);
          return createdAt <= endDate;
        });
      }
      setFilteredReports(filtered);

      aggregateData(filtered);
      setLoading(false);
    } catch (err) {
      setError(translate('reports.fetch_reports_error', `Error: ${err.message}`));
      setReports([]);
      setFilteredReports([]);
      setReportNames([]);
      setSelectedReportName('');
      setLoading(false);
    }
  };

  const aggregateData = (reports) => {
    // Status counts (replace 'null' with 'Normal')
    const statusCounts = reports.reduce((acc, r) => {
      const status = r.status === null || r.status === 'null' ? 'Normal' : r.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const totalStatus = Object.values(statusCounts).reduce((sum, v) => sum + v, 0);
    const maxStatus = Object.keys(statusCounts).reduce((a, b) => (statusCounts[a] > statusCounts[b] ? a : b), '');
    setStatusData({ counts: statusCounts, total: totalStatus, maxStatus });

    // Severity counts
    const severityCounts = reports.reduce((acc, r) => {
      acc[r.severity || 'None'] = (acc[r.severity || 'None'] || 0) + 1;
      return acc;
    }, {});
    const totalSeverity = Object.values(severityCounts).reduce((sum, v) => sum + v, 0);
    const highPercent = ((severityCounts['High'] || 0) / totalSeverity) * 100;
    setSeverityData({ counts: severityCounts, total: totalSeverity, highPercent: highPercent.toFixed(1) });

    // Reports over time
    const timeCounts = reports.reduce((acc, r) => {
      const date = format(new Date(r.created_at), 'MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    const sortedDates = Object.keys(timeCounts).sort((a, b) => new Date(`2025-${a}`) - new Date(`2025-${b}`));
    const counts = sortedDates.map((date) => timeCounts[date]);
    const totalTime = counts.reduce((sum, v) => sum + v, 0);
    let change = 0;
    if (counts.length >= 2 && counts[counts.length - 2] !== 0) {
      change = ((counts[counts.length - 1] - counts[counts.length - 2]) / counts[counts.length - 2]) * 100;
    }
    setTimeData({ labels: sortedDates, counts, total: totalTime, change: change.toFixed(1) });

    // Follow Up Status counts
    const followUpCounts = reports.reduce((acc, r) => {
      if (r.follow_up_status) {
        acc[r.follow_up_status] = (acc[r.follow_up_status] || 0) + 1;
      }
      return acc;
    }, {});
    const totalFollowUp = Object.values(followUpCounts).reduce((sum, v) => sum + v, 0);
    const openPercent = ((followUpCounts['Open'] || 0) / totalFollowUp) * 100;
    setFollowUpData({ counts: followUpCounts, total: totalFollowUp, openPercent: openPercent.toFixed(1) });

    // Main Location counts
    const locationCounts = reports.reduce((acc, r) => {
      const loc = r.main_location_name || 'Unknown';
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {});
    const totalLocation = Object.values(locationCounts).reduce((sum, v) => sum + v, 0);
    const maxLocation = Object.keys(locationCounts).reduce((a, b) => (locationCounts[a] > locationCounts[b] ? a : b), '');
    setLocationData({ counts: locationCounts, total: totalLocation, maxLocation });

    // Corrective Action table
    const correctiveRows = reports
      .filter((r) => r.corrective_action_required)
      .map((r) => ({
        id: r._id?.$oid || r.id,
        required: 'Needed',
        followUpStatus: r.follow_up_status || 'N/A',
        actionDate: r.corrective_action_date ? format(new Date(r.corrective_action_date), 'dd - MMMM - yyyy') : 'N/A',
      }));
    const totalCorrective = correctiveRows.length;
    const correctiveOpenPercent = (correctiveRows.filter((r) => r.followUpStatus === 'Open').length / totalCorrective) * 100;
    setCorrectiveTable({ rows: correctiveRows, total: totalCorrective, openPercent: correctiveOpenPercent.toFixed(1) });

    // Report Type counts
    const reportTypeCounts = reports.reduce((acc, r) => {
      const type = r.reportType || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const totalReportType = Object.values(reportTypeCounts).reduce((sum, v) => sum + v, 0);
    const maxType = Object.keys(reportTypeCounts).reduce((a, b) => (reportTypeCounts[a] > reportTypeCounts[b] ? a : b), '');
    setReportTypeData({ counts: reportTypeCounts, total: totalReportType, maxType });

    // QA Section counts
    const qaSectionCounts = reports.reduce((acc, r) => {
      const section = r.qa_section || 'Unknown';
      acc[section] = (acc[section] || 0) + 1;
      return acc;
    }, {});
    const totalQaSection = Object.values(qaSectionCounts).reduce((sum, v) => sum + v, 0);
    const maxSection = Object.keys(qaSectionCounts).reduce((a, b) => (qaSectionCounts[a] > qaSectionCounts[b] ? a : b), '');
    setQaSectionData({ counts: qaSectionCounts, total: totalQaSection, maxSection });

    // Created By Users
    const userCounts = reports.reduce((acc, r) => {
      const user = r.user_created_name || 'Unknown';
      acc[user] = (acc[user] || 0) + 1;
      return acc;
    }, {});
    const userImages = {
      'User1': UserImage01,
      'User2': UserImage02,
      'User3': UserImage03,
      'User4': UserImage04,
      'User5': UserImage05,
      'Unknown': UserImage01,
    };
    const userRows = Object.entries(userCounts).map(([user, count], index) => ({
      id: index,
      name: user,
      count,
      image: userImages[user] || UserImage01,
    }));
    const totalUsers = userRows.length;
    const maxUser = userRows.reduce((a, b) => (a.count > b.count ? a : b), { name: '', count: 0 }).name;
    setUserData({ rows: userRows, total: totalUsers, maxUser });

    // Top 10 Reject Cases
    const rejectRows = reports
      .filter((r) => r.severity === 'High')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10)
      .map((r, index) => ({
        id: index,
        reportId: r._id?.$oid || r.id,
        severity: r.severity || 'None',
        status: r.status || 'N/A',
        createdAt: format(new Date(r.created_at), 'dd - MMMM - yyyy'),
      }));
    const totalRejects = rejectRows.length;
    const rejectPercent = (totalRejects / totalSeverity) * 100;
    setRejectCases({ rows: rejectRows, total: totalRejects, percent: rejectPercent.toFixed(1) });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'search') {
      setSearchInput(value);
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSearchFromModal = (query) => {
    setSearchInput(query);
  };

  const handleReportNameChange = (e) => {
    setSelectedReportName(e.target.value);
  };

  const handleQaSectionChange = (e) => {
    setQaSectionFilter(e.target.value);
  };

  // Chart configurations
  const statusChartData = {
    labels: Object.keys(statusData.counts),
    datasets: [
      {
        label: translate('reports.status', 'Status'),
        data: Object.values(statusData.counts),
        backgroundColor: [
          getCssVariable('--color-orange-600'),
          getCssVariable('--color-red-600'),
          getCssVariable('--color-yellow-600'),
          getCssVariable('--color-green-600'),
        ],
        hoverBackgroundColor: [
          getCssVariable('--color-orange-700'),
          getCssVariable('--color-red-700'),
          getCssVariable('--color-yellow-700'),
          getCssVariable('--color-green-700'),
        ],
        borderWidth: 0,
      },
    ],
  };

  const severityChartData = {
    labels: Object.keys(severityData.counts),
    datasets: [
      {
        label: translate('reports.severity', 'Severity'),
        data: Object.values(severityData.counts),
        backgroundColor: chartColors,
        borderColor: chartColors.map((color) => `${color}CC`),
        borderWidth: 1,
      },
    ],
  };

  const severityChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: language === 'ar' ? '#E5E7EB' : '#1F2937',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12, family: "'Inter', sans-serif" },
        bodyFont: { size: 12, family: "'Inter', sans-serif" },
        padding: 10,
        cornerRadius: 4,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: language === 'ar' ? '#E5E7EB' : '#1F2937',
          stepSize: 1,
        },
      },
      x: {
        ticks: {
          color: language === 'ar' ? '#E5E7EB' : '#1F2937',
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  const timeChartData = {
    labels: timeData.labels,
    datasets: [
      {
        label: translate('reports.reports', 'Reports'),
        data: timeData.counts,
        fill: true,
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          return chartAreaGradient(ctx, chartArea, [
            { stop: 0, color: adjustColorOpacity(getCssVariable('--color-violet-500'), 0) },
            { stop: 1, color: adjustColorOpacity(getCssVariable('--color-violet-500'), 0.2) },
          ]);
        },
        borderColor: getCssVariable('--color-violet-500'),
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: getCssVariable('--color-violet-500'),
        pointHoverBackgroundColor: getCssVariable('--color-violet-500'),
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        clip: 20,
        tension: 0.2,
      },
    ],
  };

  const timeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: true,
        ticks: {
          display: true,
          color: getCssVariable('--color-gray-500'),
          font: { size: 10 },
          padding: 5,
        },
        grid: { display: false },
      },
      y: {
        display: false,
        ticks: { display: false },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: getCssVariable('--color-gray-800'),
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
        callbacks: {
          label: (context) => `Reports: ${context.parsed.y}`,
          title: (tooltipItems) => `Date: ${tooltipItems[0].label}`,
        },
      },
    },
    interaction: { mode: 'index', intersect: false },
    hover: { mode: 'index', intersect: false },
    layout: { padding: { left: 0, right: 0, top: 0, bottom: 10 } },
  };

  const followUpChartData = {
    labels: Object.keys(followUpData.counts),
    datasets: [
      {
        label: translate('reports.follow_up_status', 'Follow Up Status'),
        data: Object.values(followUpData.counts),
        backgroundColor: [
          getCssVariable('--color-yellow-600'),
          getCssVariable('--color-orange-600'),
          getCssVariable('--color-green-600'),
          getCssVariable('--color-blue-600'),
        ],
        hoverBackgroundColor: [
          getCssVariable('--color-yellow-700'),
          getCssVariable('--color-orange-700'),
          getCssVariable('--color-green-700'),
          getCssVariable('--color-blue-700'),
        ],
        borderWidth: 0,
      },
    ],
  };

  const locationChartData = {
    labels: Object.keys(locationData.counts),
    datasets: [
      {
        label: translate('reports.main_location', 'Main Location'),
        data: Object.values(locationData.counts),
        backgroundColor: chartColors,
        borderColor: chartColors.map((color) => `${color}CC`),
        borderWidth: 1,
      },
    ],
  };

  const locationChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: language === 'ar' ? '#E5E7EB' : '#1F2937',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12, family: "'Inter', sans-serif" },
        bodyFont: { size: 12, family: "'Inter', sans-serif" },
        padding: 10,
        cornerRadius: 4,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: language === 'ar' ? '#E5E7EB' : '#1F2937',
          stepSize: 1,
        },
      },
      x: {
        ticks: {
          color: language === 'ar' ? '#E5E7EB' : '#1F2937',
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  const reportTypeChartData = {
    labels: Object.keys(reportTypeData.counts),
    datasets: [
      {
        label: translate('reports.report_type', 'Report Type'),
        data: Object.values(reportTypeData.counts),
        backgroundColor: [
          getCssVariable('--color-violet-500'),
          getCssVariable('--color-sky-500'),
          getCssVariable('--color-green-500'),
          getCssVariable('--color-red-500'),
        ],
        hoverBackgroundColor: [
          getCssVariable('--color-violet-600'),
          getCssVariable('--color-sky-600'),
          getCssVariable('--color-green-600'),
          getCssVariable('--color-red-600'),
        ],
        borderWidth: 0,
      },
    ],
  };

  const qaSectionChartData = {
    labels: Object.keys(qaSectionData.counts).filter((s) => qaSectionFilter === 'All' || s === qaSectionFilter),
    datasets: [
      {
        label: translate('reports.qa_section', 'QA Section'),
        data: Object.keys(qaSectionData.counts)
          .filter((s) => qaSectionFilter === 'All' || s === qaSectionFilter)
          .map((section) => qaSectionData.counts[section]),
        backgroundColor: chartColors,
        borderColor: chartColors.map((color) => `${color}CC`),
        borderWidth: 1,
      },
    ],
  };

  const qaSectionChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: language === 'ar' ? '#E5E7EB' : '#1F2937',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12, family: "'Inter', sans-serif" },
        bodyFont: { size: 12, family: "'Inter', sans-serif" },
        padding: 10,
        cornerRadius: 4,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: language === 'ar' ? '#E5E7EB' : '#1F2937',
          stepSize: 1,
        },
      },
      x: {
        ticks: {
          color: language === 'ar' ? '#E5E7EB' : '#1F2937',
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  const currentDate = new Date('2025-06-07T14:37:00.000Z');

  if (authLoading || !authData || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                {translate('reports.report_summary', 'Report Summary')}
              </h1>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <LanguageToggle />
                <ModalSearch onSearch={handleSearchFromModal} />
                <ThemeToggle />
              </div>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm relative mb-6" role="alert">
                <span>{error}</span>
                <button
                  onClick={() => setError('')}
                  className="absolute top-0 right-0 px-4 py-3"
                  aria-label={translate('common.dismiss_error', 'Dismiss error')}
                >
                  <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                  </svg>
                </button>
              </div>
            )}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleFilterChange}
                  name="search"
                  placeholder={translate('reports.search_placeholder', 'Search by name, domain, or description...')}
                  className="w-full py-3 px-4 pl-12 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  aria-label={translate('reports.search_placeholder', 'Search reports')}
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {translate('reports.filters', 'Filters')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {translate('reports.start_date', 'Start Date')}
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {translate('reports.end_date', 'End Date')}
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  />
                </div>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {translate('reports.select_report_name', 'Select Report Name')}
              </label>
              <select
                value={selectedReportName}
                onChange={handleReportNameChange}
                className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{translate('reports.select_report_placeholder', 'Select a report')}</option>
                {reportNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-6">
              {/* Card 1: Status Distribution */}
              <div className="col-span-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
                <div className="px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{translate('reports.status_distribution', 'Status Distribution')}</h2>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mt-2">{translate('reports.total_reports', 'Total Reports')}: {statusData.total}</div>
                  <div className="flex items-center mt-2">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mr-2">{statusData.total}</div>
                    <div className="text-sm font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded">{statusData.maxStatus}</div>
                  </div>
                </div>
                <div className="h-64">
                  <DoughnutChart data={statusChartData} width={300} height={250} />
                </div>
              </div>

              {/* Card 2: Severity Distribution */}
              <div className="col-span-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
                <div className="px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{translate('reports.severity_distribution', 'Severity Distribution')}</h2>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mt-2">{translate('reports.total_reports', 'Total Reports')}: {severityData.total}</div>
                  <div className="flex items-center mt-2">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mr-2">{severityData.total}</div>
                    <div className="text-sm font-medium text-red-700 bg-red-100 px-2 py-1 rounded">{severityData.highPercent}% {translate('reports.high', 'High')}</div>
                  </div>
                </div>
                <div className="h-60 p-6">
                  {Object.keys(severityData.counts).length > 0 ? (
                    <Bar
                      data={severityChartData}
                      options={severityChartOptions}
                      width={300}
                      height={240}
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">{translate('reports.no_data', 'No data available')}</p>
                  )}
                </div>
              </div>

              {/* Card 3: Reports Over Time */}
              <div className="col-span-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
                <div className="px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{translate('reports.reports_over_time', 'Reports Over Time')}</h2>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mt-2">{translate('reports.total_reports', 'Total Reports')}: {timeData.total}</div>
                  <div className="flex items-center mt-2">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mr-2">{timeData.total}</div>
                    <div
                      className={`text-sm font-medium ${
                        timeData.change >= 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                      } px-2 py-1 rounded`}
                    >
                      {timeData.change >= 0 ? `+${timeData.change}%` : `${timeData.change}%`}
                    </div>
                  </div>
                </div>
                <div className="h-32">
                  <LineChart key={JSON.stringify(timeChartData)} data={timeChartData} options={timeChartOptions} width={300} height={128} />
                </div>
              </div>

              {/* Card 4: Follow Up Status */}
              <div className="col-span-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
                <div className="px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{translate('reports.follow_up_status', 'Follow Up Status')}</h2>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mt-2">{translate('reports.total_reports', 'Total Reports')}: {followUpData.total}</div>
                  <div className="flex items-center mt-2">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mr-2">{followUpData.total}</div>
                    <div className="text-sm font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">{followUpData.openPercent}% {translate('reports.open', 'Open')}</div>
                  </div>
                </div>
                <div className="h-64">
                  <DoughnutChart data={followUpChartData} width={300} height={250} />
                </div>
              </div>

              {/* Card 5: QA Section Analysis (swapped position) */}
              <div className="col-span-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
                <div className="px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{translate('reports.qa_section_analysis', 'QA Section Analysis')}</h2>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mt-2">{translate('reports.total_reports', 'Total Reports')}: {qaSectionData.total}</div>
                  <div className="flex items-center mt-2">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mr-2">{qaSectionData.total}</div>
                    <div className="text-sm font-medium text-sky-700 bg-sky-100 px-2 py-1 rounded">{qaSectionData.maxSection}</div>
                  </div>
                  <div className="mt-4">
                    <select
                      value={qaSectionFilter}
                      onChange={handleQaSectionChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="All">{translate('reports.all_sections', 'All Sections')}</option>
                      {Object.keys(qaSectionData.counts).map((section) => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="h-60 p-6">
                  {Object.keys(qaSectionData.counts).length > 0 ? (
                    <Bar
                      data={qaSectionChartData}
                      options={qaSectionChartOptions}
                      width={580}
                      height={240}
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">{translate('reports.no_data', 'No data available')}</p>
                  )}
                </div>
              </div>

              {/* Card 6: Corrective Action Overview */}
              <div className="col-span-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
                <div className="px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{translate('reports.corrective_action_overview', 'Corrective Action Overview')}</h2>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mt-2">{translate('reports.total_actions', 'Total Actions')}: {correctiveTable.total}</div>
                  <div className="flex items-center mt-2">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mr-2">{correctiveTable.total}</div>
                    <div className="text-sm font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">{correctiveTable.openPercent}% {translate('reports.open', 'Open')}</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="table-auto w-full text-gray-700 dark:text-gray-300">
                      <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded">
                        <tr>
                          <th className="px-4 py-2">{translate('reports.required', 'Required')}</th>
                          <th className="px-4 py-2 text-center">{translate('reports.follow_up_status', 'Follow Up Status')}</th>
                          <th className="px-4 py-2 text-center">{translate('reports.action_date', 'Action Date')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {correctiveTable.rows.slice(0, 5).map((row) => (
                          <tr key={row.id}>
                            <td className="px-4 py-2">{row.required}</td>
                            <td className="px-4 py-2 text-center">{row.followUpStatus}</td>
                            <td className="px-4 py-2 text-center">{row.actionDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Card 7: Report Types Breakdown */}
              <div className="col-span-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
                <div className="px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{translate('reports.report_types_breakdown', 'Report Types Breakdown')}</h2>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mt-2">{translate('reports.total_reports', 'Total Reports')}: {reportTypeData.total}</div>
                  <div className="flex items-center mt-2">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mr-2">{reportTypeData.total}</div>
                    <div className="text-sm font-medium text-violet-700 bg-violet-100 px-2 py-1 rounded">{reportTypeData.maxType}</div>
                  </div>
                </div>
                <div className="h-64">
                  <DoughnutChart data={reportTypeChartData} width={300} height={250} />
                </div>
              </div>

              {/* Card 8: Location Summary (swapped position) */}
              <div className="col-span-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
                <div className="px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{translate('reports.location_summary', 'Location Summary')}</h2>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mt-2">{translate('reports.total_reports', 'Total Reports')}: {locationData.total}</div>
                  <div className="flex items-center mt-2">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mr-2">{locationData.total}</div>
                    <div className="text-sm font-medium text-violet-700 bg-violet-100 px-2 py-1 rounded">{locationData.maxLocation}</div>
                  </div>
                </div>
                <div className="h-60 p-6">
                  {Object.keys(locationData.counts).length > 0 ? (
                    <Bar
                      data={locationChartData}
                      options={locationChartOptions}
                      width={300}
                      height={240}
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">{translate('reports.no_data', 'No data available')}</p>
                  )}
                </div>
              </div>

              {/* Card 9: Created By Users */}
              <div className="col-span-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
                <div className="px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{translate('reports.created_by_users', 'Created By Users')}</h2>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mt-2">{translate('reports.total_users', 'Total Users')}: {userData.total}</div>
                  <div className="flex items-center mt-2">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mr-2">{userData.total}</div>
                    <div className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded">{userData.maxUser}</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="table-auto w-full text-gray-700 dark:text-gray-300">
                      <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded">
                        <tr>
                          <th className="px-4 py-2">{translate('reports.image', 'Image')}</th>
                          <th className="px-4 py-2">{translate('reports.name', 'Name')}</th>
                          <th className="px-4 py-2 text-center">{translate('reports.report_count', 'Report Count')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {userData.rows.slice(0, 5).map((row) => (
                          <tr key={row.id}>
                            <td className="px-4 py-2">
                              <img src={row.image} alt={row.name} className="w-10 h-10 rounded-full" />
                            </td>
                            <td className="px-4 py-2">{row.name}</td>
                            <td className="px-4 py-2 text-center">{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Card 10: Top 10 Reject Cases */}
              <div className="col-span-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
                <div className="px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{translate('reports.top_reject_cases', 'Top 10 Reject Cases')}</h2>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mt-2">{translate('reports.total_cases', 'Total Cases')}: {rejectCases.total}</div>
                  <div className="flex items-center mt-2">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mr-2">{rejectCases.total}</div>
                    <div className="text-sm font-medium text-red-700 bg-red-100 px-2 py-1 rounded">{rejectCases.percent}% {translate('reports.of_total', 'of Total')}</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="table-auto w-full text-gray-700 dark:text-gray-300">
                      <thead className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded">
                        <tr>
                          <th className="px-4 py-2">{translate('reports.report_id', 'Report ID')}</th>
                          <th className="px-4 py-2 text-center">{translate('reports.severity', 'Severity')}</th>
                          <th className="px-4 py-2 text-center">{translate('reports.status', 'Status')}</th>
                          <th className="px-4 py-2 text-center">{translate('reports.created_at', 'Created At')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {rejectCases.rows.map((row) => (
                          <tr key={row.id}>
                            <td className="px-4 py-2">{row.reportId}</td>
                            <td className="px-4 py-2 text-center">{row.severity}</td>
                            <td className="px-4 py-2 text-center">{row.status}</td>
                            <td className="px-4 py-2 text-center">{row.createdAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewTopSummary;