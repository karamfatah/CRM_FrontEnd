import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import readReportService from '../../lib/readReportService';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const ReadDetailsReports = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [aggregatedData, setAggregatedData] = useState({
    byLocation: {},
    bySection: {},
    bySubSection: {},
    byField: {},
    bySeverity: {},
    byStatus: {},
    byCreatedBy: {},
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    reportName: '',
    reportType: '',
    fieldName: '',
  });
  const [filterOptions, setFilterOptions] = useState({
    reportNames: new Set(),
    reportTypes: new Set(),
    fieldNames: new Set(),
  });
  const [sectionFilters, setSectionFilters] = useState({
    location: '',
    section: '',
    subsection: '',
    field: '',
    severity: '',
    status: '',
    createdBy: '',
  });

  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('reports.no_permission') || 'No permission to view reports');
      setLoading(false);
      return;
    }

    if (authData.privilege_ids?.includes(1)) {
      setHasPrivilege(true);
      fetchReports();
    } else {
      setError(t('reports.no_permission') || 'No permission to view reports');
      setHasPrivilege(false);
      setLoading(false);
    }
  }, [authData, authLoading, language, t, currentPage, perPage, filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await readReportService.getReports(authData.org_id, {
        page: currentPage,
        perPage,
        lang: language || 'en',
        name: filters.reportName,
        reportType: filters.reportType,
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setReports(data);
      setTotalPages(response.pagination?.total_pages || 1);
      aggregateData(data);
      populateFilterOptions(data);
      setLoading(false);
    } catch (err) {
      setError(t('reports.fetch_reports_error', { message: err.message }) || `Error: ${err.message}`);
      setReports([]);
      setLoading(false);
    }
  };

  const aggregateData = (data) => {
    const agg = {
      byLocation: {},
      bySection: {},
      bySubSection: {},
      byField: {},
      bySeverity: {},
      byStatus: {},
      byCreatedBy: {},
    };

    data.forEach((report) => {
      const location = report.main_location_name || 'Unknown Location';
      agg.byLocation[location] = agg.byLocation[location] || { count: 0 };
      agg.byLocation[location].count += 1;

      const createdBy = report.created_by || 'Unknown';
      agg.byCreatedBy[createdBy] = agg.byCreatedBy[createdBy] || { count: 0 };
      agg.byCreatedBy[createdBy].count += 1;

      const severity = report.severity || 'Unknown';
      agg.bySeverity[severity] = agg.bySeverity[severity] || { count: 0 };
      agg.bySeverity[severity].count += 1;

      const status = report.status || 'Unknown';
      agg.byStatus[status] = agg.byStatus[status] || { count: 0 };
      agg.byStatus[status].count += 1;

      const processFields = (fields, path = []) => {
        fields.forEach((field) => {
          if (field.value && !isNaN(parseFloat(field.value))) {
            const key = [...path, field.name].join('/');
            agg.byField[key] = agg.byField[key] || { count: 0, sum: 0, avg: 0 };
            agg.byField[key].count += 1;
            agg.byField[key].sum += parseFloat(field.value);
            agg.byField[key].avg = agg.byField[key].sum / agg.byField[key].count;
          }
        });
      };

      const processSection = (section, name, subSections, path = []) => {
        subSections.forEach((sub, index) => {
          const subPath = [...path, name, sub.name || `Sub${index}`];
          agg.bySection[subPath.join('/')] = agg.bySection[subPath.join('/')] || { count: 0 };
          agg.bySection[subPath.join('/')].count += 1;

          processFields(sub.fields, subPath);
          sub.sub_sub_headers?.forEach((subSub, subSubIndex) => {
            const subSubPath = [...subPath, subSub.name || `SubSub${subSubIndex}`];
            agg.bySubSection[subSubPath.join('/')] = agg.bySubSection[subSubPath.join('/')] || { count: 0 };
            agg.bySubSection[subSubPath.join('/')].count += 1;
            processFields(subSub.fields, subSubPath);
          });
          sub.sub_sub_bodies?.forEach((subSub, subSubIndex) => {
            const subSubPath = [...subPath, subSub.name || `SubSub${subSubIndex}`];
            agg.bySubSection[subSubPath.join('/')] = agg.bySubSection[subSubPath.join('/')] || { count: 0 };
            agg.bySubSection[subSubPath.join('/')].count += 1;
            processFields(subSub.fields, subSubPath);
          });
        });
      };

      if (report.structure) {
        processSection('header', 'Header', report.structure.header?.sub_headers || []);
        processSection('body', 'Body', report.structure.body?.sub_bodies || []);
        processSection('footer', 'Footer', report.structure.footer?.sub_footers || []);
      }
    });

    setAggregatedData(agg);
  };

  const populateFilterOptions = (data) => {
    const options = { reportNames: new Set(), reportTypes: new Set(), fieldNames: new Set() };
    data.forEach((report) => {
      options.reportNames.add(report.name || 'Unnamed Report');
      options.reportTypes.add(report.reportType || 'Unknown Type');
      if (report.structure) {
        const extractFieldNames = (sections) => {
          sections.forEach((section) => {
            section.fields?.forEach((field) => options.fieldNames.add(field.name));
            section.sub_sub_headers?.forEach((sub) => extractFieldNames([sub]));
            section.sub_sub_bodies?.forEach((sub) => extractFieldNames([sub]));
          });
        };
        extractFieldNames([...(report.structure.header?.sub_headers || []), ...(report.structure.body?.sub_bodies || []), ...(report.structure.footer?.sub_footers || [])]);
      }
    });
    setFilterOptions({
      reportNames: Array.from(options.reportNames),
      reportTypes: Array.from(options.reportTypes),
      fieldNames: Array.from(options.fieldNames),
    });
  };

  const filterAggregatedData = (data, filterKey) => {
    const filterValue = sectionFilters[filterKey.toLowerCase()];
    if (!filterValue || filterValue === '') return data;
    return Object.fromEntries(Object.entries(data).filter(([key]) => key.includes(filterValue)));
  };

  const handleSectionFilterChange = (e, sectionType) => {
    const { value } = e.target;
    setSectionFilters((prev) => ({ ...prev, [sectionType.toLowerCase()]: value }));
  };

  const renderAggregatedSection = (title, data, type) => {
    const filteredData = filterAggregatedData(data, type);
    const labels = Object.keys(filteredData);
    const values = labels.map((key) => filteredData[key].count || filteredData[key].avg || filteredData[key].sum || 0);

    const chartData = {
      labels,
      datasets: [
        {
          label: `${type} Count`,
          data: values,
          backgroundColor: 'rgba(99, 102, 241, 0.7)', // Indigo with transparency
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
        },
      ],
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300">{title}</h3>
          <select
            value={sectionFilters[type.toLowerCase()]}
            onChange={(e) => handleSectionFilterChange(e, type)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{`All ${type} Reports`}</option>
            {filterOptions.reportNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">Sum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">Avg</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {labels.map((key) => (
                  <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{key}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{filteredData[key].count || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{filteredData[key].sum || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{filteredData[key].avg || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-900">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {t('reports.view_detailed_reports') || 'View Detailed Reports'}
              </h1>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-4">
                <LanguageToggle />
                <ModalSearch />
                <ThemeToggle />
              </div>
            </div>
            {error && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-100 px-4 py-3 rounded-lg shadow-md mb-6 relative" role="alert">
                <span className="font-medium">{error}</span>
                <button onClick={() => setError('')} className="absolute top-2 right-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" aria-label={t('common.dismiss_error') || 'Dismiss error'}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                  </svg>
                </button>
              </div>
            )}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Filters</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Main Report Name</label>
                  <select
                    name="reportName"
                    value={filters.reportName}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">{t('reports.all_report_names') || 'All Report Names'}</option>
                    {filterOptions.reportNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Type</label>
                  <select
                    name="reportType"
                    value={filters.reportType}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">{t('reports.all_report_types') || 'All Report Types'}</option>
                    {filterOptions.reportTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Field Name</label>
                  <select
                    name="fieldName"
                    value={filters.fieldName}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">{t('reports.all_fields') || 'All Fields'}</option>
                    {filterOptions.fieldNames.map((field) => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {reports.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-lg"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Report Summary</h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300"><strong>{t('reports.total_reports') || 'Total Reports'}:</strong> {reports.length}</p>
                </motion.div>
              )}
              {renderAggregatedSection('Aggregated by Location', aggregatedData.byLocation, 'Location')}
              {renderAggregatedSection('Aggregated by Section', aggregatedData.bySection, 'Section')}
              {renderAggregatedSection('Aggregated by Subsection', aggregatedData.bySubSection, 'Subsection')}
              {renderAggregatedSection('Aggregated by Field', aggregatedData.byField, 'Field')}
              {renderAggregatedSection('Aggregated by Severity', aggregatedData.bySeverity, 'Severity')}
              {renderAggregatedSection('Aggregated by Status', aggregatedData.byStatus, 'Status')}
              {renderAggregatedSection('Aggregated by Created By', aggregatedData.byCreatedBy, 'Created By')}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    aria-label={t('reports.previous') || 'Previous'}
                  >
                    {t('reports.previous') || 'Previous'}
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(8, totalPages) }, (_, i) => {
                      const startPage = Math.max(1, currentPage - 3);
                      const endPage = Math.min(totalPages, startPage + 7);
                      const page = startPage + i;
                      if (page <= endPage) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg ${
                              page === currentPage
                                ? 'bg-indigo-700 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600'
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition`}
                            aria-label={`Page ${page}`}
                            aria-current={page === currentPage ? 'page' : undefined}
                          >
                            {page}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    aria-label={t('reports.next') || 'Next'}
                  >
                    {t('reports.next') || 'Next'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReadDetailsReports;