import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { format, differenceInDays } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import escalateReportService from '../../lib/escalateReportService';

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

const ImageModal = ({ imageUrl, onClose, images = [], currentIndex = 0 }) => {
  const [index, setIndex] = useState(currentIndex);

  const nextImage = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="relative max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images.length > 0 ? images[index] : imageUrl}
          alt="Enlarged"
          className="w-full h-auto max-h-[80vh] object-cover rounded-lg"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Previous Image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Next Image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="text-center mt-2 text-sm text-white">
              {index + 1} / {images.length}
            </div>
          </>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  );
};

const ImageCarousel = ({ images, fieldName, accessToken, t }) => {
  const [imageDataUrls, setImageDataUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const urls = await Promise.all(
          images.map(async (imagePath) => {
            const filename = imagePath.split('/').pop();
            const url = await escalateReportService.fetchImage(filename, accessToken);
            return { url, file_name: filename };
          })
        );
        setImageDataUrls(urls);
        setLoading(false);
      } catch (err) {
        setError(t('reports.fetch_image_error') || 'Failed to load images');
        setLoading(false);
      }
    };
    if (images?.length > 0) {
      fetchImages();
    } else {
      setLoading(false);
      setError(t('reports.no_images') || 'No images provided');
    }
  }, [images, accessToken, t]);

  const sliderSettings = {
    dots: imageDataUrls.length > 1,
    infinite: imageDataUrls.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: imageDataUrls.length > 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    customPaging: (i) => (
      <button className="w-3 h-3 bg-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <span className="sr-only">{`Slide ${i + 1}`}</span>
      </button>
    ),
    dotsClass: "slick-dots custom-dots",
  };

  if (loading) {
    return <span className="text-gray-600 dark:text-gray-400">Loading images...</span>;
  }

  if (error) {
    return <span className="text-red-600 dark:text-red-400">{error}</span>;
  }

  if (!imageDataUrls || imageDataUrls.length === 0) {
    return <span className="text-gray-600 dark:text-gray-400">{t('reports.no_images') || 'No images'}</span>;
  }

  return (
    <>
      {imageDataUrls.length === 1 ? (
        <div className="flex flex-col items-center">
          <img
            src={imageDataUrls[0].url}
            alt={imageDataUrls[0].file_name}
            className="w-full max-w-md h-auto object-contain rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer"
            onClick={() => setShowImageModal(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setShowImageModal(true);
              }
            }}
            aria-label={`View ${imageDataUrls[0].file_name}`}
          />
          <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
            {imageDataUrls[0].file_name}
          </p>
        </div>
      ) : (
        <Slider {...sliderSettings}>
          {imageDataUrls.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image.url}
                alt={image.file_name}
                className="w-full h-64 object-contain rounded-lg cursor-pointer"
                onClick={() => setShowImageModal(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setShowImageModal(true);
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
      <AnimatePresence>
        {showImageModal && (
          <ImageModal
            images={imageDataUrls.map(img => img.url)}
            currentIndex={imageDataUrls.findIndex(img => img.url === (imageDataUrls[0]?.url || ''))}
            onClose={() => setShowImageModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
const ReportModal = ({ report, onClose, authData, t, onReportUpdate }) => {
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [signatureLoading, setSignatureLoading] = useState(false);
  const [signatureError, setSignatureError] = useState(null);
  const [escalateLoading, setEscalateLoading] = useState(false);
  const [escalateError, setEscalateError] = useState(null);
  const [severity, setSeverity] = useState(report.severity || '');
  const [severityLoading, setSeverityLoading] = useState(false);
  const [severityError, setSeverityError] = useState(null);
  const [correctiveActionRequired, setCorrectiveActionRequired] = useState(report.corrective_action_required || false);
  const [correctiveActionDescription, setCorrectiveActionDescription] = useState(report.corrective_action_description || '');
  const [correctiveActionDate, setCorrectiveActionDate] = useState(report.corrective_action_date ? new Date(report.corrective_action_date).toISOString().split('T')[0] : '');
  const [followUpStatus, setFollowUpStatus] = useState(report.follow_up_status || '');
  const [correctiveActionLoading, setCorrectiveActionLoading] = useState(false);
  const [correctiveActionError, setCorrectiveActionError] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);
  const [statusHistoryError, setStatusHistoryError] = useState(null);
  const [tag, setTag] = useState(report.tags || '');
  const [tagLoading, setTagLoading] = useState(false);
  const [tagError, setTagError] = useState(null);
  const { language } = useLanguage();

  // Debug logging to verify data
  useEffect(() => {
    console.log('ReportModal report data:', {
      workers: report.workers,
      worker_notes: report.worker_notes,
      hasWorkers: Array.isArray(report.workers) && report.workers.length > 0,
      hasWorkerNotes: Array.isArray(report.worker_notes) && report.worker_notes.length > 0,
    });
  }, [report]);

  const hasMeaningfulValue = (field) => {
    if (!field || !field.hasOwnProperty('value')) return false;

    if (field.type === 'multi_image') {
      return Array.isArray(field.value) && field.value.length > 0;
    }
    if (Array.isArray(field.value)) {
      return field.value.length > 0 && field.value.some((val) => val !== '');
    }
    return field.value !== '' && field.value !== null && field.value !== undefined;
  };

  useEffect(() => {
    const fetchSignature = async () => {
      if (report.signature_url) {
        setSignatureLoading(true);
        try {
          const filename = report.signature_url.split('/').pop();
          const url = await escalateReportService.fetchImage(filename, authData.access_token);
          setSignatureUrl(url);
          setSignatureLoading(false);
        } catch (err) {
          setSignatureError(t('reports.fetch_image_error') || 'Failed to load signature');
          setSignatureLoading(false);
        }
      }
    };
    fetchSignature();
  }, [report.signature_url, authData.access_token, t]);

  useEffect(() => {
    const fetchStatusHistory = async () => {
      const reportId = report.id || report._id?.$oid;
      if (!reportId) {
        setStatusHistoryError(t('reports.invalid_report_id') || 'Invalid report ID');
        return;
      }
      setStatusHistoryLoading(true);
      setStatusHistoryError(null);
      try {
        const response = await escalateReportService.getStatusHistory({
          id: reportId,
          orgId: authData.org_id,
          accessToken: authData.access_token
        });
        setStatusHistory(response.data || []);
        setStatusHistoryLoading(false);
      } catch (err) {
        setStatusHistoryError(t('reports.status_history_error', { message: err.message }) || `Failed to fetch status history: ${err.message}`);
        setStatusHistoryLoading(false);
      }
    };
    fetchStatusHistory();
  }, [report.id, report._id?.$oid, authData.org_id, authData.access_token, t]);

  const handleEscalate = async () => {
    const reportId = report.id || report._id?.$oid;
    if (!reportId) {
      setEscalateError(t('reports.invalid_report_id') || 'Invalid report ID');
      return;
    }
    if (['Escalated', 'Investigated', 'Under Management Action'].includes(report.status)) {
      setEscalateError(t('reports.already_escalated') || 'Report cannot be escalated in its current status');
      return;
    }
    setEscalateLoading(true);
    setEscalateError(null);
    try {
      const response = await escalateReportService.updateReportStatus({
        id: reportId,
        orgId: authData.org_id,
        accessToken: authData.access_token
      });
      if (response.message === 'Report is already escalated') {
        setEscalateError(t('reports.already_escalated') || 'Report is already escalated');
      } else {
        onReportUpdate({ ...report, status: response.report.status });
        const historyResponse = await escalateReportService.getStatusHistory({
          id: reportId,
          orgId: authData.org_id,
          accessToken: authData.access_token
        });
        setStatusHistory(historyResponse.data || []);
      }
      setEscalateLoading(false);
    } catch (err) {
      setEscalateError(t('reports.escalate_error', { message: err.message }) || `Failed to escalate report: ${err.message}`);
      setEscalateLoading(false);
    }
  };

  const handleSeverityChange = async (e) => {
    const newSeverity = e.target.value || null;
    setSeverity(newSeverity);
    setSeverityLoading(true);
    setSeverityError(null);
    const reportId = report.id || report._id?.$oid;
    try {
      const response = await escalateReportService.updateReportSeverity({
        id: reportId,
        orgId: authData.org_id,
        severity: newSeverity,
        accessToken: authData.access_token
      });
      onReportUpdate({ ...report, severity: response.report.severity });
      setSeverityLoading(false);
    } catch (err) {
      setSeverityError(t('reports.severity_error', { message: err.message }) || `Failed to update severity: ${err.message}`);
      setSeverityLoading(false);
      setSeverity(report.severity || '');
    }
  };

  const handleTagChange = async (e) => {
    const newTag = e.target.value || null;
    setTag(newTag);
    setTagLoading(true);
    setTagError(null);
    const reportId = report.id || report._id?.$oid;
    try {
      const response = await escalateReportService.updateReportTag({
        id: reportId,
        orgId: authData.org_id,
        tag: newTag,
        accessToken: authData.access_token,
      });
      onReportUpdate({ ...report, tags: response.report.tags });
      setTagLoading(false);
    } catch (err) {
      setTagError(t('reports.tag_error', { message: err.message }) || `Failed to update tag: ${err.message}`);
      setTagLoading(false);
      setTag(report.tags || '');
    }
  };

  const handleCorrectiveActionChange = async () => {
    const reportId = report.id || report._id?.$oid;
    if (!reportId) {
      setCorrectiveActionError(t('reports.invalid_report_id') || 'Invalid report ID');
      return;
    }
    setCorrectiveActionLoading(true);
    setCorrectiveActionError(null);
    try {
      const response = await escalateReportService.updateCorrectiveAction({
        id: reportId,
        orgId: authData.org_id,
        corrective_action_required: correctiveActionRequired,
        corrective_action_description: correctiveActionRequired ? correctiveActionDescription : '',
        corrective_action_date: correctiveActionRequired ? correctiveActionDate : null,
        follow_up_status: correctiveActionRequired && correctiveActionDate ? followUpStatus || 'Open' : null,
        accessToken: authData.access_token
      });
      onReportUpdate({
        ...report,
        corrective_action_required: response.report.corrective_action_required,
        corrective_action_description: response.report.corrective_action_description,
        corrective_action_date: response.report.corrective_action_date,
        follow_up_status: response.report.follow_up_status
      });
      setCorrectiveActionLoading(false);
    } catch (err) {
      setCorrectiveActionError(t('reports.corrective_action_error', { message: err.message }) || `Failed to update corrective action: ${err.message}`);
      setCorrectiveActionLoading(false);
    }
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'High':
        return 'bg-red-600 text-white';
      case 'Medium':
        return 'bg-orange-600 text-white';
      case 'Low':
        return 'bg-yellow-600 text-white';
      case 'Informational':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getFollowUpStatusBadgeClass = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-yellow-600 text-white';
      case 'Pending':
        return 'bg-orange-600 text-white';
      case 'Resolved':
        return 'bg-green-600 text-white';
      case 'Closed':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Escalated':
        return 'bg-orange-600 text-white';
      case 'Investigated':
        return 'bg-geen-600 text-white';
      case 'Under Management Action':
        return 'bg-yellow-600 text-white';
      case 'Resolved':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getTagBadgeClass = (tag) => {
    switch (tag) {
      case 'Repeated':
        return 'bg-purple-600 text-white';
      case 'First Time':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const renderFieldValue = (field) => {
    if (field.type === 'image' && field.value) {
      const [imageDataUrl, setImageDataUrl] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      useEffect(() => {
        const fetchImage = async () => {
          try {
            const filename = field.value.split('/').pop();
            const url = await escalateReportService.fetchImage(filename, authData.access_token);
            setImageDataUrl(url);
            setLoading(false);
          } catch (err) {
            setError(t('reports.fetch_image_error') || 'Failed to load image');
            setLoading(false);
          }
        };
        fetchImage();
      }, [field.value, authData.access_token]);

      if (loading) return <span className="text-gray-600 dark:text-gray-400">Loading image...</span>;
      if (error) return <span className="text-red-600 dark:text-red-400">{error}</span>;

      return (
        <img
          src={imageDataUrl}
          alt={field.name}
          className="w-32 h-32 object-cover rounded-md cursor-pointer"
          onError={(e) => (e.target.src = '/placeholder-image.png')}
          onClick={() => setEnlargedImage(imageDataUrl)}
        />
      );
    } else if (field.type === 'multi_image' && Array.isArray(field.value)) {
      return <ImageCarousel images={field.value} fieldName={field.name} accessToken={authData.access_token} t={t} />;
    } else if (field.type === 'PDF') {
      return <span className="text-gray-600 dark:text-gray-400">{t('templates.pdf_upload_placeholder') || 'PDF File'}</span>;
    } else if (field.type === 'radio') {
      return field.value || t('reports.unknown') || 'N/A';
    } else if (field.type === 'Date') {
      return field.value ? format(new Date(field.value), 'PPP') : t('reports.unknown') || 'N/A';
    } else if (field.type === 'DateTime') {
      return field.value ? format(new Date(field.value), 'PPP p') : t('reports.unknown') || 'N/A';
    } else if (field.type === 'Time') {
      return field.value || t('reports.unknown') || 'N/A';
    } else if (Array.isArray(field.value)) {
      return field.value.join(', ');
    }
    return field.value || t('reports.unknown') || 'N/A';
  };

  const renderSection = (section, subSections, sectionKey) => {
    if (!subSections || !Array.isArray(subSections)) return null;

    const filteredSubSections = subSections
      .map((sub) => {
        const filteredFields = (sub.fields || []).filter(hasMeaningfulValue);
        const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
        const filteredSubSub = (sub[subSubKey] || [])
          .map((subSub) => {
            const filteredSubSubFields = (subSub.fields || []).filter(hasMeaningfulValue);
            return filteredSubSubFields.length > 0 ? { ...subSub, fields: filteredSubSubFields } : null;
          })
          .filter((subSub) => subSub !== null);

        return (filteredFields.length > 0 || filteredSubSub.length > 0)
          ? { ...sub, fields: filteredFields, [subSubKey]: filteredSubSub }
          : null;
      })
      .filter((sub) => sub !== null);

    if (filteredSubSections.length === 0) return null;

    return (
      <div className={`mb-6 p-6 rounded-xl shadow-md ${
        section === 'header' ? 'bg-indigo-50 dark:bg-indigo-900' :
        section === 'body' ? 'bg-gray-50 dark:bg-gray-800' :
        'bg-blue-50 dark:bg-blue-900'
      }`}>
        {filteredSubSections.map((sub, subIndex) => (
          <div
            key={`${sectionKey}-${subIndex}`}
            className="border border-gray-200 dark:border-gray-600 p-5 rounded-lg mb-4 bg-gray-100 dark:bg-gray-700 shadow-sm"
          >
            <h5 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3">
              {sub.name || 'Unnamed Section'}
            </h5>
            {sub.fields.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {sub.fields.map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                      {field.name || 'Unnamed Field'}:
                    </span>
                    <span className="text-base text-gray-600 dark:text-gray-400">
                      {renderFieldValue(field)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {(sub[section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'] || []).map(
              (subSub, subSubIndex) => (
                <div
                  key={`${sectionKey}-${subIndex}-subSub-${subSubIndex}`}
                  className="ml-4 mt-4 border-l-2 border-indigo-300 dark:border-indigo-600 pl-4 bg-gray-200 dark:bg-gray-600 rounded-lg p-4"
                >
                  <h6 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
                    {subSub.name || 'Unnamed Sub-Section'}
                  </h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {(subSub.fields || []).map((field) => (
                      <div key={field.name} className="flex flex-col">
                        <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                          {field.name || 'Unnamed Field'}:
                        </span>
                        <span className="text-base text-gray-600 dark:text-gray-400">
                          {renderFieldValue(field)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    );
  };

  const currentDate = new Date();

  let formattedActionDate = '';
  let isDateViolation = false;
  if (correctiveActionDate) {
    try {
      const date = new Date(correctiveActionDate);
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      formattedActionDate = `${date.getDate()} - ${monthNames[date.getMonth()]} - ${date.getFullYear()}`;
      isDateViolation = currentDate > date;
    } catch (e) {}
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-auto border border-gray-200 dark:border-gray-600"
        >
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-600 pb-4">
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
              {report.name || 'Unnamed Report'} (ID: {report.id || report._id?.$oid || 'N/A'})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-2"
              aria-label={t('reports.close') || 'Close'}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={handleEscalate}
                disabled={escalateLoading || ['Escalated', 'Investigated', 'Under Management Action'].includes(report.status)}
                className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ${
                  escalateLoading || ['Escalated', 'Investigated', 'Under Management Action'].includes(report.status)
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700'
                }`}
                aria-label={t('reports.escalate') || 'Escalate Report'}
              >
                {escalateLoading ? t('reports.escalating') || 'Escalating...' : t('reports.escalate') || 'Escalate Report'}
              </button>
              <div className="flex items-center gap-2">
                <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                  {t('reports.severity') || 'Severity'}:
                </label>
                <select
                  value={severity || ''}
                  onChange={handleSeverityChange}
                  disabled={severityLoading}
                  className="py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  aria-label={t('reports.severity') || 'Severity'}
                >
                  <option value="">{t('reports.select_severity') || 'Select Severity'}</option>
                  <option value="High">{t('reports.severity_high') || 'High'}</option>
                  <option value="Medium">{t('reports.severity_medium') || 'Medium'}</option>
                  <option value="Low">{t('reports.severity_low') || 'Low'}</option>
                  <option value="Informational">{t('reports.severity_informational') || 'Informational'}</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                  {t('reports.tag') || 'Tag'}:
                </label>
                <select
                  value={tag || ''}
                  onChange={handleTagChange}
                  disabled={tagLoading}
                  className="py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  aria-label={t('reports.tag') || 'Tag'}
                >
                  <option value="">{t('reports.select_tag') || 'Select Tag'}</option>
                  <option value="Repeated">{t('reports.tag_repeated') || 'Repeated'}</option>
                  <option value="First Time">{t('reports.tag_first_time') || 'First Time'}</option>
                </select>
              </div>
              {escalateError && (
                <span className="text-red-600 dark:text-red-400">{escalateError}</span>
              )}
              {severityError && (
                <span className="text-red-600 dark:text-red-400">{severityError}</span>
              )}
              {tagError && (
                <span className="text-red-600 dark:text-red-400">{tagError}</span>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
              <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                {t('reports.status_history') || 'Status History'}
              </h4>
              {statusHistoryLoading ? (
                <span className="text-gray-600 dark:text-gray-400">{t('reports.loading_status_history') || 'Loading status history...'}</span>
              ) : statusHistoryError ? (
                <span className="text-red-600 dark:text-red-400">{statusHistoryError}</span>
              ) : statusHistory.length === 0 ? (
                <span className="text-gray-600 dark:text-gray-400">{t('reports.no_status_history') || 'No status history available'}</span>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
                  {statusHistory.map((entry, index) => {
                    const statusKey = `reports.status_${entry.status.toLowerCase().replace(' ', '_')}`;
                    const translatedStatus = t(statusKey) || entry.status;
                    const entryDate = new Date(entry.datetime);
                    const formattedDateTime = format(entryDate, 'yyyy-MM-dd hh:mm a');
                    const durationDays = differenceInDays(currentDate, entryDate);

                    const message = t('reports.status_changed_with_duration', {
                      status: translatedStatus,
                      datetime: formattedDateTime,
                      duration: durationDays
                    });
                    const fallbackMessage = `Changed to ${translatedStatus} on ${formattedDateTime} duration ${durationDays} days`;

                    return (
                      <div key={index} className="mb-4 flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                          <span className="w-4 h-4 bg-indigo-500 rounded-full z-10"></span>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeClass(entry.status)}`}>
                            {translatedStatus}
                          </span>
                          <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                            {message.includes('{{') ? fallbackMessage : message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
              <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                {t('reports.corrective_action') || 'Corrective Action'}
              </h4>
              <div className="flex items-center gap-4 mb-2">
                <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                  {t('reports.corrective_action_required') || 'Corrective Action Required'}:
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="correctiveAction"
                      value="required"
                      checked={correctiveActionRequired}
                      onChange={() => {
                        setCorrectiveActionRequired(true);
                        handleCorrectiveActionChange();
                      }}
                      className="mr-2 focus:ring-indigo-500"
                    />
                    {t('reports.corrective_action_needed') || 'Needed'}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="correctiveAction"
                      value="not_required"
                      checked={!correctiveActionRequired}
                      onChange={() => {
                        setCorrectiveActionRequired(false);
                        setCorrectiveActionDescription('');
                        setCorrectiveActionDate('');
                        setFollowUpStatus('');
                        handleCorrectiveActionChange();
                      }}
                      className="mr-2 focus:ring-indigo-500"
                    />
                    {t('reports.no_corrective_action_needed') || 'Not Needed'}
                  </label>
                </div>
              </div>
              {correctiveActionRequired && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                      {t('reports.corrective_action_description') || 'Corrective Action Description'}
                    </label>
                    <textarea
                      value={correctiveActionDescription}
                      onChange={(e) => setCorrectiveActionDescription(e.target.value)}
                      onBlur={handleCorrectiveActionChange}
                      className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                      rows={4}
                      aria-label={t('reports.corrective_action_description') || 'Corrective Action Description'}
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                      {t('reports.corrective_action_date') || 'Corrective Action Date'}
                    </label>
                    <input
                      type="date"
                      value={correctiveActionDate}
                      onChange={(e) => {
                        setCorrectiveActionDate(e.target.value);
                        if (!e.target.value) setFollowUpStatus('');
                      }}
                      onBlur={handleCorrectiveActionChange}
                      className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                      aria-label={t('reports.corrective_action_date') || 'Corrective Action Date'}
                    />
                  </div>
                  {correctiveActionDate && (
                    <div>
                      <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                        {t('reports.follow_up_status') || 'Follow Up Status'}
                      </label>
                      <select
                        value={followUpStatus || ''}
                        onChange={(e) => {
                          setFollowUpStatus(e.target.value);
                          handleCorrectiveActionChange();
                        }}
                        className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        aria-label={t('reports.follow_up_status') || 'Follow Up Status'}
                      >
                        <option value="">{t('reports.select_follow_up_status') || 'Select Status'}</option>
                        <option value="Open">{t('reports.follow_up_open') || 'Open'}</option>
                        <option value="Pending">{t('reports.follow_up_pending') || 'Pending'}</option>
                        <option value="Resolved">{t('reports.follow_up_resolved') || 'Resolved'}</option>
                        <option value="Closed">{t('reports.follow_up_closed') || 'Closed'}</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
              {correctiveActionError && (
                <span className="text-red-600 dark:text-red-400 block mt-2">{correctiveActionError}</span>
              )}
              {correctiveActionLoading && (
                <span className="text-gray-600 dark:text-gray-400 block mt-2">{t('reports.updating') || 'Updating...'}</span>
              )}
            </div>
            {report.status && (
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('reports.status') || 'Status'}: 
                <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeClass(report.status)}`}>
                  {t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}
                </span>
              </p>
            )}
            {report.severity && (
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('reports.severity') || 'Severity'}: 
                <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getSeverityBadgeClass(report.severity)}`}>
                  {t(`reports.severity_${report.severity.toLowerCase()}`) || report.severity}
                </span>
              </p>
            )}
            {report.tags && (
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('reports.tag') || 'Tag'}: 
                <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getTagBadgeClass(report.tags)}`}>
                  {t(`reports.tag_${report.tags.toLowerCase().replace(' ', '_')}`) || report.tags}
                </span>
              </p>
            )}
            {report.follow_up_status && (
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('reports.follow_up_status') || 'Follow Up Status'}: 
                <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getFollowUpStatusBadgeClass(report.follow_up_status)}`}>
                  {t(`reports.follow_up_${report.follow_up_status.toLowerCase()}`) || report.follow_up_status}
                </span>
              </p>
            )}
            <p className="text-base text-gray-600 dark:text-gray-400">
              {t('reports.template_id') || 'Template ID'}: {report.template_id || t('reports.unknown') || 'N/A'}
            </p>
            <p className="text-base text-gray-600 dark:text-gray-400">
              {t('reports.report_type') || 'Report Type'}: {report.reportType || t('reports.unknown') || 'N/A'}
            </p>
            <p className="text-base text-gray-600 dark:text-gray-400">
              {t('reports.created_by') || 'Created By'}: {report.user_created_name || t('reports.unknown') || 'Unknown'}
            </p>
            {report.created_at && (
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('reports.created_at') || 'Created At'}: {format(new Date(report.created_at), 'PPP')}
              </p>
            )}
            {(correctiveActionRequired && (correctiveActionDescription || correctiveActionDate)) || report.investigation_details || report.management_notes ? (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                {correctiveActionRequired && (correctiveActionDescription || correctiveActionDate) && (
                  <div className="mb-4">
                    <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                      {t('reports.corrective_action_details') || 'Corrective Action Details'}
                    </h4>
                    {correctiveActionDescription && (
                      <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
                        {t('reports.notes') || 'Notes'}: {correctiveActionDescription}
                      </p>
                    )}
                    {correctiveActionDate && (
                      <p className={`text-base ${isDateViolation ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'} mb-2`}>
                        {isDateViolation
                          ? (t('reports.action_date_violation') || 'Action Date Violation')
                          : (t('reports.action_date') || 'Action Date')}: {formattedActionDate}
                      </p>
                    )}
                  </div>
                )}
                {report.investigation_details && (
                  <div className="mb-4">
                    <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                      {t('reports.investigation_details') || 'Investigation Details'}
                    </h4>
                    <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
                      {t('reports.notes') || 'Notes'}: {report.investigation_details}
                    </p>
                  </div>
                )}
                {report.management_notes && (
                  <div className="mb-4">
                    <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                      {t('reports.management_notes') || 'Management Notes'}
                    </h4>
                    <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
                      {t('reports.notes') || 'Notes'}: {report.management_notes}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
              <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                {t('reports.location_details') || 'Location Details'}
              </h4>
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('reports.main_location') || 'Main Location'}: {report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('reports.qa_location') || 'QA Location'}: {report.qa_location || report.structure?.location_details?.locations_qa_id || t('reports.unknown') || 'N/A'}
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('reports.qa_section') || 'QA Section'}: {report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400">
                {t('reports.qa_sub_section') || 'QA Sub-Section'}: {report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}
              </p>
            </div>
            {(report.workers && report.worker_notes) && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                  {t('reports.worker_management') || 'Worker Management'}
                </h4>
                {report.workers.map((worker, index) => (
                  <div key={worker.id || worker.employee_id || index} className="mb-4">
                    <p className="text-base text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{t('reports.worker_name') || 'Worker Name'}:</span> {worker.full_name || worker.full_name_en || t('reports.unknown') || 'N/A'}
                    </p>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{t('reports.job_title') || 'Job Title'}:</span> {worker.job_name_ar || t('reports.unknown') || 'N/A'}
                    </p>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{t('reports.department') || 'Department'}:</span> {worker.department_name || t('reports.unknown') || 'N/A'}
                    </p>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{t('reports.section') || 'Section'}:</span> {worker.section_name_ar || t('reports.unknown') || 'N/A'}
                    </p>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{t('reports.notes') || 'Notes'}:</span> {report.worker_notes[index] || t('reports.no_notes') || 'No notes'}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {report.signature_url && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                  {t('reports.signature') || 'Signature'}
                </h4>
                {signatureLoading ? (
                  <span className="text-gray-600 dark:text-gray-400">{t('reports.loading_signature') || 'Loading signature...'}</span>
                ) : signatureError ? (
                  <span className="text-red-600 dark:text-red-400">{signatureError}</span>
                ) : signatureUrl ? (
                  <img
                    src={signatureUrl}
                    alt="Signature"
                    className="w-32 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-600 shadow-sm cursor-pointer"
                    onClick={() => setEnlargedImage(signatureUrl)}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.png';
                    }}
                  />
                ) : (
                  <span className="text-gray-600 dark:text-gray-400">{t('reports.no_signature') || 'No signature available'}</span>
                )}
              </div>
            )}
            {renderSection('header', report.structure?.header?.sub_headers, 'sub_headers')}
            {renderSection('body', report.structure?.body?.sub_bodies, 'sub_bodies')}
            {renderSection('footer', report.structure?.footer?.sub_footers, 'sub_footers')}
          </div>
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {enlargedImage && (
          <ImageModal imageUrl={enlargedImage} onClose={() => setEnlargedImage(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default ReportModal;