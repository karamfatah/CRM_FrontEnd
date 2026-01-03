/* import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { checklistService } from '../../lib/service_checklist';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';

const ChecklistQuery = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [checklists, setChecklists] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);

  // Check authentication and privileges
  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('checklists.no_permission'));
      setLoading(false);
      return;
    }

    if (authData.privilege_ids.includes(1)) {
      setHasPrivilege(true);
    } else {
      setError(t('checklists.no_permission'));
      setHasPrivilege(false);
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  // Fetch checklists
  const fetchChecklists = async () => {
    if (!authData?.org_id || !hasPrivilege) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await checklistService.getChecklists(authData.org_id, language);
      setChecklists(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching checklists:', err.message);
      setError(t('checklists.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && authData?.org_id && hasPrivilege) {
      fetchChecklists();
    }
  }, [authData?.org_id, hasPrivilege, authLoading, language, t]);

  // Group checklists by date, location QA, section QA, and checklist type
  const groupChecklists = () => {
    const grouped = {};

    checklists.forEach((checklist) => {
      const createdAt = checklist.created_at || 'N/A';
      const date = createdAt !== 'N/A' ? createdAt.split('T')[0] : t('checklists.unknown_date');
      const locationQa = checklist.qa_location || t('checklists.unknown_location_qa');
      const sectionQa = checklist.qa_section || t('checklists.unknown_section_qa');
      const checklistType = checklist.checklist_type || t('checklists.unknown_type');

      if (!grouped[date]) grouped[date] = {};
      if (!grouped[date][locationQa]) grouped[date][locationQa] = {};
      if (!grouped[date][locationQa][sectionQa]) grouped[date][locationQa][sectionQa] = {};
      if (!grouped[date][locationQa][sectionQa][checklistType]) {
        grouped[date][locationQa][sectionQa][checklistType] = [];
      }
      grouped[date][locationQa][sectionQa][checklistType].push(checklist);
    });

    return grouped;
  };

  // Calculate overall score for a group of checklists
  const calculateGroupScore = (groupItems) => {
    let totalMatching = 0;
    let totalItems = 0;

    groupItems.forEach((checklist) => {
      const checklistItems = checklist.checklist_items || [];
      checklistItems.forEach((item) => {
        if (item.status === 'matching') {
          totalMatching++;
        }
        totalItems++;
      });
    });

    const percentage = totalItems > 0 ? (totalMatching / totalItems) * 100 : 0;
    return { matching: totalMatching, total: totalItems, percentage };
  };

  if (authLoading || !authData) {
    return <LoadingSpinner />;
  }

  const groupedChecklists = groupChecklists();

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
                  {t('checklists.title')}
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <LanguageToggle />
                <ModalSearch />
                <ThemeToggle />
              </div>
            </div>

            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
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
            ) : Object.keys(groupedChecklists).length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300">{t('checklists.no_checklists')}</div>
            ) : (
              Object.keys(groupedChecklists).map((date) => (
                <div key={date} className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">{date}</h2>
                  {Object.keys(groupedChecklists[date]).map((locationQa) => (
                    <div key={locationQa} className="ml-4 mb-6">
                      <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-3 border-b border-gray-300 dark:border-gray-600 pb-1">
                        {locationQa}
                      </h3>
                      {Object.keys(groupedChecklists[date][locationQa]).map((sectionQa) => (
                        <div key={sectionQa} className="ml-6 mb-4">
                          <h4 className="text-md font-medium text-gray-500 dark:text-gray-400 mb-2 border-b border-gray-300 dark:border-gray-600 pb-1">
                            {sectionQa}
                          </h4>
                          {Object.keys(groupedChecklists[date][locationQa][sectionQa]).map((checklistType) => {
                            const groupItems = groupedChecklists[date][locationQa][sectionQa][checklistType];
                            const groupScore = calculateGroupScore(groupItems);
                            const isGoodScore = groupScore.percentage >= 50;
                            return (
                              <div key={checklistType} className="ml-6 mb-4">
                                <div className="flex items-center mb-3">
                                  <svg
                                    className={`w-6 h-6 mr-2 ${isGoodScore ? 'text-green-500' : 'text-red-500'}`}
                                    fill="currentColor"
                                    viewBox={isGoodScore ? "0 0 20 20" : "0 0 24 24"}
                                  >
                                    {isGoodScore ? (
                                      <path d="M10 15.172l-4.95-4.95 1.414-1.414L10 12.343l3.536-3.536 1.414 1.414L10 15.172z" />
                                    ) : (
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4-10h-2v2h-2v-2H8V8h2V6h2v2h2v2z" />
                                    )}
                                  </svg>
                                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                                    {checklistType}
                                  </span>
                                  <div className="flex-1 mx-4 h-1 bg-gray-300 dark:bg-gray-600 rounded">
                                    <div
                                      className={`h-1 rounded ${isGoodScore ? 'bg-green-500' : 'bg-red-500'}`}
                                      style={{ width: `${groupScore.percentage}%` }}
                                    />
                                  </div>
                                  <span className={`text-sm font-semibold ${isGoodScore ? 'text-green-500' : 'text-red-500'}`}>
                                    {groupScore.percentage.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ml-4">
                                  {groupItems.map((checklist) => (
                                    <div
                                      key={checklist.id}
                                      className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
                                      role="region"
                                      aria-label={`Checklist ID: ${checklist.id}`}
                                    >
                                      <div className="space-y-4">
                                        <div>
                                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                            {t('checklists.checklist_type')}
                                          </span>
                                          <p className="text-gray-800 dark:text-gray-100 font-semibold">
                                            {checklist.checklist_type || 'N/A'}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                            {t('checklists.created_at')}
                                          </span>
                                          <p className="text-gray-800 dark:text-gray-100">
                                            {checklist.created_at || 'N/A'}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                            {t('checklists.cooperation_rate')}
                                          </span>
                                          <p className="text-gray-800 dark:text-gray-100">
                                            {checklist.cooperation_rate ? `${checklist.cooperation_rate}%` : 'N/A'}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                            {t('checklists.user_uploaded')}
                                          </span>
                                          <p className="text-gray-800 dark:text-gray-100">
                                            {checklist.user_uploaded || 'N/A'}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                            {t('checklists.overall_score')}
                                          </span>
                                          <p className={`font-semibold ${overallScore.percentage >= 70 ? 'text-green-500' : overallScore.percentage >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
                                            {overallScore.percentage.toFixed(1)}%
                                          </p>
                                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                            <div
                                              className={`h-2.5 rounded-full ${overallScore.percentage >= 70 ? 'bg-green-500' : overallScore.percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                                              style={{ width: `${overallScore.percentage}%` }}
                                            />
                                          </div>
                                          <p className="text-gray-800 dark:text-gray-100 text-sm mt-1">
                                            {t('checklists.matching_items')}: {overallScore.matching} / {overallScore.total}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="mt-4">
                                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                          {t('checklists.checklist_details')}
                                        </span>
                                        {checklist.checklist_items && checklist.checklist_items.length > 0 ? (
                                          checklist.checklist_items.map((item, idx) => {
                                            const itemScore = _calculateClassificationScore([item], localizations);
                                            return (
                                              <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mt-2">
                                                <p className="text-gray-800 dark:text-gray-100 font-semibold">
                                                  {item.checklist_point_name || 'N/A'}
                                                </p>
                                                <div className="flex items-center mt-2">
                                                  <svg
                                                    className={`w-5 h-5 mr-2 ${itemScore.matching === itemScore.total ? 'text-green-500' : itemScore.matching > 0 ? 'text-orange-500' : 'text-red-500'}`}
                                                    fill="currentColor"
                                                    viewBox={itemScore.matching === itemScore.total ? "0 0 20 20" : itemScore.matching > 0 ? "0 0 24 24" : "0 0 24 24"}
                                                  >
                                                    {itemScore.matching === itemScore.total ? (
                                                      <path d="M10 15.172l-4.95-4.95 1.414-1.414L10 12.343l3.536-3.536 1.414 1.414L10 15.172z" />
                                                    ) : itemScore.matching > 0 ? (
                                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4-10h-2v2h-2v-2H8V8h2V6h2v2h2v2z" />
                                                    ) : (
                                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2H9v2H7v-2h2v-2h2v2h2v2zm0-4H7V7h6v6z" />
                                                    )}
                                                  </svg>
                                                  <span className="text-gray-800 dark:text-gray-100">
                                                    {t('checklists.score')}: {itemScore.matching} / {itemScore.total}
                                                  </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                                  <div
                                                    className={`h-2.5 rounded-full ${itemScore.matching === itemScore.total ? 'bg-green-500' : itemScore.matching > 0 ? 'bg-orange-500' : 'bg-red-500'}`}
                                                    style={{ width: `${itemScore.total > 0 ? (itemScore.matching / itemScore.total) * 100 : 0}%` }}
                                                  />
                                                </div>
                                                <div className="flex items-center mt-2">
                                                  <svg
                                                    className={`w-5 h-5 mr-2 ${item.status === 'matching' ? 'text-green-500' : 'text-red-500'}`}
                                                    fill="currentColor"
                                                    viewBox={item.status === 'matching' ? "0 0 20 20" : "0 0 20 20"}
                                                  >
                                                    {item.status === 'matching' ? (
                                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    ) : (
                                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    )}
                                                  </svg>
                                                  <div className="space-y-1">
                                                    <p className="text-gray-800 dark:text-gray-100">
                                                      <span className="text-gray-500 dark:text-gray-400">{t('checklists.classification_name')}: </span>
                                                      {item.classification_name || 'N/A'}
                                                    </p>
                                                    <p className="text-gray-800 dark:text-gray-100">
                                                      <span className="text-gray-500 dark:text-gray-400">{t('checklists.status')}: </span>
                                                      {item.status || 'N/A'}
                                                    </p>
                                                    {item.inspection_notes && (
                                                      <p className="text-gray-800 dark:text-gray-100">
                                                        <span className="text-gray-500 dark:text-gray-400">{t('checklists.inspection_notes')}: </span>
                                                        {item.inspection_notes}
                                                      </p>
                                                    )}
                                                    {item.corrective_action && (
                                                      <p className="text-gray-800 dark:text-gray-100">
                                                        <span className="text-gray-500 dark:text-gray-400">{t('checklists.corrective_action')}: </span>
                                                        {item.corrective_action}
                                                      </p>
                                                    )}
                                                    {item.corrective_action_date && (
                                                      <p className="text-gray-800 dark:text-gray-100">
                                                        <span className="text-gray-500 dark:text-gray-400">{t('checklists.corrective_action_date')}: </span>
                                                        {item.corrective_action_date}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                                {item.images && item.images.length > 0 && (
                                                  <div className="mt-4">
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                                      {t('checklists.item_images')}
                                                    </span>
                                                    <div className="flex overflow-x-auto space-x-2 mt-2">
                                                      {item.images.map((image, imgIdx) => (
                                                        <img
                                                          key={imgIdx}
                                                          src={image.image_base64}
                                                          alt={`Checklist Item Image ${imgIdx + 1}`}
                                                          className="w-20 h-20 object-cover rounded"
                                                          onError={(e) => {
                                                            e.target.src = 'path/to/fallback-image.png'; // Fallback image
                                                            e.target.alt = 'Failed to load image';
                                                          }}
                                                        />
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })
                                        ) : (
                                          <p className="text-gray-800 dark:text-gray-100 italic">
                                            {t('checklists.no_selections_made_yet')}
                                          </p>
                                        )}
                                      </div>
                                      {checklist.sign_image && (
                                        <div className="mt-4">
                                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                            {t('checklists.signature')}
                                          </span>
                                          <img
                                            src={checklist.sign_image}
                                            alt="Signature"
                                            className="w-20 h-20 object-contain rounded mt-2"
                                            onError={(e) => {
                                              e.target.src = 'path/to/fallback-image.png'; // Fallback image
                                              e.target.alt = 'Failed to load signature';
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChecklistQuery; */