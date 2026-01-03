import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { emailReportsService } from '../../lib/emailReportsService';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import { PencilIcon, TrashIcon, PlusIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';

const EmailReports = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [emailReports, setEmailReports] = useState([]);
  const [editingEmailId, setEditingEmailId] = useState(null);
  const [newEmail, setNewEmail] = useState({
    email: '',
    is_active: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Check authentication and privileges
  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError('No permission');
      setLoading(false);
      return;
    }

    if (authData.privilege_ids?.includes(1) || authData.privilege_ids?.includes(5000)) {
      setHasPrivilege(true);
    } else {
      setError('No permission');
      setLoading(false);
    }
  }, [authData, authLoading]);

  // Fetch email reports
  const fetchData = async () => {
    if (!hasPrivilege) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const emailReportsData = await emailReportsService.getEmailReports();
      setEmailReports(emailReportsData);
      setError('');
    } catch (err) {
      console.error('Error fetching email reports:', err);
      setError(err.message || 'Failed to fetch email reports');
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
      setError('No permission');
      return;
    }

    setIsCreating(true);
    setNewEmail({
      email: '',
      is_active: true,
    });
    setEditingEmailId(null);
  };

  // Handle edit
  const handleEdit = (emailId) => {
    if (!hasPrivilege) {
      setError('No permission');
      return;
    }

    const emailReport = emailReports.find((e) => e._id === emailId);
    if (emailReport) {
      setEditingEmailId(emailId);
      setNewEmail({
        email: emailReport.email,
        is_active: emailReport.is_active,
      });
      setIsCreating(false);
    }
  };

  // Handle save new
  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) return;

    if (!newEmail.email) {
      setError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await emailReportsService.createEmailReport({
        email: newEmail.email,
        is_active: newEmail.is_active,
      });
      setIsCreating(false);
      setNewEmail({ email: '', is_active: true });
      fetchData();
      setSuccess('Email report created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating email report:', err);
      setError(err.message || 'Failed to create email report');
    }
  };

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) return;

    if (!newEmail.email) {
      setError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await emailReportsService.updateEmailReport(editingEmailId, {
        email: newEmail.email,
        is_active: newEmail.is_active,
      });
      setEditingEmailId(null);
      setNewEmail({ email: '', is_active: true });
      fetchData();
      setSuccess('Email report updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating email report:', err);
      setError(err.message || 'Failed to update email report');
    }
  };

  // Handle delete
  const handleDelete = async (emailId) => {
    if (!hasPrivilege) return;

    if (window.confirm('Are you sure you want to delete this email report?')) {
      try {
        await emailReportsService.deleteEmailReport(emailId);
        fetchData();
        setSuccess('Email report deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Error deleting email report:', err);
        setError(err.message || 'Failed to delete email report');
      }
    }
  };

  // Cancel edit/create
  const handleCancel = () => {
    setIsCreating(false);
    setEditingEmailId(null);
    setNewEmail({ email: '', is_active: true });
    setError('');
  };

  // Filter data
  const filteredEmails = useMemo(() => {
    let filtered = [...emailReports];

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((email) => email.is_active.toString() === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((email) => 
        (email.email || '').toLowerCase().includes(lowerSearch)
      );
    }

    return filtered;
  }, [emailReports, statusFilter, searchTerm]);

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!hasPrivilege) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main>
            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">{error || 'You do not have permission to access this page'}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Header */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold flex items-center gap-2">
                  <EnvelopeIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  Email Reports
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Manage email addresses that receive PDF reports
                </p>
              </div>
              <button
                onClick={initiateCreate}
                className="btn bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Email
              </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200">{success}</p>
              </div>
            )}
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Create/Edit Form */}
            {(isCreating || editingEmailId) && (
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                  {editingEmailId ? 'Edit Email Report' : 'Add New Email Report'}
                </h2>
                <form onSubmit={editingEmailId ? handleUpdate : handleSaveNew}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={newEmail.email}
                        onChange={(e) => setNewEmail({ ...newEmail, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        placeholder="example@domain.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={newEmail.is_active ? 'true' : 'false'}
                        onChange={(e) => setNewEmail({ ...newEmail, is_active: e.target.value === 'true' })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      className="btn bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                      {editingEmailId ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn bg-gray-500 hover:bg-gray-600 text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Email
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Search by email..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Email Reports Table */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center">
                          <LoadingSpinner />
                        </td>
                      </tr>
                    ) : filteredEmails.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          {searchTerm || statusFilter ? 'No email reports found matching your filters' : 'No email reports found. Click "Add Email" to create one.'}
                        </td>
                      </tr>
                    ) : (
                      filteredEmails.map((emailReport) => (
                        <tr key={emailReport._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {emailReport.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                emailReport.is_active
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            >
                              {emailReport.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {emailReport.created_date
                              ? new Date(emailReport.created_date).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(emailReport._id)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                title="Edit"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(emailReport._id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Only active email addresses will receive PDF reports. 
                The Location Rating Dashboard PDF reports will be sent to all active email addresses configured here.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmailReports;
















