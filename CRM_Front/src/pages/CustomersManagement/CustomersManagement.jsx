import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Users, Search, Phone, User, MapPin, Mail, Building,
  FileText, Edit2, Save, X, CheckCircle, AlertCircle,
  Clock, ShoppingBag, ChevronRight, Trash2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5030';

const CustomersManagement = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search state
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Selected customer state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: '',
    name: '',
    email: '',
    address: '',
    city: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const getToken = () => authData?.access_token || localStorage.getItem('access_token');

  // Search customers by phone
  const handleSearch = async () => {
    if (!searchPhone.trim()) {
      setError(t('customers_management.enter_phone'));
      return;
    }

    setSearchLoading(true);
    setError('');
    setHasSearched(true);
    setSelectedCustomer(null);

    try {
      const orgId = authData?.org_id || 1;
      const response = await fetch(
        `${API_URL}/api/customer-orders/customers?phone=${encodeURIComponent(searchPhone)}&org_id=${orgId}&per_page=50`,
        {
          headers: {
            'x-access-tokens': getToken(),
          },
        }
      );

      if (!response.ok) {
        throw new Error(t('customers_management.search_error'));
      }

      const data = await response.json();
      setSearchResults(data.data || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle Enter key in search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Select a customer to view/edit
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      phone: customer.phone || '',
      name: customer.name || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || '',
      notes: customer.notes || '',
    });
    setIsEditing(false);
  };

  // Handle edit form changes
  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Save customer changes
  const handleSaveCustomer = async () => {
    if (!editForm.phone.trim()) {
      setError(t('customers_management.phone_required'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(
        `${API_URL}/api/customer-orders/customers/${selectedCustomer.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-access-tokens': getToken(),
          },
          body: JSON.stringify(editForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('customers_management.save_error'));
      }

      setSuccess(t('customers_management.save_success'));
      setSelectedCustomer(data.data);
      setIsEditing(false);

      // Update in search results
      setSearchResults(prev =>
        prev.map(c => c.id === data.data.id ? data.data : c)
      );

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return t('common.na');
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-[#0b0b12] dark:via-[#1a1a2e] dark:to-[#0b0b12]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-4 md:p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  {t('customers_management.title')}
                </h1>
                <p className="text-gray-600 dark:text-white/70 text-sm">
                  {t('customers_management.subtitle')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <p className="text-green-600 dark:text-green-400 font-medium">{success}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                  <button
                    onClick={() => setError('')}
                    className="ml-auto p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <div className="p-6 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-500" />
                {t('customers_management.search_customer')}
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('customers_management.phone_placeholder')}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    dir="ltr"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50"
                >
                  {searchLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  {t('customers_management.search')}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search Results */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-5 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg h-full">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-500" />
                  {t('customers_management.results')}
                  {searchResults.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                      {searchResults.length}
                    </span>
                  )}
                </h2>

                {!hasSearched ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-white/50">
                    <Search className="h-12 w-12 mb-4 opacity-50" />
                    <p>{t('customers_management.enter_phone_to_search')}</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-white/50">
                    <Users className="h-12 w-12 mb-4 opacity-50" />
                    <p>{t('customers_management.no_customers_found')}</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {searchResults.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => handleSelectCustomer(customer)}
                        className={`w-full p-4 rounded-lg flex items-center gap-4 transition-all ${
                          selectedCustomer?.id === customer.id
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500'
                            : 'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'
                        }`}
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                          <User className="h-6 w-6" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {customer.name || t('customers_management.unknown')}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-white/60 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                          {customer.city && (
                            <div className="text-sm text-gray-400 dark:text-white/40 flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {customer.city}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Customer Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="p-5 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    {t('customers_management.customer_details')}
                  </h2>
                  {selectedCustomer && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      {t('customers_management.edit')}
                    </button>
                  )}
                </div>

                {!selectedCustomer ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-white/50">
                    <User className="h-12 w-12 mb-4 opacity-50" />
                    <p>{t('customers_management.select_customer')}</p>
                  </div>
                ) : isEditing ? (
                  /* Edit Form */
                  <div className="space-y-4">
                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                        <Phone className="h-4 w-4 inline mr-1" />
                        {t('customers_management.phone')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => handleEditChange('phone', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        dir="ltr"
                      />
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                        <User className="h-4 w-4 inline mr-1" />
                        {t('customers_management.name')}
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleEditChange('name', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                        <Mail className="h-4 w-4 inline mr-1" />
                        {t('customers_management.email')}
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleEditChange('email', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        dir="ltr"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                        <Building className="h-4 w-4 inline mr-1" />
                        {t('customers_management.city')}
                      </label>
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => handleEditChange('city', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        {t('customers_management.address')}
                      </label>
                      <textarea
                        value={editForm.address}
                        onChange={(e) => handleEditChange('address', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-white/80">
                        <FileText className="h-4 w-4 inline mr-1" />
                        {t('customers_management.notes')}
                      </label>
                      <textarea
                        value={editForm.notes}
                        onChange={(e) => handleEditChange('notes', e.target.value)}
                        rows={3}
                        placeholder={t('customers_management.notes_placeholder')}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveCustomer}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {t('customers_management.save')}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            phone: selectedCustomer.phone || '',
                            name: selectedCustomer.name || '',
                            email: selectedCustomer.email || '',
                            address: selectedCustomer.address || '',
                            city: selectedCustomer.city || '',
                            notes: selectedCustomer.notes || '',
                          });
                        }}
                        className="px-4 py-2.5 rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-colors"
                      >
                        {t('customers_management.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="space-y-4">
                    {/* Customer Header */}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl">
                          {selectedCustomer.name || t('customers_management.unknown')}
                        </h3>
                        <p className="opacity-90 flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {selectedCustomer.phone}
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-3">
                      {selectedCustomer.email && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                          <Mail className="h-5 w-5 text-gray-500 dark:text-white/60 mt-0.5" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-white/60">{t('customers_management.email')}</div>
                            <div className="text-gray-900 dark:text-white">{selectedCustomer.email}</div>
                          </div>
                        </div>
                      )}

                      {selectedCustomer.city && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                          <Building className="h-5 w-5 text-gray-500 dark:text-white/60 mt-0.5" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-white/60">{t('customers_management.city')}</div>
                            <div className="text-gray-900 dark:text-white">{selectedCustomer.city}</div>
                          </div>
                        </div>
                      )}

                      {selectedCustomer.address && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                          <MapPin className="h-5 w-5 text-gray-500 dark:text-white/60 mt-0.5" />
                          <div>
                            <div className="text-xs text-gray-500 dark:text-white/60">{t('customers_management.address')}</div>
                            <div className="text-gray-900 dark:text-white">{selectedCustomer.address}</div>
                          </div>
                        </div>
                      )}

                      {selectedCustomer.notes && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                          <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                          <div>
                            <div className="text-xs text-yellow-600 dark:text-yellow-400">{t('customers_management.notes')}</div>
                            <div className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedCustomer.notes}</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                        <Clock className="h-5 w-5 text-gray-500 dark:text-white/60 mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-white/60">{t('customers_management.registered')}</div>
                          <div className="text-gray-900 dark:text-white">{formatDate(selectedCustomer.created_at)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomersManagement;

