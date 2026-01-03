// // // // import React, { useState, useEffect } from 'react';
// // // // import { useAuth } from '../../context/AuthContext';
// // // // import { useLanguage } from '../../context/LanguageContext';
// // // // import Header from '../../partials/Header';
// // // // import Sidebar from '../../partials/Sidebar';
// // // // import LoadingSpinner from '../../components/LoadingSpinner';
// // // // import ModalSearch from '../../components/ModalSearch';
// // // // import ThemeToggle from '../../components/ThemeToggle';
// // // // import LanguageToggle from '../../components/LanguageToggle';
// // // // import investigateReportService from '../../lib/investigateReportService';
// // // // import { format, differenceInDays } from 'date-fns';
// // // // import { AnimatePresence, motion } from 'framer-motion';
// // // // import Slider from 'react-slick';
// // // // import 'slick-carousel/slick/slick.css';
// // // // import 'slick-carousel/slick/slick-theme.css';

// // // // // Custom debounce hook
// // // // const useDebounce = (value, delay) => {
// // // //   const [debouncedValue, setDebouncedValue] = useState(value);

// // // //   useEffect(() => {
// // // //     const handler = setTimeout(() => {
// // // //       setDebouncedValue(value);
// // // //     }, delay);

// // // //     return () => {
// // // //       clearTimeout(handler);
// // // //     };
// // // //   }, [value, delay]);

// // // //   return debouncedValue;
// // // // };

// // // // // Custom arrows for the slider
// // // // const PrevArrow = (props) => {
// // // //   const { onClick } = props;
// // // //   return (
// // // //     <button
// // // //       onClick={onClick}
// // // //       className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full z-10 hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // // //       aria-label="Previous Image"
// // // //     >
// // // //       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // // //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
// // // //       </svg>
// // // //     </button>
// // // //   );
// // // // };

// // // // const NextArrow = (props) => {
// // // //   const { onClick } = props;
// // // //   return (
// // // //     <button
// // // //       onClick={onClick}
// // // //       className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full z-10 hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // // //       aria-label="Next Image"
// // // //     >
// // // //       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // // //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
// // // //       </svg>
// // // //     </button>
// // // //   );
// // // // };

// // // // const ImageModal = ({ imageUrl, onClose, images = [], currentIndex = 0 }) => {
// // // //   const [index, setIndex] = useState(currentIndex);

// // // //   const nextImage = () => {
// // // //     setIndex((prev) => (prev + 1) % images.length);
// // // //   };

// // // //   const prevImage = () => {
// // // //     setIndex((prev) => (prev - 1 + images.length) % images.length);
// // // //   };

// // // //   return (
// // // //     <motion.div
// // // //       initial={{ opacity: 0 }}
// // // //       animate={{ opacity: 1 }}
// // // //       exit={{ opacity: 0 }}
// // // //       className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
// // // //       onClick={onClose}
// // // //     >
// // // //       <motion.div
// // // //         initial={{ scale: 0.8 }}
// // // //         animate={{ scale: 1 }}
// // // //         exit={{ scale: 0.8 }}
// // // //         className="relative max-w-4xl w-full"
// // // //         onClick={(e) => e.stopPropagation()}
// // // //       >
// // // //         <img
// // // //           src={images.length > 0 ? images[index] : imageUrl}
// // // //           alt="Enlarged"
// // // //           className="w-full h-auto max-h-[80vh] object-cover rounded-lg"
// // // //         />
// // // //         {images.length > 1 && (
// // // //           <>
// // // //             <button
// // // //               onClick={prevImage}
// // // //               className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // // //               aria-label="Previous Image"
// // // //             >
// // // //               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // // //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
// // // //               </svg>
// // // //             </button>
// // // //             <button
// // // //               onClick={nextImage}
// // // //               className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // // //               aria-label="Next Image"
// // // //             >
// // // //               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // // //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
// // // //               </svg>
// // // //             </button>
// // // //             <div className="text-center mt-2 text-sm text-white">
// // // //               {index + 1} / {images.length}
// // // //             </div>
// // // //           </>
// // // //         )}
// // // //         <button
// // // //           onClick={onClose}
// // // //           className="absolute top-2 right-2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // // //           aria-label="Close"
// // // //         >
// // // //           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // // //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
// // // //           </svg>
// // // //         </button>
// // // //       </motion.div>
// // // //     </motion.div>
// // // //   );
// // // // };

// // // // const ImageCarousel = ({ images, fieldName, accessToken, t }) => {
// // // //   const [imageDataUrls, setImageDataUrls] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [error, setError] = useState(null);
// // // //   const [showImageModal, setShowImageModal] = useState(false);

// // // //   useEffect(() => {
// // // //     const fetchImages = async () => {
// // // //       setLoading(true);
// // // //       try {
// // // //         const urls = await Promise.all(
// // // //           images.map(async (imagePath) => {
// // // //             const filename = imagePath.split('/').pop();
// // // //             const url = await investigateReportService.fetchImage(filename, accessToken);
// // // //             return { url, file_name: filename };
// // // //           })
// // // //         );
// // // //         setImageDataUrls(urls);
// // // //         setLoading(false);
// // // //       } catch (err) {
// // // //         setError(t('reports.fetch_image_error') || 'Failed to load images');
// // // //         setLoading(false);
// // // //       }
// // // //     };
// // // //     if (images?.length > 0) {
// // // //       fetchImages();
// // // //     } else {
// // // //       setLoading(false);
// // // //       setError(t('reports.no_images') || 'No images provided');
// // // //     }
// // // //   }, [images, accessToken, t]);

// // // //   const sliderSettings = {
// // // //     dots: imageDataUrls.length > 1,
// // // //     infinite: imageDataUrls.length > 1,
// // // //     speed: 500,
// // // //     slidesToShow: 1,
// // // //     slidesToScroll: 1,
// // // //     arrows: imageDataUrls.length > 1,
// // // //     prevArrow: <PrevArrow />,
// // // //     nextArrow: <NextArrow />,
// // // //     customPaging: (i) => (
// // // //       <button className="w-3 h-3 bg-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
// // // //         <span className="sr-only">{`Slide ${i + 1}`}</span>
// // // //       </button>
// // // //     ),
// // // //     dotsClass: "slick-dots custom-dots",
// // // //   };

// // // //   if (loading) {
// // // //     return <span className="text-gray-600 dark:text-gray-400">Loading images...</span>;
// // // //   }

// // // //   if (error) {
// // // //     return <span className="text-red-600 dark:text-red-400">{error}</span>;
// // // //   }

// // // //   if (!imageDataUrls || imageDataUrls.length === 0) {
// // // //     return <span className="text-gray-600 dark:text-gray-400">{t('reports.no_images') || 'No images'}</span>;
// // // //   }

// // // //   return (
// // // //     <>
// // // //       {imageDataUrls.length === 1 ? (
// // // //         <div className="flex flex-col items-center">
// // // //           <img
// // // //             src={imageDataUrls[0].url}
// // // //             alt={imageDataUrls[0].file_name}
// // // //             className="w-full max-w-md h-auto object-contain rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer"
// // // //             onClick={() => setShowImageModal(true)}
// // // //             role="button"
// // // //             tabIndex={0}
// // // //             onKeyDown={(e) => {
// // // //               if (e.key === 'Enter' || e.key === ' ') {
// // // //                 setShowImageModal(true);
// // // //               }
// // // //             }}
// // // //             aria-label={`View ${imageDataUrls[0].file_name}`}
// // // //           />
// // // //           <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
// // // //             {imageDataUrls[0].file_name}
// // // //           </p>
// // // //         </div>
// // // //       ) : (
// // // //         <Slider {...sliderSettings}>
// // // //           {imageDataUrls.map((image, index) => (
// // // //             <div key={index} className="relative">
// // // //               <img
// // // //                 src={image.url}
// // // //                 alt={image.file_name}
// // // //                 className="w-full h-64 object-contain rounded-lg cursor-pointer"
// // // //                 onClick={() => setShowImageModal(true)}
// // // //                 role="button"
// // // //                 tabIndex={0}
// // // //                 onKeyDown={(e) => {
// // // //                   if (e.key === 'Enter' || e.key === ' ') {
// // // //                     setShowImageModal(true);
// // // //                   }
// // // //                 }}
// // // //                 aria-label={`View ${image.file_name}`}
// // // //               />
// // // //               <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
// // // //                 {image.file_name}
// // // //               </p>
// // // //             </div>
// // // //           ))}
// // // //         </Slider>
// // // //       )}
// // // //       <AnimatePresence>
// // // //         {showImageModal && (
// // // //           <ImageModal
// // // //             images={imageDataUrls.map(img => img.url)}
// // // //             currentIndex={imageDataUrls.findIndex(img => img.url === (imageDataUrls[0]?.url || ''))}
// // // //             onClose={() => setShowImageModal(false)}
// // // //           />
// // // //         )}
// // // //       </AnimatePresence>
// // // //     </>
// // // //   );
// // // // };

// // // // const ReportModal = ({ report, onClose, authData, t, onReportUpdate }) => {
// // // //   const [enlargedImage, setEnlargedImage] = useState(null);
// // // //   const [signatureUrl, setSignatureUrl] = useState(null);
// // // //   const [signatureLoading, setSignatureLoading] = useState(false);
// // // //   const [signatureError, setSignatureError] = useState(null);
// // // //   const [statusLoading, setStatusLoading] = useState(false);
// // // //   const [statusError, setStatusError] = useState(null);
// // // //   const [investigationDetails, setInvestigationDetails] = useState(report.investigation_details || '');
// // // //   const [investigationLoading, setInvestigationLoading] = useState(false);
// // // //   const [investigationError, setInvestigationError] = useState(null);
// // // //   const [statusHistory, setStatusHistory] = useState([]);
// // // //   const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);
// // // //   const [statusHistoryError, setStatusHistoryError] = useState(null);

// // // //   // Fetch signature image if signature_url exists
// // // //   useEffect(() => {
// // // //     const fetchSignature = async () => {
// // // //       if (report.signature_url) {
// // // //         setSignatureLoading(true);
// // // //         try {
// // // //           const filename = report.signature_url.split('/').pop();
// // // //           console.log('Fetching signature for filename:', filename);
// // // //           const url = await investigateReportService.fetchImage(filename, authData.access_token);
// // // //           console.log('Signature URL fetched:', url);
// // // //           setSignatureUrl(url);
// // // //           setSignatureLoading(false);
// // // //         } catch (err) {
// // // //           console.error('Error fetching signature:', err);
// // // //           setSignatureError(t('reports.fetch_image_error') || 'Failed to load signature');
// // // //           setSignatureLoading(false);
// // // //         }
// // // //       }
// // // //     };
// // // //     fetchSignature();
// // // //   }, [report.signature_url, authData.access_token, t]);

// // // //   // Fetch status history
// // // //   useEffect(() => {
// // // //     const fetchStatusHistory = async () => {
// // // //       const reportId = report.id || report._id?.$oid;
// // // //       if (!reportId) {
// // // //         setStatusHistoryError(t('reports.invalid_report_id') || 'Invalid report ID');
// // // //         return;
// // // //       }
// // // //       setStatusHistoryLoading(true);
// // // //       setStatusHistoryError(null);
// // // //       try {
// // // //         const response = await investigateReportService.getStatusHistory({
// // // //           id: reportId,
// // // //           orgId: authData.org_id,
// // // //           accessToken: authData.access_token
// // // //         });
// // // //         console.log('Status history response:', response);
// // // //         setStatusHistory(response.data || []);
// // // //         setStatusHistoryLoading(false);
// // // //       } catch (err) {
// // // //         console.error('Error fetching status history:', {
// // // //           message: err.message,
// // // //           response: err.response,
// // // //           reportId,
// // // //           orgId: authData.org_id
// // // //         });
// // // //         setStatusHistoryError(t('reports.status_history_error', { message: err.message }) || `Failed to fetch status history: ${err.message}`);
// // // //         setStatusHistoryLoading(false);
// // // //       }
// // // //     };
// // // //     fetchStatusHistory();
// // // //   }, [report.id, report._id?.$oid, authData.org_id, authData.access_token, t]);

// // // //   const handleStatusUpdate = async (newStatus) => {
// // // //     const reportId = report.id || report._id?.$oid;
// // // //     console.log(`Updating status for report:`, { id: reportId, newStatus });
// // // //     if (!reportId) {
// // // //       setStatusError(t('reports.invalid_report_id') || 'Invalid report ID');
// // // //       return;
// // // //     }
// // // //     if (report.status === newStatus) {
// // // //       setStatusError(t('reports.already_status', { status: newStatus }) || `Report is already ${newStatus}`);
// // // //       return;
// // // //     }
// // // //     setStatusLoading(true);
// // // //     setStatusError(null);
// // // //     try {
// // // //       const response = await investigateReportService.updateReportStatus({
// // // //         id: reportId,
// // // //         orgId: authData.org_id,
// // // //         newStatus,
// // // //         accessToken: authData.access_token
// // // //       });
// // // //       console.log('Status update response:', response);
// // // //       if (response.message.includes('already')) {
// // // //         setStatusError(t('reports.already_status', { status: newStatus }) || `Report is already ${newStatus}`);
// // // //       } else {
// // // //         onReportUpdate({ ...report, status: response.report.status });
// // // //         const historyResponse = await investigateReportService.getStatusHistory({
// // // //           id: reportId,
// // // //           orgId: authData.org_id,
// // // //           accessToken: authData.access_token
// // // //         });
// // // //         setStatusHistory(historyResponse.data || []);
// // // //       }
// // // //       setStatusLoading(false);
// // // //     } catch (err) {
// // // //       console.error('Error updating status:', {
// // // //         message: err.message,
// // // //         response: err.response,
// // // //         reportId,
// // // //         orgId: authData.org_id
// // // //       });
// // // //       setStatusError(t('reports.status_error', { message: err.message }) || `Failed to update status: ${err.message}`);
// // // //       setStatusLoading(false);
// // // //     }
// // // //   };

// // // //   const handleInvestigationDetailsChange = async () => {
// // // //     const reportId = report.id || report._id?.$oid;
// // // //     console.log('Updating investigation details:', { reportId, investigationDetails });
// // // //     if (!reportId) {
// // // //       setInvestigationError(t('reports.invalid_report_id') || 'Invalid report ID');
// // // //       return;
// // // //     }
// // // //     setInvestigationLoading(true);
// // // //     setInvestigationError(null);
// // // //     try {
// // // //       const response = await investigateReportService.updateInvestigationDetails({
// // // //         id: reportId,
// // // //         orgId: authData.org_id,
// // // //         investigationDetails,
// // // //         accessToken: authData.access_token
// // // //       });
// // // //       console.log('Investigation details update response:', response);
// // // //       onReportUpdate({ ...report, investigation_details: response.report.investigation_details });
// // // //       setInvestigationLoading(false);
// // // //     } catch (err) {
// // // //       console.error('Error updating investigation details:', {
// // // //         message: err.message,
// // // //         response: err.response,
// // // //         reportId,
// // // //         orgId: authData.org_id
// // // //       });
// // // //       setInvestigationError(t('reports.investigation_error', { message: err.message }) || `Failed to update investigation details: ${err.message}`);
// // // //       setInvestigationLoading(false);
// // // //     }
// // // //   };

// // // //   const getSeverityBadgeClass = (severity) => {
// // // //     switch (severity) {
// // // //       case 'High':
// // // //         return 'bg-red-600 text-white';
// // // //       case 'Medium':
// // // //         return 'bg-orange-600 text-white';
// // // //       case 'Low':
// // // //         return 'bg-yellow-600 text-white';
// // // //       case 'Informational':
// // // //         return 'bg-blue-600 text-white';
// // // //       default:
// // // //         return 'bg-gray-600 text-white';
// // // //     }
// // // //   };

// // // //   const getFollowUpStatusBadgeClass = (status) => {
// // // //     switch (status) {
// // // //       case 'Open':
// // // //         return 'bg-yellow-600 text-white';
// // // //       case 'Pending':
// // // //         return 'bg-orange-600 text-white';
// // // //       case 'Resolved':
// // // //         return 'bg-green-600 text-white';
// // // //       case 'Closed':
// // // //         return 'bg-blue-600 text-white';
// // // //       default:
// // // //         return 'bg-gray-600 text-white';
// // // //     }
// // // //   };

// // // //   const getStatusBadgeClass = (status) => {
// // // //     switch (status) {
// // // //       case 'Escalated':
// // // //         return 'bg-orange-600 text-white';
// // // //       case 'Investigated':
// // // //         return 'bg-red-600 text-white';
// // // //       case 'Rejected Case':
// // // //         return 'bg-gray-600 text-white';
// // // //       case 'Under Management Action':
// // // //         return 'bg-yellow-600 text-white';
// // // //       case 'Resolved':
// // // //         return 'bg-green-600 text-white';
// // // //       default:
// // // //         return 'bg-gray-600 text-white';
// // // //     }
// // // //   };

// // // //   const renderFieldValue = (field) => {
// // // //     if (field.type === 'image' && field.value) {
// // // //       const [imageDataUrl, setImageDataUrl] = useState(null);
// // // //       const [loading, setLoading] = useState(true);
// // // //       const [error, setError] = useState(null);

// // // //       useEffect(() => {
// // // //         const fetchImage = async () => {
// // // //           try {
// // // //             const filename = field.value.split('/').pop();
// // // //             const url = await investigateReportService.fetchImage(filename, authData.access_token);
// // // //             setImageDataUrl(url);
// // // //             setLoading(false);
// // // //           } catch (err) {
// // // //             setError(t('reports.fetch_image_error') || 'Failed to load image');
// // // //             setLoading(false);
// // // //           }
// // // //         };
// // // //         fetchImage();
// // // //       }, [field.value, authData.access_token]);

// // // //       if (loading) return <span className="text-gray-600 dark:text-gray-400">Loading image...</span>;
// // // //       if (error) return <span className="text-red-600 dark:text-red-400">{error}</span>;

// // // //       return (
// // // //         <img
// // // //           src={imageDataUrl}
// // // //           alt={field.name}
// // // //           className="w-32 h-32 object-cover rounded-md cursor-pointer"
// // // //           onError={(e) => (e.target.src = '/placeholder-image.png')}
// // // //           onClick={() => setEnlargedImage(imageDataUrl)}
// // // //         />
// // // //       );
// // // //     } else if (field.type === 'multi_image' && Array.isArray(field.value)) {
// // // //       return <ImageCarousel images={field.value} fieldName={field.name} accessToken={authData.access_token} t={t} />;
// // // //     } else if (field.type === 'PDF') {
// // // //       return <span className="text-gray-600 dark:text-gray-400">{t('templates.pdf_upload_placeholder') || 'PDF File'}</span>;
// // // //     } else if (field.type === 'radio') {
// // // //       return field.value || t('reports.unknown') || 'N/A';
// // // //     } else if (field.type === 'Date') {
// // // //       return field.value ? format(new Date(field.value), 'PPP') : t('reports.unknown') || 'N/A';
// // // //     } else if (field.type === 'DateTime') {
// // // //       return field.value ? format(new Date(field.value), 'PPP p') : t('reports.unknown') || 'N/A';
// // // //     } else if (field.type === 'Time') {
// // // //       return field.value || t('reports.unknown') || 'N/A';
// // // //     } else if (Array.isArray(field.value)) {
// // // //       return field.value.join(', ');
// // // //     }
// // // //     return field.value || t('reports.unknown') || 'N/A';
// // // //   };

// // // //   const renderSection = (section, subSections, sectionKey) => {
// // // //     if (!subSections || !Array.isArray(subSections)) return null;
// // // //     return (
// // // //       <div className="mb-4">
// // // //         <h4 className="text-md font-medium mb-2 text-gray-800 dark:text-gray-100 capitalize">
// // // //           {section}
// // // //         </h4>
// // // //         {subSections.map((sub, subIndex) => (
// // // //           <div key={`${sectionKey}-${subIndex}`} className="border p-4 rounded-md mb-2 bg-gray-50 dark:bg-gray-700">
// // // //             <h5 className="text-sm font-medium text-gray-800 dark:text-gray-100">{sub.name || 'Unnamed Section'}</h5>
// // // //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
// // // //               {(sub.fields || []).map((field) => (
// // // //                 <div key={field.name} className="flex flex-col">
// // // //                   <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
// // // //                     {field.name || 'Unnamed Field'}:
// // // //                   </span>
// // // //                   <span className="text-sm text-gray-600 dark:text-gray-400">
// // // //                     {renderFieldValue(field)}
// // // //                   </span>
// // // //                 </div>
// // // //               ))}
// // // //             </div>
// // // //             {(sub[section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'] || []).map(
// // // //               (subSub, subSubIndex) => (
// // // //                 <div key={`${sectionKey}-${subIndex}-subSub-${subSubIndex}`} className="ml-4 mt-2 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
// // // //                   <h6 className="text-sm font-medium text-gray-800 dark:text-gray-100">{subSub.name || 'Unnamed Sub-Section'}</h6>
// // // //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
// // // //                     {(subSub.fields || []).map((field) => (
// // // //                       <div key={field.name} className="flex flex-col">
// // // //                         <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
// // // //                           {field.name || 'Unnamed Field'}:
// // // //                         </span>
// // // //                         <span className="text-sm text-gray-600 dark:text-gray-400">
// // // //                           {renderFieldValue(field)}
// // // //                         </span>
// // // //                       </div>
// // // //                     ))}
// // // //                   </div>
// // // //                 </div>
// // // //               )
// // // //             )}
// // // //           </div>
// // // //         ))}
// // // //       </div>
// // // //     );
// // // //   };

// // // //   const currentDate = new Date('2025-06-05T09:54:00.000Z');

// // // //   return (
// // // //     <>
// // // //       <motion.div
// // // //         initial={{ opacity: 0 }}
// // // //         animate={{ opacity: 1 }}
// // // //         exit={{ opacity: 0 }}
// // // //         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
// // // //       >
// // // //         <motion.div
// // // //           initial={{ scale: 0.8, y: 50 }}
// // // //           animate={{ scale: 1, y: 0 }}
// // // //           exit={{ scale: 0.8, y: 50 }}
// // // //           className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
// // // //         >
// // // //           <div className="flex justify-between items-center mb-4">
// // // //             <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
// // // //               {report.name || 'Unnamed Report'} (ID: {report.id || report._id?.$oid || 'N/A'})
// // // //             </h2>
// // // //             <button
// // // //               onClick={onClose}
// // // //               className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
// // // //               aria-label={t('reports.close') || 'Close'}
// // // //             >
// // // //               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
// // // //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
// // // //               </svg>
// // // //             </button>
// // // //           </div>
// // // //           <div className="mb-4 flex items-center gap-4">
// // // //             <button
// // // //               onClick={() => handleStatusUpdate('Investigated')}
// // // //               disabled={statusLoading || report.status !== 'Escalated'}
// // // //               className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ${
// // // //                 statusLoading || report.status !== 'Escalated'
// // // //                   ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
// // // //                   : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
// // // //               }`}
// // // //               aria-label={t('reports.case_accepted') || 'Case Accepted'}
// // // //             >
// // // //               {statusLoading ? 'Processing...' : t('reports.case_accepted') || 'Case Accepted'}
// // // //             </button>
// // // //             <button
// // // //               onClick={() => handleStatusUpdate('Rejected Case')}
// // // //               disabled={statusLoading || report.status !== 'Escalated'}
// // // //               className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ${
// // // //                 statusLoading || report.status !== 'Escalated'
// // // //                   ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
// // // //                   : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
// // // //               }`}
// // // //               aria-label={t('reports.case_rejected') || 'Case Rejected'}
// // // //             >
// // // //               {statusLoading ? 'Processing...' : t('reports.case_rejected') || 'Case Rejected'}
// // // //             </button>
// // // //             {statusError && (
// // // //               <span className="text-red-600 dark:text-red-400">{statusError}</span>
// // // //             )}
// // // //           </div>
// // // //           <div className="mb-4">
// // // //             <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">
// // // //               {t('reports.investigation_details') || 'Investigation Details'}
// // // //             </h4>
// // // //             <textarea
// // // //               value={investigationDetails}
// // // //               onChange={(e) => setInvestigationDetails(e.target.value)}
// // // //               onBlur={handleInvestigationDetailsChange}
// // // //               className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // // //               rows={4}
// // // //               aria-label={t('reports.investigation_details') || 'Investigation Details'}
// // // //             />
// // // //             {investigationLoading && (
// // // //               <span className="text-gray-600 dark:text-gray-400 block mt-2">Updating...</span>
// // // //             )}
// // // //             {investigationError && (
// // // //               <span className="text-red-600 dark:text-red-400 block mt-2">{investigationError}</span>
// // // //             )}
// // // //           </div>
// // // //           <div className="mb-4">
// // // //             <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">
// // // //               {t('reports.status_history') || 'Status History'}
// // // //             </h4>
// // // //             {statusHistoryLoading ? (
// // // //               <span className="text-gray-600 dark:text-gray-400">Loading status history...</span>
// // // //             ) : statusHistoryError ? (
// // // //               <span className="text-red-600 dark:text-red-400">{statusHistoryError}</span>
// // // //             ) : statusHistory.length === 0 ? (
// // // //               <span className="text-gray-600 dark:text-gray-400">{t('reports.no_status_history') || 'No status history available'}</span>
// // // //             ) : (
// // // //               <div className="relative">
// // // //                 <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
// // // //                 {statusHistory.map((entry, index) => {
// // // //                   const statusKey = `reports.status_${entry.status.toLowerCase().replace(' ', '_')}`;
// // // //                   const translatedStatus = t(statusKey) || entry.status;
// // // //                   const entryDate = new Date(entry.datetime);
// // // //                   const formattedDateTime = format(entryDate, 'yyyy-MM-dd hh:mm a');
// // // //                   const durationDays = differenceInDays(currentDate, entryDate);

// // // //                   const message = t('reports.status_changed_with_duration', {
// // // //                     status: translatedStatus,
// // // //                     datetime: formattedDateTime,
// // // //                     duration: durationDays
// // // //                   });
// // // //                   const fallbackMessage = `Changed to ${translatedStatus} on ${formattedDateTime} duration ${durationDays} days`;

// // // //                   return (
// // // //                     <div key={index} className="mb-4 flex items-start">
// // // //                       <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
// // // //                         <span className="w-4 h-4 bg-indigo-500 rounded-full z-10"></span>
// // // //                       </div>
// // // //                       <div className="ml-4">
// // // //                         <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeClass(entry.status)}`}>
// // // //                           {translatedStatus}
// // // //                         </span>
// // // //                         <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
// // // //                           {message.includes('{{') ? fallbackMessage : message}
// // // //                         </p>
// // // //                       </div>
// // // //                     </div>
// // // //                   );
// // // //                 })}
// // // //               </div>
// // // //             )}
// // // //           </div>
// // // //           <div className="mb-4">
// // // //             <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">
// // // //               {t('reports.corrective_action') || 'Corrective Action'}
// // // //             </h4>
// // // //             <div className="flex items-center gap-4 mb-2">
// // // //               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
// // // //                 {t('reports.corrective_action_required') || 'Corrective Action Required'}:
// // // //               </span>
// // // //               <span className="text-sm text-gray-600 dark:text-gray-400">
// // // //                 {t(report.corrective_action_required ? 'reports.corrective_action_needed' : 'reports.no_corrective_action_needed') || (report.corrective_action_required ? 'Needed' : 'Not Needed')}
// // // //               </span>
// // // //             </div>
// // // //             {report.corrective_action_required && (
// // // //               <div className="space-y-4">
// // // //                 <div>
// // // //                   <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // // //                     {t('reports.corrective_action_description') || 'Corrective Action Description'}
// // // //                   </span>
// // // //                   <span className="text-sm text-gray-600 dark:text-gray-400">
// // // //                     {report.corrective_action_description || t('reports.unknown') || 'N/A'}
// // // //                   </span>
// // // //                 </div>
// // // //                 <div>
// // // //                   <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // // //                     {t('reports.corrective_action_date') || 'Corrective Action Date'}
// // // //                   </span>
// // // //                   <span className="text-sm text-gray-600 dark:text-gray-400">
// // // //                     {report.corrective_action_date ? format(new Date(report.corrective_action_date), 'yyyy-MM-dd') : t('reports.unknown') || 'N/A'}
// // // //                   </span>
// // // //                 </div>
// // // //                 {report.corrective_action_date && (
// // // //                   <div>
// // // //                     <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // // //                       {t('reports.follow_up_status') || 'Follow Up Status'}
// // // //                     </span>
// // // //                     <span className="text-sm text-gray-600 dark:text-gray-400">
// // // //                       {t(`reports.follow_up_${report.follow_up_status?.toLowerCase()}`) || report.follow_up_status || t('reports.unknown') || 'N/A'}
// // // //                     </span>
// // // //                   </div>
// // // //                 )}
// // // //               </div>
// // // //             )}
// // // //           </div>
// // // //           {report.status && (
// // // //             <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
// // // //               {t('reports.status') || 'Status'}: 
// // // //               <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeClass(report.status)}`}>
// // // //                 {t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}
// // // //               </span>
// // // //             </p>
// // // //           )}
// // // //           {report.severity && (
// // // //             <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
// // // //               {t('reports.severity') || 'Severity'}: 
// // // //               <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getSeverityBadgeClass(report.severity)}`}>
// // // //                 {t(`reports.severity_${report.severity.toLowerCase()}`) || report.severity}
// // // //               </span>
// // // //             </p>
// // // //           )}
// // // //           {report.follow_up_status && (
// // // //             <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
// // // //               {t('reports.follow_up_status') || 'Follow Up Status'}: 
// // // //               <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getFollowUpStatusBadgeClass(report.follow_up_status)}`}>
// // // //                 {t(`reports.follow_up_${report.follow_up_status.toLowerCase()}`) || report.follow_up_status}
// // // //               </span>
// // // //             </p>
// // // //           )}
// // // //           <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
// // // //             {t('reports.template_id') || 'Template ID'}: {report.template_id || t('reports.unknown') || 'N/A'}
// // // //           </p>
// // // //           <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
// // // //             {t('reports.report_type') || 'Report Type'}: {report.reportType || t('reports.unknown') || 'N/A'}
// // // //           </p>
// // // //           <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
// // // //             {t('reports.created_by') || 'Created By'}: {report.user_created_name || t('reports.unknown') || 'Unknown'}
// // // //           </p>
// // // //           <div className="mb-4">
// // // //             <h4 className="text-md font-medium text-gray-800 dark:text-gray-100">
// // // //               {t('reports.location_details') || 'Location Details'}
// // // //             </h4>
// // // //             <p className="text-sm text-gray-600 dark:text-gray-400">
// // // //               {t('reports.main_location') || 'Main Location'}: {report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}
// // // //             </p>
// // // //             <p className="text-sm text-gray-600 dark:text-gray-400">
// // // //               {t('reports.qa_location') || 'QA Location'}: {report.qa_location || report.structure?.location_details?.locations_qa_id || t('reports.unknown') || 'N/A'}
// // // //             </p>
// // // //             <p className="text-sm text-gray-600 dark:text-gray-400">
// // // //               {t('reports.qa_section') || 'QA Section'}: {report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}
// // // //             </p>
// // // //             <p className="text-sm text-gray-600 dark:text-gray-400">
// // // //               {t('reports.qa_sub_section') || 'QA Sub-Section'}: {report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}
// // // //             </p>
// // // //           </div>
// // // //           {report.signature_url && (
// // // //             <div className="mb-4">
// // // //               <h4 className="text-md font-medium text-gray-800 dark:text-gray-100">
// // // //                 {t('reports.signature') || 'Signature'}
// // // //               </h4>
// // // //               {signatureLoading ? (
// // // //                 <span className="text-gray-600 dark:text-gray-400">Loading signature...</span>
// // // //               ) : signatureError ? (
// // // //                 <span className="text-red-600 dark:text-red-400">{signatureError}</span>
// // // //               ) : signatureUrl ? (
// // // //                 <img
// // // //                   src={signatureUrl}
// // // //                   alt="Signature"
// // // //                   className="w-32 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer"
// // // //                   onClick={() => setEnlargedImage(signatureUrl)}
// // // //                   onError={(e) => {
// // // //                     console.error('Signature image load failed:', report.signature_url);
// // // //                     e.target.src = '/placeholder-image.png';
// // // //                   }}
// // // //                 />
// // // //               ) : (
// // // //                 <span className="text-gray-600 dark:text-gray-400">No signature available</span>
// // // //               )}
// // // //             </div>
// // // //           )}
// // // //           {renderSection('header', report.structure?.header?.sub_headers, 'sub_headers')}
// // // //           {renderSection('body', report.structure?.body?.sub_bodies, 'sub_bodies')}
// // // //           {renderSection('footer', report.structure?.footer?.sub_footers, 'sub_footers')}
// // // //         </motion.div>
// // // //       </motion.div>
// // // //       <AnimatePresence>
// // // //         {enlargedImage && (
// // // //           <ImageModal imageUrl={enlargedImage} onClose={() => setEnlargedImage(null)} />
// // // //         )}
// // // //       </AnimatePresence>
// // // //     </>
// // // //   );
// // // // };

// // // // const InvestigateReport = () => {
// // // //   const { authData, loading: authLoading } = useAuth();
// // // //   const { language, t } = useLanguage();
// // // //   const [sidebarOpen, setSidebarOpen] = useState(false);
// // // //   const [hasPrivilege, setHasPrivilege] = useState(false);
// // // //   const [error, setError] = useState('');
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [reports, setReports] = useState([]);
// // // //   const [reportTypes, setReportTypes] = useState([]);
// // // //   const [selectedReport, setSelectedReport] = useState(null);
// // // //   const [currentPage, setCurrentPage] = useState(1);
// // // //   const [perPage] = useState(6);
// // // //   const [totalPages, setTotalPages] = useState(1);
// // // //   const [filters, setFilters] = useState({
// // // //     startDate: '',
// // // //     endDate: '',
// // // //     reportType: '',
// // // //     search: '',
// // // //     sort: '-created_at',
// // // //   });
// // // //   const [searchInput, setSearchInput] = useState('');
// // // //   const debouncedSearch = useDebounce(searchInput, 1000);
// // // //   const [signatureUrls, setSignatureUrls] = useState({});

// // // //   useEffect(() => {
// // // //     setFilters((prev) => ({ ...prev, search: debouncedSearch }));
// // // //   }, [debouncedSearch]);

// // // //   useEffect(() => {
// // // //     if (authLoading) return;

// // // //     if (!authData?.access_token) {
// // // //       setError(t('reports.no_permission') || 'No permission to view reports');
// // // //       setLoading(false);
// // // //       return;
// // // //     }

// // // //     if (authData.privilege_ids?.includes(1)) {
// // // //       setHasPrivilege(true);
// // // //       fetchReports();
// // // //     } else {
// // // //       setError(t('reports.no_permission') || 'No permission to view reports');
// // // //       setHasPrivilege(false);
// // // //       setLoading(false);
// // // //     }
// // // //   }, [authData, authLoading, currentPage, filters, language, t]);

// // // //   const fetchReports = async () => {
// // // //     setLoading(true);
// // // //     try {
// // // //       const response = await investigateReportService.getReports(authData.org_id, {
// // // //         page: currentPage,
// // // //         perPage,
// // // //         reportType: filters.reportType,
// // // //         sort: filters.sort,
// // // //         lang: language || 'en',
// // // //       });

// // // //       console.log('Full API response:', response);
// // // //       console.log('Fetched reports:', response.data.map(r => ({
// // // //         id: r.id || r._id?.$oid,
// // // //         name: r.name,
// // // //         status: r.status,
// // // //         severity: r.severity,
// // // //         corrective_action_required: r.corrective_action_required,
// // // //         follow_up_status: r.follow_up_status,
// // // //         investigation_details: r.investigation_details
// // // //       })));
// // // //       setReports(Array.isArray(response.data) ? response.data : []);
// // // //       setTotalPages(response.pagination?.total_pages || 1);

// // // //       const uniqueReportTypes = response.data && Array.isArray(response.data)
// // // //         ? [...new Set(response.data.map((report) => report.reportType).filter(Boolean))]
// // // //         : [];
// // // //       setReportTypes(uniqueReportTypes.map((type) => ({ _id: type, name: type })));
// // // //       setLoading(false);
// // // //     } catch (err) {
// // // //       console.error('Error fetching reports:', err);
// // // //       setError(t('reports.fetch_reports_error', { message: err.message }) || `Error: ${err.message}`);
// // // //       setReports([]);
// // // //       setTotalPages(1);
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     const fetchSignatures = async () => {
// // // //       const signatures = {};
// // // //       for (const report of reports) {
// // // //         const reportId = report._id?.$oid || report.id;
// // // //         if (report.signature_url && reportId) {
// // // //           try {
// // // //             const filename = report.signature_url.split('/').pop();
// // // //             console.log(`Fetching signature for report ${reportId}, filename: ${filename}`);
// // // //             const url = await investigateReportService.fetchImage(filename, authData.access_token);
// // // //             signatures[reportId] = url;
// // // //             console.log(`Signature URL for report ${reportId}: ${url}`);
// // // //           } catch (err) {
// // // //             console.error(`Error fetching signature for report ${reportId}:`, err);
// // // //             signatures[reportId] = null;
// // // //           }
// // // //         }
// // // //       }
// // // //       setSignatureUrls(signatures);
// // // //     };

// // // //     if (authData?.access_token && reports.length > 0) {
// // // //       fetchSignatures();
// // // //     }
// // // //   }, [reports, authData?.access_token]);

// // // //   const handleReportUpdate = (updatedReport) => {
// // // //     setReports((prevReports) =>
// // // //       prevReports.map((report) =>
// // // //         (report.id || report._id?.$oid) === (updatedReport.id || updatedReport._id?.$oid)
// // // //           ? updatedReport
// // // //           : report
// // // //       )
// // // //     );
// // // //     setSelectedReport(updatedReport);
// // // //   };

// // // //   const handleFilterChange = (e) => {
// // // //     const { name, value } = e.target;
// // // //     if (name === 'search') {
// // // //       setSearchInput(value);
// // // //     } else {
// // // //       setFilters((prev) => ({ ...prev, [name]: value }));
// // // //       setCurrentPage(1);
// // // //     }
// // // //   };

// // // //   const handlePageChange = (page) => {
// // // //     if (page >= 1 && page <= totalPages) {
// // // //       setCurrentPage(page);
// // // //       window.scrollTo({ top: 0, behavior: 'smooth' });
// // // //     }
// // // //   };

// // // //   const getStatusBarClass = (status) => {
// // // //     switch (status) {
// // // //       case 'Escalated':
// // // //         return 'bg-orange-600';
// // // //       case 'Investigated':
// // // //         return 'bg-red-600';
// // // //       case 'Rejected Case':
// // // //         return 'bg-gray-600';
// // // //       case 'Under Management Action':
// // // //         return 'bg-yellow-600';
// // // //       case 'Resolved':
// // // //         return 'bg-green-600';
// // // //       default:
// // // //         return '';
// // // //     }
// // // //   };

// // // //   const getSeverityBadgeClass = (severity) => {
// // // //     switch (severity) {
// // // //       case 'High':
// // // //         return 'bg-red-600 text-white';
// // // //       case 'Medium':
// // // //         return 'bg-orange-600 text-white';
// // // //       case 'Low':
// // // //         return 'bg-yellow-600 text-white';
// // // //       case 'Informational':
// // // //         return 'bg-blue-600 text-white';
// // // //       default:
// // // //         return 'bg-gray-600 text-white';
// // // //     }
// // // //   };

// // // //   const getFollowUpStatusBadgeClass = (status) => {
// // // //     switch (status) {
// // // //       case 'Open':
// // // //         return 'bg-yellow-600 text-white';
// // // //       case 'Pending':
// // // //         return 'bg-orange-600 text-white';
// // // //       case 'Resolved':
// // // //         return 'bg-green-600 text-white';
// // // //       case 'Closed':
// // // //         return 'bg-blue-600 text-white';
// // // //       default:
// // // //         return 'bg-gray-600 text-white';
// // // //     }
// // // //   };

// // // //   const paginatedReports = reports;

// // // //   if (authLoading || !authData || loading) {
// // // //     return <LoadingSpinner />;
// // // //   }

// // // //   return (
// // // //     <div className="flex h-screen overflow-hidden">
// // // //       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
// // // //       <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
// // // //         <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
// // // //         <main>
// // // //           <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
// // // //             <div className="sm:flex sm:justify-between sm:items-center mb-8">
// // // //               <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
// // // //                 {t('investigate_report.view_reports') || 'Investigate Reports'}
// // // //               </h1>
// // // //               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
// // // //                 <LanguageToggle />
// // // //                 <ModalSearch />
// // // //                 <ThemeToggle />
// // // //               </div>
// // // //             </div>
// // // //             <div className="mb-6">
// // // //               <div className="relative">
// // // //                 <input
// // // //                   type="text"
// // // //                   value={searchInput}
// // // //                   onChange={handleFilterChange}
// // // //                   name="search"
// // // //                   placeholder={t('reports.search_placeholder') || 'Search by name, domain, or description...'}
// // // //                   className="w-full py-3 px-4 pl-12 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // // //                   aria-label={t('reports.search_placeholder') || 'Search reports'}
// // // //                 />
// // // //                 <svg
// // // //                   className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400"
// // // //                   fill="none"
// // // //                   stroke="currentColor"
// // // //                   viewBox="0 0 24 24"
// // // //                 >
// // // //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
// // // //                 </svg>
// // // //               </div>
// // // //             </div>
// // // //             {error && (
// // // //               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm relative mb-6" role="alert">
// // // //                 <span>{error}</span>
// // // //                 <button
// // // //                   onClick={() => setError('')}
// // // //                   className="absolute top-0 right-0 px-4 py-3"
// // // //                   aria-label={t('common.dismiss_error') || 'Dismiss error'}
// // // //                 >
// // // //                   <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
// // // //                     <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
// // // //                   </svg>
// // // //                 </button>
// // // //               </div>
// // // //             )}
// // // //             <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
// // // //               <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
// // // //                 {t('reports.filters') || 'Filters'}
// // // //               </h2>
// // // //               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
// // // //                 <div>
// // // //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // // //                     {t('reports.start_date') || 'Start Date'}
// // // //                   </label>
// // // //                   <input
// // // //                     type="date"
// // // //                     name="startDate"
// // // //                     value={filters.startDate}
// // // //                     onChange={handleFilterChange}
// // // //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // // //                   />
// // // //                 </div>
// // // //                 <div>
// // // //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // // //                     {t('reports.end_date') || 'End Date'}
// // // //                   </label>
// // // //                   <input
// // // //                     type="date"
// // // //                     name="endDate"
// // // //                     value={filters.endDate}
// // // //                     onChange={handleFilterChange}
// // // //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // // //                   />
// // // //                 </div>
// // // //                 <div>
// // // //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // // //                     {t('reports.report_type') || 'Report Type'}
// // // //                   </label>
// // // //                   <select
// // // //                     name="reportType"
// // // //                     value={filters.reportType}
// // // //                     onChange={handleFilterChange}
// // // //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // // //                   >
// // // //                     <option value="">{t('reports.all_report_types') || 'All Report Types'}</option>
// // // //                     {reportTypes.map((type) => (
// // // //                       <option key={type._id} value={type.name}>
// // // //                         {type.name}
// // // //                       </option>
// // // //                     ))}
// // // //                   </select>
// // // //                 </div>
// // // //                 <div>
// // // //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // // //                     {t('reports.sort') || 'Sort'}
// // // //                   </label>
// // // //                   <select
// // // //                     name="sort"
// // // //                     value={filters.sort}
// // // //                     onChange={handleFilterChange}
// // // //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // // //                   >
// // // //                     <option value="-created_at">{t('reports.sort_newest') || 'Newest First'}</option>
// // // //                     <option value="created_at">{t('reports.sort_oldest') || 'Oldest First'}</option>
// // // //                   </select>
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //             {loading ? (
// // // //               <LoadingSpinner />
// // // //             ) : (
// // // //               <>
// // // //                 {paginatedReports.length === 0 ? (
// // // //                   <div className="text-center text-gray-600 dark:text-gray-300 py-12">
// // // //                     <svg
// // // //                       className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
// // // //                       fill="none"
// // // //                       stroke="currentColor"
// // // //                       viewBox="0 0 24 24"
// // // //                     >
// // // //                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
// // // //                     </svg>
// // // //                     <p className="text-lg">{t('reports.no_reports') || 'No reports found'}</p>
// // // //                   </div>
// // // //                 ) : (
// // // //                   <>
// // // //                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// // // //                       {paginatedReports.map((report) => {
// // // //                         const reportId = report._id?.$oid || report.id;
// // // //                         const statusBarClass = getStatusBarClass(report.status);
// // // //                         return (
// // // //                           <div
// // // //                             key={reportId}
// // // //                             className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
// // // //                             role="button"
// // // //                             aria-label={`${t('reports.report_name') || 'Report'}: ${report.name}`}
// // // //                             onClick={() => setSelectedReport(report)}
// // // //                             tabIndex={0}
// // // //                             onKeyDown={(e) => {
// // // //                               if (e.key === 'Enter' || e.key === ' ') {
// // // //                                 setSelectedReport(report);
// // // //                               }
// // // //                             }}
// // // //                           >
// // // //                             {report.status && (
// // // //                               <div className={`${statusBarClass} text-white text-sm font-bold text-center py-2 rounded-t-lg -mt-6 -mx-6 mb-4`}>
// // // //                                 {t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}
// // // //                               </div>
// // // //                             )}
// // // //                             <div className="space-y-3">
// // // //                               <div className="flex justify-between items-start">
// // // //                                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200">
// // // //                                   {report.name || 'Unnamed Report'}
// // // //                                 </h3>
// // // //                                 <div className="flex flex-col gap-2">
// // // //                                   {report.severity && (
// // // //                                     <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getSeverityBadgeClass(report.severity)}`}>
// // // //                                       {t(`reports.severity_${report.severity.toLowerCase()}`) || report.severity}
// // // //                                     </span>
// // // //                                   )}
// // // //                                   {report.follow_up_status && (
// // // //                                     <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getFollowUpStatusBadgeClass(report.follow_up_status)}`}>
// // // //                                       {t(`reports.follow_up_${report.follow_up_status.toLowerCase()}`) || report.follow_up_status}
// // // //                                     </span>
// // // //                                   )}
// // // //                                 </div>
// // // //                               </div>
// // // //                               <div>
// // // //                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // // //                                   {t('reports.report_type') || 'Report Type'}
// // // //                                 </span>
// // // //                                 <p className="text-gray-800 dark:text-gray-100">{report.reportType || t('reports.unknown') || 'N/A'}</p>
// // // //                               </div>
// // // //                               <div>
// // // //                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // // //                                   {t('reports.created_by') || 'Created By'}
// // // //                                 </span>
// // // //                                 <p className="text-gray-800 dark:text-gray-100">{report.user_created_name || t('reports.unknown') || 'Unknown'}</p>
// // // //                               </div>
// // // //                               <div>
// // // //                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // // //                                   {t('reports.main_location') || 'Main Location'}
// // // //                                 </span>
// // // //                                 <p className="text-gray-800 dark:text-gray-100">{report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}</p>
// // // //                               </div>
// // // //                               <div>
// // // //                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // // //                                   {t('reports.qa_section') || 'QA Section'}
// // // //                                 </span>
// // // //                                 <p className="text-gray-800 dark:text-gray-100">{report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}</p>
// // // //                               </div>
// // // //                               <div>
// // // //                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // // //                                   {t('reports.qa_sub_section') || 'QA Sub-Section'}
// // // //                                 </span>
// // // //                                 <p className="text-gray-800 dark:text-gray-100">{report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}</p>
// // // //                               </div>
// // // //                               {report.created_at && (
// // // //                                 <div>
// // // //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // // //                                     {t('reports.created_at') || 'Created At'}
// // // //                                   </span>
// // // //                                   <p className="text-gray-800 dark:text-gray-100">{format(new Date(report.created_at), 'PPP')}</p>
// // // //                                 </div>
// // // //                               )}
// // // //                               {report.status && (
// // // //                                 <div>
// // // //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // // //                                     {t('reports.status') || 'Status'}
// // // //                                   </span>
// // // //                                   <p className="text-gray-800 dark:text-gray-100">{t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}</p>
// // // //                                 </div>
// // // //                               )}
// // // //                               {report.corrective_action_required && (
// // // //                                 <div>
// // // //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // // //                                     {t('reports.corrective_action_required') || 'Corrective Action'}
// // // //                                   </span>
// // // //                                   <p className="text-gray-800 dark:text-gray-100">{t(report.corrective_action_required ? 'reports.corrective_action_needed' : 'reports.no_corrective_action_needed') || (report.corrective_action_required ? 'Needed' : 'Not Needed')}</p>
// // // //                                 </div>
// // // //                               )}
// // // //                               {report.signature_url && (
// // // //                                 <div>
// // // //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // // //                                     {t('reports.signature') || 'Signature'}
// // // //                                   </span>
// // // //                                   {signatureUrls[reportId] === undefined ? (
// // // //                                     <span className="text-gray-600 dark:text-gray-400">Loading signature...</span>
// // // //                                   ) : signatureUrls[reportId] === null ? (
// // // //                                     <span className="text-red-600 dark:text-red-400">Failed to load signature</span>
// // // //                                   ) : (
// // // //                                     <img
// // // //                                       src={signatureUrls[reportId]}
// // // //                                       alt="Signature"
// // // //                                       className="w-24 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-700 shadow-sm mt-2 cursor-pointer"
// // // //                                       onError={(e) => {
// // // //                                         console.error('Signature image load failed for report:', reportId);
// // // //                                         e.target.src = '/placeholder-image.png';
// // // //                                       }}
// // // //                                       onClick={() => setSelectedReport(report)}
// // // //                                     />
// // // //                                   )}
// // // //                                 </div>
// // // //                               )}
// // // //                             </div>
// // // //                           </div>
// // // //                         );
// // // //                       })}
// // // //                     </div>
// // // //                     {totalPages > 1 && (
// // // //                       <div className="flex justify-center items-center gap-3 mt-8">
// // // //                         <button
// // // //                           onClick={() => handlePageChange(currentPage - 1)}
// // // //                           disabled={currentPage === 1}
// // // //                           className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // // //                           aria-label={t('reports.previous') || 'Previous'}
// // // //                         >
// // // //                           {t('reports.previous') || 'Previous'}
// // // //                         </button>
// // // //                         <div className="flex gap-2">
// // // //                           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
// // // //                             <button
// // // //                               key={page}
// // // //                               onClick={() => handlePageChange(page)}
// // // //                               className={`px-4 py-2 rounded-lg ${
// // // //                                 page === currentPage
// // // //                                   ? 'bg-indigo-500 text-white'
// // // //                                   : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
// // // //                               } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
// // // //                               aria-label={`Page ${page}`}
// // // //                               aria-current={page === currentPage ? 'page' : undefined}
// // // //                             >
// // // //                               {page}
// // // //                             </button>
// // // //                           ))}
// // // //                         </div>
// // // //                         <button
// // // //                           onClick={() => handlePageChange(currentPage + 1)}
// // // //                           disabled={currentPage === totalPages}
// // // //                           className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // // //                           aria-label={t('reports.next') || 'Next'}
// // // //                         >
// // // //                           {t('reports.next') || 'Next'}
// // // //                         </button>
// // // //                         <select
// // // //                           value={currentPage}
// // // //                           onChange={(e) => handlePageChange(Number(e.target.value))}
// // // //                           className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // // //                           aria-label={t('reports.jump_to_page') || 'Jump to page'}
// // // //                         >
// // // //                           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
// // // //                             <option key={page} value={page}>
// // // //                               {t('reports.page') || 'Page'} {page}
// // // //                             </option>
// // // //                           ))}
// // // //                         </select>
// // // //                       </div>
// // // //                     )}
// // // //                     <AnimatePresence>
// // // //                       {selectedReport && (
// // // //                         <ReportModal
// // // //                           report={selectedReport}
// // // //                           onClose={() => setSelectedReport(null)}
// // // //                           authData={authData}
// // // //                           t={t}
// // // //                           onReportUpdate={handleReportUpdate}
// // // //                         />
// // // //                       )}
// // // //                     </AnimatePresence>
// // // //                   </>
// // // //                 )}
// // // //               </>
// // // //             )}
// // // //           </div>
// // // //         </main>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default InvestigateReport;


// // // // Working till friday 




// // // import React, { useState, useEffect } from 'react';
// // // import { useAuth } from '../../context/AuthContext';
// // // import { useLanguage } from '../../context/LanguageContext';
// // // import Header from '../../partials/Header';
// // // import Sidebar from '../../partials/Sidebar';
// // // import LoadingSpinner from '../../components/LoadingSpinner';
// // // import ModalSearch from '../../components/ModalSearch';
// // // import ThemeToggle from '../../components/ThemeToggle';
// // // import LanguageToggle from '../../components/LanguageToggle';
// // // import investigateReportService from '../../lib/investigateReportService';
// // // import { format, differenceInDays } from 'date-fns';
// // // import { AnimatePresence, motion } from 'framer-motion';
// // // import Slider from 'react-slick';
// // // import 'slick-carousel/slick/slick.css';
// // // import 'slick-carousel/slick/slick-theme.css';

// // // // Custom debounce hook
// // // const useDebounce = (value, delay) => {
// // //   const [debouncedValue, setDebouncedValue] = useState(value);

// // //   useEffect(() => {
// // //     const handler = setTimeout(() => {
// // //       setDebouncedValue(value);
// // //     }, delay);

// // //     return () => {
// // //       clearTimeout(handler);
// // //     };
// // //   }, [value, delay]);

// // //   return debouncedValue;
// // // };

// // // // Custom arrows for the slider
// // // const PrevArrow = (props) => {
// // //   const { onClick } = props;
// // //   return (
// // //     <button
// // //       onClick={onClick}
// // //       className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full z-10 hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // //       aria-label="Previous Image"
// // //     >
// // //       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
// // //       </svg>
// // //     </button>
// // //   );
// // // };

// // // const NextArrow = (props) => {
// // //   const { onClick } = props;
// // //   return (
// // //     <button
// // //       onClick={onClick}
// // //       className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full z-10 hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // //       aria-label="Next Image"
// // //     >
// // //       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
// // //       </svg>
// // //     </button>
// // //   );
// // // };

// // // const ImageModal = ({ imageUrl, onClose, images = [], currentIndex = 0 }) => {
// // //   const [index, setIndex] = useState(currentIndex);

// // //   const nextImage = () => {
// // //     setIndex((prev) => (prev + 1) % images.length);
// // //   };

// // //   const prevImage = () => {
// // //     setIndex((prev) => (prev - 1 + images.length) % images.length);
// // //   };

// // //   return (
// // //     <motion.div
// // //       initial={{ opacity: 0 }}
// // //       animate={{ opacity: 1 }}
// // //       exit={{ opacity: 0 }}
// // //       className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
// // //       onClick={onClose}
// // //     >
// // //       <motion.div
// // //         initial={{ scale: 0.8 }}
// // //         animate={{ scale: 1 }}
// // //         exit={{ scale: 0.8 }}
// // //         className="relative max-w-4xl w-full"
// // //         onClick={(e) => e.stopPropagation()}
// // //       >
// // //         <img
// // //           src={images.length > 0 ? images[index] : imageUrl}
// // //           alt="Enlarged"
// // //           className="w-full h-auto max-h-[80vh] object-cover rounded-lg"
// // //         />
// // //         {images.length > 1 && (
// // //           <>
// // //             <button
// // //               onClick={prevImage}
// // //               className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // //               aria-label="Previous Image"
// // //             >
// // //               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
// // //               </svg>
// // //             </button>
// // //             <button
// // //               onClick={nextImage}
// // //               className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // //               aria-label="Next Image"
// // //             >
// // //               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
// // //               </svg>
// // //             </button>
// // //             <div className="text-center mt-2 text-sm text-white">
// // //               {index + 1} / {images.length}
// // //             </div>
// // //           </>
// // //         )}
// // //         <button
// // //           onClick={onClose}
// // //           className="absolute top-2 right-2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // //           aria-label="Close"
// // //         >
// // //           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// // //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
// // //           </svg>
// // //         </button>
// // //       </motion.div>
// // //     </motion.div>
// // //   );
// // // };



// // // const ImageCarousel = ({ images, fieldName, accessToken, t }) => {
// // //   const [imageDataUrls, setImageDataUrls] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState(null);
// // //   const [showImageModal, setShowImageModal] = useState(false);

// // //   useEffect(() => {
// // //     const fetchImages = async () => {
// // //       setLoading(true);
// // //       try {
// // //         const urls = await Promise.all(
// // //           images.map(async (imagePath) => {
// // //             const filename = imagePath.split('/').pop();
// // //             const url = await investigateReportService.fetchImage(filename, accessToken);
// // //             return { url, file_name: filename };
// // //           })
// // //         );
// // //         setImageDataUrls(urls);
// // //         setLoading(false);
// // //       } catch (err) {
// // //         setError(t('reports.fetch_image_error') || 'Failed to load images');
// // //         setLoading(false);
// // //       }
// // //     };
// // //     if (images?.length > 0) {
// // //       fetchImages();
// // //     } else {
// // //       setLoading(false);
// // //       setError(t('reports.no_images') || 'No images provided');
// // //     }
// // //   }, [images, accessToken, t]);

// // //   const sliderSettings = {
// // //     dots: imageDataUrls.length > 1,
// // //     infinite: imageDataUrls.length > 1,
// // //     speed: 500,
// // //     slidesToShow: 1,
// // //     slidesToScroll: 1,
// // //     arrows: imageDataUrls.length > 1,
// // //     prevArrow: <PrevArrow />,
// // //     nextArrow: <NextArrow />,
// // //     customPaging: (i) => (
// // //       <button className="w-3 h-3 bg-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
// // //         <span className="sr-only">{`Slide ${i + 1}`}</span>
// // //       </button>
// // //     ),
// // //     dotsClass: "slick-dots custom-dots",
// // //   };

// // //   if (loading) {
// // //     return <span className="text-gray-600 dark:text-gray-400">Loading images...</span>;
// // //   }

// // //   if (error) {
// // //     return <span className="text-red-600 dark:text-red-400">{error}</span>;
// // //   }

// // //   if (!imageDataUrls || imageDataUrls.length === 0) {
// // //     return <span className="text-gray-600 dark:text-gray-400">{t('reports.no_images') || 'No images'}</span>;
// // //   }

// // //   return (
// // //     <>
// // //       {imageDataUrls.length === 1 ? (
// // //         <div className="flex flex-col items-center">
// // //           <img
// // //             src={imageDataUrls[0].url}
// // //             alt={imageDataUrls[0].file_name}
// // //             className="w-full max-w-md h-auto object-contain rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer"
// // //             onClick={() => setShowImageModal(true)}
// // //             role="button"
// // //             tabIndex={0}
// // //             onKeyDown={(e) => {
// // //               if (e.key === 'Enter' || e.key === ' ') {
// // //                 setShowImageModal(true);
// // //               }
// // //             }}
// // //             aria-label={`View ${imageDataUrls[0].file_name}`}
// // //           />
// // //           <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
// // //             {imageDataUrls[0].file_name}
// // //           </p>
// // //         </div>
// // //       ) : (
// // //         <Slider {...sliderSettings}>
// // //           {imageDataUrls.map((image, index) => (
// // //             <div key={index} className="relative">
// // //               <img
// // //                 src={image.url}
// // //                 alt={image.file_name}
// // //                 className="w-full h-64 object-contain rounded-lg cursor-pointer"
// // //                 onClick={() => setShowImageModal(true)}
// // //                 role="button"
// // //                 tabIndex={0}
// // //                 onKeyDown={(e) => {
// // //                   if (e.key === 'Enter' || e.key === ' ') {
// // //                     setShowImageModal(true);
// // //                   }
// // //                 }}
// // //                 aria-label={`View ${image.file_name}`}
// // //               />
// // //               <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
// // //                 {image.file_name}
// // //               </p>
// // //             </div>
// // //           ))}
// // //         </Slider>
// // //       )}
// // //       <AnimatePresence>
// // //         {showImageModal && (
// // //           <ImageModal
// // //             images={imageDataUrls.map(img => img.url)}
// // //             currentIndex={imageDataUrls.findIndex(img => img.url === (imageDataUrls[0]?.url || ''))}
// // //             onClose={() => setShowImageModal(false)}
// // //           />
// // //         )}
// // //       </AnimatePresence>
// // //     </>
// // //   );
// // // };

// // // const ReportModal = ({ report, onClose, authData, t, onReportUpdate }) => {
// // //   const [enlargedImage, setEnlargedImage] = useState(null);
// // //   const [signatureUrl, setSignatureUrl] = useState(null);
// // //   const [signatureLoading, setSignatureLoading] = useState(false);
// // //   const [signatureError, setSignatureError] = useState(null);
// // //   const [statusLoading, setStatusLoading] = useState(false);
// // //   const [statusError, setStatusError] = useState(null);
// // //   const [investigationDetails, setInvestigationDetails] = useState(report.investigation_details || '');
// // //   const [investigationLoading, setInvestigationLoading] = useState(false);
// // //   const [investigationError, setInvestigationError] = useState(null);
// // //   const [statusHistory, setStatusHistory] = useState([]);
// // //   const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);
// // //   const [statusHistoryError, setStatusHistoryError] = useState(null);
// // //   const { language } = useLanguage();

// // //   useEffect(() => {
// // //     const fetchSignature = async () => {
// // //       if (report.signature_url) {
// // //         setSignatureLoading(true);
// // //         try {
// // //           const filename = report.signature_url.split('/').pop();
// // //           console.log('Fetching signature for filename:', filename);
// // //           const url = await investigateReportService.fetchImage(filename, authData.access_token);
// // //           console.log('Signature URL fetched:', url);
// // //           setSignatureUrl(url);
// // //           setSignatureLoading(false);
// // //         } catch (err) {
// // //           console.error('Error fetching signature:', err);
// // //           setSignatureError(t('reports.fetch_image_error') || 'Failed to load signature');
// // //           setSignatureLoading(false);
// // //         }
// // //       }
// // //     };
// // //     fetchSignature();
// // //   }, [report.signature_url, authData.access_token, t]);

// // //   useEffect(() => {
// // //     const fetchStatusHistory = async () => {
// // //       const reportId = report.id || report._id?.$oid;
// // //       if (!reportId) {
// // //         setStatusHistoryError(t('reports.invalid_report_id') || 'Invalid report ID');
// // //         return;
// // //       }
// // //       setStatusHistoryLoading(true);
// // //       setStatusHistoryError(null);
// // //       try {
// // //         const response = await investigateReportService.getStatusHistory({
// // //           id: reportId,
// // //           orgId: authData.org_id,
// // //           accessToken: authData.access_token
// // //         });
// // //         console.log('Status history response:', response);
// // //         setStatusHistory(response.data || []);
// // //         setStatusHistoryLoading(false);
// // //       } catch (err) {
// // //         console.error('Error fetching status history:', {
// // //           message: err.message,
// // //           response: err.response,
// // //           reportId,
// // //           orgId: authData.org_id
// // //         });
// // //         setStatusHistoryError(t('reports.status_history_error', { message: err.message }) || `Failed to fetch status history: ${err.message}`);
// // //         setStatusHistoryLoading(false);
// // //       }
// // //     };
// // //     fetchStatusHistory();
// // //   }, [report.id, report._id?.$oid, authData.org_id, authData.access_token, t]);

// // //   const handleStatusUpdate = async (newStatus) => {
// // //     const reportId = report.id || report._id?.$oid;
// // //     console.log(`Updating status for report:`, { id: reportId, newStatus });
// // //     if (!reportId) {
// // //       setStatusError(t('reports.invalid_report_id') || 'Invalid report ID');
// // //       return;
// // //     }
// // //     if (report.status === newStatus) {
// // //       setStatusError(t('reports.already_status', { status: newStatus }) || `Report is already ${newStatus}`);
// // //       return;
// // //     }
// // //     setStatusLoading(true);
// // //     setStatusError(null);
// // //     try {
// // //       const response = await investigateReportService.updateReportStatus({
// // //         id: reportId,
// // //         orgId: authData.org_id,
// // //         newStatus,
// // //         accessToken: authData.access_token
// // //       });
// // //       console.log('Status update response:', response);
// // //       if (response.message.includes('already')) {
// // //         setStatusError(t('reports.already_status', { status: newStatus }) || `Report is already ${newStatus}`);
// // //       } else {
// // //         onReportUpdate({ ...report, status: response.report.status });
// // //         const historyResponse = await investigateReportService.getStatusHistory({
// // //           id: reportId,
// // //           orgId: authData.org_id,
// // //           accessToken: authData.access_token
// // //         });
// // //         setStatusHistory(historyResponse.data || []);
// // //       }
// // //       setStatusLoading(false);
// // //     } catch (err) {
// // //       console.error('Error updating status:', {
// // //         message: err.message,
// // //         response: err.response,
// // //         reportId,
// // //         orgId: authData.org_id
// // //       });
// // //       setStatusError(t('reports.status_error', { message: err.message }) || `Failed to update status: ${err.message}`);
// // //       setStatusLoading(false);
// // //     }
// // //   };

// // //   const handleInvestigationDetailsChange = async () => {
// // //     const reportId = report.id || report._id?.$oid;
// // //     console.log('Updating investigation details:', { reportId, investigationDetails });
// // //     if (!reportId) {
// // //       setInvestigationError(t('reports.invalid_report_id') || 'Invalid report ID');
// // //       return;
// // //     }
// // //     setInvestigationLoading(true);
// // //     setInvestigationError(null);
// // //     try {
// // //       const response = await investigateReportService.updateInvestigationDetails({
// // //         id: reportId,
// // //         orgId: authData.org_id,
// // //         investigationDetails,
// // //         accessToken: authData.access_token
// // //       });
// // //       console.log('Investigation details update response:', response);
// // //       onReportUpdate({ ...report, investigation_details: response.report.investigation_details });
// // //       setInvestigationLoading(false);
// // //     } catch (err) {
// // //       console.error('Error updating investigation details:', {
// // //         message: err.message,
// // //         response: err.response,
// // //         reportId,
// // //         orgId: authData.org_id
// // //       });
// // //       setInvestigationError(t('reports.investigation_error', { message: err.message }) || `Failed to update investigation details: ${err.message}`);
// // //       setInvestigationLoading(false);
// // //     }
// // //   };

// // //   const getSeverityBadgeClass = (severity) => {
// // //     switch (severity) {
// // //       case 'High':
// // //         return 'bg-red-600 text-white';
// // //       case 'Medium':
// // //         return 'bg-orange-600 text-white';
// // //       case 'Low':
// // //         return 'bg-yellow-600 text-white';
// // //       case 'Informational':
// // //         return 'bg-blue-600 text-white';
// // //       default:
// // //         return 'bg-gray-600 text-white';
// // //     }
// // //   };

// // //   const getFollowUpStatusBadgeClass = (status) => {
// // //     switch (status) {
// // //       case 'Open':
// // //         return 'bg-yellow-600 text-white';
// // //       case 'Pending':
// // //         return 'bg-orange-600 text-white';
// // //       case 'Resolved':
// // //         return 'bg-green-600 text-white';
// // //       case 'Closed':
// // //         return 'bg-blue-600 text-white';
// // //       default:
// // //         return 'bg-gray-600 text-white';
// // //     }
// // //   };

// // //   const getStatusBadgeClass = (status) => {
// // //     switch (status) {
// // //       case 'Escalated':
// // //         return 'bg-orange-600 text-white';
// // //       case 'Investigated':
// // //         return 'bg-red-600 text-white';
// // //       case 'Rejected Case':
// // //         return 'bg-gray-600 text-white';
// // //       case 'Under Management Action':
// // //         return 'bg-yellow-600 text-white';
// // //       case 'Resolved':
// // //         return 'bg-green-600 text-white';
// // //       default:
// // //         return 'bg-gray-600 text-white';
// // //     }
// // //   };

// // //   const getTagBadgeClass = (tag) => {
// // //     switch (tag) {
// // //       case 'Repeated':
// // //         return 'bg-purple-600 text-white';
// // //       case 'First Time':
// // //         return 'bg-purple-600 text-white';
// // //       default:
// // //         return 'bg-gray-600 text-white';
// // //     }
// // //   };

// // //   const renderFieldValue = (field) => {
// // //     if (field.type === 'image' && field.value) {
// // //       const [imageDataUrl, setImageDataUrl] = useState(null);
// // //       const [loading, setLoading] = useState(true);
// // //       const [error, setError] = useState(null);

// // //       useEffect(() => {
// // //         const fetchImage = async () => {
// // //           try {
// // //             const filename = field.value.split('/').pop();
// // //             const url = await investigateReportService.fetchImage(filename, authData.access_token);
// // //             setImageDataUrl(url);
// // //             setLoading(false);
// // //           } catch (err) {
// // //             setError(t('reports.fetch_image_error') || 'Failed to load image');
// // //             setLoading(false);
// // //           }
// // //         };
// // //         fetchImage();
// // //       }, [field.value, authData.access_token]);

// // //       if (loading) return <span className="text-gray-600 dark:text-gray-400">Loading image...</span>;
// // //       if (error) return <span className="text-red-600 dark:text-red-400">{error}</span>;

// // //       return (
// // //         <img
// // //           src={imageDataUrl}
// // //           alt={field.name}
// // //           className="w-32 h-32 object-cover rounded-md cursor-pointer"
// // //           onError={(e) => (e.target.src = '/placeholder-image.png')}
// // //           onClick={() => setEnlargedImage(imageDataUrl)}
// // //         />
// // //       );
// // //     } else if (field.type === 'multi_image' && Array.isArray(field.value)) {
// // //       return <ImageCarousel images={field.value} fieldName={field.name} accessToken={authData.access_token} t={t} />;
// // //     } else if (field.type === 'PDF') {
// // //       return <span className="text-gray-600 dark:text-gray-400">{t('templates.pdf_upload_placeholder') || 'PDF File'}</span>;
// // //     } else if (field.type === 'radio') {
// // //       return field.value || t('reports.unknown') || 'N/A';
// // //     } else if (field.type === 'Date') {
// // //       return field.value ? format(new Date(field.value), 'PPP') : t('reports.unknown') || 'N/A';
// // //     } else if (field.type === 'DateTime') {
// // //       return field.value ? format(new Date(field.value), 'PPP p') : t('reports.unknown') || 'N/A';
// // //     } else if (field.type === 'Time') {
// // //       return field.value || t('reports.unknown') || 'N/A';
// // //     } else if (Array.isArray(field.value)) {
// // //       return field.value.join(', ');
// // //     }
// // //     return field.value || t('reports.unknown') || 'N/A';
// // //   };

// // //   const renderSection = (section, subSections, sectionKey) => {
// // //     if (!subSections || !Array.isArray(subSections)) return null;
// // //     return (
// // //       <div className="mb-4">
// // //         <h4 className="text-md font-medium mb-2 text-gray-800 dark:text-gray-100 capitalize">
// // //           {section}
// // //         </h4>
// // //         {subSections.map((sub, subIndex) => (
// // //           <div key={`${sectionKey}-${subIndex}`} className="border p-4 rounded-md mb-2 bg-gray-50 dark:bg-gray-700">
// // //             <h5 className="text-sm font-medium text-gray-800 dark:text-gray-100">{sub.name || 'Unnamed Section'}</h5>
// // //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
// // //               {(sub.fields || []).map((field) => (
// // //                 <div key={field.name} className="flex flex-col">
// // //                   <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
// // //                     {field.name || 'Unnamed Field'}:
// // //                   </span>
// // //                   <span className="text-sm text-gray-600 dark:text-gray-400">
// // //                     {renderFieldValue(field)}
// // //                   </span>
// // //                 </div>
// // //               ))}
// // //             </div>
// // //             {(sub[section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'] || []).map(
// // //               (subSub, subSubIndex) => (
// // //                 <div key={`${sectionKey}-${subIndex}-subSub-${subSubIndex}`} className="ml-4 mt-2 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
// // //                   <h6 className="text-sm font-medium text-gray-800 dark:text-gray-100">{subSub.name || 'Unnamed Sub-Section'}</h6>
// // //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
// // //                     {(subSub.fields || []).map((field) => (
// // //                       <div key={field.name} className="flex flex-col">
// // //                         <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
// // //                           {field.name || 'Unnamed Field'}:
// // //                         </span>
// // //                         <span className="text-sm text-gray-600 dark:text-gray-400">
// // //                           {renderFieldValue(field)}
// // //                         </span>
// // //                       </div>
// // //                     ))}
// // //                   </div>
// // //                 </div>
// // //               )
// // //             )}
// // //           </div>
// // //         ))}
// // //       </div>
// // //     );
// // //   };

// // //   const currentDate = new Date();

// // //   return (
// // //     <>
// // //       <motion.div
// // //         initial={{ opacity: 0 }}
// // //         animate={{ opacity: 1 }}
// // //         exit={{ opacity: 0 }}
// // //         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
// // //         dir={language === 'ar' ? 'rtl' : 'ltr'}
// // //       >
// // //         <motion.div
// // //           initial={{ scale: 0.8, y: 50 }}
// // //           animate={{ scale: 1, y: 0 }}
// // //           exit={{ scale: 0.8, y: 50 }}
// // //           className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
// // //         >
// // //           <div className="flex justify-between items-center mb-4">
// // //             <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
// // //               {report.name || 'Unnamed Report'} (ID: {report.id || report._id?.$oid || 'N/A'})
// // //             </h2>
// // //             <button
// // //               onClick={onClose}
// // //               className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
// // //               aria-label={t('reports.close') || 'Close'}
// // //             >
// // //               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
// // //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
// // //               </svg>
// // //             </button>
// // //           </div>
// // //           <div className="mb-4 flex items-center gap-4">
// // //             <button
// // //               onClick={() => handleStatusUpdate('Investigated')}
// // //               disabled={statusLoading || report.status !== 'Escalated'}
// // //               className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ${
// // //                 statusLoading || report.status !== 'Escalated'
// // //                   ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
// // //                   : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
// // //               }`}
// // //               aria-label={t('reports.case_accepted') || 'Case Accepted'}
// // //             >
// // //               {statusLoading ? t('reports.processing') || 'Processing...' : t('reports.case_accepted') || 'Case Accepted'}
// // //             </button>
// // //             <button
// // //               onClick={() => handleStatusUpdate('Rejected Case')}
// // //               disabled={statusLoading || report.status !== 'Escalated'}
// // //               className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ${
// // //                 statusLoading || report.status !== 'Escalated'
// // //                   ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
// // //                   : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
// // //               }`}
// // //               aria-label={t('reports.case_rejected') || 'Case Rejected'}
// // //             >
// // //               {statusLoading ? t('reports.processing') || 'Processing...' : t('reports.case_rejected') || 'Case Rejected'}
// // //             </button>
// // //             {statusError && (
// // //               <span className="text-red-600 dark:text-red-400">{statusError}</span>
// // //             )}
// // //           </div>
// // //           <div className="mb-4">
// // //             <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">
// // //               {t('reports.investigation_details') || 'Investigation Details'}
// // //             </h4>
// // //             <textarea
// // //               value={investigationDetails}
// // //               onChange={(e) => setInvestigationDetails(e.target.value)}
// // //               onBlur={handleInvestigationDetailsChange}
// // //               className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //               rows={4}
// // //               aria-label={t('reports.investigation_details') || 'Investigation Details'}
// // //             />
// // //             {investigationLoading && (
// // //               <span className="text-gray-600 dark:text-gray-400 block mt-2">{t('reports.updating') || 'Updating...'}</span>
// // //             )}
// // //             {investigationError && (
// // //               <span className="text-red-600 dark:text-red-400 block mt-2">{investigationError}</span>
// // //             )}
// // //           </div>
// // //           <div className="mb-4">
// // //             <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">
// // //               {t('reports.status_history') || 'Status History'}
// // //             </h4>
// // //             {statusHistoryLoading ? (
// // //               <span className="text-gray-600 dark:text-gray-400">{t('reports.loading_status_history') || 'Loading status history...'}</span>
// // //             ) : statusHistoryError ? (
// // //               <span className="text-red-600 dark:text-red-400">{statusHistoryError}</span>
// // //             ) : statusHistory.length === 0 ? (
// // //               <span className="text-gray-600 dark:text-gray-400">{t('reports.no_status_history') || 'No status history available'}</span>
// // //             ) : (
// // //               <div className="relative">
// // //                 <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
// // //                 {statusHistory.map((entry, index) => {
// // //                   const statusKey = `reports.status_${entry.status.toLowerCase().replace(' ', '_')}`;
// // //                   const translatedStatus = t(statusKey) || entry.status;
// // //                   const entryDate = new Date(entry.datetime);
// // //                   const formattedDateTime = format(entryDate, 'yyyy-MM-dd hh:mm a');
// // //                   const durationDays = differenceInDays(currentDate, entryDate);

// // //                   const message = t('reports.status_changed_with_duration', {
// // //                     status: translatedStatus,
// // //                     datetime: formattedDateTime,
// // //                     duration: durationDays
// // //                   });
// // //                   const fallbackMessage = `Changed to ${translatedStatus} on ${formattedDateTime} duration ${durationDays} days`;

// // //                   return (
// // //                     <div key={index} className="mb-4 flex items-start">
// // //                       <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
// // //                         <span className="w-4 h-4 bg-indigo-500 rounded-full z-10"></span>
// // //                       </div>
// // //                       <div className="ml-4">
// // //                         <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeClass(entry.status)}`}>
// // //                           {translatedStatus}
// // //                         </span>
// // //                         <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
// // //                           {message.includes('{{') ? fallbackMessage : message}
// // //                         </p>
// // //                       </div>
// // //                     </div>
// // //                   );
// // //                 })}
// // //               </div>
// // //             )}
// // //           </div>
// // //           <div className="mb-4">
// // //             <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">
// // //               {t('reports.corrective_action') || 'Corrective Action'}
// // //             </h4>
// // //             <div className="flex items-center gap-4 mb-2">
// // //               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
// // //                 {t('reports.corrective_action_required') || 'Corrective Action Required'}:
// // //               </span>
// // //               <span className="text-sm text-gray-600 dark:text-gray-400">
// // //                 {t(report.corrective_action_required ? 'reports.corrective_action_needed' : 'reports.no_corrective_action_needed') || (report.corrective_action_required ? 'Needed' : 'Not Needed')}
// // //               </span>
// // //             </div>
// // //             {report.corrective_action_required && (
// // //               <div className="space-y-4">
// // //                 <div>
// // //                   <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // //                     {t('reports.corrective_action_description') || 'Corrective Action Description'}
// // //                   </span>
// // //                   <span className="text-sm text-gray-600 dark:text-gray-400">
// // //                     {report.corrective_action_description || t('reports.unknown') || 'N/A'}
// // //                   </span>
// // //                 </div>
// // //                 <div>
// // //                   <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // //                     {t('reports.corrective_action_date') || 'Corrective Action Date'}
// // //                   </span>
// // //                   <span className="text-sm text-gray-600 dark:text-gray-400">
// // //                     {report.corrective_action_date ? format(new Date(report.corrective_action_date), 'yyyy-MM-dd') : t('reports.unknown') || 'N/A'}
// // //                   </span>
// // //                 </div>
// // //                 {report.corrective_action_date && (
// // //                   <div>
// // //                     <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // //                       {t('reports.follow_up_status') || 'Follow Up Status'}
// // //                     </span>
// // //                     <span className="text-sm text-gray-600 dark:text-gray-400">
// // //                       {t(`reports.follow_up_${report.follow_up_status?.toLowerCase()}`) || report.follow_up_status || t('reports.unknown') || 'N/A'}
// // //                     </span>
// // //                   </div>
// // //                 )}
// // //               </div>
// // //             )}
// // //           </div>
// // //           {report.status && (
// // //             <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
// // //               {t('reports.status') || 'Status'}: 
// // //               <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeClass(report.status)}`}>
// // //                 {t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}
// // //               </span>
// // //             </p>
// // //           )}
// // //           {report.severity && (
// // //             <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
// // //               {t('reports.severity') || 'Severity'}: 
// // //               <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getSeverityBadgeClass(report.severity)}`}>
// // //                 {t(`reports.severity_${report.severity.toLowerCase()}`) || report.severity}
// // //               </span>
// // //             </p>
// // //           )}
// // //           {report.tags && (
// // //             <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
// // //               {t('reports.tag') || 'Tag'}: 
// // //               <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getTagBadgeClass(report.tags)}`}>
// // //                 {t(`reports.tag_${report.tags.toLowerCase().replace(' ', '_')}`) || report.tags}
// // //               </span>
// // //             </p>
// // //           )}
// // //           {report.follow_up_status && (
// // //             <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
// // //               {t('reports.follow_up_status') || 'Follow Up Status'}: 
// // //               <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getFollowUpStatusBadgeClass(report.follow_up_status)}`}>
// // //                 {t(`reports.follow_up_${report.follow_up_status.toLowerCase()}`) || report.follow_up_status}
// // //               </span>
// // //             </p>
// // //           )}
// // //           <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
// // //             {t('reports.template_id') || 'Template ID'}: {report.template_id || t('reports.unknown') || 'N/A'}
// // //           </p>
// // //           <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
// // //             {t('reports.report_type') || 'Report Type'}: {report.reportType || t('reports.unknown') || 'N/A'}
// // //           </p>
// // //           <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
// // //             {t('reports.created_by') || 'Created By'}: {report.user_created_name || t('reports.unknown') || 'Unknown'}
// // //           </p>
// // //           <div className="mb-4">
// // //             <h4 className="text-md font-medium text-gray-800 dark:text-gray-100">
// // //               {t('reports.location_details') || 'Location Details'}
// // //             </h4>
// // //             <p className="text-sm text-gray-600 dark:text-gray-400">
// // //               {t('reports.main_location') || 'Main Location'}: {report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}
// // //             </p>
// // //             <p className="text-sm text-gray-600 dark:text-gray-400">
// // //               {t('reports.qa_location') || 'QA Location'}: {report.qa_location || report.structure?.location_details?.locations_qa_id || t('reports.unknown') || 'N/A'}
// // //             </p>
// // //             <p className="text-sm text-gray-600 dark:text-gray-400">
// // //               {t('reports.qa_section') || 'QA Section'}: {report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}
// // //             </p>
// // //             <p className="text-sm text-gray-600 dark:text-gray-400">
// // //               {t('reports.qa_sub_section') || 'QA Sub-Section'}: {report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}
// // //             </p>
// // //           </div>
// // //           {report.signature_url && (
// // //             <div className="mb-4">
// // //               <h4 className="text-md font-medium text-gray-800 dark:text-gray-100">
// // //                 {t('reports.signature') || 'Signature'}
// // //               </h4>
// // //               {signatureLoading ? (
// // //                 <span className="text-gray-600 dark:text-gray-400">{t('reports.loading_signature') || 'Loading signature...'}</span>
// // //               ) : signatureError ? (
// // //                 <span className="text-red-600 dark:text-red-400">{signatureError}</span>
// // //               ) : signatureUrl ? (
// // //                 <img
// // //                   src={signatureUrl}
// // //                   alt="Signature"
// // //                   className="w-32 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer"
// // //                   onClick={() => setEnlargedImage(signatureUrl)}
// // //                   onError={(e) => {
// // //                     console.error('Signature image load failed:', report.signature_url);
// // //                     e.target.src = '/placeholder-image.png';
// // //                   }}
// // //                 />
// // //               ) : (
// // //                 <span className="text-gray-600 dark:text-gray-400">{t('reports.no_signature') || 'No signature available'}</span>
// // //               )}
// // //             </div>
// // //           )}
// // //           {renderSection('header', report.structure?.header?.sub_headers, 'sub_headers')}
// // //           {renderSection('body', report.structure?.body?.sub_bodies, 'sub_bodies')}
// // //           {renderSection('footer', report.structure?.footer?.sub_footers, 'sub_footers')}
// // //         </motion.div>
// // //       </motion.div>
// // //       <AnimatePresence>
// // //         {enlargedImage && (
// // //           <ImageModal imageUrl={enlargedImage} onClose={() => setEnlargedImage(null)} />
// // //         )}
// // //       </AnimatePresence>
// // //     </>
// // //   );
// // // };



// // // const InvestigateReport = () => {
// // //   const { authData, loading: authLoading } = useAuth();
// // //   const { language, t } = useLanguage();
// // //   const [sidebarOpen, setSidebarOpen] = useState(false);
// // //   const [hasPrivilege, setHasPrivilege] = useState(false);
// // //   const [error, setError] = useState('');
// // //   const [loading, setLoading] = useState(true);
// // //   const [reports, setReports] = useState([]);
// // //   const [filteredReports, setFilteredReports] = useState([]);
// // //   const [reportTypes, setReportTypes] = useState([]);
// // //   const [selectedReport, setSelectedReport] = useState(null);
// // //   const [currentPage, setCurrentPage] = useState(1);
// // //   const [perPage, setPerPage] = useState(5);
// // //   const [totalPages, setTotalPages] = useState(1);
// // //   const [filters, setFilters] = useState({
// // //     startDate: '',
// // //     endDate: '',
// // //     reportType: '',
// // //     search: '',
// // //     sort: '-created_at',
// // //     severity: '',
// // //     tags: '',
// // //     reportName: '',
// // //     status: '',
// // //   });
// // //   const [searchInput, setSearchInput] = useState('');
// // //   const debouncedSearch = useDebounce(searchInput, 1000);
// // //   const [signatureUrls, setSignatureUrls] = useState({});

// // //   const extractTextFields = (structure) => {
// // //     const textFields = [];

// // //     const extractFromSection = (section, sectionKey) => {
// // //       if (section && Array.isArray(section)) {
// // //         section.forEach((item) => {
// // //           if (item.name) textFields.push(item.name);
// // //           if (item.fields) {
// // //             item.fields.forEach((field) => {
// // //               if (field.name) textFields.push(field.name);
// // //               if (['text', 'radio', 'Time'].includes(field.type) && field.value) {
// // //                 textFields.push(field.value);
// // //               } else if (['Date', 'DateTime'].includes(field.type) && field.value) {
// // //                 textFields.push(format(new Date(field.value), 'PPP'));
// // //               } else if (Array.isArray(field.value)) {
// // //                 textFields.push(field.value.join(', '));
// // //               }
// // //             });
// // //           }
// // //           const subKey = sectionKey === 'sub_headers' ? 'sub_sub_headers' : sectionKey === 'sub_bodies' ? 'sub_sub_bodies' : 'sub_sub_footers';
// // //           if (item[subKey]) extractFromSection(item[subKey], subKey);
// // //         });
// // //       }
// // //     };

// // //     if (structure?.header?.sub_headers) extractFromSection(structure.header.sub_headers, 'sub_headers');
// // //     if (structure?.body?.sub_bodies) extractFromSection(structure.body.sub_bodies, 'sub_bodies');
// // //     if (structure?.footer?.sub_footers) extractFromSection(structure.footer.sub_footers, 'sub_footers');

// // //     return textFields.filter(Boolean);
// // //   };

// // //   useEffect(() => {
// // //     setFilters((prev) => ({ ...prev, search: debouncedSearch }));
// // //   }, [debouncedSearch]);

// // //   useEffect(() => {
// // //     if (authLoading) return;

// // //     if (!authData?.access_token) {
// // //       setError(t('reports.no_permission') || 'No permission to view reports');
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     if (authData.privilege_ids?.includes(1003)) {
// // //       setHasPrivilege(true);
// // //       fetchReports();
// // //     } else {
// // //       setError(t('reports.no_permission') || 'No permission to view reports');
// // //       setHasPrivilege(false);
// // //       setLoading(false);
// // //     }
// // //   }, [authData, authLoading, currentPage, filters, language, t, perPage]);

// // //   const fetchReports = async () => {
// // //     setLoading(true);
// // //     try {
// // //       const response = await investigateReportService.getReports(authData.org_id, {
// // //         page: currentPage,
// // //         perPage,
// // //         reportType: filters.reportType,
// // //         sort: filters.sort,
// // //         lang: language || 'en',
// // //       });

// // //       console.log('Full API response:', response);
// // //       console.log('Fetched reports:', response.data.map(r => ({
// // //         id: r.id || r._id?.$oid,
// // //         name: r.name,
// // //         status: r.status,
// // //         severity: r.severity,
// // //         tags: r.tags,
// // //         corrective_action_required: r.corrective_action_required,
// // //         follow_up_status: r.follow_up_status,
// // //         investigation_details: r.investigation_details
// // //       })));
// // //       setReports(Array.isArray(response.data) ? response.data : []);
// // //       setTotalPages(response.pagination?.total_pages || 1);

// // //       const uniqueReportTypes = response.data && Array.isArray(response.data)
// // //         ? [...new Set(response.data.map((report) => report.reportType).filter(Boolean))]
// // //         : [];
// // //       setReportTypes(uniqueReportTypes.map((type) => ({ _id: type, name: type })));
// // //       setLoading(false);
// // //     } catch (err) {
// // //       console.error('Error fetching reports:', err);
// // //       setError(t('reports.fetch_reports_error', { message: err.message }) || `Error: ${err.message}`);
// // //       setReports([]);
// // //       setFilteredReports([]);
// // //       setTotalPages(1);
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     let filtered = [...reports];

// // //     if (filters.search) {
// // //       const queryLower = filters.search.toLowerCase();
// // //       filtered = filtered.filter((report) => {
// // //         const textFields = extractTextFields(report.structure);
// // //         return (
// // //           [
// // //             report.name,
// // //             report.reportType,
// // //             report.user_created_name,
// // //             report.main_location_name,
// // //             report.qa_section,
// // //             report.qa_sub_section,
// // //             report.tags,
// // //             report.severity,
// // //             report.follow_up_status,
// // //             report.investigation_details,
// // //             ...textFields,
// // //           ]
// // //             .filter(Boolean)
// // //             .map((field) => field.toLowerCase())
// // //             .some((field) => field.includes(queryLower))
// // //         );
// // //       });
// // //     }

// // //     if (filters.startDate) {
// // //       const startDate = new Date(filters.startDate);
// // //       filtered = filtered.filter((report) => {
// // //         const createdAt = new Date(report.created_at);
// // //         return createdAt >= startDate;
// // //       });
// // //     }

// // //     if (filters.endDate) {
// // //       const endDate = new Date(filters.endDate);
// // //       endDate.setHours(23, 59, 59, 999);
// // //       filtered = filtered.filter((report) => {
// // //         const createdAt = new Date(report.created_at);
// // //         return createdAt <= endDate;
// // //       });
// // //     }

// // //     if (filters.severity) {
// // //       filtered = filtered.filter((report) => report.severity === filters.severity);
// // //     }

// // //     if (filters.tags) {
// // //       filtered = filtered.filter((report) => report.tags === filters.tags);
// // //     }

// // //     if (filters.reportName) {
// // //       filtered = filtered.filter((report) => (report.name || 'Unnamed Report') === filters.reportName);
// // //     }

// // //     if (filters.status) {
// // //       if (filters.status === 'None') {
// // //         filtered = filtered.filter((report) => !report.status);
// // //       } else {
// // //         filtered = filtered.filter((report) => report.status === filters.status);
// // //       }
// // //     }

// // //     setFilteredReports(filtered);
// // //   }, [reports, filters]);

// // //   useEffect(() => {
// // //     const fetchSignatures = async () => {
// // //       const signatures = {};
// // //       for (const report of reports) {
// // //         const reportId = report._id?.$oid || report.id;
// // //         if (report.signature_url && reportId) {
// // //           try {
// // //             const filename = report.signature_url.split('/').pop();
// // //             console.log(`Fetching signature for report ${reportId}, filename: ${filename}`);
// // //             const url = await investigateReportService.fetchImage(filename, authData.access_token);
// // //             signatures[reportId] = url;
// // //             console.log(`Signature URL for report ${reportId}: ${url}`);
// // //           } catch (err) {
// // //             console.error(`Error fetching signature for report ${reportId}:`, err);
// // //             signatures[reportId] = null;
// // //           }
// // //         }
// // //       }
// // //       setSignatureUrls(signatures);
// // //     };

// // //     if (authData?.access_token && reports.length > 0) {
// // //       fetchSignatures();
// // //     }
// // //   }, [reports, authData?.access_token]);

// // //   const handleReportUpdate = (updatedReport) => {
// // //     setReports((prevReports) =>
// // //       prevReports.map((report) =>
// // //         (report.id || report._id?.$oid) === (updatedReport.id || updatedReport._id?.$oid)
// // //           ? updatedReport
// // //           : report
// // //       )
// // //     );
// // //     setSelectedReport(updatedReport);
// // //   };

// // //   const handleFilterChange = (e) => {
// // //     const { name, value } = e.target;
// // //     if (name === 'search') {
// // //       setSearchInput(value);
// // //     } else {
// // //       setFilters((prev) => ({ ...prev, [name]: value }));
// // //       setCurrentPage(1);
// // //     }
// // //   };

// // //   const handlePerPageChange = (e) => {
// // //     const newPerPage = Number(e.target.value);
// // //     setPerPage(newPerPage);
// // //     setCurrentPage(1);
// // //   };

// // //   const handlePageChange = (page) => {
// // //     if (page >= 1 && page <= totalPages) {
// // //       setCurrentPage(page);
// // //       window.scrollTo({ top: 0, behavior: 'smooth' });
// // //     }
// // //   };

// // //   const getStatusBarClass = (status) => {
// // //     switch (status) {
// // //       case 'Escalated':
// // //         return 'bg-orange-600';
// // //       case 'Investigated':
// // //         return 'bg-green-600';
// // //       case 'Rejected Case':
// // //         return 'bg-gray-600';
// // //       case 'Under Management Action':
// // //         return 'bg-yellow-600';
// // //       case 'Resolved':
// // //         return 'bg-green-600';
// // //       default:
// // //         return '';
// // //     }
// // //   };

// // //   const getSeverityBadgeClass = (severity) => {
// // //     switch (severity) {
// // //       case 'High':
// // //         return 'bg-red-600 text-white';
// // //       case 'Medium':
// // //         return 'bg-orange-600 text-white';
// // //       case 'Low':
// // //         return 'bg-yellow-600 text-white';
// // //       case 'Informational':
// // //         return 'bg-blue-600 text-white';
// // //       default:
// // //         return 'bg-gray-600 text-white';
// // //     }
// // //   };

// // //   const getFollowUpStatusBadgeClass = (status) => {
// // //     switch (status) {
// // //       case 'Open':
// // //         return 'bg-yellow-600 text-white';
// // //       case 'Pending':
// // //         return 'bg-orange-600 text-white';
// // //       case 'Resolved':
// // //         return 'bg-green-600 text-white';
// // //       case 'Closed':
// // //         return 'bg-blue-600 text-white';
// // //       default:
// // //         return 'bg-gray-600 text-white';
// // //     }
// // //   };

// // //   const getTagBadgeClass = (tag) => {
// // //     switch (tag) {
// // //       case 'Repeated':
// // //         return 'bg-purple-600 text-white';
// // //       case 'First Time':
// // //         return 'bg-purple-600 text-white';
// // //       default:
// // //         return 'bg-gray-600 text-white';
// // //     }
// // //   };

// // //   const uniqueReportNames = [...new Set(reports.map((report) => report.name || 'Unnamed Report'))];
// // //   const statusOptions = ['None', 'Open', 'Resolved', 'Escalated', 'Investigated', 'Under Management Action', 'Rejected Case'];
// // //   const severityOptions = ['High', 'Medium', 'Low', 'Informational'];
// // //   const tagOptions = ['Repeated', 'First Time'];
// // //   const perPageOptions = [5, 10, 15, 50, 75, 100, 200, 10000, 100000, 50000000];

// // //   if (authLoading || !authData || loading) {
// // //     return <LoadingSpinner />;
// // //   }

// // //   return (
// // //     <div className="flex h-screen overflow-hidden">
// // //       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
// // //       <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
// // //         <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
// // //         <main>
// // //           <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
// // //             <div className="sm:flex sm:justify-between sm:items-center mb-8">
// // //               <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
// // //                 {t('investigate_report.view_reports') || 'Investigate Reports'}
// // //               </h1>
// // //               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
// // //                 <LanguageToggle />
// // //                 <ModalSearch onSearch={(query) => setSearchInput(query)} />
// // //                 <ThemeToggle />
// // //               </div>
// // //             </div>
// // //             <div className="mb-6">
// // //               <div className="relative">
// // //                 <input
// // //                   type="text"
// // //                   value={searchInput}
// // //                   onChange={handleFilterChange}
// // //                   name="search"
// // //                   placeholder={t('reports.search_placeholder') || 'Search by name, type, or any field...'}
// // //                   className="w-full py-3 px-4 pl-12 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                   aria-label={t('reports.search_placeholder') || 'Search reports'}
// // //                 />
// // //                 <svg
// // //                   className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400"
// // //                   fill="none"
// // //                   stroke="currentColor"
// // //                   viewBox="0 0 24 24"
// // //                 >
// // //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
// // //                 </svg>
// // //               </div>
// // //             </div>
// // //             {error && (
// // //               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm relative mb-6" role="alert">
// // //                 <span>{error}</span>
// // //                 <button
// // //                   onClick={() => setError('')}
// // //                   className="absolute top-0 right-0 px-4 py-3"
// // //                   aria-label={t('common.dismiss_error') || 'Dismiss error'}
// // //                 >
// // //                   <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
// // //                     <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
// // //                   </svg>
// // //                 </button>
// // //               </div>
// // //             )}
// // //             <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
// // //               <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
// // //                 {t('reports.filters') || 'Filters'}
// // //               </h2>
// // //               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
// // //                 <div>
// // //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // //                     {t('reports.start_date') || 'Start Date'}
// // //                   </label>
// // //                   <input
// // //                     type="date"
// // //                     name="startDate"
// // //                     value={filters.startDate}
// // //                     onChange={handleFilterChange}
// // //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                   />
// // //                 </div>
// // //                 <div>
// // //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // //                     {t('reports.end_date') || 'End Date'}
// // //                   </label>
// // //                   <input
// // //                     type="date"
// // //                     name="endDate"
// // //                     value={filters.endDate}
// // //                     onChange={handleFilterChange}
// // //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                   />
// // //                 </div>
// // //                 <div>
// // //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // //                     {t('reports.report_type') || 'Report Type'}
// // //                   </label>
// // //                   <select
// // //                     name="reportType"
// // //                     value={filters.reportType}
// // //                     onChange={handleFilterChange}
// // //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                   >
// // //                     <option value="">{t('reports.all_report_types') || 'All Report Types'}</option>
// // //                     {reportTypes.map((type) => (
// // //                       <option key={type._id} value={type.name}>
// // //                         {type.name}
// // //                       </option>
// // //                     ))}
// // //                   </select>
// // //                 </div>
// // //                 <div>
// // //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // //                     {t('reports.sort') || 'Sort'}
// // //                   </label>
// // //                   <select
// // //                     name="sort"
// // //                     value={filters.sort}
// // //                     onChange={handleFilterChange}
// // //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                   >
// // //                     <option value="-created_at">{t('reports.sort_newest') || 'Newest First'}</option>
// // //                     <option value="created_at">{t('reports.sort_oldest') || 'Oldest First'}</option>
// // //                   </select>
// // //                 </div>
// // //                 <div>
// // //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // //                     {t('reports.severity') || 'Severity'}
// // //                   </label>
// // //                   <select
// // //                     name="severity"
// // //                     value={filters.severity}
// // //                     onChange={handleFilterChange}
// // //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                   >
// // //                     <option value="">{t('reports.all_severities') || 'All Severities'}</option>
// // //                     {severityOptions.map((severity) => (
// // //                       <option key={severity} value={severity}>
// // //                         {t(`reports.severity_${severity.toLowerCase()}`) || severity}
// // //                       </option>
// // //                     ))}
// // //                   </select>
// // //                 </div>
// // //                 <div>
// // //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // //                     {t('reports.tag') || 'Tag'}
// // //                   </label>
// // //                   <select
// // //                     name="tags"
// // //                     value={filters.tags}
// // //                     onChange={handleFilterChange}
// // //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                   >
// // //                     <option value="">{t('reports.all_tags') || 'All Tags'}</option>
// // //                     {tagOptions.map((tag) => (
// // //                       <option key={tag} value={tag}>
// // //                         {t(`reports.tag_${tag.toLowerCase().replace(' ', '_')}`) || tag}
// // //                       </option>
// // //                     ))}
// // //                   </select>
// // //                 </div>
// // //                 <div>
// // //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // //                     {t('reports.report_name') || 'Report Name'}
// // //                   </label>
// // //                   <select
// // //                     name="reportName"
// // //                     value={filters.reportName}
// // //                     onChange={handleFilterChange}
// // //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                   >
// // //                     <option value="">{t('reports.all_report_names') || 'All Report Names'}</option>
// // //                     {uniqueReportNames.map((name) => (
// // //                       <option key={name} value={name}>
// // //                         {name}
// // //                       </option>
// // //                     ))}
// // //                   </select>
// // //                 </div>
// // //                 <div>
// // //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// // //                     {t('reports.status') || 'Status'}
// // //                   </label>
// // //                   <select
// // //                     name="status"
// // //                     value={filters.status}
// // //                     onChange={handleFilterChange}
// // //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                   >
// // //                     <option value="">{t('reports.all_statuses') || 'All Statuses'}</option>
// // //                     {statusOptions.map((status) => (
// // //                       <option key={status} value={status}>
// // //                         {t(status === 'None' ? 'reports.no_status' : `reports.status_${status.toLowerCase().replace(' ', '_')}`) || status}
// // //                       </option>
// // //                     ))}
// // //                   </select>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //             {loading ? (
// // //               <LoadingSpinner />
// // //             ) : (
// // //               <>
// // //                 {filteredReports.length === 0 ? (
// // //                   <div className="text-center text-gray-600 dark:text-gray-300 py-12">
// // //                     <svg
// // //                       className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
// // //                       fill="none"
// // //                       stroke="currentColor"
// // //                       viewBox="0 0 24 24"
// // //                     >
// // //                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
// // //                     </svg>
// // //                     <p className="text-lg">{t('reports.no_reports') || 'No reports found'}</p>
// // //                   </div>
// // //                 ) : (
// // //                   <>
// // //                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// // //                       {filteredReports.map((report) => {
// // //                         const reportId = report._id?.$oid || report.id;
// // //                         const statusBarClass = getStatusBarClass(report.status);
// // //                         return (
// // //                           <div
// // //                             key={reportId}
// // //                             className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
// // //                             role="button"
// // //                             aria-label={`${t('reports.report_name') || 'Report'}: ${report.name}`}
// // //                             onClick={() => setSelectedReport(report)}
// // //                             tabIndex={0}
// // //                             onKeyDown={(e) => {
// // //                               if (e.key === 'Enter' || e.key === ' ') {
// // //                                 setSelectedReport(report);
// // //                               }
// // //                             }}
// // //                           >
// // //                             {report.status && (
// // //                               <div className={`${statusBarClass} text-white text-sm font-bold text-center py-2 rounded-t-lg -mt-6 -mx-6 mb-4`}>
// // //                                 {t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}
// // //                               </div>
// // //                             )}
// // //                             <div className="space-y-3">
// // //                               <div className="flex justify-between items-start">
// // //                                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200">
// // //                                   {report.name || 'Unnamed Report'}
// // //                                 </h3>
// // //                                 <div className="flex flex-col gap-2">
// // //                                   {report.severity && (
// // //                                     <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getSeverityBadgeClass(report.severity)}`}>
// // //                                       {t(`reports.severity_${report.severity.toLowerCase()}`) || report.severity}
// // //                                     </span>
// // //                                   )}
// // //                                   {report.tags && (
// // //                                     <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getTagBadgeClass(report.tags)}`}>
// // //                                       {t(`reports.tag_${report.tags.toLowerCase().replace(' ', '_')}`) || report.tags}
// // //                                     </span>
// // //                                   )}
// // //                                   {report.follow_up_status && (
// // //                                     <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getFollowUpStatusBadgeClass(report.follow_up_status)}`}>
// // //                                       {t(`reports.follow_up_${report.follow_up_status.toLowerCase()}`) || report.follow_up_status}
// // //                                     </span>
// // //                                   )}
// // //                                 </div>
// // //                               </div>
// // //                               <div>
// // //                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // //                                   {t('reports.report_type') || 'Report Type'}
// // //                                 </span>
// // //                                 <p className="text-gray-800 dark:text-gray-100">{report.reportType || t('reports.unknown') || 'N/A'}</p>
// // //                               </div>
// // //                               <div>
// // //                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // //                                   {t('reports.created_by') || 'Created By'}
// // //                                 </span>
// // //                                 <p className="text-gray-800 dark:text-gray-100">{report.user_created_name || t('reports.unknown') || 'Unknown'}</p>
// // //                               </div>
// // //                               <div>
// // //                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // //                                   {t('reports.main_location') || 'Main Location'}
// // //                                 </span>
// // //                                 <p className="text-gray-800 dark:text-gray-100">{report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}</p>
// // //                               </div>
// // //                               <div>
// // //                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // //                                   {t('reports.qa_section') || 'QA Section'}
// // //                                 </span>
// // //                                 <p className="text-gray-800 dark:text-gray-100">{report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}</p>
// // //                               </div>
// // //                               <div>
// // //                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // //                                   {t('reports.qa_sub_section') || 'QA Sub-Section'}
// // //                                 </span>
// // //                                 <p className="text-gray-800 dark:text-gray-100">{report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}</p>
// // //                               </div>
// // //                               {report.created_at && (
// // //                                 <div>
// // //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // //                                     {t('reports.created_at') || 'Created At'}
// // //                                   </span>
// // //                                   <p className="text-gray-800 dark:text-gray-100">{format(new Date(report.created_at), 'PPP')}</p>
// // //                                 </div>
// // //                               )}
// // //                               {report.status && (
// // //                                 <div>
// // //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // //                                     {t('reports.status') || 'Status'}
// // //                                   </span>
// // //                                   <p className="text-gray-800 dark:text-gray-100">{t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}</p>
// // //                                 </div>
// // //                               )}
// // //                               {report.corrective_action_required && (
// // //                                 <div>
// // //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // //                                     {t('reports.corrective_action_required') || 'Corrective Action'}
// // //                                   </span>
// // //                                   <p className="text-gray-800 dark:text-gray-100">{t(report.corrective_action_required ? 'reports.corrective_action_needed' : 'reports.no_corrective_action_needed') || (report.corrective_action_required ? 'Needed' : 'Not Needed')}</p>
// // //                                 </div>
// // //                               )}
// // //                               {report.signature_url && (
// // //                                 <div>
// // //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // //                                     {t('reports.signature') || 'Signature'}
// // //                                   </span>
// // //                                   {signatureUrls[reportId] === undefined ? (
// // //                                     <span className="text-gray-600 dark:text-gray-400">{t('reports.loading_signature') || 'Loading signature...'}</span>
// // //                                   ) : signatureUrls[reportId] === null ? (
// // //                                     <span className="text-red-600 dark:text-red-400">{t('reports.signature_failed') || 'Failed to load signature'}</span>
// // //                                   ) : (
// // //                                     <img
// // //                                       src={signatureUrls[reportId]}
// // //                                       alt="Signature"
// // //                                       className="w-24 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-700 shadow-sm mt-2 cursor-pointer"
// // //                                       onError={(e) => {
// // //                                         console.error('Signature image load failed for report:', reportId);
// // //                                         e.target.src = '/placeholder-image.png';
// // //                                       }}
// // //                                       onClick={() => setSelectedReport(report)}
// // //                                     />
// // //                                   )}
// // //                                 </div>
// // //                               )}
// // //                             </div>
// // //                           </div>
// // //                         );
// // //                       })}
// // //                     </div>
// // //                     {totalPages > 1 && (
// // //                       <div className="flex justify-center items-center gap-3 mt-8">
// // //                         <button
// // //                           onClick={() => handlePageChange(currentPage - 1)}
// // //                           disabled={currentPage === 1}
// // //                           className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // //                           aria-label={t('reports.previous') || 'Previous'}
// // //                         >
// // //                           {t('reports.previous') || 'Previous'}
// // //                         </button>
// // //                         <div className="flex gap-2">
// // //                           {Array.from({ length: Math.min(8, totalPages) }, (_, i) => {
// // //                             const startPage = Math.max(1, currentPage - 3);
// // //                             const endPage = Math.min(totalPages, startPage + 7);
// // //                             const page = startPage + i;

// // //                             if (page <= endPage) {
// // //                               return (
// // //                                 <button
// // //                                   key={page}
// // //                                   onClick={() => handlePageChange(page)}
// // //                                   className={`px-4 py-2 rounded-lg ${
// // //                                     page === currentPage
// // //                                       ? 'bg-indigo-500 text-white'
// // //                                       : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
// // //                                   } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
// // //                                   aria-label={`Page ${page}`}
// // //                                   aria-current={page === currentPage ? 'page' : undefined}
// // //                                 >
// // //                                   {page}
// // //                                 </button>
// // //                               );
// // //                             }
// // //                             return null;
// // //                           })}
// // //                         </div>
// // //                         <button
// // //                           onClick={() => handlePageChange(currentPage + 1)}
// // //                           disabled={currentPage === totalPages}
// // //                           className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // //                           aria-label={t('reports.next') || 'Next'}
// // //                         >
// // //                           {t('reports.next') || 'Next'}
// // //                         </button>
// // //                         <select
// // //                           value={currentPage}
// // //                           onChange={(e) => handlePageChange(Number(e.target.value))}
// // //                           className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // //                           aria-label={t('reports.jump_to_page') || 'Jump to page'}
// // //                         >
// // //                           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
// // //                             <option key={page} value={page}>
// // //                               {t('reports.page') || 'Page'} {page}
// // //                             </option>
// // //                           ))}
// // //                         </select>
// // //                         <select
// // //                           value={perPage}
// // //                           onChange={handlePerPageChange}
// // //                           className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
// // //                           aria-label={t('reports.items_per_page') || 'Items per page'}
// // //                         >
// // //                           {perPageOptions.map((option) => (
// // //                             <option key={option} value={option}>
// // //                               {option} {t('reports.items') || 'items'}
// // //                             </option>
// // //                           ))}
// // //                         </select>
// // //                       </div>
// // //                     )}
// // //                     <AnimatePresence>
// // //                       {selectedReport && (
// // //                         <ReportModal
// // //                           report={selectedReport}
// // //                           onClose={() => setSelectedReport(null)}
// // //                           authData={authData}
// // //                           t={t}
// // //                           onReportUpdate={handleReportUpdate}
// // //                         />
// // //                       )}
// // //                     </AnimatePresence>
// // //                   </>
// // //                 )}
// // //               </>
// // //             )}
// // //           </div>
// // //         </main>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default InvestigateReport;

// // import React, { useState, useEffect } from 'react';
// // import { useAuth } from '../../context/AuthContext';
// // import { useLanguage } from '../../context/LanguageContext';
// // import Header from '../../partials/Header';
// // import Sidebar from '../../partials/Sidebar';
// // import LoadingSpinner from '../../components/LoadingSpinner';
// // import ModalSearch from '../../components/ModalSearch';
// // import ThemeToggle from '../../components/ThemeToggle';
// // import LanguageToggle from '../../components/LanguageToggle';
// // import investigateReportService from '../../lib/investigateReportService';
// // import { format } from 'date-fns';
// // import { AnimatePresence } from 'framer-motion';
// // import { useDebounce, ImageCarousel, ReportModal } from './InvestigateReportHelpers';

// // const InvestigateReport = () => {
// //   const { authData, loading: authLoading } = useAuth();
// //   const { language, t } = useLanguage();
// //   const [sidebarOpen, setSidebarOpen] = useState(false);
// //   const [hasPrivilege, setHasPrivilege] = useState(false);
// //   const [error, setError] = useState('');
// //   const [loading, setLoading] = useState(true);
// //   const [reports, setReports] = useState([]);
// //   const [filteredReports, setFilteredReports] = useState([]);
// //   const [reportTypes, setReportTypes] = useState([]);
// //   const [selectedReport, setSelectedReport] = useState(null);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [perPage, setPerPage] = useState(5);
// //   const [totalPages, setTotalPages] = useState(1);
// //   const [filters, setFilters] = useState({
// //     startDate: '',
// //     endDate: '',
// //     reportType: '',
// //     search: '',
// //     sort: '-created_at',
// //     severity: '',
// //     tags: '',
// //     reportName: '',
// //     status: '',
// //   });
// //   const [searchInput, setSearchInput] = useState('');
// //   const debouncedSearch = useDebounce(searchInput, 1000);
// //   const [signatureUrls, setSignatureUrls] = useState({});

// //   // Privilege check function
// //   const hasPrivilegeCheck = (requiredPrivileges) => {
// //     return authData?.privilege_ids?.some(id => requiredPrivileges.includes(id)) || false;
// //   };

// //   const extractTextFields = (structure) => {
// //     const textFields = [];

// //     const extractFromSection = (section, sectionKey) => {
// //       if (section && Array.isArray(section)) {
// //         section.forEach((item) => {
// //           if (item.name) textFields.push(item.name);
// //           if (item.fields) {
// //             item.fields.forEach((field) => {
// //               if (field.name) textFields.push(field.name);
// //               if (['text', 'radio', 'Time'].includes(field.type) && field.value) {
// //                 textFields.push(field.value);
// //               } else if (['Date', 'DateTime'].includes(field.type) && field.value) {
// //                 textFields.push(format(new Date(field.value), 'PPP'));
// //               } else if (Array.isArray(field.value)) {
// //                 textFields.push(field.value.join(', '));
// //               }
// //             });
// //           }
// //           const subKey = sectionKey === 'sub_headers' ? 'sub_sub_headers' : sectionKey === 'sub_bodies' ? 'sub_sub_bodies' : 'sub_sub_footers';
// //           if (item[subKey]) extractFromSection(item[subKey], subKey);
// //         });
// //       }
// //     };

// //     if (structure?.header?.sub_headers) extractFromSection(structure.header.sub_headers, 'sub_headers');
// //     if (structure?.body?.sub_bodies) extractFromSection(structure.body.sub_bodies, 'sub_bodies');
// //     if (structure?.footer?.sub_footers) extractFromSection(structure.footer.sub_footers, 'sub_footers');

// //     return textFields.filter(Boolean);
// //   };

// //   useEffect(() => {
// //     setFilters((prev) => ({ ...prev, search: debouncedSearch }));
// //   }, [debouncedSearch]);

// //   useEffect(() => {
// //     if (authLoading) return;

// //     if (!authData?.access_token) {
// //       setError(t('reports.no_permission') || 'No permission to view reports');
// //       setLoading(false);
// //       return;
// //     }

// //     // Check for multiple privileges
// //     if (hasPrivilegeCheck([5000, 1, 1003])) {
// //       setHasPrivilege(true);
// //       fetchReports();
// //     } else {
// //       setError(t('reports.no_permission') || 'No permission to view reports');
// //       setHasPrivilege(false);
// //       setLoading(false);
// //     }
// //   }, [authData, authLoading, currentPage, filters, language, t, perPage]);

// //   const fetchReports = async () => {
// //     setLoading(true);
// //     try {
// //       const response = await investigateReportService.getReports(authData.org_id, {
// //         page: currentPage,
// //         perPage,
// //         reportType: filters.reportType,
// //         sort: filters.sort,
// //         lang: language || 'en',
// //       });

// //       console.log('Full API response:', response);
// //       console.log('Fetched reports:', response.data.map(r => ({
// //         id: r.id || r._id?.$oid,
// //         name: r.name,
// //         status: r.status,
// //         severity: r.severity,
// //         tags: r.tags,
// //         corrective_action_required: r.corrective_action_required,
// //         follow_up_status: r.follow_up_status,
// //         investigation_details: r.investigation_details
// //       })));
// //       setReports(Array.isArray(response.data) ? response.data : []);
// //       setTotalPages(response.pagination?.total_pages || 1);

// //       const uniqueReportTypes = response.data && Array.isArray(response.data)
// //         ? [...new Set(response.data.map((report) => report.reportType).filter(Boolean))]
// //         : [];
// //       setReportTypes(uniqueReportTypes.map((type) => ({ _id: type, name: type })));
// //       setLoading(false);
// //     } catch (err) {
// //       console.error('Error fetching reports:', err);
// //       setError(t('reports.fetch_reports_error', { message: err.message }) || `Error: ${err.message}`);
// //       setReports([]);
// //       setFilteredReports([]);
// //       setTotalPages(1);
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     let filtered = [...reports];

// //     if (filters.search) {
// //       const queryLower = filters.search.toLowerCase();
// //       filtered = filtered.filter((report) => {
// //         const textFields = extractTextFields(report.structure);
// //         return (
// //           [
// //             report.name,
// //             report.reportType,
// //             report.user_created_name,
// //             report.main_location_name,
// //             report.qa_section,
// //             report.qa_sub_section,
// //             report.tags,
// //             report.severity,
// //             report.follow_up_status,
// //             report.investigation_details,
// //             ...textFields,
// //           ]
// //             .filter(Boolean)
// //             .map((field) => field.toLowerCase())
// //             .some((field) => field.includes(queryLower))
// //         );
// //       });
// //     }

// //     if (filters.startDate) {
// //       const startDate = new Date(filters.startDate);
// //       filtered = filtered.filter((report) => {
// //         const createdAt = new Date(report.created_at);
// //         return createdAt >= startDate;
// //       });
// //     }

// //     if (filters.endDate) {
// //       const endDate = new Date(filters.endDate);
// //       endDate.setHours(23, 59, 59, 999);
// //       filtered = filtered.filter((report) => {
// //         const createdAt = new Date(report.created_at);
// //         return createdAt <= endDate;
// //       });
// //     }

// //     if (filters.severity) {
// //       filtered = filtered.filter((report) => report.severity === filters.severity);
// //     }

// //     if (filters.tags) {
// //       filtered = filtered.filter((report) => report.tags === filters.tags);
// //     }

// //     if (filters.reportName) {
// //       filtered = filtered.filter((report) => (report.name || 'Unnamed Report') === filters.reportName);
// //     }

// //     if (filters.status) {
// //       if (filters.status === 'None') {
// //         filtered = filtered.filter((report) => !report.status);
// //       } else {
// //         filtered = filtered.filter((report) => report.status === filters.status);
// //       }
// //     }

// //     setFilteredReports(filtered);
// //   }, [reports, filters]);

// //   useEffect(() => {
// //     const fetchSignatures = async () => {
// //       const signatures = {};
// //       for (const report of reports) {
// //         const reportId = report._id?.$oid || report.id;
// //         if (report.signature_url && reportId) {
// //           try {
// //             const filename = report.signature_url.split('/').pop();
// //             console.log(`Fetching signature for report ${reportId}, filename: ${filename}`);
// //             const url = await investigateReportService.fetchImage(filename, authData.access_token);
// //             signatures[reportId] = url;
// //             console.log(`Signature URL for report ${reportId}: ${url}`);
// //           } catch (err) {
// //             console.error(`Error fetching signature for report ${reportId}:`, err);
// //             signatures[reportId] = null;
// //           }
// //         }
// //       }
// //       setSignatureUrls(signatures);
// //     };

// //     if (authData?.access_token && reports.length > 0) {
// //       fetchSignatures();
// //     }
// //   }, [reports, authData?.access_token]);

// //   const handleReportUpdate = (updatedReport) => {
// //     setReports((prevReports) =>
// //       prevReports.map((report) =>
// //         (report.id || report._id?.$oid) === (updatedReport.id || updatedReport._id?.$oid)
// //           ? updatedReport
// //           : report
// //       )
// //     );
// //     setSelectedReport(updatedReport);
// //   };

// //   const handleFilterChange = (e) => {
// //     const { name, value } = e.target;
// //     if (name === 'search') {
// //       setSearchInput(value);
// //     } else {
// //       setFilters((prev) => ({ ...prev, [name]: value }));
// //       setCurrentPage(1);
// //     }
// //   };

// //   const handlePerPageChange = (e) => {
// //     const newPerPage = Number(e.target.value);
// //     setPerPage(newPerPage);
// //     setCurrentPage(1);
// //   };

// //   const handlePageChange = (page) => {
// //     if (page >= 1 && page <= totalPages) {
// //       setCurrentPage(page);
// //       window.scrollTo({ top: 0, behavior: 'smooth' });
// //     }
// //   };

// //   const getStatusBarClass = (status) => {
// //     switch (status) {
// //       case 'Escalated':
// //         return 'bg-orange-600';
// //       case 'Investigated':
// //         return 'bg-green-600';
// //       case 'Rejected Case':
// //         return 'bg-gray-600';
// //       case 'Under Management Action':
// //         return 'bg-yellow-600';
// //       case 'Resolved':
// //         return 'bg-green-600';
// //       default:
// //         return '';
// //     }
// //   };

// //   const getSeverityBadgeClass = (severity) => {
// //     switch (severity) {
// //       case 'High':
// //         return 'bg-red-600 text-white';
// //       case 'Medium':
// //         return 'bg-orange-600 text-white';
// //       case 'Low':
// //         return 'bg-yellow-600 text-white';
// //       case 'Informational':
// //         return 'bg-blue-600 text-white';
// //       default:
// //         return 'bg-gray-600 text-white';
// //     }
// //   };

// //   const getFollowUpStatusBadgeClass = (status) => {
// //     switch (status) {
// //       case 'Open':
// //         return 'bg-yellow-600 text-white';
// //       case 'Pending':
// //         return 'bg-orange-600 text-white';
// //       case 'Resolved':
// //         return 'bg-green-600 text-white';
// //       case 'Closed':
// //         return 'bg-blue-600 text-white';
// //       default:
// //         return 'bg-gray-600 text-white';
// //     }
// //   };

// //   const getTagBadgeClass = (tag) => {
// //     switch (tag) {
// //       case 'Repeated':
// //         return 'bg-purple-600 text-white';
// //       case 'First Time':
// //         return 'bg-purple-600 text-white';
// //       default:
// //         return 'bg-gray-600 text-white';
// //     }
// //   };

// //   const uniqueReportNames = [...new Set(reports.map((report) => report.name || 'Unnamed Report'))];
// //   const statusOptions = ['None', 'Open', 'Resolved', 'Escalated', 'Investigated', 'Under Management Action', 'Rejected Case'];
// //   const severityOptions = ['High', 'Medium', 'Low', 'Informational'];
// //   const tagOptions = ['Repeated', 'First Time'];
// //   const perPageOptions = [5, 10, 15, 50, 75, 100, 200, 10000, 100000, 50000000];

// //   if (authLoading || !authData || loading) {
// //     return <LoadingSpinner />;
// //   }

// //   // Render the component only if the user has the required privileges
// //   if (!hasPrivilegeCheck([5000, 1, 1003])) {
// //     return (
// //       <div className="flex h-screen overflow-hidden">
// //         <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
// //         <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
// //           <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
// //           <main>
// //             <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
// //               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm relative mb-6" role="alert">
// //                 <span>{t('reports.no_permission') || 'No permission to view reports'}</span>
// //               </div>
// //             </div>
// //           </main>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex h-screen overflow-hidden">
// //       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
// //       <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
// //         <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
// //         <main>
// //           <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
// //             <div className="sm:flex sm:justify-between sm:items-center mb-8">
// //               <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
// //                 {t('investigate_report.view_reports') || 'Investigate Reports'}
// //               </h1>
// //               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
// //                 <LanguageToggle />
// //                 <ModalSearch onSearch={(query) => setSearchInput(query)} />
// //                 <ThemeToggle />
// //               </div>
// //             </div>
// //             <div className="mb-6">
// //               <div className="relative">
// //                 <input
// //                   type="text"
// //                   value={searchInput}
// //                   onChange={handleFilterChange}
// //                   name="search"
// //                   placeholder={t('reports.search_placeholder') || 'Search by name, type, or any field...'}
// //                   className="w-full py-3 px-4 pl-12 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                   aria-label={t('reports.search_placeholder') || 'Search reports'}
// //                 />
// //                 <svg
// //                   className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400"
// //                   fill="none"
// //                   stroke="currentColor"
// //                   viewBox="0 0 24 24"
// //                 >
// //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
// //                 </svg>
// //               </div>
// //             </div>
// //             {error && (
// //               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm relative mb-6" role="alert">
// //                 <span>{error}</span>
// //                 <button
// //                   onClick={() => setError('')}
// //                   className="absolute top-0 right-0 px-4 py-3"
// //                   aria-label={t('common.dismiss_error') || 'Dismiss error'}
// //                 >
// //                   <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
// //                     <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
// //                   </svg>
// //                 </button>
// //               </div>
// //             )}
// //             <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
// //               <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
// //                 {t('reports.filters') || 'Filters'}
// //               </h2>
// //               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// //                     {t('reports.start_date') || 'Start Date'}
// //                   </label>
// //                   <input
// //                     type="date"
// //                     name="startDate"
// //                     value={filters.startDate}
// //                     onChange={handleFilterChange}
// //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                   />
// //                 </div>
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// //                     {t('reports.end_date') || 'End Date'}
// //                   </label>
// //                   <input
// //                     type="date"
// //                     name="endDate"
// //                     value={filters.endDate}
// //                     onChange={handleFilterChange}
// //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                   />
// //                 </div>
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// //                     {t('reports.report_type') || 'Report Type'}
// //                   </label>
// //                   <select
// //                     name="reportType"
// //                     value={filters.reportType}
// //                     onChange={handleFilterChange}
// //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                   >
// //                     <option value="">{t('reports.all_report_types') || 'All Report Types'}</option>
// //                     {reportTypes.map((type) => (
// //                       <option key={type._id} value={type.name}>
// //                         {type.name}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// //                     {t('reports.sort') || 'Sort'}
// //                   </label>
// //                   <select
// //                     name="sort"
// //                     value={filters.sort}
// //                     onChange={handleFilterChange}
// //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                   >
// //                     <option value="-created_at">{t('reports.sort_newest') || 'Newest First'}</option>
// //                     <option value="created_at">{t('reports.sort_oldest') || 'Oldest First'}</option>
// //                   </select>
// //                 </div>
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// //                     {t('reports.severity') || 'Severity'}
// //                   </label>
// //                   <select
// //                     name="severity"
// //                     value={filters.severity}
// //                     onChange={handleFilterChange}
// //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                   >
// //                     <option value="">{t('reports.all_severities') || 'All Severities'}</option>
// //                     {severityOptions.map((severity) => (
// //                       <option key={severity} value={severity}>
// //                         {t(`reports.severity_${severity.toLowerCase()}`) || severity}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// //                     {t('reports.tag') || 'Tag'}
// //                   </label>
// //                   <select
// //                     name="tags"
// //                     value={filters.tags}
// //                     onChange={handleFilterChange}
// //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                   >
// //                     <option value="">{t('reports.all_tags') || 'All Tags'}</option>
// //                     {tagOptions.map((tag) => (
// //                       <option key={tag} value={tag}>
// //                         {t(`reports.tag_${tag.toLowerCase().replace(' ', '_')}`) || tag}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// //                     {t('reports.report_name') || 'Report Name'}
// //                   </label>
// //                   <select
// //                     name="reportName"
// //                     value={filters.reportName}
// //                     onChange={handleFilterChange}
// //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                   >
// //                     <option value="">{t('reports.all_report_names') || 'All Report Names'}</option>
// //                     {uniqueReportNames.map((name) => (
// //                       <option key={name} value={name}>
// //                         {name}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
// //                     {t('reports.status') || 'Status'}
// //                   </label>
// //                   <select
// //                     name="status"
// //                     value={filters.status}
// //                     onChange={handleFilterChange}
// //                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                   >
// //                     <option value="">{t('reports.all_statuses') || 'All Statuses'}</option>
// //                     {statusOptions.map((status) => (
// //                       <option key={status} value={status}>
// //                         {t(status === 'None' ? 'reports.no_status' : `reports.status_${status.toLowerCase().replace(' ', '_')}`) || status}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>
// //               </div>
// //             </div>
// //             {loading ? (
// //               <LoadingSpinner />
// //             ) : (
// //               <>
// //                 {filteredReports.length === 0 ? (
// //                   <div className="text-center text-gray-600 dark:text-gray-300 py-12">
// //                     <svg
// //                       className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
// //                       fill="none"
// //                       stroke="currentColor"
// //                       viewBox="0 0 24 24"
// //                     >
// //                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
// //                     </svg>
// //                     <p className="text-lg">{t('reports.no_reports') || 'No reports found'}</p>
// //                   </div>
// //                 ) : (
// //                   <>
// //                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// //                       {filteredReports.map((report) => {
// //                         const reportId = report._id?.$oid || report.id;
// //                         const statusBarClass = getStatusBarClass(report.status);
// //                         return (
// //                           <div
// //                             key={reportId}
// //                             className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
// //                             role="button"
// //                             aria-label={`${t('reports.report_name') || 'Report'}: ${report.name}`}
// //                             onClick={() => setSelectedReport(report)}
// //                             tabIndex={0}
// //                             onKeyDown={(e) => {
// //                               if (e.key === 'Enter' || e.key === ' ') {
// //                                 setSelectedReport(report);
// //                               }
// //                             }}
// //                           >
// //                             {report.status && (
// //                               <div className={`${statusBarClass} text-white text-sm font-bold text-center py-2 rounded-t-lg -mt-6 -mx-6 mb-4`}>
// //                                 {t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}
// //                               </div>
// //                             )}
// //                             <div className="space-y-3">
// //                               <div className="flex justify-between items-start">
// //                                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200">
// //                                   {report.name || 'Unnamed Report'}
// //                                 </h3>
// //                                 <div className="flex flex-col gap-2">
// //                                   {report.severity && (
// //                                     <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getSeverityBadgeClass(report.severity)}`}>
// //                                       {t(`reports.severity_${report.severity.toLowerCase()}`) || report.severity}
// //                                     </span>
// //                                   )}
// //                                   {report.tags && (
// //                                     <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getTagBadgeClass(report.tags)}`}>
// //                                       {t(`reports.tag_${report.tags.toLowerCase().replace(' ', '_')}`) || report.tags}
// //                                     </span>
// //                                   )}
// //                                   {report.follow_up_status && (
// //                                     <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getFollowUpStatusBadgeClass(report.follow_up_status)}`}>
// //                                       {t(`reports.follow_up_${report.follow_up_status.toLowerCase()}`) || report.follow_up_status}
// //                                     </span>
// //                                   )}
// //                                 </div>
// //                               </div>
// //                               <div>
// //                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                   {t('reports.report_type') || 'Report Type'}
// //                                 </span>
// //                                 <p className="text-gray-800 dark:text-gray-100">{report.reportType || t('reports.unknown') || 'N/A'}</p>
// //                               </div>
// //                               <div>
// //                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                   {t('reports.created_by') || 'Created By'}
// //                                 </span>
// //                                 <p className="text-gray-800 dark:text-gray-100">{report.user_created_name || t('reports.unknown') || 'Unknown'}</p>
// //                               </div>
// //                               <div>
// //                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                   {t('reports.main_location') || 'Main Location'}
// //                                 </span>
// //                                 <p className="text-gray-800 dark:text-gray-100">{report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}</p>
// //                               </div>
// //                               <div>
// //                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                   {t('reports.qa_section') || 'QA Section'}
// //                                 </span>
// //                                 <p className="text-gray-800 dark:text-gray-100">{report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}</p>
// //                               </div>
// //                               <div>
// //                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                   {t('reports.qa_sub_section') || 'QA Sub-Section'}
// //                                 </span>
// //                                 <p className="text-gray-800 dark:text-gray-100">{report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}</p>
// //                               </div>
// //                               {report.created_at && (
// //                                 <div>
// //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                     {t('reports.created_at') || 'Created At'}
// //                                   </span>
// //                                   <p className="text-gray-800 dark:text-gray-100">{format(new Date(report.created_at), 'PPP')}</p>
// //                                 </div>
// //                               )}
// //                               {report.status && (
// //                                 <div>
// //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                     {t('reports.status') || 'Status'}
// //                                   </span>
// //                                   <p className="text-gray-800 dark:text-gray-100">{t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}</p>
// //                                 </div>
// //                               )}
// //                               {report.corrective_action_required && (
// //                                 <div>
// //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                     {t('reports.corrective_action_required') || 'Corrective Action'}
// //                                   </span>
// //                                   <p className="text-gray-800 dark:text-gray-100">{t(report.corrective_action_required ? 'reports.corrective_action_needed' : 'reports.no_corrective_action_needed') || (report.corrective_action_required ? 'Needed' : 'Not Needed')}</p>
// //                                 </div>
// //                               )}
// //                               {report.signature_url && (
// //                                 <div>
// //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                     {t('reports.signature') || 'Signature'}
// //                                   </span>
// //                                   {signatureUrls[reportId] === undefined ? (
// //                                     <span className="text-gray-600 dark:text-gray-400">{t('reports.loading_signature') || 'Loading signature...'}</span>
// //                                   ) : signatureUrls[reportId] === null ? (
// //                                     <span className="text-red-600 dark:text-red-400">{t('reports.signature_failed') || 'Failed to load signature'}</span>
// //                                   ) : (
// //                                     <img
// //                                       src={signatureUrls[reportId]}
// //                                       alt="Signature"
// //                                       className="w-24 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-700 shadow-sm mt-2 cursor-pointer"
// //                                       onError={(e) => {
// //                                         console.error('Signature image load failed for report:', reportId);
// //                                         e.target.src = '/placeholder-image.png';
// //                                       }}
// //                                       onClick={() => setSelectedReport(report)}
// //                                     />
// //                                   )}
// //                                 </div>
// //                               )}
// //                             </div>
// //                           </div>
// //                         );
// //                       })}
// //                     </div>
// //                     {totalPages > 1 && (
// //                       <div className="flex justify-center items-center gap-3 mt-8">
// //                         <button
// //                           onClick={() => handlePageChange(currentPage - 1)}
// //                           disabled={currentPage === 1}
// //                           className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
// //                           aria-label={t('reports.previous') || 'Previous'}
// //                         >
// //                           {t('reports.previous') || 'Previous'}
// //                         </button>
// //                         <div className="flex gap-2">
// //                           {Array.from({ length: Math.min(8, totalPages) }, (_, i) => {
// //                             const startPage = Math.max(1, currentPage - 3);
// //                             const endPage = Math.min(totalPages, startPage + 7);
// //                             const page = startPage + i;

// //                             if (page <= endPage) {
// //                               return (
// //                                 <button
// //                                   key={page}
// //                                   onClick={() => handlePageChange(page)}
// //                                   className={`px-4 py-2 rounded-lg ${
// //                                     page === currentPage
// //                                       ? 'bg-indigo-500 text-white'
// //                                       : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
// //                                   } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
// //                                   aria-label={`Page ${page}`}
// //                                   aria-current={page === currentPage ? 'page' : undefined}
// //                                 >
// //                                   {page}
// //                                 </button>
// //                               );
// //                             }
// //                             return null;
// //                           })}
// //                         </div>
// //                         <button
// //                           onClick={() => handlePageChange(currentPage + 1)}
// //                           disabled={currentPage === totalPages}
// //                           className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
// //                           aria-label={t('reports.next') || 'Next'}
// //                         >
// //                           {t('reports.next') || 'Next'}
// //                         </button>
// //                         <select
// //                           value={currentPage}
// //                           onChange={(e) => handlePageChange(Number(e.target.value))}
// //                           className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
// //                           aria-label={t('reports.jump_to_page') || 'Jump to page'}
// //                         >
// //                           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
// //                             <option key={page} value={page}>
// //                               {t('reports.page') || 'Page'} {page}
// //                             </option>
// //                           ))}
// //                         </select>
// //                         <select
// //                           value={perPage}
// //                           onChange={handlePerPageChange}
// //                           className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
// //                           aria-label={t('reports.items_per_page') || 'Items per page'}
// //                         >
// //                           {perPageOptions.map((option) => (
// //                             <option key={option} value={option}>
// //                               {option} {t('reports.items') || 'items'}
// //                             </option>
// //                           ))}
// //                         </select>
// //                       </div>
// //                     )}
// //                     <AnimatePresence>
// //                       {selectedReport && (
// //                         <ReportModal
// //                           report={selectedReport}
// //                           onClose={() => setSelectedReport(null)}
// //                           authData={authData}
// //                           t={t}
// //                           onReportUpdate={handleReportUpdate}
// //                         />
// //                       )}
// //                     </AnimatePresence>
// //                   </>
// //                 )}
// //               </>
// //             )}
// //           </div>
// //         </main>
// //       </div>
// //     </div>
// //   );
// // };

// // export default InvestigateReport;


// // InvestigateReport
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import ModalSearch from '../../components/ModalSearch';
// import ThemeToggle from '../../components/ThemeToggle';
// import LanguageToggle from '../../components/LanguageToggle';
// import investigateReportService from '../../lib/investigateReportService';
// import { format } from 'date-fns';
// import { AnimatePresence } from 'framer-motion';
// import { useDebounce, ImageCarousel, ReportModal } from './InvestigateReportHelpers';

// const InvestigateReport = () => {
//   const { authData, loading: authLoading } = useAuth();
//   const { language, t } = useLanguage();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [hasPrivilege, setHasPrivilege] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [reports, setReports] = useState([]);
//   const [filteredReports, setFilteredReports] = useState([]);
//   const [reportTypes, setReportTypes] = useState([]);
//   const [selectedReport, setSelectedReport] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [perPage, setPerPage] = useState(5);
//   const [totalPages, setTotalPages] = useState(1);
//   const [filters, setFilters] = useState({
//     startDate: '',
//     endDate: '',
//     reportType: '',
//     search: '',
//     sort: '-created_at',
//     severity: '',
//     tags: '',
//     reportName: '',
//     status: '',
//   });
//   const [searchInput, setSearchInput] = useState('');
//   const debouncedSearch = useDebounce(searchInput, 1000);
//   const [signatureUrls, setSignatureUrls] = useState({});

//   // Privilege check function
//   const hasPrivilegeCheck = (requiredPrivileges) => {
//     return authData?.privilege_ids?.some(id => requiredPrivileges.includes(id)) || false;
//   };

//   const extractTextFields = (structure) => {
//     const textFields = [];

//     const extractFromSection = (section, sectionKey) => {
//       if (section && Array.isArray(section)) {
//         section.forEach((item) => {
//           if (item.name) textFields.push(item.name);
//           if (item.fields) {
//             item.fields.forEach((field) => {
//               if (field.name) textFields.push(field.name);
//               if (['text', 'radio', 'Time'].includes(field.type) && field.value) {
//                 textFields.push(field.value);
//               } else if (['Date', 'DateTime'].includes(field.type) && field.value) {
//                 textFields.push(format(new Date(field.value), 'PPP'));
//               } else if (Array.isArray(field.value)) {
//                 textFields.push(field.value.join(', '));
//               }
//             });
//           }
//           const subKey = sectionKey === 'sub_headers' ? 'sub_sub_headers' : sectionKey === 'sub_bodies' ? 'sub_sub_bodies' : 'sub_sub_footers';
//           if (item[subKey]) extractFromSection(item[subKey], subKey);
//         });
//       }
//     };

//     if (structure?.header?.sub_headers) extractFromSection(structure.header.sub_headers, 'sub_headers');
//     if (structure?.body?.sub_bodies) extractFromSection(structure.body.sub_bodies, 'sub_bodies');
//     if (structure?.footer?.sub_footers) extractFromSection(structure.footer.sub_footers, 'sub_footers');

//     return textFields.filter(Boolean);
//   };

//   useEffect(() => {
//     setFilters((prev) => ({ ...prev, search: debouncedSearch }));
//   }, [debouncedSearch]);

//   useEffect(() => {
//     if (authLoading) return;

//     if (!authData?.access_token) {
//       setError(t('reports.no_permission') || 'No permission to view reports');
//       setLoading(false);
//       return;
//     }

//     // Check for multiple privileges
//     if (hasPrivilegeCheck([5000, 1, 1003])) {
//       setHasPrivilege(true);
//       fetchReports();
//     } else {
//       setError(t('reports.no_permission') || 'No permission to view reports');
//       setHasPrivilege(false);
//       setLoading(false);
//     }
//   }, [authData, authLoading, currentPage, filters, language, t, perPage]);

//   const fetchReports = async () => {
//     setLoading(true);
//     try {
//       const response = await investigateReportService.getReports(authData.org_id, {
//         page: currentPage,
//         perPage,
//         reportType: filters.reportType,
//         sort: filters.sort,
//         lang: language || 'en',
//       });

//       console.log('Full API response:', response);
//       console.log('Fetched reports:', response.data.map(r => ({
//         id: r.id || r._id?.$oid,
//         name: r.name,
//         status: r.status,
//         severity: r.severity,
//         tags: r.tags,
//         corrective_action_required: r.corrective_action_required,
//         follow_up_status: r.follow_up_status,
//         investigation_details: r.investigation_details
//       })));
//       setReports(Array.isArray(response.data) ? response.data : []);
//       setTotalPages(response.pagination?.total_pages || 1);

//       const uniqueReportTypes = response.data && Array.isArray(response.data)
//         ? [...new Set(response.data.map((report) => report.reportType).filter(Boolean))]
//         : [];
//       setReportTypes(uniqueReportTypes.map((type) => ({ _id: type, name: type })));
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching reports:', err);
//       setError(t('reports.fetch_reports_error', { message: err.message }) || `Error: ${err.message}`);
//       setReports([]);
//       setFilteredReports([]);
//       setTotalPages(1);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     let filtered = [...reports];

//     if (filters.search) {
//       const queryLower = filters.search.toLowerCase();
//       filtered = filtered.filter((report) => {
//         const textFields = extractTextFields(report.structure);
//         return (
//           [
//             report.name,
//             report.reportType,
//             report.user_created_name,
//             report.main_location_name,
//             report.qa_section,
//             report.qa_sub_section,
//             report.tags,
//             report.severity,
//             report.follow_up_status,
//             report.investigation_details,
//             ...textFields,
//           ]
//             .filter(Boolean)
//             .map((field) => field.toLowerCase())
//             .some((field) => field.includes(queryLower))
//         );
//       });
//     }

//     if (filters.startDate) {
//       const startDate = new Date(filters.startDate);
//       filtered = filtered.filter((report) => {
//         const createdAt = new Date(report.created_at);
//         return createdAt >= startDate;
//       });
//     }

//     if (filters.endDate) {
//       const endDate = new Date(filters.endDate);
//       endDate.setHours(23, 59, 59, 999);
//       filtered = filtered.filter((report) => {
//         const createdAt = new Date(report.created_at);
//         return createdAt <= endDate;
//       });
//     }

//     if (filters.severity) {
//       filtered = filtered.filter((report) => report.severity === filters.severity);
//     }

//     if (filters.tags) {
//       filtered = filtered.filter((report) => report.tags === filters.tags);
//     }

//     if (filters.reportName) {
//       filtered = filtered.filter((report) => (report.name || 'Unnamed Report') === filters.reportName);
//     }

//     if (filters.status) {
//       if (filters.status === 'None') {
//         filtered = filtered.filter((report) => !report.status);
//       } else {
//         filtered = filtered.filter((report) => report.status === filters.status);
//       }
//     }

//     setFilteredReports(filtered);
//   }, [reports, filters]);

//   useEffect(() => {
//     const fetchSignatures = async () => {
//       const signatures = {};
//       for (const report of reports) {
//         const reportId = report._id?.$oid || report.id;
//         if (report.signature_url && reportId) {
//           try {
//             const filename = report.signature_url.split('/').pop();
//             console.log(`Fetching signature for report ${reportId}, filename: ${filename}`);
//             const url = await investigateReportService.fetchImage(filename, authData.access_token);
//             signatures[reportId] = url;
//             console.log(`Signature URL for report ${reportId}: ${url}`);
//           } catch (err) {
//             console.error(`Error fetching signature for report ${reportId}:`, err);
//             signatures[reportId] = null;
//           }
//         }
//       }
//       setSignatureUrls(signatures);
//     };

//     if (authData?.access_token && reports.length > 0) {
//       fetchSignatures();
//     }
//   }, [reports, authData?.access_token]);

//   const handleReportUpdate = (updatedReport) => {
//     setReports((prevReports) =>
//       prevReports.map((report) =>
//         (report.id || report._id?.$oid) === (updatedReport.id || updatedReport._id?.$oid)
//           ? updatedReport
//           : report
//       )
//     );
//     setSelectedReport(updatedReport);
//   };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     if (name === 'search') {
//       setSearchInput(value);
//     } else {
//       setFilters((prev) => ({ ...prev, [name]: value }));
//       setCurrentPage(1);
//     }
//   };

//   const handlePerPageChange = (e) => {
//     const newPerPage = Number(e.target.value);
//     setPerPage(newPerPage);
//     setCurrentPage(1);
//   };

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const getStatusBarClass = (status) => {
//     switch (status) {
//       case 'Escalated':
//         return 'bg-orange-600';
//       case 'Investigated':
//         return 'bg-green-600';
//       case 'Rejected Case':
//         return 'bg-gray-600';
//       case 'Under Management Action':
//         return 'bg-yellow-600';
//       case 'Resolved':
//         return 'bg-green-600';
//       default:
//         return '';
//     }
//   };

//   const getSeverityBadgeClass = (severity) => {
//     switch (severity) {
//       case 'High':
//         return 'bg-red-600 text-white';
//       case 'Medium':
//         return 'bg-orange-600 text-white';
//       case 'Low':
//         return 'bg-yellow-600 text-white';
//       case 'Informational':
//         return 'bg-blue-600 text-white';
//       default:
//         return 'bg-gray-600 text-white';
//     }
//   };

//   const getFollowUpStatusBadgeClass = (status) => {
//     switch (status) {
//       case 'Open':
//         return 'bg-yellow-600 text-white';
//       case 'Pending':
//         return 'bg-orange-600 text-white';
//       case 'Resolved':
//         return 'bg-green-600 text-white';
//       case 'Closed':
//         return 'bg-blue-600 text-white';
//       default:
//         return 'bg-gray-600 text-white';
//     }
//   };

//   const getTagBadgeClass = (tag) => {
//     switch (tag) {
//       case 'Repeated':
//         return 'bg-purple-600 text-white';
//       case 'First Time':
//         return 'bg-purple-600 text-white';
//       default:
//         return 'bg-gray-600 text-white';
//     }
//   };

//   const uniqueReportNames = [...new Set(reports.map((report) => report.name || 'Unnamed Report'))];
//   const statusOptions = ['None', 'Open', 'Resolved', 'Escalated', 'Investigated', 'Under Management Action', 'Rejected Case'];
//   const severityOptions = ['High', 'Medium', 'Low', 'Informational'];
//   const tagOptions = ['Repeated', 'First Time'];
//   const perPageOptions = [5, 10, 15, 50, 75, 100, 200, 10000, 100000, 50000000];

//   if (authLoading || !authData || loading) {
//     return <LoadingSpinner />;
//   }

//   // Render the component only if the user has the required privileges
//   if (!hasPrivilegeCheck([5000, 1, 1003])) {
//     return (
//       <div className="flex h-screen overflow-hidden">
//         <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//         <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
//           <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//           <main>
//             <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
//               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm relative mb-6" role="alert">
//                 <span>{t('reports.no_permission') || 'No permission to view reports'}</span>
//               </div>
//             </div>
//           </main>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen overflow-hidden">
//       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//       <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
//         <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//         <main>
//           <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
//             <div className="sm:flex sm:justify-between sm:items-center mb-8">
//               <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
//                 {t('investigate_report.view_reports') || 'Investigate Reports'}
//               </h1>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//                 <LanguageToggle />
//                 <ModalSearch onSearch={(query) => setSearchInput(query)} />
//                 <ThemeToggle />
//               </div>
//             </div>
//             <div className="mb-6">
//               <div className="relative">
//                 <input
//                   type="text"
//                   value={searchInput}
//                   onChange={handleFilterChange}
//                   name="search"
//                   placeholder={t('reports.search_placeholder') || 'Search by name, type, or any field...'}
//                   className="w-full py-3 px-4 pl-12 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   aria-label={t('reports.search_placeholder') || 'Search reports'}
//                 />
//                 <svg
//                   className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//               </div>
//             </div>
//             {error && (
//               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm relative mb-6" role="alert">
//                 <span>{error}</span>
//                 <button
//                   onClick={() => setError('')}
//                   className="absolute top-0 right-0 px-4 py-3"
//                   aria-label={t('common.dismiss_error') || 'Dismiss error'}
//                 >
//                   <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
//                     <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
//                   </svg>
//                 </button>
//               </div>
//             )}
//             <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
//               <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
//                 {t('reports.filters') || 'Filters'}
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {t('reports.start_date') || 'Start Date'}
//                   </label>
//                   <input
//                     type="date"
//                     name="startDate"
//                     value={filters.startDate}
//                     onChange={handleFilterChange}
//                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {t('reports.end_date') || 'End Date'}
//                   </label>
//                   <input
//                     type="date"
//                     name="endDate"
//                     value={filters.endDate}
//                     onChange={handleFilterChange}
//                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {t('reports.report_type') || 'Report Type'}
//                   </label>
//                   <select
//                     name="reportType"
//                     value={filters.reportType}
//                     onChange={handleFilterChange}
//                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   >
//                     <option value="">{t('reports.all_report_types') || 'All Report Types'}</option>
//                     {reportTypes.map((type) => (
//                       <option key={type._id} value={type.name}>
//                         {type.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {t('reports.sort') || 'Sort'}
//                   </label>
//                   <select
//                     name="sort"
//                     value={filters.sort}
//                     onChange={handleFilterChange}
//                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   >
//                     <option value="-created_at">{t('reports.sort_newest') || 'Newest First'}</option>
//                     <option value="created_at">{t('reports.sort_oldest') || 'Oldest First'}</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {t('reports.severity') || 'Severity'}
//                   </label>
//                   <select
//                     name="severity"
//                     value={filters.severity}
//                     onChange={handleFilterChange}
//                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   >
//                     <option value="">{t('reports.all_severities') || 'All Severities'}</option>
//                     {severityOptions.map((severity) => (
//                       <option key={severity} value={severity}>
//                         {t(`reports.severity_${severity.toLowerCase()}`) || severity}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {t('reports.tag') || 'Tag'}
//                   </label>
//                   <select
//                     name="tags"
//                     value={filters.tags}
//                     onChange={handleFilterChange}
//                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   >
//                     <option value="">{t('reports.all_tags') || 'All Tags'}</option>
//                     {tagOptions.map((tag) => (
//                       <option key={tag} value={tag}>
//                         {t(`reports.tag_${tag.toLowerCase().replace(' ', '_')}`) || tag}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {t('reports.report_name') || 'Report Name'}
//                   </label>
//                   <select
//                     name="reportName"
//                     value={filters.reportName}
//                     onChange={handleFilterChange}
//                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   >
//                     <option value="">{t('reports.all_report_names') || 'All Report Names'}</option>
//                     {uniqueReportNames.map((name) => (
//                       <option key={name} value={name}>
//                         {name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {t('reports.status') || 'Status'}
//                   </label>
//                   <select
//                     name="status"
//                     value={filters.status}
//                     onChange={handleFilterChange}
//                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   >
//                     <option value="">{t('reports.all_statuses') || 'All Statuses'}</option>
//                     {statusOptions.map((status) => (
//                       <option key={status} value={status}>
//                         {t(status === 'None' ? 'reports.no_status' : `reports.status_${status.toLowerCase().replace(' ', '_')}`) || status}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>
//             {loading ? (
//               <LoadingSpinner />
//             ) : (
//               <>
//                 {filteredReports.length === 0 ? (
//                   <div className="text-center text-gray-600 dark:text-gray-300 py-12">
//                     <svg
//                       className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                     <p className="text-lg">{t('reports.no_reports') || 'No reports found'}</p>
//                   </div>
//                 ) : (
//                   <>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                       {filteredReports.map((report) => {
//                         const reportId = report._id?.$oid || report.id;
//                         const statusBarClass = getStatusBarClass(report.status);
//                         return (
//                           <div
//                             key={reportId}
//                             className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
//                             role="button"
//                             aria-label={`${t('reports.report_name') || 'Report'}: ${report.name}`}
//                             onClick={() => setSelectedReport(report)}
//                             tabIndex={0}
//                             onKeyDown={(e) => {
//                               if (e.key === 'Enter' || e.key === ' ') {
//                                 setSelectedReport(report);
//                               }
//                             }}
//                           >
//                             {report.status && (
//                               <div className={`${statusBarClass} text-white text-sm font-bold text-center py-2 rounded-t-lg -mt-6 -mx-6 mb-4`}>
//                                 {t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}
//                               </div>
//                             )}
//                             <div className="space-y-3">
//                               <div className="flex justify-between items-start">
//                                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200">
//                                   {report.name || 'Unnamed Report'}
//                                 </h3>
//                                 <div className="flex flex-col gap-2">
//                                   {report.severity && (
//                                     <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getSeverityBadgeClass(report.severity)}`}>
//                                       {t(`reports.severity_${report.severity.toLowerCase()}`) || report.severity}
//                                     </span>
//                                   )}
//                                   {report.tags && (
//                                     <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getTagBadgeClass(report.tags)}`}>
//                                       {t(`reports.tag_${report.tags.toLowerCase().replace(' ', '_')}`) || report.tags}
//                                     </span>
//                                   )}
//                                   {report.follow_up_status && (
//                                     <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getFollowUpStatusBadgeClass(report.follow_up_status)}`}>
//                                       {t(`reports.follow_up_${report.follow_up_status.toLowerCase()}`) || report.follow_up_status}
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                               <div>
//                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                   {t('reports.report_type') || 'Report Type'}
//                                 </span>
//                                 <p className="text-gray-800 dark:text-gray-100">{report.reportType || t('reports.unknown') || 'N/A'}</p>
//                               </div>
//                               <div>
//                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                   {t('reports.created_by') || 'Created By'}
//                                 </span>
//                                 <p className="text-gray-800 dark:text-gray-100">{report.user_created_name || t('reports.unknown') || 'Unknown'}</p>
//                               </div>
//                               <div>
//                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                   {t('reports.main_location') || 'Main Location'}
//                                 </span>
//                                 <p className="text-gray-800 dark:text-gray-100">{report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}</p>
//                               </div>
//                               <div>
//                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                   {t('reports.qa_section') || 'QA Section'}
//                                 </span>
//                                 <p className="text-gray-800 dark:text-gray-100">{report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}</p>
//                               </div>
//                               <div>
//                                 <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                   {t('reports.qa_sub_section') || 'QA Sub-Section'}
//                                 </span>
//                                 <p className="text-gray-800 dark:text-gray-100">{report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}</p>
//                               </div>
//                               {report.created_at && (
//                                 <div>
//                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                     {t('reports.created_at') || 'Created At'}
//                                   </span>
//                                   <p className="text-gray-800 dark:text-gray-100">{format(new Date(report.created_at), 'PPP')}</p>
//                                 </div>
//                               )}
//                               {report.status && (
//                                 <div>
//                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                     {t('reports.status') || 'Status'}
//                                   </span>
//                                   <p className="text-gray-800 dark:text-gray-100">{t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}</p>
//                                 </div>
//                               )}
//                               {report.corrective_action_required && (
//                                 <div>
//                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                     {t('reports.corrective_action_required') || 'Corrective Action'}
//                                   </span>
//                                   <p className="text-gray-800 dark:text-gray-100">{t(report.corrective_action_required ? 'reports.corrective_action_needed' : 'reports.no_corrective_action_needed') || (report.corrective_action_required ? 'Needed' : 'Not Needed')}</p>
//                                 </div>
//                               )}
//                               {report.signature_url && (
//                                 <div>
//                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                     {t('reports.signature') || 'Signature'}
//                                   </span>
//                                   {signatureUrls[reportId] === undefined ? (
//                                     <span className="text-gray-600 dark:text-gray-400">{t('reports.loading_signature') || 'Loading signature...'}</span>
//                                   ) : signatureUrls[reportId] === null ? (
//                                     <span className="text-red-600 dark:text-red-400">{t('reports.signature_failed') || 'Failed to load signature'}</span>
//                                   ) : (
//                                     <img
//                                       src={signatureUrls[reportId]}
//                                       alt="Signature"
//                                       className="w-24 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-700 shadow-sm mt-2 cursor-pointer"
//                                       onError={(e) => {
//                                         console.error('Signature image load failed for report:', reportId);
//                                         e.target.src = '/placeholder-image.png';
//                                       }}
//                                       onClick={() => setSelectedReport(report)}
//                                     />
//                                   )}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                     {totalPages > 1 && (
//                       <div className="flex justify-center items-center gap-3 mt-8">
//                         <button
//                           onClick={() => handlePageChange(currentPage - 1)}
//                           disabled={currentPage === 1}
//                           className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                           aria-label={t('reports.previous') || 'Previous'}
//                         >
//                           {t('reports.previous') || 'Previous'}
//                         </button>
//                         <div className="flex gap-2">
//                           {Array.from({ length: Math.min(8, totalPages) }, (_, i) => {
//                             const startPage = Math.max(1, currentPage - 3);
//                             const endPage = Math.min(totalPages, startPage + 7);
//                             const page = startPage + i;

//                             if (page <= endPage) {
//                               return (
//                                 <button
//                                   key={page}
//                                   onClick={() => handlePageChange(page)}
//                                   className={`px-4 py-2 rounded-lg ${
//                                     page === currentPage
//                                       ? 'bg-indigo-500 text-white'
//                                       : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
//                                   } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
//                                   aria-label={`Page ${page}`}
//                                   aria-current={page === currentPage ? 'page' : undefined}
//                                 >
//                                   {page}
//                                 </button>
//                               );
//                             }
//                             return null;
//                           })}
//                         </div>
//                         <button
//                           onClick={() => handlePageChange(currentPage + 1)}
//                           disabled={currentPage === totalPages}
//                           className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                           aria-label={t('reports.next') || 'Next'}
//                         >
//                           {t('reports.next') || 'Next'}
//                         </button>
//                         <select
//                           value={currentPage}
//                           onChange={(e) => handlePageChange(Number(e.target.value))}
//                           className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                           aria-label={t('reports.jump_to_page') || 'Jump to page'}
//                         >
//                           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                             <option key={page} value={page}>
//                               {t('reports.page') || 'Page'} {page}
//                             </option>
//                           ))}
//                         </select>
//                         <select
//                           value={perPage}
//                           onChange={handlePerPageChange}
//                           className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                           aria-label={t('reports.items_per_page') || 'Items per page'}
//                         >
//                           {perPageOptions.map((option) => (
//                             <option key={option} value={option}>
//                               {option} {t('reports.items') || 'items'}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     )}
//                     <AnimatePresence>
//                       {selectedReport && (
//                         <ReportModal
//                           report={selectedReport}
//                           onClose={() => setSelectedReport(null)}
//                           authData={authData}
//                           t={t}
//                           onReportUpdate={handleReportUpdate}
//                         />
//                       )}
//                     </AnimatePresence>
//                   </>
//                 )}
//               </>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default InvestigateReport;


// befor workiner

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import investigateReportService from '../../lib/investigateReportService';
import { format, differenceInDays } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

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
            const url = await investigateReportService.fetchImage(filename, accessToken);
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
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [investigationDetails, setInvestigationDetails] = useState(report.investigation_details || '');
  const [investigationLoading, setInvestigationLoading] = useState(false);
  const [investigationError, setInvestigationError] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);
  const [statusHistoryError, setStatusHistoryError] = useState(null);
  const { language } = useLanguage();

  // Debug logging to verify worker data
  useEffect(() => {
    console.log('ReportModal received report:', {
      reportId: report.id || report._id?.$oid,
      workers: report.workers,
      worker_notes: report.worker_notes,
      hasWorkers: Array.isArray(report.workers) && report.workers.length > 0,
      hasWorkerNotes: Array.isArray(report.worker_notes) && report.worker_notes.length > 0,
      willRenderWorkerSection: report.workers && Array.isArray(report.workers) && report.workers.length > 0 && report.worker_notes && Array.isArray(report.worker_notes) && report.worker_notes.length > 0
    });
  }, [report]);

  // Privilege check for updating status and investigation details
  const hasPrivilege = (requiredPrivileges) => {
    return authData?.privilege_ids?.some(id => requiredPrivileges.includes(id)) || false;
  };

  useEffect(() => {
    const fetchSignature = async () => {
      if (report.signature_url) {
        setSignatureLoading(true);
        try {
          const filename = report.signature_url.split('/').pop();
          console.log('Fetching signature for filename:', filename);
          const url = await investigateReportService.fetchImage(filename, authData.access_token);
          console.log('Signature URL fetched:', url);
          setSignatureUrl(url);
          setSignatureLoading(false);
        } catch (err) {
          console.error('Error fetching signature:', err);
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
        const response = await investigateReportService.getStatusHistory({
          id: reportId,
          orgId: authData.org_id,
          accessToken: authData.access_token
        });
        console.log('Status history response:', response);
        setStatusHistory(response.data || []);
        setStatusHistoryLoading(false);
      } catch (err) {
        console.error('Error fetching status history:', {
          message: err.message,
          response: err.response,
          reportId,
          orgId: authData.org_id
        });
        setStatusHistoryError(t('reports.status_history_error', { message: err.message }) || `Failed to fetch status history: ${err.message}`);
        setStatusHistoryLoading(false);
      }
    };
    fetchStatusHistory();
  }, [report.id, report._id?.$oid, authData.org_id, authData.access_token, t]);

  const handleStatusUpdate = async (newStatus) => {
    if (!hasPrivilege([5000, 1, 1003])) {
      setStatusError(t('reports.no_permission') || 'No permission to update status');
      return;
    }

    const reportId = report.id || report._id?.$oid;
    console.log(`Updating status for report:`, { id: reportId, newStatus });
    if (!reportId) {
      setStatusError(t('reports.invalid_report_id') || 'Invalid report ID');
      return;
    }
    if (report.status === newStatus) {
      setStatusError(t('reports.already_status', { status: newStatus }) || `Report is already ${newStatus}`);
      return;
    }
    setStatusLoading(true);
    setStatusError(null);
    try {
      const response = await investigateReportService.updateReportStatus({
        id: reportId,
        orgId: authData.org_id,
        newStatus,
        accessToken: authData.access_token
      });
      console.log('Status update response:', response);
      if (response.message.includes('already')) {
        setStatusError(t('reports.already_status', { status: newStatus }) || `Report is already ${newStatus}`);
      } else {
        onReportUpdate({ ...report, status: response.report.status });
        const historyResponse = await investigateReportService.getStatusHistory({
          id: reportId,
          orgId: authData.org_id,
          accessToken: authData.access_token
        });
        setStatusHistory(historyResponse.data || []);
      }
      setStatusLoading(false);
    } catch (err) {
      console.error('Error updating status:', {
        message: err.message,
        response: err.response,
        reportId,
        orgId: authData.org_id
      });
      setStatusError(t('reports.status_error', { message: err.message }) || `Failed to update status: ${err.message}`);
      setStatusLoading(false);
    }
  };

  const handleInvestigationDetailsChange = async () => {
    if (!hasPrivilege([5000, 1, 1003])) {
      setInvestigationError(t('reports.no_permission') || 'No permission to update investigation details');
      return;
    }

    const reportId = report.id || report._id?.$oid;
    console.log('Updating investigation details:', { reportId, investigationDetails });
    if (!reportId) {
      setInvestigationError(t('reports.invalid_report_id') || 'Invalid report ID');
      return;
    }
    setInvestigationLoading(true);
    setInvestigationError(null);
    try {
      const response = await investigateReportService.updateInvestigationDetails({
        id: reportId,
        orgId: authData.org_id,
        investigationDetails,
        accessToken: authData.access_token
      });
      console.log('Investigation details update response:', response);
      onReportUpdate({ ...report, investigation_details: response.report.investigation_details });
      setInvestigationLoading(false);
    } catch (err) {
      console.error('Error updating investigation details:', {
        message: err.message,
        response: err.response,
        reportId,
        orgId: authData.org_id
      });
      setInvestigationError(t('reports.investigation_error', { message: err.message }) || `Failed to update investigation details: ${err.message}`);
      setInvestigationLoading(false);
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
        return 'bg-red-600 text-white';
      case 'Rejected Case':
        return 'bg-gray-600 text-white';
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
            const url = await investigateReportService.fetchImage(filename, authData.access_token);
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
    } else if (field.type === 'multi_image' && Array.isArray(field.value) && field.value.length > 0) {
      return <ImageCarousel images={field.value} fieldName={field.name} accessToken={authData.access_token} t={t} />;
    } else if (field.type === 'PDF' && field.value) {
      return <span className="inline-block px-2 py-1 bg-blue-600 text-white rounded">{t('templates.pdf_upload_placeholder') || 'PDF File'}</span>;
    } else if (field.type === 'radio' && field.value) {
      return <span className="inline-block px-2 py-1 bg-blue-600 text-white rounded">{field.value}</span>;
    } else if (field.type === 'Date' && field.value) {
      return <span className="inline-block px-2 py-1 bg-blue-600 text-white rounded">{format(new Date(field.value), 'PPP')}</span>;
    } else if (field.type === 'DateTime' && field.value) {
      return <span className="inline-block px-2 py-1 bg-blue-600 text-white rounded">{format(new Date(field.value), 'PPP p')}</span>;
    } else if (field.type === 'Time' && field.value) {
      return <span className="inline-block px-2 py-1 bg-blue-600 text-white rounded">{field.value}</span>;
    } else if (Array.isArray(field.value) && field.value.length > 0) {
      return <span className="inline-block px-2 py-1 bg-blue-600 text-white rounded">{field.value.join(', ')}</span>;
    } else if (field.value && field.value !== 'N/A') {
      return <span className="inline-block px-2 py-1 bg-blue-600 text-white rounded">{field.value}</span>;
    }
    return null;
  };


  const renderSection = (section, subSections, sectionKey) => {
    if (!subSections || !Array.isArray(subSections)) return null;

    const validSubSections = subSections
      .map((sub, subIndex) => {
        const validFields = (sub.fields || []).filter((field) => {
          if (field.type === 'image' && field.value) return true;
          if (field.type === 'multi_image' && Array.isArray(field.value) && field.value.length > 0) return true;
          if (field.type === 'PDF' && field.value) return true;
          if (field.type === 'radio' && field.value) return true;
          if (field.type === 'Date' && field.value) return true;
          if (field.type === 'DateTime' && field.value) return true;
          if (field.type === 'Time' && field.value) return true;
          if (Array.isArray(field.value) && field.value.length > 0) return true;
          if (field.value && field.value !== 'N/A') return true;
          return false;
        });

        const subKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
        const validSubSubSections = (sub[subKey] || [])
          .map((subSub, subSubIndex) => {
            const validSubSubFields = (subSub.fields || []).filter((field) => {
              if (field.type === 'image' && field.value) return true;
              if (field.type === 'multi_image' && Array.isArray(field.value) && field.value.length > 0) return true;
              if (field.type === 'PDF' && field.value) return true;
              if (field.type === 'radio' && field.value) return true;
              if (field.type === 'Date' && field.value) return true;
              if (field.type === 'DateTime' && field.value) return true;
              if (field.type === 'Time' && field.value) return true;
              if (Array.isArray(field.value) && field.value.length > 0) return true;
              if (field.value && field.value !== 'N/A') return true;
              return false;
            });

            return validSubSubFields.length > 0
              ? {
                  ...subSub,
                  fields: validSubSubFields,
                  index: subSubIndex,
                }
              : null;
          })
          .filter(Boolean);

        return (validFields.length > 0 || validSubSubSections.length > 0)
          ? {
              ...sub,
              fields: validFields,
              [subKey]: validSubSubSections,
              index: subIndex,
            }
          : null;
      })
      .filter(Boolean);

    if (validSubSections.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="text-md font-medium mb-2 text-gray-800 dark:text-gray-100 capitalize">
          {section}
        </h4>
        {validSubSections.map((sub) => (
          <div key={`${sectionKey}-${sub.index}`} className="border p-4 rounded-md mb-2 bg-gray-50 dark:bg-gray-700">
            <h5 className="text-sm font-medium text-gray-800 dark:text-gray-100">{sub.name || 'Unnamed Section'}</h5>
            {sub.fields.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {sub.fields.map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.name || 'Unnamed Field'}:
                    </span>
                    <span className="text-sm">{renderFieldValue(field)}</span>
                  </div>
                ))}
              </div>
            )}
            {sub[section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'].length > 0 && (
              <div className="mt-2">
                {sub[section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'].map((subSub) => (
                  <div key={`${sectionKey}-${sub.index}-subSub-${subSub.index}`} className="ml-4 mt-2 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                    <h6 className="text-sm font-medium text-gray-800 dark:text-gray-100">{subSub.name || 'Unnamed Sub-Section'}</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {subSub.fields.map((field) => (
                        <div key={field.name} className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {field.name || 'Unnamed Field'}:
                          </span>
                          <span className="text-sm">{renderFieldValue(field)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const currentDate = new Date();

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
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {report.name || 'Unnamed Report'} (ID: {report.id || report._id?.$oid || 'N/A'})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              aria-label={t('reports.close') || 'Close'}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {hasPrivilege([5000, 1, 1003]) && (
            <div className="mb-4 flex items-center gap-4">
              <button
                onClick={() => handleStatusUpdate('Investigated')}
                disabled={statusLoading || report.status !== 'Escalated'}
                className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ${
                  statusLoading || report.status !== 'Escalated'
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
                }`}
                aria-label={t('reports.case_accepted') || 'Case Accepted'}
              >
                {statusLoading ? t('reports.processing') || 'Processing...' : t('reports.case_accepted') || 'Case Accepted'}
              </button>
              <button
                onClick={() => handleStatusUpdate('Rejected Case')}
                disabled={statusLoading || report.status !== 'Escalated'}
                className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ${
                  statusLoading || report.status !== 'Escalated'
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                }`}
                aria-label={t('reports.case_rejected') || 'Case Rejected'}
              >
                {statusLoading ? t('reports.processing') || 'Processing...' : t('reports.case_rejected') || 'Case Rejected'}
              </button>
              {statusError && (
                <span className="text-red-600 dark:text-red-400">{statusError}</span>
              )}
            </div>
          )}
          {hasPrivilege([5000, 1, 1003]) && (
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">
                {t('reports.investigation_details') || 'Investigation Details'}
              </h4>
              <textarea
                value={investigationDetails}
                onChange={(e) => setInvestigationDetails(e.target.value)}
                onBlur={handleInvestigationDetailsChange}
                className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                rows={4}
                aria-label={t('reports.investigation_details') || 'Investigation Details'}
              />
              {investigationLoading && (
                <span className="text-gray-600 dark:text-gray-400 block mt-2">{t('reports.updating') || 'Updating...'}</span>
              )}
              {investigationError && (
                <span className="text-red-600 dark:text-red-400 block mt-2">{investigationError}</span>
              )}
            </div>
          )}
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {message.includes('{{') ? fallbackMessage : message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">
              {t('reports.corrective_action') || 'Corrective Action'}
            </h4>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('reports.corrective_action_required') || 'Corrective Action Required'}:
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t(report.corrective_action_required ? 'reports.corrective_action_needed' : 'reports.no_corrective_action_needed') || (report.corrective_action_required ? 'Needed' : 'Not Needed')}
              </span>
            </div>
            {report.corrective_action_required && (
              <div className="space-y-4">
                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('reports.corrective_action_description') || 'Corrective Action Description'}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {report.corrective_action_description || t('reports.unknown') || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('reports.corrective_action_date') || 'Corrective Action Date'}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {report.corrective_action_date ? format(new Date(report.corrective_action_date), 'yyyy-MM-dd') : t('reports.unknown') || 'N/A'}
                  </span>
                </div>
                {report.corrective_action_date && (
                  <div>
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('reports.follow_up_status') || 'Follow Up Status'}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t(`reports.follow_up_${report.follow_up_status?.toLowerCase()}`) || report.follow_up_status || t('reports.unknown') || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          {report.status && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('reports.status') || 'Status'}: 
              <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeClass(report.status)}`}>
                {t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}
              </span>
            </p>
          )}
          {report.severity && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('reports.severity') || 'Severity'}: 
              <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getSeverityBadgeClass(report.severity)}`}>
                {t(`reports.severity_${report.severity.toLowerCase()}`) || report.severity}
              </span>
            </p>
          )}
          {report.tags && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('reports.tag') || 'Tag'}: 
              <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getTagBadgeClass(report.tags)}`}>
                {t(`reports.tag_${report.tags.toLowerCase().replace(' ', '_')}`) || report.tags}
              </span>
            </p>
          )}
          {report.follow_up_status && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {t('reports.follow_up_status') || 'Follow Up Status'}: 
              <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getFollowUpStatusBadgeClass(report.follow_up_status)}`}>
                {t(`reports.follow_up_${report.follow_up_status.toLowerCase()}`) || report.follow_up_status}
              </span>
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {t('reports.template_id') || 'Template ID'}: {report.template_id || t('reports.unknown') || 'N/A'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {t('reports.report_type') || 'Report Type'}: {report.reportType || t('reports.unknown') || 'N/A'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('reports.created_by') || 'Created By'}: {report.user_created_name || t('reports.unknown') || 'Unknown'}
          </p>
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-100">
              {t('reports.location_details') || 'Location Details'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('reports.main_location') || 'Main Location'}: {report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('reports.qa_location') || 'QA Location'}: {report.qa_location || report.structure?.location_details?.locations_qa_id || t('reports.unknown') || 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('reports.qa_section') || 'QA Section'}: {report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('reports.qa_sub_section') || 'QA Sub-Section'}: {report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}
            </p>
          </div>
          {report.workers && Array.isArray(report.workers) && report.workers.length > 0 && report.worker_notes && Array.isArray(report.worker_notes) && report.worker_notes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-100">
                {t('reports.worker_management') || 'Worker Management'}
              </h4>
              {report.workers.map((worker, index) => (
                <div key={worker.id || worker.employee_id || index} className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{t('reports.worker_name') || 'Worker Name'}:</span> {worker.full_name || worker.full_name_en || t('reports.unknown') || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{t('reports.job_title') || 'Job Title'}:</span> {worker.job_name_ar || t('reports.unknown') || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{t('reports.department') || 'Department'}:</span> {worker.department_name || t('reports.unknown') || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{t('reports.section') || 'Section'}:</span> {worker.section_name_ar || t('reports.unknown') || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{t('reports.notes') || 'Notes'}:</span> {report.worker_notes[index] || t('reports.no_notes') || 'No notes'}
                  </p>
                </div>
              ))}
            </div>
          )}
          {report.signature_url && (
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-100">
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
                  className="w-32 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer"
                  onClick={() => setEnlargedImage(signatureUrl)}
                  onError={(e) => {
                    console.error('Signature image load failed:', report.signature_url);
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

const InvestigateReport = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    reportType: '',
    search: '',
    sort: '-created_at',
    severity: '',
    tags: '',
    reportName: '',
    status: '',
  });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 1000);
  const [signatureUrls, setSignatureUrls] = useState({});

  // Privilege check function
  const hasPrivilegeCheck = (requiredPrivileges) => {
    return authData?.privilege_ids?.some(id => requiredPrivileges.includes(id)) || false;
  };

  const extractTextFields = (structure) => {
    const textFields = [];

    const extractFromSection = (section, sectionKey) => {
      if (section && Array.isArray(section)) {
        section.forEach((item) => {
          if (item.name) textFields.push(item.name);
          if (item.fields) {
            item.fields.forEach((field) => {
              if (field.name) textFields.push(field.name);
              if (['text', 'radio', 'Time'].includes(field.type) && field.value) {
                textFields.push(field.value);
              } else if (['Date', 'DateTime'].includes(field.type) && field.value) {
                textFields.push(format(new Date(field.value), 'PPP'));
              } else if (Array.isArray(field.value)) {
                textFields.push(field.value.join(', '));
              }
            });
          }
          const subKey = sectionKey === 'sub_headers' ? 'sub_sub_headers' : sectionKey === 'sub_bodies' ? 'sub_sub_bodies' : 'sub_sub_footers';
          if (item[subKey]) extractFromSection(item[subKey], subKey);
        });
      }
    };

    if (structure?.header?.sub_headers) extractFromSection(structure.header.sub_headers, 'sub_headers');
    if (structure?.body?.sub_bodies) extractFromSection(structure.body.sub_bodies, 'sub_bodies');
    if (structure?.footer?.sub_footers) extractFromSection(structure.footer.sub_footers, 'sub_footers');

    return textFields.filter(Boolean);
  };

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('reports.no_permission') || 'No permission to view reports');
      setLoading(false);
      return;
    }

    // Check for multiple privileges
    if (hasPrivilegeCheck([5000, 1, 1003])) {
      setHasPrivilege(true);
      fetchReports();
    } else {
      setError(t('reports.no_permission') || 'No permission to view reports');
      setHasPrivilege(false);
      setLoading(false);
    }
  }, [authData, authLoading, currentPage, filters, language, t, perPage]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await investigateReportService.getReports(authData.org_id, {
        page: currentPage,
        perPage,
        reportType: filters.reportType,
        sort: filters.sort,
        lang: language || 'en',
      });

      console.log('Full API response:', response);
      console.log('Fetched reports:', response.data.map(r => ({
        id: r.id || r._id?.$oid,
        name: r.name,
        status: r.status,
        severity: r.severity,
        tags: r.tags,
        corrective_action_required: r.corrective_action_required,
        follow_up_status: r.follow_up_status,
        investigation_details: r.investigation_details,
        workers: r.workers,
        worker_notes: r.worker_notes
      })));
      setReports(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.pagination?.total_pages || 1);

      const uniqueReportTypes = response.data && Array.isArray(response.data)
        ? [...new Set(response.data.map((report) => report.reportType).filter(Boolean))]
        : [];
      setReportTypes(uniqueReportTypes.map((type) => ({ _id: type, name: type })));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(t('reports.fetch_reports_error', { message: err.message }) || `Error: ${err.message}`);
      setReports([]);
      setFilteredReports([]);
      setTotalPages(1);
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...reports];

    if (filters.search) {
      const queryLower = filters.search.toLowerCase();
      filtered = filtered.filter((report) => {
        const textFields = extractTextFields(report.structure);
        return (
          [
            report.name,
            report.reportType,
            report.user_created_name,
            report.main_location_name,
            report.qa_section,
            report.qa_sub_section,
            report.tags,
            report.severity,
            report.follow_up_status,
            report.investigation_details,
            ...textFields,
          ]
            .filter(Boolean)
            .map((field) => field.toLowerCase())
            .some((field) => field.includes(queryLower))
        );
      });
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter((report) => {
        const createdAt = new Date(report.created_at);
        return createdAt >= startDate;
      });
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((report) => {
        const createdAt = new Date(report.created_at);
        return createdAt <= endDate;
      });
    }

    if (filters.severity) {
      filtered = filtered.filter((report) => report.severity === filters.severity);
    }

    if (filters.tags) {
      filtered = filtered.filter((report) => report.tags === filters.tags);
    }

    if (filters.reportName) {
      filtered = filtered.filter((report) => (report.name || 'Unnamed Report') === filters.reportName);
    }

    if (filters.status) {
      if (filters.status === 'None') {
        filtered = filtered.filter((report) => !report.status);
      } else {
        filtered = filtered.filter((report) => report.status === filters.status);
      }
    }

    setFilteredReports(filtered);
  }, [reports, filters]);

  useEffect(() => {
    const fetchSignatures = async () => {
      const signatures = {};
      for (const report of reports) {
        const reportId = report._id?.$oid || report.id;
        if (report.signature_url && reportId) {
          try {
            const filename = report.signature_url.split('/').pop();
            console.log(`Fetching signature for report ${reportId}, filename: ${filename}`);
            const url = await investigateReportService.fetchImage(filename, authData.access_token);
            signatures[reportId] = url;
            console.log(`Signature URL for report ${reportId}: ${url}`);
          } catch (err) {
            console.error(`Error fetching signature for report ${reportId}:`, err);
            signatures[reportId] = null;
          }
        }
      }
      setSignatureUrls(signatures);
    };

    if (authData?.access_token && reports.length > 0) {
      fetchSignatures();
    }
  }, [reports, authData?.access_token]);

  const handleReportUpdate = (updatedReport) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        (report.id || report._id?.$oid) === (updatedReport.id || updatedReport._id?.$oid)
          ? updatedReport
          : report
      )
    );
    setSelectedReport(updatedReport);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'search') {
      setSearchInput(value);
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
      setCurrentPage(1);
    }
  };

  const handlePerPageChange = (e) => {
    const newPerPage = Number(e.target.value);
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getStatusBarClass = (status) => {
    switch (status) {
      case 'Escalated':
        return 'bg-orange-600';
      case 'Investigated':
        return 'bg-green-600';
      case 'Rejected Case':
        return 'bg-gray-600';
      case 'Under Management Action':
        return 'bg-yellow-600';
      case 'Resolved':
        return 'bg-green-600';
      default:
        return '';
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

  const uniqueReportNames = [...new Set(reports.map((report) => report.name || 'Unnamed Report'))];
  const statusOptions = ['None', 'Open', 'Resolved', 'Escalated', 'Investigated', 'Under Management Action', 'Rejected Case'];
  const severityOptions = ['High', 'Medium', 'Low', 'Informational'];
  const tagOptions = ['Repeated', 'First Time'];
  const perPageOptions = [5, 10, 15, 50, 75, 100, 200, 10000, 100000, 50000000];

  if (authLoading || !authData || loading) {
    return <LoadingSpinner />;
  }

  // Render the component only if the user has the required privileges
  if (!hasPrivilegeCheck([5000, 1, 1003])) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main>
            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm relative mb-6" role="alert">
                <span>{t('reports.no_permission') || 'No permission to view reports'}</span>
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
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                {t('investigate_report.view_reports') || 'Investigate Reports'}
              </h1>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <LanguageToggle />
                <ModalSearch onSearch={(query) => setSearchInput(query)} />
                <ThemeToggle />
              </div>
            </div>
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleFilterChange}
                  name="search"
                  placeholder={t('reports.search_placeholder') || 'Search by name, type, or any field...'}
                  className="w-full py-3 px-4 pl-12 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  aria-label={t('reports.search_placeholder') || 'Search reports'}
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
                  aria-label={t('common.dismiss_error') || 'Dismiss error'}
                >
                  <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                  </svg>
                </button>
              </div>
            )}
            <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {t('reports.filters') || 'Filters'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('reports.start_date') || 'Start Date'}
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('reports.end_date') || 'End Date'}
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('reports.report_type') || 'Report Type'}
                  </label>
                  <select
                    name="reportType"
                    value={filters.reportType}
                    onChange={handleFilterChange}
                    className="mt-1 block w/full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  >
                    <option value="">{t('reports.all_report_types') || 'All Report Types'}</option>
                    {reportTypes.map((type) => (
                      <option key={type._id} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('reports.sort') || 'Sort'}
                  </label>
                  <select
                    name="sort"
                    value={filters.sort}
                    onChange={handleFilterChange}
                    className="mt-1 block w/full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  >
                    <option value="-created_at">{t('reports.sort_newest') || 'Newest First'}</option>
                    <option value="created_at">{t('reports.sort_oldest') || 'Oldest First'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('reports.severity') || 'Severity'}
                  </label>
                  <select
                    name="severity"
                    value={filters.severity}
                    onChange={handleFilterChange}
                    className="mt-1 block w/full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  >
                    <option value="">{t('reports.all_severities') || 'All Severities'}</option>
                    {severityOptions.map((severity) => (
                      <option key={severity} value={severity}>
                        {t(`reports.severity_${severity.toLowerCase()}`) || severity}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('reports.tag') || 'Tag'}
                  </label>
                  <select
                    name="tags"
                    value={filters.tags}
                    onChange={handleFilterChange}
                    className="mt-1 block w/full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  >
                    <option value="">{t('reports.all_tags') || 'All Tags'}</option>
                    {tagOptions.map((tag) => (
                      <option key={tag} value={tag}>
                        {t(`reports.tag_${tag.toLowerCase().replace(' ', '_')}`) || tag}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('reports.report_name') || 'Report Name'}
                  </label>
                  <select
                    name="reportName"
                    value={filters.reportName}
                    onChange={handleFilterChange}
                    className="mt-1 block w/full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  >
                    <option value="">{t('reports.all_report_names') || 'All Report Names'}</option>
                    {uniqueReportNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('reports.status') || 'Status'}
                  </label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="mt-1 block w/full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  >
                    <option value="">{t('reports.all_statuses') || 'All Statuses'}</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {t(status === 'None' ? 'reports.no_status' : `reports.status_${status.toLowerCase().replace(' ', '_')}`) || status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                {filteredReports.length === 0 ? (
                  <div className="text-center text-gray-600 dark:text-gray-300 py-12">
                    <svg
                      className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg">{t('reports.no_reports') || 'No reports found'}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredReports.map((report) => {
                        const reportId = report._id?.$oid || report.id;
                        const statusBarClass = getStatusBarClass(report.status);
                        return (
                          <div
                            key={reportId}
                            className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                            role="button"
                            aria-label={`${t('reports.report_name') || 'Report'}: ${report.name}`}
                            onClick={() => setSelectedReport(report)}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                setSelectedReport(report);
                              }
                            }}
                          >
                            {report.status && (
                              <div className={`${statusBarClass} text-white text-sm font-bold text-center py-2 rounded-t-lg -mt-6 -mx-6 mb-4`}>
                                {t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}
                              </div>
                            )}
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200">
                                  {report.name || 'Unnamed Report'}
                                </h3>
                                <div className="flex flex-col gap-2">
                                  {report.severity && (
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getSeverityBadgeClass(report.severity)}`}>
                                      {t(`reports.severity_${report.severity.toLowerCase()}`) || report.severity}
                                    </span>
                                  )}
                                  {report.tags && (
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getTagBadgeClass(report.tags)}`}>
                                      {t(`reports.tag_${report.tags.toLowerCase().replace(' ', '_')}`) || report.tags}
                                    </span>
                                  )}
                                  {report.follow_up_status && (
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getFollowUpStatusBadgeClass(report.follow_up_status)}`}>
                                      {t(`reports.follow_up_${report.follow_up_status.toLowerCase()}`) || report.follow_up_status}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                  {t('reports.report_type') || 'Report Type'}
                                </span>
                                <p className="text-gray-800 dark:text-gray-100">{report.reportType || t('reports.unknown') || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                  {t('reports.created_by') || 'Created By'}
                                </span>
                                <p className="text-gray-800 dark:text-gray-100">{report.user_created_name || t('reports.unknown') || 'Unknown'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                  {t('reports.main_location') || 'Main Location'}
                                </span>
                                <p className="text-gray-800 dark:text-gray-100">{report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                  {t('reports.qa_section') || 'QA Section'}
                                </span>
                                <p className="text-gray-800 dark:text-gray-100">{report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                  {t('reports.qa_sub_section') || 'QA Sub-Section'}
                                </span>
                                <p className="text-gray-800 dark:text-gray-100">{report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}</p>
                              </div>
                              {report.created_at && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                    {t('reports.created_at') || 'Created At'}
                                  </span>
                                  <p className="text-gray-800 dark:text-gray-100">{format(new Date(report.created_at), 'PPP')}</p>
                                </div>
                              )}
                              {report.status && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                    {t('reports.status') || 'Status'}
                                  </span>
                                  <p className="text-gray-800 dark:text-gray-100">{t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}</p>
                                </div>
                              )}
                              {report.corrective_action_required && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                    {t('reports.corrective_action_required') || 'Corrective Action'}
                                  </span>
                                  <p className="text-gray-800 dark:text-gray-100">{t(report.corrective_action_required ? 'reports.corrective_action_needed' : 'reports.no_corrective_action_needed') || (report.corrective_action_required ? 'Needed' : 'Not Needed')}</p>
                                </div>
                              )}
                              {report.signature_url && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                    {t('reports.signature') || 'Signature'}
                                  </span>
                                  {signatureUrls[reportId] === undefined ? (
                                    <span className="text-gray-600 dark:text-gray-400">{t('reports.loading_signature') || 'Loading signature...'}</span>
                                  ) : signatureUrls[reportId] === null ? (
                                    <span className="text-red-600 dark:text-red-400">{t('reports.signature_failed') || 'Failed to load signature'}</span>
                                  ) : (
                                    <img
                                      src={signatureUrls[reportId]}
                                      alt="Signature"
                                      className="w-24 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-700 shadow-sm mt-2 cursor-pointer"
                                      onError={(e) => {
                                        console.error('Signature image load failed for report:', reportId);
                                        e.target.src = '/placeholder-image.png';
                                      }}
                                      onClick={() => setSelectedReport(report)}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-3 mt-8">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          aria-label={t('reports.previous') || 'Previous'}
                        >
                          {t('reports.previous') || 'Previous'}
                        </button>
                        <div className="flex gap-2">
                          {Array.from({ length: Math.min(8, totalPages) }, (_, i) => {
                            const startPage = Math.max(1, currentPage - 3);
                            const endPage = Math.min(totalPages, startPage + 7);
                            const page = startPage + i;

                            if (page <= endPage) {
                              return (
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
                              );
                            }
                            return null;
                          })}
                        </div>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          aria-label={t('reports.next') || 'Next'}
                        >
                          {t('reports.next') || 'Next'}
                        </button>
                        <select
                          value={currentPage}
                          onChange={(e) => handlePageChange(Number(e.target.value))}
                          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          aria-label={t('reports.jump_to_page') || 'Jump to page'}
                        >
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <option key={page} value={page}>
                              {t('reports.page') || 'Page'} {page}
                            </option>
                          ))}
                        </select>
                        <select
                          value={perPage}
                          onChange={handlePerPageChange}
                          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          aria-label={t('reports.items_per_page') || 'Items per page'}
                        >
                          {perPageOptions.map((option) => (
                            <option key={option} value={option}>
                              {option} {t('reports.items') || 'items'}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <AnimatePresence>
                      {selectedReport && (
                        <ReportModal
                          report={selectedReport}
                          onClose={() => setSelectedReport(null)}
                          authData={authData}
                          t={t}
                          onReportUpdate={handleReportUpdate}
                        />
                      )}
                    </AnimatePresence>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvestigateReport;