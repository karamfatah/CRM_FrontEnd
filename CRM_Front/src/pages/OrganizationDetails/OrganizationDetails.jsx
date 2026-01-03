import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { orgService } from '../../lib/orgService';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Save, 
  X, 
  Building2, 
  Globe, 
  Phone, 
  MapPin, 
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const OrganizationDetails = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orgData, setOrgData] = useState({
    org_id: '',
    org_name_en: '',
    org_name_ar: '',
    org_phone: '',
    org_address: '',
    org_website: '',
    chat_webhook_url: '',
    country_id: '',
    org_logo: null,
  });
  const [originalOrgData, setOriginalOrgData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (!authData?.org_id) {
      setError('Organization ID not found. Please log in again.');
      setLoading(false);
      return;
    }
    fetchOrganizationDetails();
    fetchCountries();
  }, [authData, authLoading]);

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const orgId = authData?.org_id;
      if (!orgId) {
        throw new Error('Organization ID is missing. Please log in again.');
      }
      
      console.log('Fetching organization details for org_id:', orgId);
      const data = await orgService.getOrg(orgId);
      
      if (!data || !data.org_id) {
        throw new Error('Invalid organization data received from server');
      }
      
      setOrgData({
        org_id: data.org_id.toString(),
        org_name_en: data.org_name_en || '',
        org_name_ar: data.org_name_ar || '',
        org_phone: data.org_phone || '',
        org_address: data.org_address || '',
        org_website: data.org_website || '',
        chat_webhook_url: data.chat_webhook_url || '',
        country_id: data.country_id ? data.country_id.toString() : '',
        org_logo: null,
      });
      
      setOriginalOrgData({
        org_id: data.org_id.toString(),
        org_name_en: data.org_name_en || '',
        org_name_ar: data.org_name_ar || '',
        org_phone: data.org_phone || '',
        org_address: data.org_address || '',
        org_website: data.org_website || '',
        chat_webhook_url: data.chat_webhook_url || '',
        country_id: data.country_id ? data.country_id.toString() : '',
      });

      // Fetch logo if exists
      if (data.org_logo) {
        try {
          const token = localStorage.getItem('access_token');
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orgs/${data.org_id}/logo`, {
            headers: { 'x-access-tokens': token },
          });
          if (response.ok) {
            const blob = await response.blob();
            setLogoUrl(URL.createObjectURL(blob));
          }
        } catch (err) {
          console.error('Failed to fetch logo:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching organization details:', err);
      setError(err.message || 'Failed to load organization details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const data = await orgService.getCountries();
      setCountries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setOrgData(prev => ({ ...prev, [field]: value }));
    setSuccess('');
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Logo file size must be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
        setError('Only JPEG, JPG, PNG, and GIF images are allowed');
        return;
      }
      setOrgData(prev => ({ ...prev, org_logo: file }));
      // Preview new logo
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Use org_id from orgData (which was fetched from the database) instead of authData
      const orgIdToUpdate = orgData.org_id ? parseInt(orgData.org_id) : authData?.org_id;
      
      if (!orgIdToUpdate) {
        throw new Error('Organization ID is missing. Please refresh the page.');
      }

      console.log('Updating organization with ID:', orgIdToUpdate);

      const formData = new FormData();
      formData.append('org_name_en', orgData.org_name_en);
      formData.append('org_name_ar', orgData.org_name_ar);
      formData.append('org_phone', orgData.org_phone);
      formData.append('org_address', orgData.org_address);
      formData.append('org_website', orgData.org_website);
      formData.append('chat_webhook_url', orgData.chat_webhook_url);
      formData.append('country_id', orgData.country_id);
      
      if (orgData.org_logo) {
        formData.append('logo', orgData.org_logo);
      } else {
        formData.append('org_logo', originalOrgData?.org_logo || '');
      }

      await orgService.updateOrg(orgIdToUpdate, formData);
      
      setSuccess('Organization details updated successfully');
      setIsEditing(false);
      fetchOrganizationDetails(); // Refresh data
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating organization:', err);
      setError(err.message || 'Failed to update organization details');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalOrgData) {
      setOrgData({
        ...originalOrgData,
        org_logo: null,
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reset logo to original
    if (originalOrgData?.org_logo) {
      fetchOrganizationDetails();
    } else {
      setLogoUrl(null);
    }
  };

  const testWebhook = () => {
    if (orgData.chat_webhook_url) {
      window.open(orgData.chat_webhook_url, '_blank');
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-[#0b0b12] dark:via-[#1a1a2e] dark:to-[#0b0b12]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                    {t('org_details.title') || 'Organization Details'}
                  </h1>
                  <p className="text-gray-600 dark:text-white/70 mt-1">
                    {t('org_details.subtitle') || 'View and manage your organization information'}
                  </p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold hover:from-indigo-700 hover:to-fuchsia-700 transition-all shadow-lg"
                >
                  {t('org_details.edit') || 'Edit Details'}
                </button>
              )}
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Organization Details Form */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Organization ID - Read Only */}
                <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg">
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <Building2 className="h-4 w-4" />
                    {t('org_details.org_id') || 'Organization ID'}
                  </label>
                  <input
                    type="text"
                    value={orgData.org_id}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-white/50 mt-1">
                    {t('org_details.org_id_note') || 'Organization ID cannot be changed'}
                  </p>
                </div>

                {/* Organization Name (English) */}
                <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg">
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <Building2 className="h-4 w-4" />
                    {t('org_details.org_name_en') || 'Organization Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={orgData.org_name_en}
                    onChange={(e) => handleInputChange('org_name_en', e.target.value)}
                    disabled={!isEditing}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-white/5 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  />
                </div>

                {/* Organization Name (Arabic) */}
                <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg">
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <Building2 className="h-4 w-4" />
                    {t('org_details.org_name_ar') || 'Organization Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={orgData.org_name_ar}
                    onChange={(e) => handleInputChange('org_name_ar', e.target.value)}
                    disabled={!isEditing}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-white/5 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg">
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <Phone className="h-4 w-4" />
                    {t('org_details.org_phone') || 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={orgData.org_phone}
                    onChange={(e) => handleInputChange('org_phone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-white/5 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  />
                </div>

                {/* Address */}
                <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg">
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <MapPin className="h-4 w-4" />
                    {t('org_details.org_address') || 'Address'}
                  </label>
                  <input
                    type="text"
                    value={orgData.org_address}
                    onChange={(e) => handleInputChange('org_address', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-white/5 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Website */}
                <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg">
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <Globe className="h-4 w-4" />
                    {t('org_details.org_website') || 'Website'}
                  </label>
                  <input
                    type="url"
                    value={orgData.org_website}
                    onChange={(e) => handleInputChange('org_website', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-white/5 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  />
                </div>

                {/* Chat Webhook URL */}
                <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg">
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <LinkIcon className="h-4 w-4" />
                    {t('org_details.chat_webhook_url') || 'Chat Webhook URL'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={orgData.chat_webhook_url}
                      onChange={(e) => handleInputChange('chat_webhook_url', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://n8n.quantum-g.io/webhook/..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-white/5 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                    />
                    {orgData.chat_webhook_url && (
                      <button
                        type="button"
                        onClick={testWebhook}
                        disabled={!isEditing}
                        className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Test Webhook"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white/50 mt-1">
                    {t('org_details.webhook_note') || 'n8n webhook URL for AI customer chat'}
                  </p>
                </div>

                {/* Country */}
                <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg">
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <Globe className="h-4 w-4" />
                    {t('org_details.country') || 'Country'}
                  </label>
                  <select
                    value={orgData.country_id}
                    onChange={(e) => handleInputChange('country_id', e.target.value)}
                    disabled={!isEditing}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-white/5 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  >
                    <option value="">{t('org_details.select_country') || 'Select Country'}</option>
                    {countries.map((country) => (
                      <option key={country.country_id} value={country.country_id}>
                        {language === 'en' ? country.country_name_en : country.country_name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Logo */}
                <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg">
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-white/80">
                    <Building2 className="h-4 w-4" />
                    {t('org_details.org_logo') || 'Organization Logo'}
                  </label>
                  {logoUrl && (
                    <div className="mb-3">
                      <img
                        src={logoUrl}
                        alt="Organization Logo"
                        className="h-24 w-24 object-contain rounded-lg border border-gray-200 dark:border-white/10"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handleFileChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-white/5 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-fuchsia-500/50 transition-all"
                  />
                  <p className="text-xs text-gray-500 dark:text-white/50 mt-1">
                    {t('org_details.logo_note') || 'Max 5MB. JPEG, JPG, PNG, GIF only'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <X className="h-4 w-4 inline mr-2" />
                  {t('org_details.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold hover:from-indigo-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {saving ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      {t('org_details.saving') || 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 inline mr-2" />
                      {t('org_details.save') || 'Save Changes'}
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </main>
      </div>
    </div>
  );
};

export default OrganizationDetails;

