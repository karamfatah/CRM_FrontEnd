
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import investigateReportService from '../../lib/investigateReportService';
// import { format, differenceInDays } from 'date-fns';
// import { AnimatePresence, motion } from 'framer-motion';
// import Slider from 'react-slick';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

// // Custom debounce hook
// const useDebounce = (value, delay) => {
//   const [debouncedValue, setDebouncedValue] = useState(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// };

// // Custom arrows for the slider
// const PrevArrow = (props) => {
//   const { onClick } = props;
//   return (
//     <button
//       onClick={onClick}
//       className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full z-10 hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//       aria-label="Previous Image"
//     >
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
//       </svg>
//     </button>
//   );
// };

// const NextArrow = (props) => {
//   const { onClick } = props;
//   return (
//     <button
//       onClick={onClick}
//       className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full z-10 hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//       aria-label="Next Image"
//     >
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
//       </svg>
//     </button>
//   );
// };

// const ImageModal = ({ imageUrl, onClose, images = [], currentIndex = 0 }) => {
//   const [index, setIndex] = useState(currentIndex);

//   const nextImage = () => {
//     setIndex((prev) => (prev + 1) % images.length);
//   };

//   const prevImage = () => {
//     setIndex((prev) => (prev - 1 + images.length) % images.length);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ scale: 0.8 }}
//         animate={{ scale: 1 }}
//         exit={{ scale: 0.8 }}
//         className="relative max-w-4xl w-full"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <img
//           src={images.length > 0 ? images[index] : imageUrl}
//           alt="Enlarged"
//           className="w-full h-auto max-h-[80vh] object-cover rounded-lg"
//         />
//         {images.length > 1 && (
//           <>
//             <button
//               onClick={prevImage}
//               className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               aria-label="Previous Image"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
//               </svg>
//             </button>
//             <button
//               onClick={nextImage}
//               className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               aria-label="Next Image"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
//               </svg>
//             </button>
//             <div className="text-center mt-2 text-sm text-white">
//               {index + 1} / {images.length}
//             </div>
//           </>
//         )}
//         <button
//           onClick={onClose}
//           className="absolute top-2 right-2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           aria-label="Close"
//         >
//           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         </button>
//       </motion.div>
//     </motion.div>
//   );
// };

// const ImageCarousel = ({ images, fieldName, accessToken, t }) => {
//   const [imageDataUrls, setImageDataUrls] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showImageModal, setShowImageModal] = useState(false);

//   useEffect(() => {
//     const fetchImages = async () => {
//       setLoading(true);
//       try {
//         const urls = await Promise.all(
//           images.map(async (imagePath) => {
//             const filename = imagePath.split('/').pop();
//             const url = await investigateReportService.fetchImage(filename, accessToken);
//             return { url, file_name: filename };
//           })
//         );
//         setImageDataUrls(urls);
//         setLoading(false);
//       } catch (err) {
//         setError(t('reports.fetch_image_error') || 'Failed to load images');
//         setLoading(false);
//       }
//     };
//     if (images?.length > 0) {
//       fetchImages();
//     } else {
//       setLoading(false);
//       setError(t('reports.no_images') || 'No images provided');
//     }
//   }, [images, accessToken, t]);

//   const sliderSettings = {
//     dots: imageDataUrls.length > 1,
//     infinite: imageDataUrls.length > 1,
//     speed: 500,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     arrows: imageDataUrls.length > 1,
//     prevArrow: <PrevArrow />,
//     nextArrow: <NextArrow />,
//     customPaging: (i) => (
//       <button className="w-3 h-3 bg-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
//         <span className="sr-only">{`Slide ${i + 1}`}</span>
//       </button>
//     ),
//     dotsClass: "slick-dots custom-dots",
//   };

//   if (loading) {
//     return <span className="text-gray-600 dark:text-gray-400">Loading images...</span>;
//   }

//   if (error) {
//     return <span className="text-red-600 dark:text-red-400">{error}</span>;
//   }

//   if (!imageDataUrls || imageDataUrls.length === 0) {
//     return <span className="text-gray-600 dark:text-gray-400">{t('reports.no_images') || 'No images'}</span>;
//   }

//   return (
//     <>
//       {imageDataUrls.length === 1 ? (
//         <div className="flex flex-col items-center">
//           <img
//             src={imageDataUrls[0].url}
//             alt={imageDataUrls[0].file_name}
//             className="w-full max-w-md h-auto object-contain rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer"
//             onClick={() => setShowImageModal(true)}
//             role="button"
//             tabIndex={0}
//             onKeyDown={(e) => {
//               if (e.key === 'Enter' || e.key === ' ') {
//                 setShowImageModal(true);
//               }
//             }}
//             aria-label={`View ${imageDataUrls[0].file_name}`}
//           />
//           <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
//             {imageDataUrls[0].file_name}
//           </p>
//         </div>
//       ) : (
//         <Slider {...sliderSettings}>
//           {imageDataUrls.map((image, index) => (
//             <div key={index} className="relative">
//               <img
//                 src={image.url}
//                 alt={image.file_name}
//                 className="w-full h-64 object-contain rounded-lg cursor-pointer"
//                 onClick={() => setShowImageModal(true)}
//                 role="button"
//                 tabIndex={0}
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter' || e.key === ' ') {
//                     setShowImageModal(true);
//                   }
//                 }}
//                 aria-label={`View ${image.file_name}`}
//               />
//               <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
//                 {image.file_name}
//               </p>
//             </div>
//           ))}
//         </Slider>
//       )}
//       <AnimatePresence>
//         {showImageModal && (
//           <ImageModal
//             images={imageDataUrls.map(img => img.url)}
//             currentIndex={imageDataUrls.findIndex(img => img.url === (imageDataUrls[0]?.url || ''))}
//             onClose={() => setShowImageModal(false)}
//           />
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// const ReportModal = ({ report, onClose, authData, t, onReportUpdate }) => {
//   const [enlargedImage, setEnlargedImage] = useState(null);
//   const [signatureUrl, setSignatureUrl] = useState(null);
//   const [signatureLoading, setSignatureLoading] = useState(false);
//   const [signatureError, setSignatureError] = useState(null);
//   const [statusLoading, setStatusLoading] = useState(false);
//   const [statusError, setStatusError] = useState(null);
//   const [investigationDetails, setInvestigationDetails] = useState(report.investigation_details || '');
//   const [investigationLoading, setInvestigationLoading] = useState(false);
//   const [investigationError, setInvestigationError] = useState(null);
//   const [statusHistory, setStatusHistory] = useState([]);
//   const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);
//   const [statusHistoryError, setStatusHistoryError] = useState(null);
//   const { language } = useLanguage();

//   // Privilege check for updating status and investigation details
//   const hasPrivilege = (requiredPrivileges) => {
//     return authData?.privilege_ids?.some(id => requiredPrivileges.includes(id)) || false;
//   };

//   useEffect(() => {
//     const fetchSignature = async () => {
//       if (report.signature_url) {
//         setSignatureLoading(true);
//         try {
//           const filename = report.signature_url.split('/').pop();
//           console.log('Fetching signature for filename:', filename);
//           const url = await investigateReportService.fetchImage(filename, authData.access_token);
//           console.log('Signature URL fetched:', url);
//           setSignatureUrl(url);
//           setSignatureLoading(false);
//         } catch (err) {
//           console.error('Error fetching signature:', err);
//           setSignatureError(t('reports.fetch_image_error') || 'Failed to load signature');
//           setSignatureLoading(false);
//         }
//       }
//     };
//     fetchSignature();
//   }, [report.signature_url, authData.access_token, t]);

//   useEffect(() => {
//     const fetchStatusHistory = async () => {
//       const reportId = report.id || report._id?.$oid;
//       if (!reportId) {
//         setStatusHistoryError(t('reports.invalid_report_id') || 'Invalid report ID');
//         return;
//       }
//       setStatusHistoryLoading(true);
//       setStatusHistoryError(null);
//       try {
//         const response = await investigateReportService.getStatusHistory({
//           id: reportId,
//           orgId: authData.org_id,
//           accessToken: authData.access_token
//         });
//         console.log('Status history response:', response);
//         setStatusHistory(response.data || []);
//         setStatusHistoryLoading(false);
//       } catch (err) {
//         console.error('Error fetching status history:', {
//           message: err.message,
//           response: err.response,
//           reportId,
//           orgId: authData.org_id
//         });
//         setStatusHistoryError(t('reports.status_history_error', { message: err.message }) || `Failed to fetch status history: ${err.message}`);
//         setStatusHistoryLoading(false);
//       }
//     };
//     fetchStatusHistory();
//   }, [report.id, report._id?.$oid, authData.org_id, authData.access_token, t]);

//   const handleStatusUpdate = async (newStatus) => {
//     // Only allow status updates if the user has the required privileges
//     if (!hasPrivilege([5000, 1, 1003])) {
//       setStatusError(t('reports.no_permission') || 'No permission to update status');
//       return;
//     }

//     const reportId = report.id || report._id?.$oid;
//     console.log(`Updating status for report:`, { id: reportId, newStatus });
//     if (!reportId) {
//       setStatusError(t('reports.invalid_report_id') || 'Invalid report ID');
//       return;
//     }
//     if (report.status === newStatus) {
//       setStatusError(t('reports.already_status', { status: newStatus }) || `Report is already ${newStatus}`);
//       return;
//     }
//     setStatusLoading(true);
//     setStatusError(null);
//     try {
//       const response = await investigateReportService.updateReportStatus({
//         id: reportId,
//         orgId: authData.org_id,
//         newStatus,
//         accessToken: authData.access_token
//       });
//       console.log('Status update response:', response);
//       if (response.message.includes('already')) {
//         setStatusError(t('reports.already_status', { status: newStatus }) || `Report is already ${newStatus}`);
//       } else {
//         onReportUpdate({ ...report, status: response.report.status });
//         const historyResponse = await investigateReportService.getStatusHistory({
//           id: reportId,
//           orgId: authData.org_id,
//           accessToken: authData.access_token
//         });
//         setStatusHistory(historyResponse.data || []);
//       }
//       setStatusLoading(false);
//     } catch (err) {
//       console.error('Error updating status:', {
//         message: err.message,
//         response: err.response,
//         reportId,
//         orgId: authData.org_id
//       });
//       setStatusError(t('reports.status_error', { message: err.message }) || `Failed to update status: ${err.message}`);
//       setStatusLoading(false);
//     }
//   };

//   const handleInvestigationDetailsChange = async () => {
//     // Only allow investigation details updates if the user has the required privileges
//     if (!hasPrivilege([5000, 1, 1003])) {
//       setInvestigationError(t('reports.no_permission') || 'No permission to update investigation details');
//       return;
//     }

//     const reportId = report.id || report._id?.$oid;
//     console.log('Updating investigation details:', { reportId, investigationDetails });
//     if (!reportId) {
//       setInvestigationError(t('reports.invalid_report_id') || 'Invalid report ID');
//       return;
//     }
//     setInvestigationLoading(true);
//     setInvestigationError(null);
//     try {
//       const response = await investigateReportService.updateInvestigationDetails({
//         id: reportId,
//         orgId: authData.org_id,
//         investigationDetails,
//         accessToken: authData.access_token
//       });
//       console.log('Investigation details update response:', response);
//       onReportUpdate({ ...report, investigation_details: response.report.investigation_details });
//       setInvestigationLoading(false);
//     } catch (err) {
//       console.error('Error updating investigation details:', {
//         message: err.message,
//         response: err.response,
//         reportId,
//         orgId: authData.org_id
//       });
//       setInvestigationError(t('reports.investigation_error', { message: err.message }) || `Failed to update investigation details: ${err.message}`);
//       setInvestigationLoading(false);
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

//   const getStatusBadgeClass = (status) => {
//     switch (status) {
//       case 'Escalated':
//         return 'bg-orange-600 text-white';
//       case 'Investigated':
//         return 'bg-red-600 text-white';
//       case 'Rejected Case':
//         return 'bg-gray-600 text-white';
//       case 'Under Management Action':
//         return 'bg-yellow-600 text-white';
//       case 'Resolved':
//         return 'bg-green-600 text-white';
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

//   const renderFieldValue = (field) => {
//     if (field.type === 'image' && field.value) {
//       const [imageDataUrl, setImageDataUrl] = useState(null);
//       const [loading, setLoading] = useState(true);
//       const [error, setError] = useState(null);

//       useEffect(() => {
//         const fetchImage = async () => {
//           try {
//             const filename = field.value.split('/').pop();
//             const url = await investigateReportService.fetchImage(filename, authData.access_token);
//             setImageDataUrl(url);
//             setLoading(false);
//           } catch (err) {
//             setError(t('reports.fetch_image_error') || 'Failed to load image');
//             setLoading(false);
//           }
//         };
//         fetchImage();
//       }, [field.value, authData.access_token]);

//       if (loading) return <span className="text-gray-600 dark:text-gray-400">Loading image...</span>;
//       if (error) return <span className="text-red-600 dark:text-red-400">{error}</span>;

//       return (
//         <img
//           src={imageDataUrl}
//           alt={field.name}
//           className="w-32 h-32 object-cover rounded-md cursor-pointer"
//           onError={(e) => (e.target.src = '/placeholder-image.png')}
//           onClick={() => setEnlargedImage(imageDataUrl)}
//         />
//       );
//     } else if (field.type === 'multi_image' && Array.isArray(field.value) && field.value.length > 0) {
//       return <ImageCarousel images={field.value} fieldName={field.name} accessToken={authData.access_token} t={t} />;
//     } else if (field.type === 'PDF' && field.value) {
//       return <span className="inline-block px-2 py-1 bg-blue-600 text-white rounded">{t('templates.pdf_upload_placeholder') || 'PDF File'}</span>;
//     } else if (field.type === 'radio' && field.value) {
//       return <span className="inline-block px-2 py-1 bg-blue-600 text-white rounded">{field.value}</span>;
//     } else if (field.type === 'Date' && field.value) {
//       return <span className="inline-block px-2 py-1 bg-blue-600 text-white rounded">{format(new Date(field.value), 'PPP')}</span>;
//     } else if (field.type === 'DateTime' && field.value) {
//       return <span className="inline-block px-2 py-1 bg-blue-600 text-white rounded">{format(new Date(field.value), 'PPP p')}</span>;
//     } else if (field.type === 'Time' && field.value) {
//       return <span className="inline-block px-2 py-1 bg-blue-600 text-white rounded">{field.value}</span>;
//     } else if (Array.isArray(field.value) && field.value.length > 0) {
//       return <span className="inline-block px-2 py-1 bg-blue-600 text-white rounded">{field.value.join(', ')}</span>;
//     } else if (field.value && field.value !== 'N/A') {
//       return <span className="inline-block px-2 py-1 bg-blue-600 text-white rounded">{field.value}</span>;
//     }
//     return null;
//   };

//   const renderSection = (section, subSections, sectionKey) => {
//     if (!subSections || !Array.isArray(subSections)) return null;

//     // Filter sub-sections to only include those with at least one valid field
//     const validSubSections = subSections
//       .map((sub, subIndex) => {
//         // Filter fields to only include those with valid values
//         const validFields = (sub.fields || []).filter((field) => {
//           if (field.type === 'image' && field.value) return true;
//           if (field.type === 'multi_image' && Array.isArray(field.value) && field.value.length > 0) return true;
//           if (field.type === 'PDF' && field.value) return true;
//           if (field.type === 'radio' && field.value) return true;
//           if (field.type === 'Date' && field.value) return true;
//           if (field.type === 'DateTime' && field.value) return true;
//           if (field.type === 'Time' && field.value) return true;
//           if (Array.isArray(field.value) && field.value.length > 0) return true;
//           if (field.value && field.value !== 'N/A') return true;
//           return false;
//         });

//         // Filter sub-sub-sections to only include those with at least one valid field
//         const subKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
//         const validSubSubSections = (sub[subKey] || [])
//           .map((subSub, subSubIndex) => {
//             const validSubSubFields = (subSub.fields || []).filter((field) => {
//               if (field.type === 'image' && field.value) return true;
//               if (field.type === 'multi_image' && Array.isArray(field.value) && field.value.length > 0) return true;
//               if (field.type === 'PDF' && field.value) return true;
//               if (field.type === 'radio' && field.value) return true;
//               if (field.type === 'Date' && field.value) return true;
//               if (field.type === 'DateTime' && field.value) return true;
//               if (field.type === 'Time' && field.value) return true;
//               if (Array.isArray(field.value) && field.value.length > 0) return true;
//               if (field.value && field.value !== 'N/A') return true;
//               return false;
//             });

//             return validSubSubFields.length > 0
//               ? {
//                   ...subSub,
//                   fields: validSubSubFields,
//                   index: subSubIndex,
//                 }
//               : null;
//           })
//           .filter(Boolean);

//         return (validFields.length > 0 || validSubSubSections.length > 0)
//           ? {
//               ...sub,
//               fields: validFields,
//               [subKey]: validSubSubSections,
//               index: subIndex,
//             }
//           : null;
//       })
//       .filter(Boolean);

//     // Only render the section if there are valid sub-sections
//     if (validSubSections.length === 0) return null;

//     return (
//       <div className="mb-4">
//         <h4 className="text-md font-medium mb-2 text-gray-800 dark:text-gray-100 capitalize">
//           {section}
//         </h4>
//         {validSubSections.map((sub) => (
//           <div key={`${sectionKey}-${sub.index}`} className="border p-4 rounded-md mb-2 bg-gray-50 dark:bg-gray-700">
//             <h5 className="text-sm font-medium text-gray-800 dark:text-gray-100">{sub.name || 'Unnamed Section'}</h5>
//             {sub.fields.length > 0 && (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
//                 {sub.fields.map((field) => (
//                   <div key={field.name} className="flex flex-col">
//                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                       {field.name || 'Unnamed Field'}:
//                     </span>
//                     <span className="text-sm">{renderFieldValue(field)}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//             {sub[section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'].length > 0 && (
//               <div className="mt-2">
//                 {sub[section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'].map((subSub) => (
//                   <div key={`${sectionKey}-${sub.index}-subSub-${subSub.index}`} className="ml-4 mt-2 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
//                     <h6 className="text-sm font-medium text-gray-800 dark:text-gray-100">{subSub.name || 'Unnamed Sub-Section'}</h6>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
//                       {subSub.fields.map((field) => (
//                         <div key={field.name} className="flex flex-col">
//                           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                             {field.name || 'Unnamed Field'}:
//                           </span>
//                           <span className="text-sm">{renderFieldValue(field)}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     );
//   };

//   const currentDate = new Date();

//   return (
//     <>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//         dir={language === 'ar' ? 'rtl' : 'ltr'}
//       >
//         <motion.div
//           initial={{ scale: 0.8, y: 50 }}
//           animate={{ scale: 1, y: 0 }}
//           exit={{ scale: 0.8, y: 50 }}
//           className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
//         >
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
//               {report.name || 'Unnamed Report'} (ID: {report.id || report._id?.$oid || 'N/A'})
//             </h2>
//             <button
//               onClick={onClose}
//               className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
//               aria-label={t('reports.close') || 'Close'}
//             >
//               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//           {hasPrivilege([5000, 1, 1003]) && (
//             <div className="mb-4 flex items-center gap-4">
//               <button
//                 onClick={() => handleStatusUpdate('Investigated')}
//                 disabled={statusLoading || report.status !== 'Escalated'}
//                 className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ${
//                   statusLoading || report.status !== 'Escalated'
//                     ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
//                     : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
//                 }`}
//                 aria-label={t('reports.case_accepted') || 'Case Accepted'}
//               >
//                 {statusLoading ? t('reports.processing') || 'Processing...' : t('reports.case_accepted') || 'Case Accepted'}
//               </button>
//               <button
//                 onClick={() => handleStatusUpdate('Rejected Case')}
//                 disabled={statusLoading || report.status !== 'Escalated'}
//                 className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ${
//                   statusLoading || report.status !== 'Escalated'
//                     ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
//                     : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
//                 }`}
//                 aria-label={t('reports.case_rejected') || 'Case Rejected'}
//               >
//                 {statusLoading ? t('reports.processing') || 'Processing...' : t('reports.case_rejected') || 'Case Rejected'}
//               </button>
//               {statusError && (
//                 <span className="text-red-600 dark:text-red-400">{statusError}</span>
//               )}
//             </div>
//           )}
//           {hasPrivilege([5000, 1, 1003]) && (
//             <div className="mb-4">
//               <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">
//                 {t('reports.investigation_details') || 'Investigation Details'}
//               </h4>
//               <textarea
//                 value={investigationDetails}
//                 onChange={(e) => setInvestigationDetails(e.target.value)}
//                 onBlur={handleInvestigationDetailsChange}
//                 className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                 rows={4}
//                 aria-label={t('reports.investigation_details') || 'Investigation Details'}
//               />
//               {investigationLoading && (
//                 <span className="text-gray-600 dark:text-gray-400 block mt-2">{t('reports.updating') || 'Updating...'}</span>
//               )}
//               {investigationError && (
//                 <span className="text-red-600 dark:text-red-400 block mt-2">{investigationError}</span>
//               )}
//             </div>
//           )}
//           <div className="mb-4">
//             <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">
//               {t('reports.status_history') || 'Status History'}
//             </h4>
//             {statusHistoryLoading ? (
//               <span className="text-gray-600 dark:text-gray-400">{t('reports.loading_status_history') || 'Loading status history...'}</span>
//             ) : statusHistoryError ? (
//               <span className="text-red-600 dark:text-red-400">{statusHistoryError}</span>
//             ) : statusHistory.length === 0 ? (
//               <span className="text-gray-600 dark:text-gray-400">{t('reports.no_status_history') || 'No status history available'}</span>
//             ) : (
//               <div className="relative">
//                 <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
//                 {statusHistory.map((entry, index) => {
//                   const statusKey = `reports.status_${entry.status.toLowerCase().replace(' ', '_')}`;
//                   const translatedStatus = t(statusKey) || entry.status;
//                   const entryDate = new Date(entry.datetime);
//                   const formattedDateTime = format(entryDate, 'yyyy-MM-dd hh:mm a');
//                   const durationDays = differenceInDays(currentDate, entryDate);

//                   const message = t('reports.status_changed_with_duration', {
//                     status: translatedStatus,
//                     datetime: formattedDateTime,
//                     duration: durationDays
//                   });
//                   const fallbackMessage = `Changed to ${translatedStatus} on ${formattedDateTime} duration ${durationDays} days`;

//                   return (
//                     <div key={index} className="mb-4 flex items-start">
//                       <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
//                         <span className="w-4 h-4 bg-indigo-500 rounded-full z-10"></span>
//                       </div>
//                       <div className="ml-4">
//                         <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeClass(entry.status)}`}>
//                           {translatedStatus}
//                         </span>
//                         <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                           {message.includes('{{') ? fallbackMessage : message}
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//           <div className="mb-4">
//             <h4 className="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">
//               {t('reports.corrective_action') || 'Corrective Action'}
//             </h4>
//             <div className="flex items-center gap-4 mb-2">
//               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                 {t('reports.corrective_action_required') || 'Corrective Action Required'}:
//               </span>
//               <span className="text-sm text-gray-600 dark:text-gray-400">
//                 {t(report.corrective_action_required ? 'reports.corrective_action_needed' : 'reports.no_corrective_action_needed') || (report.corrective_action_required ? 'Needed' : 'Not Needed')}
//               </span>
//             </div>
//             {report.corrective_action_required && (
//               <div className="space-y-4">
//                 <div>
//                   <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {t('reports.corrective_action_description') || 'Corrective Action Description'}
//                   </span>
//                   <span className="text-sm text-gray-600 dark:text-gray-400">
//                     {report.corrective_action_description || t('reports.unknown') || 'N/A'}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {t('reports.corrective_action_date') || 'Corrective Action Date'}
//                   </span>
//                   <span className="text-sm text-gray-600 dark:text-gray-400">
//                     {report.corrective_action_date ? format(new Date(report.corrective_action_date), 'yyyy-MM-dd') : t('reports.unknown') || 'N/A'}
//                   </span>
//                 </div>
//                 {report.corrective_action_date && (
//                   <div>
//                     <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                       {t('reports.follow_up_status') || 'Follow Up Status'}
//                     </span>
//                     <span className="text-sm text-gray-600 dark:text-gray-400">
//                       {t(`reports.follow_up_${report.follow_up_status?.toLowerCase()}`) || report.follow_up_status || t('reports.unknown') || 'N/A'}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//           {report.status && (
//             <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
//               {t('reports.status') || 'Status'}: 
//               <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeClass(report.status)}`}>
//                 {t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}
//               </span>
//             </p>
//           )}
//           {report.severity && (
//             <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
//               {t('reports.severity') || 'Severity'}: 
//               <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getSeverityBadgeClass(report.severity)}`}>
//                 {t(`reports.severity_${report.severity.toLowerCase()}`) || report.severity}
//               </span>
//             </p>
//           )}
//           {report.tags && (
//             <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
//               {t('reports.tag') || 'Tag'}: 
//               <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getTagBadgeClass(report.tags)}`}>
//                 {t(`reports.tag_${report.tags.toLowerCase().replace(' ', '_')}`) || report.tags}
//               </span>
//             </p>
//           )}
//           {report.follow_up_status && (
//             <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
//               {t('reports.follow_up_status') || 'Follow Up Status'}: 
//               <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getFollowUpStatusBadgeClass(report.follow_up_status)}`}>
//                 {t(`reports.follow_up_${report.follow_up_status.toLowerCase()}`) || report.follow_up_status}
//               </span>
//             </p>
//           )}
//           <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
//             {t('reports.template_id') || 'Template ID'}: {report.template_id || t('reports.unknown') || 'N/A'}
//           </p>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
//             {t('reports.report_type') || 'Report Type'}: {report.reportType || t('reports.unknown') || 'N/A'}
//           </p>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//             {t('reports.created_by') || 'Created By'}: {report.user_created_name || t('reports.unknown') || 'Unknown'}
//           </p>
//           <div className="mb-4">
//             <h4 className="text-md font-medium text-gray-800 dark:text-gray-100">
//               {t('reports.location_details') || 'Location Details'}
//             </h4>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               {t('reports.main_location') || 'Main Location'}: {report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}
//             </p>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               {t('reports.qa_location') || 'QA Location'}: {report.qa_location || report.structure?.location_details?.locations_qa_id || t('reports.unknown') || 'N/A'}
//             </p>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               {t('reports.qa_section') || 'QA Section'}: {report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}
//             </p>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               {t('reports.qa_sub_section') || 'QA Sub-Section'}: {report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}
//             </p>
//           </div>
//           {report.signature_url && (
//             <div className="mb-4">
//               <h4 className="text-md font-medium text-gray-800 dark:text-gray-100">
//                 {t('reports.signature') || 'Signature'}
//               </h4>
//               {signatureLoading ? (
//                 <span className="text-gray-600 dark:text-gray-400">{t('reports.loading_signature') || 'Loading signature...'}</span>
//               ) : signatureError ? (
//                 <span className="text-red-600 dark:text-red-400">{signatureError}</span>
//               ) : signatureUrl ? (
//                 <img
//                   src={signatureUrl}
//                   alt="Signature"
//                   className="w-32 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer"
//                   onClick={() => setEnlargedImage(signatureUrl)}
//                   onError={(e) => {
//                     console.error('Signature image load failed:', report.signature_url);
//                     e.target.src = '/placeholder-image.png';
//                   }}
//                 />
//               ) : (
//                 <span className="text-gray-600 dark:text-gray-400">{t('reports.no_signature') || 'No signature available'}</span>
//               )}
//             </div>
//           )}
//           {renderSection('header', report.structure?.header?.sub_headers, 'sub_headers')}
//           {renderSection('body', report.structure?.body?.sub_bodies, 'sub_bodies')}
//           {renderSection('footer', report.structure?.footer?.sub_footers, 'sub_footers')}
//         </motion.div>
//       </motion.div>
//       <AnimatePresence>
//         {enlargedImage && (
//           <ImageModal imageUrl={enlargedImage} onClose={() => setEnlargedImage(null)} />
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export { useDebounce, PrevArrow, NextArrow, ImageModal, ImageCarousel, ReportModal };


// befor woker


import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
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
    // Only allow status updates if the user has the required privileges
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
    // Only allow investigation details updates if the user has the required privileges
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

    // Filter sub-sections to only include those with at least one valid field
    const validSubSections = subSections
      .map((sub, subIndex) => {
        // Filter fields to only include those with valid values
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

        // Filter sub-sub-sections to only include those with at least one valid field
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

    // Only render the section if there are valid sub-sections
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

export { useDebounce, PrevArrow, NextArrow, ImageModal, ImageCarousel, ReportModal };