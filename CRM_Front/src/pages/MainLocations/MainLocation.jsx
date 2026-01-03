
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { mainLocationService } from '../../lib/mainLocationService';
import ModalSearch from '../../components/ModalSearch';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';

const MainLocation = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [mainLocations, setMainLocations] = useState([]);
  const [editingMainLocation, setEditingMainLocation] = useState(null);
  const [newMainLocation, setNewMainLocation] = useState({
    country_id: authData?.country_id || '',
    main_location_name_en: '',
    main_location_ar: '',
  });
  const [country, setCountry] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);

  // Check authentication and privileges
  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('main_locations.no_permission'));
      setLoading(false);
      return;
    }

    if (authData.privilege_ids.includes(1)) {
      setHasPrivilege(true);
    } else {
      setError(t('main_locations.no_permission'));
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  // Fetch country data
  useEffect(() => {
    if (!authData?.country_id) {
      setError(t('main_locations.no_country_id'));
      setLoading(false);
      return;
    }

    const fetchCountry = async () => {
      try {
        const countryData = await mainLocationService.getCountryById(authData.country_id);
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Fetched country:', countryData);
        }
        setCountry(countryData);
      } catch (err) {
        console.error('Error fetching country:', err.message);
        setError(err.message || t('main_locations.fetch_country_error'));
      }
    };

    fetchCountry();
  }, [authData, t]);

  // Fetch main locations
  const fetchMainLocations = async () => {
    if (!authData?.org_id || !hasPrivilege) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await mainLocationService.getMainLocations(authData.org_id);
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Fetched main locations:', data);
      }
      setMainLocations(data);
      setError('');
    } catch (err) {
      console.error('Error fetching main locations:', err.message);
      setError(err.message || t('main_locations.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPrivilege && authData?.org_id) {
      fetchMainLocations();
    }
  }, [authData, hasPrivilege]);

  // Handle edit
  const handleEdit = async (mainLocation) => {
    if (!hasPrivilege) {
      setError(t('main_locations.no_permission'));
      return;
    }

    try {
      const data = await mainLocationService.getMainLocation(mainLocation.id, authData.org_id);
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Fetched main location for edit:', data);
      }
      setEditingMainLocation(mainLocation);
      setNewMainLocation({
        country_id: authData.country_id,
        main_location_name_en: data.main_location_name_en,
        main_location_ar: data.main_location_ar,
      });
    } catch (err) {
      console.error('Error fetching main location for edit:', err.message);
      setError(err.message || t('main_locations.fetch_edit_error'));
    }
  };

  // Handle create
  const initiateCreate = () => {
    if (!hasPrivilege) {
      setError(t('main_locations.no_permission'));
      return;
    }

    if (!authData.country_id || isNaN(authData.country_id)) {
      setError(t('main_locations.invalid_country_id'));
      return;
    }

    setIsCreating(true);
    setNewMainLocation({
      country_id: Number(authData.country_id), // Ensure it's a number
      main_location_name_en: '',
      main_location_ar: '',
    });
  };

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) return;

    try {
      await mainLocationService.updateMainLocation(
        editingMainLocation.id,
        newMainLocation,
        authData.org_id
      );
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Updated main location:', editingMainLocation.id);
      }
      setEditingMainLocation(null);
      setNewMainLocation({ country_id: authData.country_id, main_location_name_en: '', main_location_ar: '' });
      fetchMainLocations();
    } catch (err) {
      console.error('Error updating main location:', err.message);
      setError(err.message || t('main_locations.update_error'));
    }
  };

  // Handle save new
  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) return;

    try {
      await mainLocationService.createMainLocation(newMainLocation, authData.org_id);
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Created new main location:', newMainLocation);
      }
      setIsCreating(false);
      setNewMainLocation({ country_id: authData.country_id, main_location_name_en: '', main_location_ar: '' });
      fetchMainLocations();
    } catch (err) {
      console.error('Error creating main location:', err.message);
      setError(err.message || t('main_locations.create_error'));
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!hasPrivilege) return;

    if (window.confirm(t('main_locations.delete_confirm'))) {
      try {
        await mainLocationService.deleteMainLocation(id, authData.org_id);
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Deleted main location:', id);
        }
        fetchMainLocations();
      } catch (err) {
        console.error('Error deleting main location:', err.message);
        setError(err.message || t('main_locations.delete_error'));
      }
    }
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
                  {t('main_locations.title')}
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {hasPrivilege && (
                  <button
                    onClick={initiateCreate}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                  >
                    {t('main_locations.add_main_location')}
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

            {loading ? (
              <LoadingSpinner />
            ) : mainLocations.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300">{t('main_locations.no_locations')}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mainLocations.map((mainLocation) => (
                  <div
                    key={mainLocation.id}
                    className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
                    role="region"
                    aria-label={`${t('main_locations.main_location_name')}: ${language === 'en' ? mainLocation.main_location_name_en : mainLocation.main_location_ar}`}
                  >
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                          {t('main_locations.country')}
                        </span>
                        <p className="text-gray-800 dark:text-gray-100 font-semibold">
                          {country?.country_name_en || t('common.loading')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                          {t('main_locations.main_location_name')}
                        </span>
                        <p className="text-gray-800 dark:text-gray-100 font-semibold">
                          {language === 'en' ? mainLocation.main_location_name_en : mainLocation.main_location_ar}
                        </p>
                      </div>
                    </div>
                    {hasPrivilege && (
                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={() => handleEdit(mainLocation)}
                          className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
                          aria-label={t('main_locations.edit')}
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          {t('main_locations.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(mainLocation.id)}
                          className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                          aria-label={t('main_locations.delete')}
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          {t('main_locations.delete')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {(editingMainLocation || isCreating) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    {isCreating ? t('main_locations.add_title') : t('main_locations.edit_title')}
                  </h2>
                  <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="country_id">
                        {t('main_locations.country')}
                      </label>
                      <select
                        id="country_id"
                        value={newMainLocation.country_id}
                        onChange={(e) => setNewMainLocation({ ...newMainLocation, country_id: e.target.value })}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        disabled
                        required
                      >
                        <option value={country?.country_id}>{country?.country_name_en}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="main_location_name_en">
                        {t('main_locations.main_location_name_en')}
                      </label>
                      <input
                        type="text"
                        id="main_location_name_en"
                        value={newMainLocation.main_location_name_en}
                        onChange={(e) => setNewMainLocation({ ...newMainLocation, main_location_name_en: e.target.value })}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="main_location_ar">
                        {t('main_locations.main_location_ar')}
                      </label>
                      <input
                        type="text"
                        id="main_location_ar"
                        value={newMainLocation.main_location_ar}
                        onChange={(e) => setNewMainLocation({ ...newMainLocation, main_location_ar: e.target.value })}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMainLocation(null);
                          setIsCreating(false);
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {t('main_locations.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {isCreating ? t('main_locations.create') : t('main_locations.save')}
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

export default MainLocation;