import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import { aiDashboardService } from '../../lib/aiDashboardService';
import readReportService from '../../lib/readReportService';
import {
  format,
  isAfter,
  startOfDay,
  differenceInMinutes,
  parseISO,
  subDays,
  formatDistanceToNow,
  isValid as isValidDateFns
} from 'date-fns';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { AnimatePresence, motion } from 'framer-motion';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

// ---------- helpers ----------
const chartColor = (cssVar, fallback) => {
  const el = document.documentElement;
  const v = getComputedStyle(el).getPropertyValue(cssVar)?.trim();
  return v || fallback;
};
const clamp = (n, min, max) => Math.max(min, Math.min(n, max));
const toArray = (v) => Array.isArray(v) ? v : (v ? [v] : []);
const normalizeId = (x) => x?._id?.$oid || x?._id || x?.id;
const safeDate = (v) => {
  try {
    if (!v) return null;
    const d = typeof v === 'string' ? parseISO(v) : new Date(v);
    return isValidDateFns(d) ? d : null;
  } catch { return null; }
};
const tSafe = (t, key, fallback) => {
  const val = t?.(key);
  return (typeof val === 'string' && !val.includes('{{')) ? val : fallback;
};

const Badge = ({ children, className='' }) => (
  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${className}`}>{children}</span>
);

// ==============================
// Media helpers for Report modal
// ==============================
const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full z-10"
    aria-label="Previous Image"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
);
const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full z-10"
    aria-label="Next Image"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  </button>
);

const ImageModal = ({ imageUrl, onClose, images = [], currentIndex = 0 }) => {
  const [index, setIndex] = useState(currentIndex);
  const next = () => setIndex((p) => (p + 1) % images.length);
  const prev = () => setIndex((p) => (p - 1 + images.length) % images.length);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
        className="relative max-w-4xl w-full"
        onClick={(e)=>e.stopPropagation()}
      >
        <img
          src={images.length ? images[index] : imageUrl}
          alt="Enlarged"
          className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
        />
        {images.length > 1 && (
          <>
            <PrevArrow onClick={prev} />
            <NextArrow onClick={next} />
            <div className="text-center mt-2 text-sm text-white">{index + 1} / {images.length}</div>
          </>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full"
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

const ImageCarousel = ({ images, accessToken, t }) => {
  const [imageDataUrls, setImageDataUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const urls = await Promise.all(
          images.map(async (path) => {
            const filename = path.split('/').pop();
            const url = await readReportService.fetchImage(filename, accessToken);
            return { url, file_name: filename };
          })
        );
        setImageDataUrls(urls);
      } catch (e) {
        setErr(tSafe(t, 'reports.fetch_image_error', 'Failed to load images'));
      } finally { setLoading(false); }
    };
    if (images?.length) run(); else { setLoading(false); setErr(tSafe(t,'reports.no_images','No images provided')); }
  }, [images, accessToken, t]);

  if (loading) return <span className="text-gray-600 dark:text-gray-400">Loading images…</span>;
  if (err) return <span className="text-red-600 dark:text-red-400">{err}</span>;
  if (!imageDataUrls?.length) return <span className="text-gray-600 dark:text-gray-400">{tSafe(t,'reports.no_images','No images')}</span>;

  if (imageDataUrls.length === 1) {
    return (
      <>
        <div className="flex flex-col items-center">
          <img
            src={imageDataUrls[0].url}
            alt={imageDataUrls[0].file_name}
            className="w-full max-w-md h-auto object-contain rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer"
            onClick={() => setShowModal(true)}
          />
          <p className="text-center text-gray-600 dark:text-gray-300 mt-2">{imageDataUrls[0].file_name}</p>
        </div>
        <AnimatePresence>
          {showModal && (
            <ImageModal
              images={imageDataUrls.map(x => x.url)}
              currentIndex={0}
              onClose={() => setShowModal(false)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // lightweight carousel (no external slick dependency)
  return (
    <>
      <div className="relative w-full">
        <div className="grid grid-cols-1 gap-2">
          {imageDataUrls.map((img, idx) => (
            <div key={idx} className="relative">
              <img
                src={img.url}
                alt={img.file_name}
                className="w-full h-64 object-contain rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700"
                onClick={() => setShowModal(true)}
              />
              <p className="text-center text-gray-600 dark:text-gray-300 mt-2">{img.file_name}</p>
            </div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {showModal && (
          <ImageModal
            images={imageDataUrls.map(x => x.url)}
            currentIndex={0}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// ==============================
// FULL Report Modal (rich detail)
// ==============================
const ReportModal = ({ report, onClose, authData, t }) => {
  const { language } = useLanguage();
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [signatureLoading, setSignatureLoading] = useState(false);
  const [signatureError, setSignatureError] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);
  const [statusHistoryError, setStatusHistoryError] = useState(null);

  const hasMeaningfulValue = (field) => {
    if (!field || !field.hasOwnProperty('value')) return false;
    if (field.type === 'multi_image') return Array.isArray(field.value) && field.value.length > 0;
    if (Array.isArray(field.value)) return field.value.length > 0 && field.value.some((v) => v !== '');
    return field.value !== '' && field.value !== null && field.value !== undefined;
  };

  useEffect(() => {
    const fetchSignature = async () => {
      if (report.signature_url) {
        setSignatureLoading(true);
        try {
          const filename = report.signature_url.split('/').pop();
          const url = await readReportService.fetchImage(filename, authData.access_token);
          setSignatureUrl(url);
        } catch (err) {
          setSignatureError(tSafe(t,'reports.fetch_image_error','Failed to load signature'));
        } finally { setSignatureLoading(false); }
      }
    };
    fetchSignature();
  }, [report.signature_url, authData.access_token, t]);

  useEffect(() => {
    const fetchStatusHistory = async () => {
      const reportId = report.id || report._id?.$oid;
      if (!reportId) {
        setStatusHistoryError(tSafe(t,'reports.invalid_report_id','Invalid report ID'));
        return;
      }
      setStatusHistoryLoading(true);
      setStatusHistoryError(null);
      try {
        const response = await readReportService.getStatusHistory({
          id: reportId, orgId: authData.org_id, accessToken: authData.access_token
        });
        setStatusHistory(response.data || []);
      } catch (err) {
        setStatusHistoryError(tSafe(t,'reports.status_history_error','Failed to fetch status history') + ': ' + err.message);
      } finally { setStatusHistoryLoading(false); }
    };
    fetchStatusHistory();
  }, [report.id, report._id?.$oid, authData.org_id, authData.access_token, t]);

  const renderFieldValue = (field) => {
    if (field.type === 'image' && field.value) {
      const [imageDataUrl, setImageDataUrl] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      useEffect(() => {
        const fetchImage = async () => {
          try {
            const filename = field.value.split('/').pop();
            const url = await readReportService.fetchImage(filename, authData.access_token);
            setImageDataUrl(url); setLoading(false);
          } catch (err) { setError(tSafe(t,'reports.fetch_image_error','Failed to load image')); setLoading(false); }
        };
        fetchImage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [field.value, authData.access_token]);

      if (loading) return <span className="text-gray-600 dark:text-gray-400">Loading image…</span>;
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
      return <ImageCarousel images={field.value} accessToken={authData.access_token} t={t} />;
    } else if (field.type === 'PDF') {
      return <span className="text-gray-600 dark:text-gray-400">{tSafe(t,'templates.pdf_upload_placeholder','PDF File')}</span>;
    } else if (field.type === 'radio') {
      return field.value || tSafe(t,'reports.unknown','N/A');
    } else if (field.type === 'Date') {
      return field.value ? format(new Date(field.value), 'PPP') : tSafe(t,'reports.unknown','N/A');
    } else if (field.type === 'DateTime') {
      return field.value ? format(new Date(field.value), 'PPP p') : tSafe(t,'reports.unknown','N/A');
    } else if (field.type === 'Time') {
      return field.value || tSafe(t,'reports.unknown','N/A');
    } else if (Array.isArray(field.value)) {
      return field.value.join(', ');
    }
    return field.value || tSafe(t,'reports.unknown','N/A');
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
          .filter(Boolean);
        return (filteredFields.length > 0 || filteredSubSub.length > 0)
          ? { ...sub, fields: filteredFields, [subSubKey]: filteredSubSub }
          : null;
      })
      .filter(Boolean);

    if (!filteredSubSections.length) return null;

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
                {sub.fields.map((field, i) => (
                  <div key={`${field.name}-${i}`} className="flex flex-col">
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
                    {(subSub.fields || []).map((field, j) => (
                      <div key={`${field.name}-${j}`} className="flex flex-col">
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

  const getSeverityBadgeClass = (v) =>
    v === 'High' ? 'bg-red-600 text-white' :
    v === 'Medium' ? 'bg-orange-600 text-white' :
    v === 'Low' ? 'bg-yellow-600 text-white' :
    v === 'Informational' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white';

  const getFollowUpStatusBadgeClass = (v) =>
    v === 'Open' ? 'bg-yellow-600 text-white' :
    v === 'Pending' ? 'bg-orange-600 text-white' :
    v === 'Resolved' ? 'bg-green-600 text-white' :
    v === 'Closed' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white';

  const getStatusBadgeClass = (v) =>
    v === 'Escalated' ? 'bg-orange-600 text-white' :
    v === 'Investigated' ? 'bg-red-600 text-white' :
    v === 'Under Management Action' ? 'bg-yellow-600 text-white' :
    v === 'Resolved' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white';

  const currentDate = new Date();
  let formattedActionDate = '';
  let isDateViolation = false;
  if (report.corrective_action_date) {
    try {
      const date = new Date(report.corrective_action_date);
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      formattedActionDate = `${date.getDate()} - ${months[date.getMonth()]} - ${date.getFullYear()}`;
      isDateViolation = currentDate > date;
    } catch {}
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ scale: 0.98, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, y: 16 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-600"
        >
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-600 pb-4">
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
              {report.name || 'Report'} (ID: {report.id || report._id?.$oid || 'N/A'})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none rounded-full p-2"
              aria-label={tSafe(t,'reports.close','Close')}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status history */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm mb-6">
            <h4 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-3">
              {tSafe(t,'reports.status_history','Status History')}
            </h4>
            {statusHistoryLoading ? (
              <span className="text-gray-600 dark:text-gray-400">{tSafe(t,'reports.loading_status_history','Loading status history…')}</span>
            ) : statusHistoryError ? (
              <span className="text-red-600 dark:text-red-400">{statusHistoryError}</span>
            ) : statusHistory.length === 0 ? (
              <span className="text-gray-600 dark:text-gray-400">{tSafe(t,'reports.no_status_history','No status history')}</span>
            ) : (
              <div className="space-y-3">
                {statusHistory.map((entry, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeClass(entry.status)}`}>
                      {entry.status}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-200">{format(new Date(entry.datetime),'yyyy-MM-dd hh:mm a')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================================ */}
          {/* AI Flow (Actions Timeline) — NEW */}
          {/* ================================ */}
          {Array.isArray(report?.ai_data?.actions) && report.ai_data.actions.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm mb-6">
              <h4 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-3">
                {tSafe(t,'reports.ai_flow','AI Flow (Actions Timeline)')}
              </h4>
              <div className="space-y-4">
                {report.ai_data.actions.map((a, idx) => {
                  const createdAt = safeDate(a.action_date) || safeDate(a.created_at);
                  const updatedAt = safeDate(a.updated_at) || safeDate(a.updated_action_at) || createdAt;
                  return (
                    <div key={a._id || idx} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className={`${
                          (a.status || 'Pending') === 'Resolved' ? 'bg-green-600 text-white' :
                          (a.status || 'Pending') === 'Pending' ? 'bg-amber-600 text-white' :
                          'bg-indigo-600 text-white'
                        }`}>{a.status || 'Pending'}</Badge>
                        {a.department && <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100">{a.department}</Badge>}
                        {a.priority && <Badge className={
                          a.priority.toLowerCase()==='high' ? 'bg-red-600 text-white' :
                          a.priority.toLowerCase()==='medium' ? 'bg-orange-600 text-white' :
                          a.priority.toLowerCase()==='low' ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white'
                        }>{a.priority}</Badge>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                        {a.destination_department && <div><strong>{tSafe(t,'reports.destination_department','Destination Dept')}:</strong> {a.destination_department}</div>}
                        {a.action_owner && <div><strong>{tSafe(t,'reports.owner','Owner')}:</strong> {a.action_owner}</div>}
                        {createdAt && <div><strong>{tSafe(t,'reports.created_at','Created At')}:</strong> {format(createdAt,'PPP p')}</div>}
                        {updatedAt && <div><strong>{tSafe(t,'reports.last_update','Last Update')}:</strong> {formatDistanceToNow(updatedAt, { addSuffix: true })}</div>}
                      </div>
                      {(a.notes || a.resolution_notes) && (
                        <div className="mt-3 text-sm">
                          {a.notes && (
                            <p className="text-gray-700 dark:text-gray-300"><strong>{tSafe(t,'reports.notes','Notes')}:</strong> {a.notes}</p>
                          )}
                          {a.resolution_notes && (
                            <p className="text-gray-700 dark:text-gray-300"><strong>{tSafe(t,'reports.resolution_notes','Resolution Notes')}:</strong> {a.resolution_notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* ============== END AI FLOW ============== */}

          {/* badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm text-gray-700 dark:text-gray-200">
            {report.status && (
              <div>
                <strong>{tSafe(t,'reports.status','Status')}:</strong>{' '}
                <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeClass(report.status)}`}>
                  {report.status}
                </span>
              </div>
            )}
            {report.severity && (
              <div>
                <strong>{tSafe(t,'reports.severity','Severity')}:</strong>{' '}
                <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getSeverityBadgeClass(report.severity)}`}>
                  {report.severity}
                </span>
              </div>
            )}
            {report.follow_up_status && (
              <div>
                <strong>{tSafe(t,'reports.follow_up_status','Follow Up Status')}:</strong>{' '}
                <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getFollowUpStatusBadgeClass(report.follow_up_status)}`}>
                  {report.follow_up_status}
                </span>
              </div>
            )}
            <div><strong>{tSafe(t,'reports.template_id','Template ID')}:</strong> {report.template_id || '—'}</div>
            <div><strong>{tSafe(t,'reports.report_type','Report Type')}:</strong> {report.reportType || '—'}</div>
            <div><strong>{tSafe(t,'reports.created_by','Created By')}:</strong> {report.user_created_name || '—'}</div>
            <div><strong>{tSafe(t,'reports.created_at','Created At')}:</strong> {report.created_at ? format(new Date(report.created_at),'PPP') : '—'}</div>
          </div>

          {/* corrective / investigation / notes */}
          {(report.corrective_action_description || report.corrective_action_date || report.investigation_details || report.management_notes) && (
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm mb-6 space-y-4">
              {(report.corrective_action_description || report.corrective_action_date) && (
                <div>
                  <h4 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-2">
                    {tSafe(t,'reports.corrective_action_details','Corrective Action Details')}
                  </h4>
                  {report.corrective_action_description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      {tSafe(t,'reports.notes','Notes')}: {report.corrective_action_description}
                    </p>
                  )}
                  {report.corrective_action_date && (
                    <p className={`text-sm ${isDateViolation ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {isDateViolation ? tSafe(t,'reports.action_date_violation','Action Date Violation') : tSafe(t,'reports.action_date','Action Date')}: {formattedActionDate}
                    </p>
                  )}
                </div>
              )}
              {report.investigation_details && (
                <div>
                  <h4 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-1">
                    {tSafe(t,'reports.investigation_details','Investigation Details')}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{report.investigation_details}</p>
                </div>
              )}
              {report.management_notes && (
                <div>
                  <h4 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-1">
                    {tSafe(t,'reports.management_notes','Management Notes')}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{report.management_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* location */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm mb-6">
            <h4 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-2">
              {tSafe(t,'reports.location_details','Location Details')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
              <div><strong>{tSafe(t,'reports.main_location','Main Location')}:</strong> {report.main_location_name || report.structure?.location_details?.main_location_id || '—'}</div>
              <div><strong>{tSafe(t,'reports.qa_location','QA Location')}:</strong> {report.qa_location || report.structure?.location_details?.locations_qa_id || '—'}</div>
              <div><strong>{tSafe(t,'reports.qa_section','QA Section')}:</strong> {report.qa_section || report.structure?.location_details?.section_qa_id || '—'}</div>
              <div><strong>{tSafe(t,'reports.qa_sub_section','QA Sub-Section')}:</strong> {report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || '—'}</div>
            </div>
          </div>

          {/* Signature */}
          {report.signature_url && (
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm mb-6">
              <h4 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-2">
                {tSafe(t,'reports.signature','Signature')}
              </h4>
              {signatureLoading ? (
                <span className="text-gray-600 dark:text-gray-400">{tSafe(t,'reports.loading_signature','Loading signature…')}</span>
              ) : signatureError ? (
                <span className="text-red-600 dark:text-red-400">{signatureError}</span>
              ) : signatureUrl ? (
                <img
                  src={signatureUrl}
                  alt="Signature"
                  className="w-32 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-600 shadow-sm cursor-pointer"
                  onClick={() => setEnlargedImage(signatureUrl)}
                  onError={(e) => (e.target.src='/placeholder-image.png')}
                />
              ) : (
                <span className="text-gray-600 dark:text-gray-400">{tSafe(t,'reports.no_signature','No signature available')}</span>
              )}
            </div>
          )}

          {/* sections */}
          {renderSection('header', report.structure?.header?.sub_headers, 'sub_headers')}
          {renderSection('body', report.structure?.body?.sub_bodies, 'sub_bodies')}
          {renderSection('footer', report.structure?.footer?.sub_footers, 'sub_footers')}
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
// ==============================
// ReportsTable (filters + click)
// ==============================
const ReportsTable = ({ reports, t, setSelectedReport, selectedColumns, getFieldValue, toolbar }) => {
  const fixedColumns = [
    { key: 'user_created_name', name: tSafe(t,'reports.created_by','Created By') },
    { key: 'main_location_name', name: tSafe(t,'reports.main_location','Main Location') },
    { key: 'qa_section', name: tSafe(t,'reports.qa_section','QA Section') },
    { key: 'qa_sub_section', name: tSafe(t,'reports.qa_sub_section','QA Sub-Section') },
    { key: 'created_at', name: tSafe(t,'reports.created_at','Created At') },
  ];

  const getStructureFields = useCallback((report) => {
    const fields = [];
    const pushField = (field, prefix = '') => {
      if (field?.name) {
        fields.push({ key: `${prefix}${field.name}`.replace(/[^a-zA-Z0-9]/g,'_').toLowerCase(), name: field.name });
      }
    };
    const proc = (section, sKey, subKey, subSubKey) => {
      (section?.[subKey] || []).forEach((sub, i) => {
        (sub.fields || []).forEach((f) => pushField(f, `${sKey}_${i}_`));
        (sub[subSubKey] || []).forEach((ss, j) => {
          (ss.fields || []).forEach((f) => pushField(f, `${sKey}_${i}_${j}_`));
          if (!ss.fields?.length) pushField({ name:ss.name }, `${sKey}_${i}_${j}_`);
        });
      });
    };
    proc(report?.structure?.header,'header','sub_headers','sub_sub_headers');
    proc(report?.structure?.body,'body','sub_bodies','sub_sub_bodies');
    proc(report?.structure?.footer,'footer','sub_footers','sub_sub_footers');
    return fields;
  }, []);

  const structureFields = reports?.[0] ? getStructureFields(reports[0]) : [];
  const allColumns = [...fixedColumns, ...structureFields];
  const shownColumns = selectedColumns?.length ? allColumns.filter(c => selectedColumns.includes(c.key)) : allColumns;

  const [colFilters, setColFilters] = useState(() => Object.fromEntries(allColumns.map(c => [c.key,''])));
  const onFilterChange = (e) => setColFilters((p) => ({ ...p, [e.target.name]: e.target.value }));

  const valueFor = (report, col) => {
    switch (col.key) {
      case 'user_created_name': return report.user_created_name || '—';
      case 'main_location_name': return report.main_location_name || report?.structure?.location_details?.main_location_id || '—';
      case 'qa_section': return report.qa_section || report?.structure?.location_details?.section_qa_id || '—';
      case 'qa_sub_section': return report.qa_sub_section || report?.structure?.location_details?.sub_section_qa_id || '—';
      case 'created_at': return report.created_at ? format(new Date(report.created_at),'PPP') : '—';
      default: return getFieldValue(report, col.name) || '—';
    }
  };

  const filtered = useMemo(() => {
    return (reports||[]).filter((r) => {
      return shownColumns.every((c) => {
        const q = (colFilters[c.key]||'').toLowerCase();
        if (!q) return true;
        const v = String(valueFor(r,c)).toLowerCase();
        return v.includes(q);
      });
    });
  }, [reports, shownColumns, colFilters]); // eslint-disable-line

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Toolbar (Export etc.) */}
      {toolbar}
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-indigo-50 dark:bg-indigo-900">
          <tr>
            {shownColumns.map((c) => (
              <th key={c.key} className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
                {c.name}
              </th>
            ))}
          </tr>
          <tr className="bg-gray-50 dark:bg-gray-700">
            {shownColumns.map((c) => (
              <td key={c.key} className="px-6 py-2">
                <input
                  type="text"
                  name={c.key}
                  value={colFilters[c.key] || ''}
                  onChange={onFilterChange}
                  placeholder={`Filter ${c.name}`}
                  className="w-full py-1 px-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md"
                />
              </td>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {filtered.map((r) => {
            const id = r._id?.$oid || r.id;
            return (
              <tr
                key={id}
                className="hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer"
                onClick={() => setSelectedReport(r)}
              >
                {shownColumns.map((c) => (
                  <td key={c.key} className="px-6 py-3 text-sm text-gray-800 dark:text-gray-100">
                    {valueFor(r,c)}
                  </td>
                ))}
              </tr>
            );
          })}
          {filtered.length===0 && (
            <tr><td colSpan={shownColumns.length} className="px-6 py-6 text-center text-gray-500 dark:text-gray-400">—</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// =======================================
// Drilldown Panel with Export to Excel
// =======================================
const DrilldownPanel = ({
  open, onClose, title,
  reports, t,
  defaultSelectedKeys, allColumnsFromSample,
  getFieldValue, onSelectReport
}) => {
  const [selectedCols, setSelectedCols] = useState(defaultSelectedKeys || []);

  useEffect(() => {
    if (defaultSelectedKeys?.length) setSelectedCols(defaultSelectedKeys);
    else if (allColumnsFromSample?.length) setSelectedCols(allColumnsFromSample.map(c=>c.key));
  }, [defaultSelectedKeys, allColumnsFromSample]);

  const handleExport = async () => {
    // build rows based on selected columns
    const colMap = (allColumnsFromSample||[]).filter(c => selectedCols.includes(c.key));
    const rows = (reports||[]).map((r) => {
      const row = {};
      colMap.forEach((c) => {
        switch (c.key) {
          case 'user_created_name': row[c.name] = r.user_created_name || ''; break;
          case 'main_location_name': row[c.name] = r.main_location_name || r?.structure?.location_details?.main_location_id || ''; break;
          case 'qa_section': row[c.name] = r.qa_section || r?.structure?.location_details?.section_qa_id || ''; break;
          case 'qa_sub_section': row[c.name] = r.qa_sub_section || r?.structure?.location_details?.sub_section_qa_id || ''; break;
          case 'created_at': row[c.name] = r.created_at ? format(new Date(r.created_at),'yyyy-MM-dd HH:mm') : ''; break;
          default: row[c.name] = getFieldValue(r, c.name) || ''; break;
        }
      });
      // include meta columns helpful for identification
      row._id = r._id?.$oid || r.id || '';
      row.name = r.name || '';
      return row;
    });

    // try to use xlsx, fallback to csv
    try {
      const XLSX = (await import(/* webpackChunkName: "xlsx" */ 'xlsx')).default || (await import('xlsx'));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      XLSX.writeFile(wb, `${(title||'export').replace(/[^\w\-]+/g,'_')}.xlsx`);
    } catch (e) {
      // fallback CSV
      const headers = Object.keys(rows[0] || {});
      const csv = [
        headers.join(','),
        ...rows.map(r => headers.map(h => {
          const val = (r[h] ?? '').toString().replace(/"/g,'""');
          return /[",\n]/.test(val) ? `"${val}"` : val;
        }).join(','))
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${(title||'export').replace(/[^\w\-]+/g,'_')}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
          transition={{ type:'tween', duration:.25 }}
          className="fixed top-0 right-0 h-full w-full sm:w-[48rem] bg-white dark:bg-gray-900 z-50 shadow-2xl border-l border-gray-200 dark:border-gray-700 overflow-y-auto"
        >
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                aria-label="Export to Excel"
              >
                ⬇️ Export
              </button>
              <button onClick={onClose} className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">✕</button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Column selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {tSafe(t,'reports.select_columns','Select Your Columns')}
              </label>
              <select
                multiple
                value={selectedCols}
                onChange={(e)=> setSelectedCols(Array.from(e.target.selectedOptions, o=>o.value))}
                className="w-full min-h-[10rem] py-2 px-3 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                {(allColumnsFromSample||[]).map((c)=>(
                  <option key={c.key} value={c.key}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Table with toolbar (Export button duplicated at top of table as requested) */}
            <ReportsTable
              reports={reports}
              t={t}
              setSelectedReport={onSelectReport}
              selectedColumns={selectedCols}
              getFieldValue={getFieldValue}
              toolbar={
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {reports?.length || 0} {tSafe(t,'reports.items','items')}
                  </div>
                  <button
                    onClick={handleExport}
                    className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    ⬇️ {tSafe(t,'reports.export_excel','Export to Excel')}
                  </button>
                </div>
              }
            />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

// ===================================================================
// MAIN DASHBOARD
// ===================================================================
const AIDashboard = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // live data
  const [reports, setReports] = useState([]); // includes ai_data.actions[]
  const socketRef = useRef(null);
  const pollRef = useRef(null);

  // filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // date range
  const today = useMemo(() => new Date(), []);
  const [dateFrom, setDateFrom] = useState(format(subDays(today, 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(today, 'yyyy-MM-dd'));

  const canView = useMemo(() => {
    const required = [5000,1,12001,12002,12003,12004,12005,12006,12007,12008,12009,120010];
    return (authData?.privilege_ids || []).some(id => required.includes(id));
  }, [authData]);

  // timestamps
  const getResolvedAt = (a) =>
    safeDate(a.resolution_date) ||
    safeDate(a.resolved_at) ||
    ((a.status === 'Resolved') ? safeDate(a.action_date) : null) ||
    safeDate(a.updated_at);

  const getLastUpdate = (a, rpt) =>
    safeDate(a.updated_at) ||
    safeDate(a.updated_action_at) ||
    safeDate(a.resolution_date) ||
    safeDate(a.resolved_at) ||
    safeDate(rpt?.updated_at) ||
    safeDate(rpt?.created_at) ||
    safeDate(a.action_date);

  // flatten actions
  const flattenActions = useCallback((rpt) => {
    const rid = normalizeId(rpt);
    return toArray(rpt?.ai_data?.actions).map(a => ({
      ...a,
      report_id: rid,
      report_name: rpt?.name,
      department: a.department || a.destination_department || a.dest_dept || null,
      destination_departments: rpt?.ai_data?.destination_departments || [],
      priority: rpt?.ai_data?.priority || null,
      overall_status: rpt?.ai_data?.overall_status || null,
      main_location_name: rpt?.main_location_name || null,
      qa_location: rpt?.qa_location || null,
      qa_section: rpt?.qa_section || null,
      created_at: rpt?.created_at,
      report_updated_at: rpt?.updated_at
    }));
  }, []);
  const allActions = useMemo(() => reports.flatMap(flattenActions), [reports, flattenActions]);

  // filtered
  const actionsFiltered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allActions.filter(a => {
      const deptPass = deptFilter === 'All' || a.department === deptFilter;
      const sevPass = !severityFilter || (a.priority?.toLowerCase() === severityFilter.toLowerCase());
      const stPass = !statusFilter || (a.status === statusFilter);
      const hay = [
        a.report_name, a.department, a.overall_status, a.priority,
        a.main_location_name, a.qa_section
      ].filter(Boolean).join(' ').toLowerCase();
      const qPass = !q || hay.includes(q);
      return deptPass && sevPass && stPass && qPass;
    });
  }, [allActions, deptFilter, severityFilter, statusFilter, search]);

  // KPIs
  const kpis = useMemo(() => {
    const now = new Date();
    let open = 0, noMove = 0, breached = 0, resolvedToday = 0;
    actionsFiltered.forEach(a => {
      const isPending = (a.status || 'Pending').toLowerCase() === 'pending';
      const hasUpdate = !!a.updated_action_by_user || !!a.resolution_notes;
      const actionDate = safeDate(a.action_date);
      const rpt = reports.find(r => normalizeId(r) === a.report_id);
      const due = safeDate(rpt?.corrective_action_date);
      if (isPending) open += 1;
      if (isPending && !hasUpdate) noMove += 1;
      if (isPending && due && isAfter(now, due)) breached += 1;
      if ((a.status || '').toLowerCase() === 'resolved' && actionDate && isAfter(actionDate, startOfDay(now))) {
        resolvedToday += 1;
      }
    });
    return { open, noMove, breached, resolvedToday };
  }, [actionsFiltered, reports]);

  // insights
  const deptStats = useMemo(() => {
    const map = {};
    actionsFiltered.forEach(a => {
      const d = a.department || 'Unknown';
      if (!map[d]) map[d] = { Pending: 0, Resolved: 0, Other: 0, total: 0, mttaMin: [], mttrMin: [] };
      const s = (a.status || 'Pending');
      map[d].total += 1;
      if (s === 'Pending') map[d].Pending += 1; else if (s === 'Resolved') map[d].Resolved += 1; else map[d].Other += 1;
      const created = safeDate(a.action_date);
      if (created) {
        const firstTouch = getLastUpdate(a);
        if (firstTouch) {
          const firstTouchMin = clamp(differenceInMinutes(firstTouch, created), 0, 60*24*30);
          map[d].mttaMin.push(firstTouchMin);
        }
        const resolvedAt = getResolvedAt(a);
        if (s === 'Resolved' && resolvedAt) {
          const mttr = clamp(differenceInMinutes(resolvedAt, created), 0, 60*24*30);
          map[d].mttrMin.push(mttr);
        }
      }
    });
    const toMedian = (arr) => {
      if (!arr.length) return null; const s = [...arr].sort((a,b)=>a-b);
      const m = Math.floor(s.length/2); return s.length%2?s[m]:(s[m-1]+s[m])/2;
    };
    return Object.fromEntries(Object.entries(map).map(([d, v]) => ([d, {
      ...v,
      mttaMedianMin: toMedian(v.mttaMin),
      mttrMedianMin: toMedian(v.mttrMin),
      resolutionRate: v.total ? (v.Resolved / v.total) : 0,
    }])));
  }, [actionsFiltered]);
  const departments = useMemo(() => Object.keys(deptStats).sort(), [deptStats]);

  const agingBuckets = useMemo(() => {
    const buckets = { '<4h':0, '4-24h':0, '1-3d':0, '>3d':0 };
    const now = new Date();
    actionsFiltered.forEach(a => {
      if ((a.status || 'Pending') !== 'Pending') return;
      const created = safeDate(a.action_date);
      if (!created) return;
      const hrs = differenceInMinutes(now, created)/60;
      if (hrs < 4) buckets['<4h']++; else if (hrs < 24) buckets['4-24h']++; else if (hrs < 72) buckets['1-3d']++; else buckets['>3d']++;
    });
    return buckets;
  }, [actionsFiltered]);

  const topIssues = useMemo(() => {
    const map = {};
    const rptIds = new Set(actionsFiltered.map(a => a.report_id));
    const filteredReports = reports.filter(r => rptIds.has(normalizeId(r)));
    filteredReports.forEach(r => {
      const bodies = r?.structure?.body?.sub_bodies || [];
      bodies.forEach(b => {
        if (b?.name?.toLowerCase().includes('issue')) {
          (b.fields||[]).forEach(f => {
            if (f.name?.toLowerCase().includes('issue type')) {
              const values = Array.isArray(f.value) ? f.value : (f.value ? [f.value] : []);
              values.forEach(v => { if (!map[v]) map[v]=0; map[v]++; });
            }
          });
        }
      });
    });
    return Object.entries(map).map(([k,v])=>({label:k,count:v})).sort((a,b)=>b.count-a.count).slice(0,10);
  }, [actionsFiltered, reports]);

  const matrix = useMemo(() => {
    const rptIds = new Set(actionsFiltered.map(a => a.report_id));
    const filteredReports = reports.filter(r => rptIds.has(normalizeId(r)));
    const rowKeys = Array.from(new Set(filteredReports.map(r => r.main_location_name || 'Unknown')));
    const colKeys = Array.from(new Set(filteredReports.map(r => r.qa_section || 'Unknown')));
    const grid = Object.fromEntries(rowKeys.map(rk => [rk, Object.fromEntries(colKeys.map(ck => [ck,0]))]));
    filteredReports.forEach(r => {
      const rk = r.main_location_name || 'Unknown';
      const ck = r.qa_section || 'Unknown';
      if (!grid[rk]) grid[rk] = {}; if (grid[rk][ck] == null) grid[rk][ck]=0;
      grid[rk][ck]++;
    });
    return { rows: rowKeys, cols: colKeys, grid };
  }, [actionsFiltered, reports]);

  const qualityStats = useMemo(() => {
    let notesPct = 0, slaPct = 0;
    let total = 0, withNotes = 0, slaOk = 0, slaHasDue = 0;
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    let throughput7d = 0;
    actionsFiltered.forEach(a => {
      total++;
      if (a.resolution_notes && a.resolution_notes.trim()) withNotes++;
      const rpt = reports.find(r => normalizeId(r) === a.report_id);
      const due = safeDate(rpt?.corrective_action_date);
      const resolvedAt = getResolvedAt(a);
      if (due) { slaHasDue++; if (resolvedAt && resolvedAt <= due) slaOk++; }
      if ((a.status === 'Resolved') && resolvedAt && resolvedAt >= sevenDaysAgo && resolvedAt <= now) throughput7d++;
    });
    notesPct = total ? Math.round((withNotes/total)*100) : 0;
    slaPct = slaHasDue ? Math.round((slaOk/slaHasDue)*100) : 0;
    return { throughput7d, notesPct, slaPct };
  }, [actionsFiltered, reports]);

  // REMOVED: complianceBySlot (per your request)

  const priorityMix = useMemo(() => {
    const map = {};
    actionsFiltered.forEach(a => {
      const p = (a.priority || 'Unknown').trim();
      if (!map[p]) map[p] = { Resolved: 0, Pending: 0, Other: 0 };
      const s = a.status || 'Pending';
      if (s === 'Resolved') map[p].Resolved += 1;
      else if (s === 'Pending') map[p].Pending += 1;
      else map[p].Other += 1;
    });
    const labels = Object.keys(map);
    return { labels, resolved: labels.map(l => map[l].Resolved), pending: labels.map(l => map[l].Pending), other: labels.map(l => map[l].Other) };
  }, [actionsFiltered]);

  // charts
  const deptEffChart = useMemo(() => {
    const labels = departments;
    return {
      labels,
      datasets: [
        { label: tSafe(t,'dashboard.pending','Pending'), data: labels.map(d=>deptStats[d].Pending), backgroundColor: chartColor('--color-amber-500','#F59E0B') },
        { label: tSafe(t,'dashboard.resolved','Resolved'), data: labels.map(d=>deptStats[d].Resolved), backgroundColor: chartColor('--color-green-500','#10B981') }
      ]
    };
  }, [departments, deptStats, t]);

  const agingChart = useMemo(() => ({
    labels: Object.keys(agingBuckets),
    datasets: [{ label: tSafe(t,'dashboard.pending_age','Pending Age'), data: Object.values(agingBuckets),
      backgroundColor: [
        chartColor('--color-sky-500','#0EA5E9'),
        chartColor('--color-indigo-500','#6366F1'),
        chartColor('--color-violet-500','#8B5CF6'),
        chartColor('--color-rose-500','#F43F5E')
      ] }]
  }), [agingBuckets, t]);

  const issueChart = useMemo(() => ({
    labels: topIssues.map(i=>i.label),
    datasets: [{ label: tSafe(t,'dashboard.top_issues','Top Issues'),
      data: topIssues.map(i=>i.count),
      backgroundColor: ['#4F46E5','#14B8A6','#F43F5E','#A78BFA','#10B981','#F59E0B','#EC4899','#3B82F6','#EF4444','#8B5CF6'] }]
  }), [topIssues, t]);

  // REMOVED: slotComplianceChart (per your request)

  const priorityMixChart = useMemo(() => ({
    labels: priorityMix.labels,
    datasets: [
      { label: tSafe(t,'dashboard.resolved','Resolved'), data: priorityMix.resolved, backgroundColor: chartColor('--color-green-500','#10B981') },
      { label: tSafe(t,'dashboard.pending','Pending'), data: priorityMix.pending, backgroundColor: chartColor('--color-amber-500','#F59E0B') },
      { label: tSafe(t,'dashboard.other','Other'), data: priorityMix.other, backgroundColor: chartColor('--color-indigo-400','#818CF8') }
    ]
  }), [priorityMix, t]);

  // field introspection
  const getStructureFields = useCallback((report) => {
    const fields = [];
    const pushField = (field, prefix = '') => field?.name && fields.push({
      key: `${prefix}${field.name}`.replace(/[^a-zA-Z0-9]/g,'_').toLowerCase(),
      name: field.name
    });
    const proc = (section, sKey, subKey, subSubKey) => {
      (section?.[subKey]||[]).forEach((sub,i)=>{
        (sub.fields||[]).forEach(f=>pushField(f,`${sKey}_${i}_`));
        (sub[subSubKey]||[]).forEach((ss,j)=>{
          (ss.fields||[]).forEach(f=>pushField(f,`${sKey}_${i}_${j}_`));
          if (!ss.fields?.length) pushField({ name:ss.name }, `${sKey}_${i}_${j}_`);
        });
      });
    };
    proc(report?.structure?.header,'header','sub_headers','sub_sub_headers');
    proc(report?.structure?.body,'body','sub_bodies','sub_sub_bodies');
    proc(report?.structure?.footer,'footer','sub_footers','sub_sub_footers');
    return fields;
  }, []);

  const getFieldValue = useCallback((report, fieldName) => {
    let value = '';
    const check = (section, subKey, subSubKey) => {
      (section?.[subKey]||[]).forEach((sub)=>{
        (sub.fields||[]).forEach((f)=>{ if (f.name===fieldName) value = Array.isArray(f.value)?f.value.join(', '): (f.value ?? ''); });
        (sub[subSubKey]||[]).forEach((ss)=>{
          (ss.fields||[]).forEach((f)=>{ if (f.name===fieldName) value = Array.isArray(f.value)?f.value.join(', '): (f.value ?? ''); });
          if (ss.name===fieldName && !ss.fields?.length) value = fieldName;
        });
      });
    };
    check(report?.structure?.header,'sub_headers','sub_sub_headers');
    check(report?.structure?.body,'sub_bodies','sub_sub_bodies');
    check(report?.structure?.footer,'sub_footers','sub_sub_footers');
    return value || 'N/A';
  }, []);

  const filterReportsBy = useCallback((predicate) => {
    const ids = new Set(actionsFiltered.filter(predicate).map(a=>a.report_id));
    return reports.filter(r => ids.has(normalizeId(r)));
  }, [actionsFiltered, reports]);

  // Drilldown state
  const [drillOpen, setDrillOpen] = useState(false);
  const [drillTitle, setDrillTitle] = useState('');
  const [drillReports, setDrillReports] = useState([]);
  const [drillDefaultCols, setDrillDefaultCols] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const openDrill = (title, reps) => {
    setDrillTitle(title);
    setDrillReports(reps);
    const sample = reps?.[0];
    const fixed = [
      { key: 'user_created_name', name: tSafe(t,'reports.created_by','Created By') },
      { key: 'main_location_name', name: tSafe(t,'reports.main_location','Main Location') },
      { key: 'qa_section', name: tSafe(t,'reports.qa_section','QA Section') },
      { key: 'qa_sub_section', name: tSafe(t,'reports.qa_sub_section','QA Sub-Section') },
      { key: 'created_at', name: tSafe(t,'reports.created_at','Created At') },
    ];
    const structure = sample ? getStructureFields(sample) : [];
    setDrillDefaultCols([...fixed, ...structure].map(c=>c.key));
    setDrillOpen(true);
  };

  // chart clicks
  const onDeptEffClick = (event, elements) => {
    if (!elements?.length) return;
    const { datasetIndex, index } = elements[0];
    const dept = deptEffChart.labels[index];
    const isPending = datasetIndex === 0;
    const title = `${tSafe(t,'dashboard.department_efficiency','Department Efficiency')} · ${dept} · ${isPending? tSafe(t,'dashboard.pending','Pending'): tSafe(t,'dashboard.resolved','Resolved')}`;
    const reps = filterReportsBy(a => (a.department || 'Unknown') === dept && ((a.status==='Pending') === isPending || (isPending ? a.status==='Pending' : a.status==='Resolved')));
    openDrill(title, reps);
  };
  const onAgingClick = (event, elements) => {
    if (!elements?.length) return;
    const bucket = agingChart.labels[elements[0].index];
    const now = new Date();
    const inBucket = (created) => {
      const hrs = differenceInMinutes(now, created)/60;
      if (bucket === '<4h') return hrs < 4;
      if (bucket === '4-24h') return hrs >= 4 && hrs < 24;
      if (bucket === '1-3d') return hrs >= 24 && hrs < 72;
      return hrs >= 72;
    };
    const reps = filterReportsBy(a => (a.status==='Pending') && safeDate(a.action_date) && inBucket(safeDate(a.action_date)));
    openDrill(`${tSafe(t,'dashboard.pending_age_buckets','Pending Age Buckets')} · ${bucket}`, reps);
  };
  const onIssueClick = (event, elements) => {
    if (!elements?.length) return;
    const label = issueChart.labels[elements[0].index];
    const reps = reports.filter(r => {
      const subs = r?.structure?.body?.sub_bodies || [];
      let found = false;
      subs.forEach(sb => {
        (sb.fields||[]).forEach(f => {
          if (f.name?.toLowerCase().includes('issue type')) {
            const vals = Array.isArray(f.value) ? f.value : (f.value ? [f.value] : []);
            if (vals.includes(label)) found = true;
          }
        });
      });
      return found;
    });
    openDrill(`${tSafe(t,'dashboard.top_issues','Top Issues')} · ${label}`, reps);
  };

  // REMOVED: onSlotClick (per your request)

  const onPriorityMixClick = (event, elements) => {
    if (!elements?.length) return;
    const { datasetIndex, index } = elements[0];
    const pr = priorityMixChart.labels[index];
    const statusLabel = priorityMixChart.datasets[datasetIndex].label;
    const reps = filterReportsBy(a => (a.priority || 'Unknown').trim() === pr && (
      (statusLabel==='Resolved' && a.status==='Resolved') ||
      (statusLabel==='Pending'  && a.status==='Pending')  ||
      (statusLabel==='Other'    && a.status!=='Resolved' && a.status!=='Pending')
    ));
    openDrill(`${tSafe(t,'dashboard.priority_mix','Priority Mix')} · ${pr} · ${statusLabel}`, reps);
  };

  // load & live
  const fetchWithDates = useCallback(async () => {
    if (!authData?.access_token) return;
    const from = dateFrom; const to = dateTo;
    if (from && to && from > to) return;
    setLoading(true);
    try {
      const res = await aiDashboardService.fetchAIReports(
        authData.org_id,
        { page: 1, per_page: 200, sort: '-created_at', start_date: from, end_date: to },
        authData.access_token
      );
      setReports(res.data || []);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to load reports');
    } finally { setLoading(false); }
  }, [authData, dateFrom, dateTo]);

  useEffect(() => {
    if (authLoading) return;
    if (!authData?.access_token) return;
    let mounted = true;

    const connectSocket = () => {
      const sock = aiDashboardService.getSocket(authData.access_token, authData.org_id);
      socketRef.current = sock;

      sock.on('connect', () => { sock.emit('join_org', { org_id: authData.org_id }); });
      sock.on('disconnect', () => {});

      sock.on('workflow_created', (payload) => {
        if (!mounted) return;
        setReports(prev => {
          const id = normalizeId(payload);
          const exists = prev.some(r => normalizeId(r) === id);
          return exists ? prev.map(r => normalizeId(r)===id?payload:r) : [payload, ...prev];
        });
      });
      sock.on('workflow_updated', (payload) => {
        if (!mounted) return;
        setReports(prev => prev.map(r => normalizeId(r) === normalizeId(payload) ? payload : r));
      });
      sock.on('action_updated', ({ report_id, action }) => {
        if (!mounted) return;
        setReports(prev => prev.map(r => {
          if (normalizeId(r) !== (report_id?._id || report_id)) return r;
          const actions = toArray(r?.ai_data?.actions).map(a => a._id === action._id ? { ...a, ...action } : a);
          return { ...r, ai_data: { ...(r.ai_data||{}), actions } };
        }));
      });
    };
    connectSocket();

    // fallback polling
    pollRef.current = setInterval(async () => {
      try {
        const res = await aiDashboardService.fetchAIReports(
          authData.org_id,
          { page: 1, per_page: 200, sort: '-created_at', start_date: dateFrom, end_date: dateTo },
          authData.access_token
        );
        setReports(res.data || []);
      } catch (_) {}
    }, 30_000);

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('workflow_created');
        socketRef.current.off('workflow_updated');
        socketRef.current.off('action_updated');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [authLoading, authData, dateFrom, dateTo]);

  useEffect(() => {
    if (!authLoading && canView) fetchWithDates();
  }, [authLoading, canView, fetchWithDates]);

  if (authLoading || !authData || loading) return <LoadingSpinner />;

  if (!canView) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="px-6 py-10">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {tSafe(t,'autoflow.no_permission','No permission to view reports')}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ---------- UI ----------
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Top bar */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                {tSafe(t,'dashboard.ai_live','AI Live Dashboard')}
              </h1>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <LanguageToggle />
                <ModalSearch onSearch={setSearch} />
                <ThemeToggle />
              </div>
            </div>

            {/* Errors */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm relative mb-6" role="alert">
                <span>{error}</span>
                <button onClick={() => setError('')} className="absolute top-0 right-0 px-4 py-3" aria-label="Dismiss">
                  <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20"><path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"/></svg>
                  </button>
              </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">{tSafe(t,'dashboard.open_actions','Open Actions')}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{kpis.open}</div>
                <Badge className="mt-3 bg-amber-100 text-amber-700">{tSafe(t,'dashboard.live','Live')}</Badge>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">{tSafe(t,'dashboard.no_movement','No Movement')}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{kpis.noMove}</div>
                <Badge className="mt-3 bg-gray-200 text-gray-700">{tSafe(t,'dashboard.stalled','Stalled')}</Badge>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">{tSafe(t,'dashboard.breached','Breached (Past Due)')}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{kpis.breached}</div>
                <Badge className="mt-3 bg-red-100 text-red-700">{tSafe(t,'dashboard.sla','SLA')}</Badge>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">{tSafe(t,'dashboard.resolved_today','Resolved Today')}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{kpis.resolvedToday}</div>
                <Badge className="mt-3 bg-green-100 text-green-700">{tSafe(t,'dashboard.good','Good')}</Badge>
              </div>
            </div>

            {/* QUALITY KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">{tSafe(t,'dashboard.action_throughput','Action Throughput (Last 7 Days)')}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{qualityStats.throughput7d}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{tSafe(t,'dashboard.throughput_hint','Total actions resolved in the last 7 days')}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">{tSafe(t,'dashboard.notes_adoption','Notes Adoption')}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{qualityStats.notesPct}%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{tSafe(t,'dashboard.of_actions_notes','of actions with notes')}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">{tSafe(t,'dashboard.sla_compliance','SLA Compliance')}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{qualityStats.slaPct}%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{tSafe(t,'dashboard.with_due','of items with due date')}</div>
              </div>
            </div>

            {/* Filters including date range */}
            <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{tSafe(t,'dashboard.filters','Filters')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                  placeholder={tSafe(t,'dashboard.search','Search…')}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
                <select
                  value={deptFilter}
                  onChange={(e)=>setDeptFilter(e.target.value)}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="All">{tSafe(t,'dashboard.all_departments','All Departments')}</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select
                  value={severityFilter}
                  onChange={(e)=>setSeverityFilter(e.target.value)}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="">{tSafe(t,'autoflow.select_severity','All Priorities')}</option>
                  {['High','Medium','Low','Informational'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e)=>setStatusFilter(e.target.value)}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="">{tSafe(t,'autoflow.select_status','All Statuses')}</option>
                  {['Pending','Resolved','In Progress','Open','Closed','Under Management Action','Investigated','Escalated','Rejected Case'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo}
                  onChange={(e)=>setDateFrom(e.target.value)}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  aria-label="Date From"
                />
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom}
                  onChange={(e)=>setDateTo(e.target.value)}
                  className="w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  aria-label="Date To"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {tSafe(t,'dashboard.filters_hint','Filters affect KPIs, charts, heatmap, and the table. Use Date From / Date To to extend beyond the last 30 days.')}
              </p>
            </div>

            {/* Row 1: Dept Efficiency + Aging */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {tSafe(t,'dashboard.department_efficiency','Department Efficiency (Pending vs Resolved)')}
                </h3>
                <div className="h-72">
                  <Bar
                    data={deptEffChart}
                    options={{
                      responsive:true,
                      onClick: onDeptEffClick,
                      plugins:{legend:{position:'top',labels:{color: language==='ar'? '#E5E7EB':'#1F2937'}}},
                      scales:{
                        x:{ticks:{color: language==='ar'? '#E5E7EB':'#1F2937'}},
                        y:{beginAtZero:true,ticks:{color: language==='ar'? '#E5E7EB':'#1F2937',stepSize:1}}
                      }
                    }}
                  />
                </div>
                {/* Leaderboard */}
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      <tr>
                        <th className="px-4 py-2 text-left">Dept</th>
                        <th className="px-4 py-2 text-left">Resolved%</th>
                        <th className="px-4 py-2 text-left">MTTA (min)</th>
                        <th className="px-4 py-2 text-left">MTTR (min)</th>
                        <th className="px-4 py-2 text-left">Open</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-100">
                      {departments.map(d => (
                        <tr
                          key={d}
                          className="hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer"
                          onClick={() => openDrill(`${tSafe(t,'dashboard.department_efficiency','Department Efficiency')} · ${d}`, filterReportsBy(a => (a.department||'Unknown')===d))}
                        >
                          <td className="px-4 py-2">{d}</td>
                          <td className="px-4 py-2">{Math.round((deptStats[d].resolutionRate||0)*100)}%</td>
                          <td className="px-4 py-2">{deptStats[d].mttaMedianMin ?? '—'}</td>
                          <td className="px-4 py-2">{deptStats[d].mttrMedianMin ?? '—'}</td>
                          <td className="px-4 py-2">{deptStats[d].Pending}</td>
                        </tr>
                      ))}
                      {departments.length===0 && <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">—</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {tSafe(t,'dashboard.pending_age_buckets','Pending Age Buckets')}
                </h3>
                <div className="h-64">
                  <Bar
                    data={agingChart}
                    options={{
                      responsive:true,
                      onClick: onAgingClick,
                      plugins:{legend:{display:false}},
                      scales:{y:{beginAtZero:true, ticks:{stepSize:1}}}
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {tSafe(t,'dashboard.pending_age_hint','How long actions have been waiting.')}
                </p>
              </div>
            </div>

            {/* Row 2: Top Issues + Priority Mix SIDE BY SIDE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {tSafe(t,'dashboard.top_issues','Top Recurring Issues')}
                </h3>
                <div className="h-64">
                  <Bar
                    data={issueChart}
                    options={{
                      responsive:true,
                      indexAxis:'y',
                      onClick: onIssueClick,
                      plugins:{legend:{display:false}},
                      scales:{x:{beginAtZero:true, ticks:{stepSize:1}}}
                    }}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {tSafe(t,'dashboard.priority_mix','Priority Mix (Status)')}
                </h3>
                <div className="h-64">
                  <Bar
                    data={priorityMixChart}
                    options={{
                      responsive:true,
                      onClick: onPriorityMixClick,
                      plugins:{legend:{position:'top'}},
                      scales:{x:{stacked:true}, y:{stacked:true, beginAtZero:true}}
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Location × Section */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8 overflow-x-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {tSafe(t,'dashboard.location_section_heatmap','Location × Section Heatmap')}
              </h3>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-2 text-left">{tSafe(t,'dashboard.location','Location')}</th>
                    {matrix.cols.map(c => <th key={c} className="px-4 py-2 text-left">{c}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-100">
                  {matrix.rows.map(rk => (
                    <tr key={rk}>
                      <td className="px-4 py-2 font-semibold">{rk}</td>
                      {matrix.cols.map(ck => {
                        const v = matrix.grid[rk]?.[ck] || 0;
                        const shade = v===0? 'bg-gray-50 dark:bg-gray-800' : v<3? 'bg-sky-100 dark:bg-sky-900' : v<6? 'bg-sky-200 dark:bg-sky-800' : 'bg-sky-300 dark:bg-sky-700';
                        return (
                          <td
                            key={ck}
                            className={`px-4 py-2 ${shade} cursor-pointer`}
                            onClick={() => openDrill(`${rk} × ${ck}`, reports.filter(r => (r.main_location_name||'Unknown')===rk && (r.qa_section||'Unknown')===ck))}
                          >
                            {v}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {matrix.rows.length===0 && <tr><td className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">—</td></tr>}
                </tbody>
              </table>
            </div>

            {/* 9) Issue Types × Destination Departments (Matrix) — CLICKABLE */}
            {(() => {
              // Build matrix (unchanged)
              const issueDeptMatrix = (() => {
                const rptIds = new Set(actionsFiltered.map(a => a.report_id));
                const filteredReports = reports.filter(r => rptIds.has(normalizeId(r)));

                const issueSet = new Set();
                const deptSet = new Set();
                const grid = new Map(); // key: `${issue}__${dept}`

                filteredReports.forEach(r => {
                  const issues = [];
                  const subs = r?.structure?.body?.sub_bodies || [];

                  subs.forEach(sb => {
                    if (/issue/i.test(sb?.name || '')) {
                      (sb.fields || []).forEach(f => {
                        if (/issue\s*type/i.test(f?.name || '')) {
                          const vals = Array.isArray(f.value) ? f.value : (f.value ? [f.value] : []);
                          vals.forEach(v => {
                            if (v != null && v !== '') issues.push(String(v));
                          });
                        }
                      });
                    }
                  });

                  const depts = Array.isArray(r?.ai_data?.destination_departments)
                    ? r.ai_data.destination_departments.filter(Boolean).map(String)
                    : [];

                  issues.forEach(i => issueSet.add(i));
                  depts.forEach(d => deptSet.add(d));

                  issues.forEach(i => {
                    depts.forEach(d => {
                      const key = `${i}__${d}`;
                      grid.set(key, (grid.get(key) || 0) + 1);
                    });
                  });
                });

                const rows = Array.from(issueSet);
                const cols = Array.from(deptSet);
                const value = (issue, dept) => grid.get(`${issue}__${dept}`) || 0;

                return { rows, cols, value };
              })();

              // CLICK HANDLER: open drilldown for a given Issue × Dept
              const openIssueDeptDrill = (issue, dept) => {
                // limit to the same filtered population as the matrix
                const rptIds = new Set(actionsFiltered.map(a => a.report_id));
                const reps = reports.filter(r => {
                  if (!rptIds.has(normalizeId(r))) return false;

                  // collect issue types on this report
                  const issues = [];
                  (r?.structure?.body?.sub_bodies || []).forEach(sb => {
                    if (/issue/i.test(sb?.name || '')) {
                      (sb.fields || []).forEach(f => {
                        if (/issue\s*type/i.test(f?.name || '')) {
                          const vals = Array.isArray(f.value) ? f.value : (f.value ? [f.value] : []);
                          vals.forEach(v => { if (v != null && v !== '') issues.push(String(v)); });
                        }
                      });
                    }
                  });

                  const depts = Array.isArray(r?.ai_data?.destination_departments)
                    ? r.ai_data.destination_departments.filter(Boolean).map(String)
                    : [];

                  return issues.includes(issue) && depts.includes(dept);
                });

                openDrill(`${issue} × ${dept}`, reps);
              };

              return (
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8 overflow-x-auto">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {t('dashboard.issue_dept_matrix') || 'Issue Types × Destination Departments'}
                  </h3>

                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      <tr>
                        <th className="px-4 py-2 text-left">{t('dashboard.issue_type') || 'Issue Type'}</th>
                        {issueDeptMatrix.cols.map((c) => (
                          <th key={c} className="px-4 py-2 text-left">{c}</th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-100">
                      {issueDeptMatrix.rows.map((rk) => (
                        <tr key={rk}>
                          <td className="px-4 py-2 font-semibold">{rk}</td>
                          {issueDeptMatrix.cols.map((ck) => {
                            const v = issueDeptMatrix.value(rk, ck);
                            const shade =
                              v === 0
                                ? 'bg-gray-50 dark:bg-gray-800'
                                : v < 3
                                ? 'bg-emerald-100 dark:bg-emerald-900'
                                : v < 6
                                ? 'bg-emerald-200 dark:bg-emerald-800'
                                : 'bg-emerald-300 dark:bg-emerald-700';

                            return (
                              <td
                                key={ck}
                                className={`px-4 py-2 ${shade} ${v > 0 ? 'cursor-pointer hover:ring-2 hover:ring-emerald-400/60' : ''}`}
                                onClick={() => v > 0 && openIssueDeptDrill(rk, ck)}
                                title={v > 0 ? `${rk} × ${ck}: ${v}` : undefined}
                              >
                                {v}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {issueDeptMatrix.rows.length === 0 && (
                        <tr>
                          <td
                            colSpan={issueDeptMatrix.cols.length + 1}
                            className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
                          >
                            —
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })()}


            {/* (Removed the previous Row that contained: Slot Compliance + Priority Mix) */}

            {/* Needs Attention Table */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg mb-8">
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{tSafe(t,'dashboard.needs_attention','Needs Attention (Live)')}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{tSafe(t,'dashboard.needs_attention_hint','Pending, no movement, or past due actions — sorted by age.')}</p>
              </div>
              <AttentionTable
                actions={actionsFiltered}
                reports={reports}
                t={t}
                getLastUpdate={getLastUpdate}
                onRowClick={(reportId) => {
                  const reps = reports.filter(r => normalizeId(r) === reportId);
                  if (reps.length) openDrill(`${tSafe(t,'dashboard.report','Report')} · ${reps[0].name || reportId}`, reps);
                }}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Drilldown */}
      <DrilldownPanel
        open={drillOpen}
        onClose={()=>setDrillOpen(false)}
        title={drillTitle}
        reports={drillReports}
        t={t}
        defaultSelectedKeys={drillDefaultCols}
        allColumnsFromSample={(drillReports[0] ? [
          { key:'user_created_name', name:tSafe(t,'reports.created_by','Created By') },
          { key:'main_location_name', name:tSafe(t,'reports.main_location','Main Location') },
          { key:'qa_section', name:tSafe(t,'reports.qa_section','QA Section') },
          { key:'qa_sub_section', name:tSafe(t,'reports.qa_sub_section','QA Sub-Section') },
          { key:'created_at', name:tSafe(t,'reports.created_at','Created At') },
          ...getStructureFields(drillReports[0])
        ] : [])}
        getFieldValue={getFieldValue}
        onSelectReport={(r)=> setSelectedReport(r)}
      />

      {/* Full report modal */}
      <AnimatePresence>
        {selectedReport && (
          <ReportModal
            report={selectedReport}
            onClose={()=>setSelectedReport(null)}
            authData={authData}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------- Needs Attention table ----------
const AttentionTable = ({ actions, reports, t, getLastUpdate, onRowClick }) => {
  const rows = useMemo(() => {
    const now = Date.now();
    return actions
      .filter(a => (a.status || 'Pending').toLowerCase() === 'pending')
      .map(a => {
        const ageHrs = a.action_date ? Math.max(0, (now - (safeDate(a.action_date)?.getTime() || now)) / 36e5) : null;
        const hasUpdate = !!a.updated_action_by_user || !!a.resolution_notes || !!a.updated_at;
        const rpt = reports.find(r => normalizeId(r) === a.report_id);
        const breached = rpt?.corrective_action_date ? (safeDate(rpt.corrective_action_date)?.getTime() || 0) < now : false;
        const lastUpd = getLastUpdate(a, rpt);
        return { ...a, ageHrs, noMove: !hasUpdate, breached, lastUpd };
      })
      .sort((a,b) => (b.ageHrs || 0) - (a.ageHrs || 0))
      .slice(0, 50);
  }, [actions, reports, getLastUpdate]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          <tr>
            <th className="px-4 py-2 text-left">{tSafe(t,'dashboard.report','Report')}</th>
            <th className="px-4 py-2 text-left">{tSafe(t,'dashboard.department','Department')}</th>
            <th className="px-4 py-2 text-left">{tSafe(t,'dashboard.priority','Priority')}</th>
            <th className="px-4 py-2 text-left">{tSafe(t,'dashboard.status','Status')}</th>
            <th className="px-4 py-2 text-left">{tSafe(t,'dashboard.age','Age (hrs)')}</th>
            <th className="px-4 py-2 text-left">{tSafe(t,'dashboard.flags','Flags')}</th>
            <th className="px-4 py-2 text-left">{tSafe(t,'dashboard.last_update','Last Update')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-100">
          {rows.map((a, idx) => (
            <tr
              key={`${a._id || a.id || idx}`}
              className="hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer"
              onClick={() => onRowClick?.(a.report_id)}
            >
              <td className="px-4 py-2">{a.report_name}</td>
              <td className="px-4 py-2">{a.department}</td>
              <td className="px-4 py-2">
                {a.priority ? (
                  <Badge className={
                    a.priority.toLowerCase()==='high' ? 'bg-red-600 text-white' :
                    a.priority.toLowerCase()==='medium' ? 'bg-orange-600 text-white' :
                    a.priority.toLowerCase()==='low' ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white'
                  }>
                    {a.priority}
                  </Badge>
                ) : '—'}
              </td>
              <td className="px-4 py-2">{a.status || 'Pending'}</td>
              <td className="px-4 py-2">{a.ageHrs ? a.ageHrs.toFixed(1) : '—'}</td>
              <td className="px-4 py-2">
                <div className="flex gap-2">
                  {a.noMove && <Badge className="bg-gray-200 text-gray-700">{tSafe(t,'dashboard.no_move','No Move')}</Badge>}
                  {a.breached && <Badge className="bg-red-100 text-red-700">{tSafe(t,'dashboard.breached','Breached')}</Badge>}
                </div>
              </td>
              <td className="px-4 py-2">
                {a.lastUpd ? `${formatDistanceToNow(a.lastUpd, { addSuffix: true })}` : '—'}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
              {tSafe(t,'dashboard.nothing_attention','Nothing needs attention 🎉')}
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AIDashboard;
