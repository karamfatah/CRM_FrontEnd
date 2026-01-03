import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { reportsNameService } from '../../lib/reportsNameService';
import ModalSearch from '../../components/ModalSearch';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import { PencilIcon, TrashIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';

const ReportsNameManagement = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [reportsNames, setReportsNames] = useState([]);
  const [editingReportId, setEditingReportId] = useState(null);
  const [newReport, setNewReport] = useState({
    name: '',
    status: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Check authentication and privileges
  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('reports_names.no_permission'));
      setLoading(false);
      return;
    }

    if (authData.privilege_ids.includes(1)) {
      setHasPrivilege(true);
    } else {
      setError(t('reports_names.no_permission'));
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  // Fetch reports names
  const fetchData = async () => {
    if (!authData?.org_id || !hasPrivilege) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const reportsNameData = await reportsNameService.getReportsNames(authData.org_id);
      setReportsNames(reportsNameData);
      setError('');
    } catch (err) {
      console.error('Error fetching reports names:', err);
      setError(err.message || t('reports_names.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPrivilege && authData?.org_id) {
      fetchData();
    }
  }, [authData, hasPrivilege]);

  // Handle create
  const initiateCreate = () => {
    if (!hasPrivilege) {
      setError(t('reports_names.no_permission'));
      return;
    }

    setIsCreating(true);
    setNewReport({
      name: '',
      status: true,
    });
  };

  // Handle edit
  const handleEdit = (reportId) => {
    if (!hasPrivilege) {
      setError(t('reports_names.no_permission'));
      return;
    }

    const report = reportsNames.find((r) => r._id === reportId);
    if (report) {
      setEditingReportId(reportId);
      setNewReport({
        name: report.name,
        status: report.status,
      });
    }
  };

  // Handle save new
  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) return;

    if (!newReport.name) {
      setError(t('reports_names.select_name'));
      return;
    }

    try {
      await reportsNameService.createReportName({
        name: newReport.name,
        status: newReport.status,
      });
      setIsCreating(false);
      setNewReport({ name: '', status: true });
      fetchData();
      setSuccess(t('reports_names.create_success'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating report name:', err);
      setError(err.message || t('reports_names.create_error'));
    }
  };

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) return;

    if (!newReport.name) {
      setError(t('reports_names.select_name'));
      return;
    }

    try {
      await reportsNameService.updateReportName(editingReportId, {
        name: newReport.name,
        status: newReport.status,
      });
      setEditingReportId(null);
      setNewReport({ name: '', status: true });
      fetchData();
      setSuccess(t('reports_names.update_success'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating report name:', err);
      setError(err.message || t('reports_names.update_error'));
    }
  };

  // Handle delete
  const handleDelete = async (reportId) => {
    if (!hasPrivilege) return;

    if (window.confirm(t('reports_names.delete_confirm'))) {
      try {
        await reportsNameService.deleteReportName(reportId);
        fetchData();
        setSuccess(t('reports_names.delete_success'));
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Error deleting report name:', err);
        setError(err.message || t('reports_names.delete_error'));
      }
    }
  };

  // Filter and sort data
  const filteredAndSortedReports = useMemo(() => {
    let filtered = [...reportsNames];

    // Apply filters
    if (nameFilter) {
      filtered = filtered.filter((report) => report.name === nameFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter((report) => report.status.toString() === statusFilter);
    }
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((report) => (report.name || '').toLowerCase().includes(lowerSearch));
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [reportsNames, nameFilter, statusFilter, searchTerm, sortConfig]);

  // Get unique filter options
  const uniqueNames = useMemo(() => {
    const names = new Set(reportsNames.map((report) => report.name).filter(Boolean));
    return ['', ...Array.from(names).sort()];
  }, [reportsNames]);

  const uniqueStatuses = ['', 'true', 'false'];

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key && prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  };

  if (authLoading) {
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
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  {t('reports_names.title')}
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {hasPrivilege && (
                  <button
                    onClick={initiateCreate}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                  >
                    {t('reports_names.add_report')}
                  </button>
                )}
                <ModalSearch />
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span>{error}</span>
                <button
                  onClick={() => setError('')}
                  className="absolute top-0 right-0 px-4 py-3"
                  aria-label={t('common.dismiss_error')}
                >
                  <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                  </svg>
                </button>
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span>{success}</span>
                <button
                  onClick={() => setSuccess('')}
                  className="absolute top-0 right-0 px-4 py-3"
                  aria-label={t('common.dismiss_success')}
                >
                  <svg className="fill-current h-6 w-6 text-green-500" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                  </svg>
                </button>
              </div>
            )}

            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="mb-4 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="search">
                      {t('reports_names.search')}
                    </label>
                    <input
                      id="search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('reports_names.search_placeholder')}
                      className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="nameFilter">
                      {t('reports_names.name')}
                    </label>
                    <select
                      id="nameFilter"
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                      className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    >
                      {uniqueNames.map((name) => (
                        <option key={name || 'all'} value={name}>
                          {name || t('reports_names.all')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="statusFilter">
                      {t('reports_names.status')}
                    </label>
                    <select
                      id="statusFilter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    >
                      {uniqueStatuses.map((status) => (
                        <option key={status || 'all'} value={status}>
                          {status === 'true' ? t('reports_names.active') : status === 'false' ? t('reports_names.inactive') : t('reports_names.all')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredAndSortedReports.length === 0 ? (
                  <div className="text-gray-600 dark:text-gray-300">{t('reports_names.no_reports')}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('name')}
                          >
                            <div className="flex items-center">
                              {t('reports_names.name')}
                              {sortConfig.key === 'name' && (
                                sortConfig.direction === 'asc' ? (
                                  <ArrowUpIcon className="w-4 h-4 ml-1" />
                                ) : (
                                  <ArrowDownIcon className="w-4 h-4 ml-1" />
                                )
                              )}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {t('reports_names.status')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {t('reports_names.created_at')}
                          </th>
                          {hasPrivilege && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              {t('reports_names.actions')}
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredAndSortedReports.map((report) => (
                          <tr key={report._id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                              {report.name || t('reports_names.unknown')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                              {report.status ? t('reports_names.active') : t('reports_names.inactive')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </td>
                            {hasPrivilege && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleEdit(report._id)}
                                  className="text-indigo-500 hover:text-indigo-600 mr-4"
                                  aria-label={t('reports_names.edit')}
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(report._id)}
                                  className="text-red-500 hover:text-red-600"
                                  aria-label={t('reports_names.delete')}
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {(editingReportId || isCreating) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    {isCreating ? t('reports_names.add_title') : t('reports_names.edit_title')}
                  </h2>
                  <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                        {t('reports_names.name')}
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={newReport.name}
                        onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="status">
                        {t('reports_names.status')}
                      </label>
                      <select
                        id="status"
                        value={newReport.status}
                        onChange={(e) => setNewReport({ ...newReport, status: e.target.value === 'true' })}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                      >
                        <option value="true">{t('reports_names.active')}</option>
                        <option value="false">{t('reports_names.inactive')}</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReportId(null);
                          setIsCreating(false);
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {t('reports_names.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {isCreating ? t('reports_names.create') : t('reports_names.save')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsNameManagement;