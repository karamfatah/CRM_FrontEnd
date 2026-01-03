import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { subSectionQaService } from '../../lib/subSectionQaService';
import { sectionQaService } from '../../lib/sectionQaService';
import { locationsQaService } from '../../lib/locationsQaService';
import { mainLocationService } from '../../lib/mainLocationService';
import ModalSearch from '../../components/ModalSearch';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import { PencilIcon, TrashIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';
import * as XLSX from 'xlsx';

const SubSectionQa = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [mainLocations, setMainLocations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sections, setSections] = useState([]);
  const [subSections, setSubSections] = useState([]);
  const [selectedMainLocation, setSelectedMainLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [editingSubSection, setEditingSubSection] = useState(null);
  const [newSubSection, setNewSubSection] = useState({
    section_qa_id: '',
    sub_section_en: '',
    sub_section_ar: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Check authentication and privileges
  useEffect(() => {
    if (authLoading) return;

    console.log('authData:', authData);

    if (!authData?.access_token) {
      setError(t('sub_sections.no_permission'));
      setLoading(false);
      return;
    }

    if (authData.privilege_ids.includes(1)) {
      setHasPrivilege(true);
    } else {
      setError(t('sub_sections.no_permission'));
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  // Fetch main locations
  const fetchMainLocations = async () => {
    if (!authData?.org_id || !hasPrivilege) {
      console.log('Skipping fetchMainLocations: missing org_id or privilege');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await mainLocationService.getMainLocations(authData.org_id);
      console.log('Main locations:', data);
      setMainLocations(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selectedMainLocation) {
        setSelectedMainLocation(data[0].id.toString());
      }
      setError('');
    } catch (err) {
      console.error('Error fetching main locations:', err.message);
      setError(err.message || t('sub_sections.fetch_main_locations_error'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch locations
  const fetchLocations = async (mainLocationId) => {
    if (!authData?.org_id || !hasPrivilege || !mainLocationId) {
      console.log('Skipping fetchLocations: missing org_id, privilege, or mainLocationId');
      setLocations([]);
      setSelectedLocation('');
      return;
    }

    try {
      const data = await locationsQaService.getLocations(authData.org_id, mainLocationId);
      console.log('Locations:', data);
      setLocations(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selectedLocation) {
        setSelectedLocation(data[0].locations_qa_id.toString());
      } else {
        setSelectedLocation('');
      }
      setError('');
    } catch (err) {
      console.error('Error fetching locations:', err.message);
      setError(err.message || t('sub_sections.fetch_locations_error'));
    }
  };

  // Fetch sections
  const fetchSections = async (locationsQaId) => {
    if (!authData?.org_id || !hasPrivilege || !locationsQaId) {
      console.log('Skipping fetchSections: missing org_id, privilege, or locationsQaId');
      setSections([]);
      setSelectedSection('');
      return;
    }

    try {
      const data = await sectionQaService.getSections(authData.org_id, locationsQaId);
      console.log('Sections:', data);
      setSections(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selectedSection) {
        setSelectedSection(data[0].section_qa_id.toString());
      } else {
        setSelectedSection('');
      }
      setError('');
    } catch (err) {
      console.error('Error fetching sections:', err.message);
      setError(err.message || t('sub_sections.fetch_sections_error'));
    }
  };

  // Fetch sub-sections
  const fetchSubSections = async (sectionQaId) => {
    if (!authData?.org_id || !hasPrivilege || !sectionQaId) {
      console.log('Skipping fetchSubSections: missing org_id, privilege, or sectionQaId');
      setSubSections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching sub-sections with org_id:', authData.org_id, 'and section_qa_id:', sectionQaId);
      const data = await subSectionQaService.getSubSections(authData.org_id, sectionQaId);
      console.log('Sub-sections:', data);
      setSubSections(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching sub-sections:', err.message);
      setError(err.message || t('sub_sections.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPrivilege && authData?.org_id) {
      fetchMainLocations();
    }
  }, [authData, hasPrivilege, t]);

  useEffect(() => {
    if (selectedMainLocation) {
      fetchLocations(selectedMainLocation);
    }
  }, [selectedMainLocation, authData, hasPrivilege, t]);

  useEffect(() => {
    if (selectedLocation) {
      fetchSections(selectedLocation);
    }
  }, [selectedLocation, authData, hasPrivilege, t]);

  useEffect(() => {
    if (selectedSection) {
      fetchSubSections(selectedSection);
    }
  }, [selectedSection, authData, hasPrivilege, t]);

  // Handle edit
  const handleEdit = async (subSection) => {
    if (!hasPrivilege) {
      setError(t('sub_sections.no_permission'));
      return;
    }

    try {
      const data = await subSectionQaService.getSubSection(
        subSection.sub_section_qa_id,
        authData.org_id,
        subSection.section_qa_id
      );
      setEditingSubSection(subSection);
      setNewSubSection({
        section_qa_id: data.section_qa_id.toString(),
        sub_section_en: data.sub_section_en,
        sub_section_ar: data.sub_section_ar,
      });
    } catch (err) {
      console.error('Error fetching sub-section for edit:', err.message);
      setError(err.message || t('sub_sections.fetch_edit_error'));
    }
  };

  // Handle create
  const initiateCreate = () => {
    if (!hasPrivilege) {
      setError(t('sub_sections.no_permission'));
      return;
    }

    if (sections.length === 0) {
      setError(t('sub_sections.no_sections_available'));
      return;
    }

    setIsCreating(true);
    setIsBulkUpload(false);
    setFile(null);
    setNewSubSection({
      section_qa_id: selectedSection || sections[0]?.section_qa_id.toString() || '',
      sub_section_en: '',
      sub_section_ar: '',
    });
  };

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('sub_sections.no_permission'));
      return;
    }

    try {
      await subSectionQaService.updateSubSection(
        editingSubSection.sub_section_qa_id,
        {
          sub_section_en: newSubSection.sub_section_en,
          sub_section_ar: newSubSection.sub_section_ar,
        },
        authData.org_id
      );
      setEditingSubSection(null);
      setNewSubSection({ section_qa_id: selectedSection || '', sub_section_en: '', sub_section_ar: '' });
      fetchSubSections(selectedSection);
      setSuccess(t('sub_sections.update_success'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating sub-section:', err.message);
      setError(err.message || t('sub_sections.update_error'));
    }
  };

  // Handle save new
  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('sub_sections.no_permission'));
      return;
    }

    if (!newSubSection.section_qa_id) {
      setError(t('sub_sections.section_required'));
      return;
    }

    if (isBulkUpload) {
      if (!file) {
        setError(t('sub_sections.file_required'));
        return;
      }

      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          if (!event.target || !event.target.result) {
            setError('Failed to read the file.');
            return;
          }

          try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            if (jsonData.length === 0) {
              setError(t('sub_sections.empty_file'));
              return;
            }

            const requiredColumns = ['sub_section_en', 'sub_section_ar'];
            const missingColumns = requiredColumns.filter(col => !Object.keys(jsonData[0]).includes(col));
            if (missingColumns.length > 0) {
              setError(t('sub_sections.missing_columns', { columns: missingColumns.join(', ') }));
              return;
            }

            const bulkData = jsonData.map(row => ({
              section_qa_id: newSubSection.section_qa_id,
              sub_section_en: row.sub_section_en,
              sub_section_ar: row.sub_section_ar,
            }));

            await subSectionQaService.bulkCreateSubSections(bulkData, authData.org_id);
            setIsCreating(false);
            setFile(null);
            setNewSubSection({ section_qa_id: selectedSection || '', sub_section_en: '', sub_section_ar: '' });
            fetchSubSections(selectedSection);
            setSuccess(t('sub_sections.bulk_create_success'));
            setTimeout(() => setSuccess(''), 3000);
          } catch (err) {
            console.error('Error parsing file:', err.message);
            setError(err.message || t('sub_sections.file_parse_error'));
          }
        };
        reader.onerror = () => {
          setError('Error reading the file.');
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        console.error('Error processing file:', err.message);
        setError('An unexpected error occurred during file processing.');
      }
    } else {
      if (!newSubSection.sub_section_en || !newSubSection.sub_section_ar) {
        setError(t('sub_sections.missing_fields_error'));
        return;
      }

      try {
        await subSectionQaService.createSubSection(
          {
            section_qa_id: newSubSection.section_qa_id,
            sub_section_en: newSubSection.sub_section_en,
            sub_section_ar: newSubSection.sub_section_ar,
          },
          authData.org_id
        );
        setIsCreating(false);
        setNewSubSection({ section_qa_id: selectedSection || '', sub_section_en: '', sub_section_ar: '' });
        fetchSubSections(selectedSection);
        setSuccess(t('sub_sections.create_success'));
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Error creating sub-section:', err.message);
        setError(err.message || t('sub_sections.create_error'));
      }
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!hasPrivilege) {
      setError(t('sub_sections.no_permission'));
      return;
    }

    if (window.confirm(t('sub_sections.delete_confirm'))) {
      try {
        await subSectionQaService.deleteSubSection(id, authData.org_id);
        fetchSubSections(selectedSection);
        setSuccess(t('sub_sections.delete_success'));
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Error deleting sub-section:', err.message);
        setError(err.message || t('sub_sections.delete_error'));
      }
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(subSections.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedSubSections = subSections.slice(start, end);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
                  {t('sub_sections.title')}
                </h1>
                <div className="grid grid-flow-col sm:auto-cols-max justify-start gap-2 mt-4">
                  <select
                    value={selectedMainLocation}
                    onChange={(e) => {
                      setSelectedMainLocation(e.target.value);
                      setSelectedLocation('');
                      setSelectedSection('');
                      setCurrentPage(1);
                    }}
                    className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    aria-label={t('sub_sections.main_location')}
                  >
                    <option value="" disabled>
                      {t('sub_sections.select_main_location')}
                    </option>
                    {mainLocations.map((ml) => (
                      <option key={ml.id} value={ml.id}>
                        {language === 'en' ? ml.main_location_name_en : ml.main_location_ar}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedLocation}
                    onChange={(e) => {
                      setSelectedLocation(e.target.value);
                      setSelectedSection('');
                      setCurrentPage(1);
                    }}
                    className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    aria-label={t('sub_sections.location')}
                    disabled={locations.length === 0}
                  >
                    <option value="" disabled>
                      {t('sub_sections.select_location')}
                    </option>
                    {locations.map((loc) => (
                      <option key={loc.locations_qa_id} value={loc.locations_qa_id}>
                        {language === 'en' ? loc.location_en : loc.location_ar}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedSection}
                    onChange={(e) => {
                      setSelectedSection(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    aria-label={t('sub_sections.section_qa')}
                    disabled={sections.length === 0}
                  >
                    <option value="" disabled>
                      {t('sub_sections.select_section')}
                    </option>
                    {sections.map((sec) => (
                      <option key={sec.section_qa_id} value={sec.section_qa_id}>
                        {language === 'en' ? sec.section_en : sec.section_ar}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {hasPrivilege && (
                  <button
                    onClick={initiateCreate}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                    disabled={sections.length === 0}
                  >
                    {t('sub_sections.add_sub_section')}
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
            ) : subSections.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300">{t('sub_sections.no_sub_sections')}</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedSubSections.map((subSection) => (
                    <div
                      key={subSection.sub_section_qa_id}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
                      role="region"
                      aria-label={`${t('sub_sections.sub_section_name')}: ${language === 'en' ? subSection.sub_section_en : subSection.sub_section_ar}`}
                    >
                      <div className="space-y-4">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            {t('sub_sections.section_qa')}
                          </span>
                          <p className="text-gray-800 dark:text-gray-100 font-semibold">
                            {sections.find(sec => sec.section_qa_id === subSection.section_qa_id)?.[language === 'en' ? 'section_en' : 'section_ar'] || t('sub_sections.not_assigned')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            {t('sub_sections.sub_section_name')}
                          </span>
                          <p className="text-gray-800 dark:text-gray-100 font-semibold">
                            {language === 'en' ? subSection.sub_section_en : subSection.sub_section_ar || t('sub_sections.unknown')}
                          </p>
                        </div>
                      </div>
                      {hasPrivilege && (
                        <div className="flex justify-end gap-3 mt-4">
                          <button
                            onClick={() => handleEdit(subSection)}
                            className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
                            aria-label={t('sub_sections.edit')}
                          >
                            <PencilIcon className="w-4 h-4 mr-1" />
                            {t('sub_sections.edit')}
                          </button>
                          <button
                            onClick={() => handleDelete(subSection.sub_section_qa_id)}
                            className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                            aria-label={t('sub_sections.delete')}
                          >
                            <TrashIcon className="w-4 h-4 mr-1" />
                            {t('sub_sections.delete')}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {currentPage > 1 && (
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                      >
                        {t('sub_sections.previous')}
                      </button>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`${
                          page === currentPage ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'
                        } hover:bg-indigo-600 font-bold py-2 px-4 rounded`}
                        disabled={page === currentPage}
                      >
                        {page}
                      </button>
                    ))}
                    {currentPage < totalPages && (
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                      >
                        {t('sub_sections.next')}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {(editingSubSection || isCreating) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    {isCreating ? t('sub_sections.add_title') : t('sub_sections.edit_title')}
                  </h2>
                  <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
                    {isCreating && (
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="upload_mode">
                          {t('sub_sections.upload_mode')}
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="uploadMode"
                              checked={!isBulkUpload}
                              onChange={() => setIsBulkUpload(false)}
                              className="form-radio h-4 w-4 text-indigo-500 transition duration-200"
                            />
                            <span className="text-gray-700 dark:text-gray-300">{t('sub_sections.manual_entry')}</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="uploadMode"
                              checked={isBulkUpload}
                              onChange={() => {
                                setIsBulkUpload(true);
                                setNewSubSection({ ...newSubSection, sub_section_en: '', sub_section_ar: '' });
                              }}
                              className="form-radio h-4 w-4 text-indigo-500 transition duration-200"
                            />
                            <span className="text-gray-700 dark:text-gray-300">{t('sub_sections.bulk_upload')}</span>
                          </label>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="section_qa_id">
                        {t('sub_sections.section_qa')}
                      </label>
                      <select
                        id="section_qa_id"
                        value={newSubSection.section_qa_id}
                        onChange={(e) => setNewSubSection({ ...newSubSection, section_qa_id: e.target.value })}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                        disabled={!isCreating}
                        aria-label={t('sub_sections.section_qa')}
                      >
                        <option value="" disabled>
                          {t('sub_sections.select_section')}
                        </option>
                        {sections.map((sec) => (
                          <option key={sec.section_qa_id} value={sec.section_qa_id}>
                            {language === 'en' ? sec.section_en : sec.section_ar}
                          </option>
                        ))}
                      </select>
                    </div>
                    {isCreating && isBulkUpload ? (
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="file_upload">
                          {t('sub_sections.upload_file')}
                        </label>
                        <div className="flex items-center">
                          <input
                            type="file"
                            id="file_upload"
                            accept=".xlsx"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          />
                          <DocumentArrowUpIcon className="w-6 h-6 ml-2 text-gray-500 dark:text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {t('sub_sections.upload_instruction')}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="sub_section_en">
                            {t('sub_sections.sub_section_name_en')}
                          </label>
                          <input
                            type="text"
                            id="sub_section_en"
                            value={newSubSection.sub_section_en}
                            onChange={(e) => setNewSubSection({ ...newSubSection, sub_section_en: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="sub_section_ar">
                            {t('sub_sections.sub_section_name_ar')}
                          </label>
                          <input
                            type="text"
                            id="sub_section_ar"
                            value={newSubSection.sub_section_ar}
                            onChange={(e) => setNewSubSection({ ...newSubSection, sub_section_ar: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                      </>
                    )}
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSubSection(null);
                          setIsCreating(false);
                          setError('');
                          setFile(null);
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {t('sub_sections.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                        disabled={!newSubSection.section_qa_id || (isBulkUpload && !file)}
                      >
                        {isCreating ? t('sub_sections.create') : t('sub_sections.save')}
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

export default SubSectionQa;