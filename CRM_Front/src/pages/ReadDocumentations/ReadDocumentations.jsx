import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import documentService from '../../lib/documentService';
import ModalSearch from '../../components/ModalSearch';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Custom arrows for the slider
const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full z-10 hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      aria-label="Previous Image"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
};

const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full z-10 hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      aria-label="Next Image"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

const ReadDocumentations = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageUrls, setImageUrls] = useState([]);
  const modalRef = useRef(null);
  const itemsPerPage = 6;

  // Check authentication
  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('documents.no_permission'));
      setLoading(false);
      return;
    }
  }, [authData, authLoading, t]);

  // Fetch documents
  const fetchDocuments = async () => {
    if (!authData?.org_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
      setFilteredDocuments(data);
      setError('');
    } catch (err) {
      setError(err.message || t('documents.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authData?.org_id) {
      fetchDocuments();
    }
  }, [authData, t]);

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = documents.filter(
      (doc) =>
        doc.app_name.toLowerCase().includes(query) ||
        doc.domain.toLowerCase().includes(query) ||
        (doc.description && doc.description.toLowerCase().includes(query))
    );
    setFilteredDocuments(filtered);
    setCurrentPage(1);
  };

  // Handle viewing a document
  const handleViewDocument = async (docId) => {
    try {
      const doc = await documentService.getDocument(docId);
      setSelectedDocument(doc);
      setActiveTab('details');

      // Fetch image URLs for the gallery
      if (doc.media_files && doc.media_files.length > 0) {
        const imageFiles = doc.media_files.filter(
          (media) =>
            media.mime_type.startsWith('image/') ||
            /\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(media.file_name)
        );
        const urls = await Promise.all(
          imageFiles.map(async (media) => {
            const url = await handleViewMedia(media.media_id);
            return { url, file_name: media.file_name };
          })
        );
        setImageUrls(urls.filter((item) => item.url));
      } else {
        setImageUrls([]);
      }

      // Focus the modal for accessibility
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } catch (err) {
      setError(err.message || t('documents.fetch_error'));
    }
  };

  // Handle downloading media
  const handleDownloadMedia = async (mediaId, fileName) => {
    try {
      const response = await documentService.downloadMedia(mediaId);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      setError(error.message || t('documents.download_error'));
    }
  };

  // Handle viewing media (for images)
  const handleViewMedia = async (mediaId) => {
    try {
      const blob = await documentService.viewMedia(mediaId);
      const url = window.URL.createObjectURL(blob);
      return url;
    } catch (error) {
      setError(error.message || t('documents.view_error'));
      return null;
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(start, end);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle keyboard navigation in modal
  const handleModalKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSelectedDocument(null);
      setImageUrls([]);
    }
  };

  // Slider settings (adjust infinite based on number of images)
  const sliderSettings = {
    dots: imageUrls.length > 1,
    infinite: imageUrls.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: imageUrls.length > 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    customPaging: (i) => (
      <button className="w-3 h-3 bg-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <span className="sr-only">{`Slide ${i + 1}`}</span>
      </button>
    ),
    dotsClass: "slick-dots custom-dots",
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
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl text-gray-800 dark:text-gray-100 font-bold tracking-tight">
                {t('documents.read_title')}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg">
                {t('documents.read_subtitle')}
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder={t('documents.search_placeholder')}
                  className="w-full py-3 px-4 pl-12 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  aria-label={t('documents.search_placeholder')}
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

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm relative mb-6" role="alert">
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
            ) : (
              <>
                {filteredDocuments.length === 0 ? (
                  <div className="text-center text-gray-600 dark:text-gray-300 py-12">
                    <svg
                      className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg">{t('documents.no_documents')}</p>
                  </div>
                ) : (
                  <>
                    {/* Document Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedDocuments.map((doc) => (
                        <div
                          key={doc.doc_id}
                          className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                          role="button"
                          aria-label={`${t('documents.document_name')}: ${doc.app_name}`}
                          onClick={() => handleViewDocument(doc.doc_id)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleViewDocument(doc.doc_id);
                            }
                          }}
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200">
                                {doc.app_name}
                              </h3>
                              {doc.media_files && doc.media_files.length > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                                  {doc.media_files.length} {t('documents.attachments')}
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                {t('documents.domain')}
                              </span>
                              <p className="text-gray-800 dark:text-gray-100">{doc.domain}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                {t('documents.description')}
                              </span>
                              <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                                {doc.description || t('documents.unknown')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-3 mt-8">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          aria-label={t('documents.previous')}
                        >
                          {t('documents.previous')}
                        </button>
                        <div className="flex gap-2">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-2 rounded-lg ${
                                page === currentPage
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                              aria-label={`Page ${page}`}
                              aria-current={page === currentPage ? 'page' : undefined}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          aria-label={t('documents.next')}
                        >
                          {t('documents.next')}
                        </button>
                        <select
                          value={currentPage}
                          onChange={(e) => handlePageChange(Number(e.target.value))}
                          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          aria-label={t('documents.jump_to_page')}
                        >
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <option key={page} value={page}>
                              {t('documents.page')} {page}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                {/* Detail Modal */}
                {selectedDocument && (
                  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div
                      className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
                      ref={modalRef}
                      tabIndex={-1}
                      onKeyDown={handleModalKeyDown}
                    >
                      {/* Sticky Header */}
                      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center rounded-t-2xl shadow-sm z-10">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                          {selectedDocument.app_name}
                        </h2>
                        <button
                          onClick={() => {
                            setSelectedDocument(null);
                            setImageUrls([]);
                          }}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-2"
                          aria-label={t('documents.close')}
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Tabs */}
                      <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                        <nav className="flex space-x-4" aria-label="Tabs">
                          {['details', 'content', 'media'].map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={`py-3 px-4 text-sm font-medium border-b-2 ${
                                activeTab === tab
                                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                              } focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-t-md`}
                              aria-selected={activeTab === tab}
                            >
                              {t(`documents.tab_${tab}`)}
                            </button>
                          ))}
                        </nav>
                      </div>

                      {/* Tab Content */}
                      <div className="p-6 space-y-6">
                        {activeTab === 'details' && (
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {t('documents.domain')}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300">{selectedDocument.domain}</p>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {t('documents.chapter')}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300">{selectedDocument.chapter || t('documents.unknown')}</p>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {t('documents.section')}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300">{selectedDocument.section || t('documents.unknown')}</p>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {t('documents.sub_section')}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300">{selectedDocument.sub_section || t('documents.unknown')}</p>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {t('documents.description')}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300">{selectedDocument.description || t('documents.unknown')}</p>
                            </div>
                          </div>
                        )}

                        {activeTab === 'content' && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                              {t('documents.content')}
                            </h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {selectedDocument.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {activeTab === 'media' && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                              {t('documents.attachments')} ({selectedDocument.media_files?.length || 0})
                            </h3>
                            {selectedDocument.media_files && selectedDocument.media_files.length > 0 ? (
                              <>
                                {/* Image Display */}
                                {imageUrls.length > 0 && (
                                  <div className="mb-6">
                                    {imageUrls.length === 1 ? (
                                      // Single Image Display
                                      <div className="flex flex-col items-center">
                                        <img
                                          src={imageUrls[0].url}
                                          alt={imageUrls[0].file_name}
                                          className="w-full max-w-md h-auto object-contain rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                                          onClick={() => window.open(imageUrls[0].url, '_blank')}
                                          role="button"
                                          tabIndex={0}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                              window.open(imageUrls[0].url, '_blank');
                                            }
                                          }}
                                          aria-label={`View ${imageUrls[0].file_name}`}
                                        />
                                        <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
                                          {imageUrls[0].file_name}
                                        </p>
                                      </div>
                                    ) : (
                                      // Multiple Images in Slider
                                      <Slider {...sliderSettings}>
                                        {imageUrls.map((image, index) => (
                                          <div key={index} className="relative">
                                            <img
                                              src={image.url}
                                              alt={image.file_name}
                                              className="w-full h-64 object-contain rounded-lg"
                                              onClick={() => window.open(image.url, '_blank')}
                                              role="button"
                                              tabIndex={0}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                  window.open(image.url, '_blank');
                                                }
                                              }}
                                              aria-label={`View ${image.file_name}`}
                                            />
                                            <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
                                              {image.file_name}
                                            </p>
                                          </div>
                                        ))}
                                      </Slider>
                                    )}
                                  </div>
                                )}

                                {/* Non-Image Files */}
                                {selectedDocument.media_files.some(
                                  (media) =>
                                    !media.mime_type.startsWith('image/') &&
                                    !/\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(media.file_name)
                                ) && (
                                  <div>
                                    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                      {t('documents.other_files')}
                                    </h4>
                                    <div className="space-y-2">
                                      {selectedDocument.media_files
                                        .filter(
                                          (media) =>
                                            !media.mime_type.startsWith('image/') &&
                                            !/\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(media.file_name)
                                        )
                                        .map((media) => (
                                          <div
                                            key={media.media_id}
                                            className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                                          >
                                            <span className="text-gray-800 dark:text-gray-100 flex items-center">
                                              <svg
                                                className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                              </svg>
                                              {media.file_name}
                                            </span>
                                            <button
                                              onClick={() => handleDownloadMedia(media.media_id, media.file_name)}
                                              className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                              aria-label={`Download ${media.file_name}`}
                                            >
                                              {t('documents.download')}
                                            </button>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <p className="text-gray-600 dark:text-gray-300">{t('documents.no_attachments')}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReadDocumentations;