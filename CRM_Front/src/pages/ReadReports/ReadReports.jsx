
// // import React, { useState, useEffect } from 'react';
// // import { useAuth } from '../../context/AuthContext';
// // import { useLanguage } from '../../context/LanguageContext';
// // import Header from '../../partials/Header';
// // import Sidebar from '../../partials/Sidebar';
// // import LoadingSpinner from '../../components/LoadingSpinner';
// // import ModalSearch from '../../components/ModalSearch';
// // import ThemeToggle from '../../components/ThemeToggle';
// // import LanguageToggle from '../../components/LanguageToggle';
// // import readReportService from '../../lib/readReportService';
// // import { format } from 'date-fns';
// // import { AnimatePresence, motion } from 'framer-motion';
// // import Slider from 'react-slick';
// // import 'slick-carousel/slick/slick.css';
// // import 'slick-carousel/slick/slick-theme.css';

// // // Custom arrows for the slider
// // const PrevArrow = (props) => {
// //   const { onClick } = props;
// //   return (
// //     <button
// //       onClick={onClick}
// //       className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full z-10 hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// //       aria-label="Previous Image"
// //     >
// //       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
// //       </svg>
// //     </button>
// //   );
// // };

// // const NextArrow = (props) => {
// //   const { onClick } = props;
// //   return (
// //     <button
// //       onClick={onClick}
// //       className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full z-10 hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// //       aria-label="Next Image"
// //     >
// //       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
// //       </svg>
// //     </button>
// //   );
// // };

// // const ImageModal = ({ imageUrl, onClose, images = [], currentIndex = 0 }) => {
// //   const [index, setIndex] = useState(currentIndex);

// //   const nextImage = () => {
// //     setIndex((prev) => (prev + 1) % images.length);
// //   };

// //   const prevImage = () => {
// //     setIndex((prev) => (prev - 1 + images.length) % images.length);
// //   };

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0 }}
// //       animate={{ opacity: 1 }}
// //       exit={{ opacity: 0 }}
// //       className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
// //       onClick={onClose}
// //     >
// //       <motion.div
// //         initial={{ scale: 0.8 }}
// //         animate={{ scale: 1 }}
// //         exit={{ scale: 0.8 }}
// //         className="relative max-w-4xl w-full"
// //         onClick={(e) => e.stopPropagation()}
// //       >
// //         <img
// //           src={images.length > 0 ? images[index] : imageUrl}
// //           alt="Enlarged"
// //           className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
// //         />
// //         {images.length > 1 && (
// //           <>
// //             <button
// //               onClick={prevImage}
// //               className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// //               aria-label="Previous Image"
// //             >
// //               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
// //               </svg>
// //             </button>
// //             <button
// //               onClick={nextImage}
// //               className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-600 text-white p-3 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// //               aria-label="Next Image"
// //             >
// //               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
// //               </svg>
// //             </button>
// //             <div className="text-center mt-2 text-sm text-white">
// //               {index + 1} / {images.length}
// //             </div>
// //           </>
// //         )}
// //         <button
// //           onClick={onClose}
// //           className="absolute top-2 right-2 bg-gray-800 dark:bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
// //           aria-label="Close"
// //         >
// //           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
// //           </svg>
// //         </button>
// //       </motion.div>
// //     </motion.div>
// //   );
// // };

// // const ImageCarousel = ({ images, fieldName, accessToken, t }) => {
// //   const [imageDataUrls, setImageDataUrls] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [showImageModal, setShowImageModal] = useState(false);

// //   useEffect(() => {
// //     const fetchImages = async () => {
// //       setLoading(true);
// //       try {
// //         const urls = await Promise.all(
// //           images.map(async (imagePath) => {
// //             const filename = imagePath.split('/').pop();
// //             const url = await readReportService.fetchImage(filename, accessToken);
// //             return { url, file_name: filename };
// //           })
// //         );
// //         setImageDataUrls(urls);
// //         setLoading(false);
// //       } catch (err) {
// //         setError(t('reports.fetch_image_error') || 'Failed to load images');
// //         setLoading(false);
// //       }
// //     };
// //     if (images?.length > 0) {
// //       fetchImages();
// //     } else {
// //       setLoading(false);
// //       setError(t('reports.no_images') || 'No images provided');
// //     }
// //   }, [images, accessToken, t]);

// //   const sliderSettings = {
// //     dots: imageDataUrls.length > 1,
// //     infinite: imageDataUrls.length > 1,
// //     speed: 500,
// //     slidesToShow: 1,
// //     slidesToScroll: 1,
// //     arrows: imageDataUrls.length > 1,
// //     prevArrow: <PrevArrow />,
// //     nextArrow: <NextArrow />,
// //     customPaging: (i) => (
// //       <button className="w-3 h-3 bg-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
// //         <span className="sr-only">{`Slide ${i + 1}`}</span>
// //       </button>
// //     ),
// //     dotsClass: "slick-dots custom-dots",
// //   };

// //   if (loading) {
// //     return <span className="text-gray-600 dark:text-gray-400">Loading images...</span>;
// //   }

// //   if (error) {
// //     return <span className="text-red-600 dark:text-red-400">{error}</span>;
// //   }

// //   if (!imageDataUrls || imageDataUrls.length === 0) {
// //     return <span className="text-gray-600 dark:text-gray-400">{t('reports.no_images') || 'No images'}</span>;
// //   }

// //   return (
// //     <>
// //       {imageDataUrls.length === 1 ? (
// //         <div className="flex flex-col items-center">
// //           <img
// //             src={imageDataUrls[0].url}
// //             alt={imageDataUrls[0].file_name}
// //             className="w-full max-w-md h-auto object-contain rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer"
// //             onClick={() => setShowImageModal(true)}
// //             role="button"
// //             tabIndex={0}
// //             onKeyDown={(e) => {
// //               if (e.key === 'Enter' || e.key === ' ') {
// //                 setShowImageModal(true);
// //               }
// //             }}
// //             aria-label={`View ${imageDataUrls[0].file_name}`}
// //           />
// //           <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
// //             {imageDataUrls[0].file_name}
// //           </p>
// //         </div>
// //       ) : (
// //         <Slider {...sliderSettings}>
// //           {imageDataUrls.map((image, index) => (
// //             <div key={index} className="relative">
// //               <img
// //                 src={image.url}
// //                 alt={image.file_name}
// //                 className="w-full h-64 object-contain rounded-lg cursor-pointer"
// //                 onClick={() => setShowImageModal(true)}
// //                 role="button"
// //                 tabIndex={0}
// //                 onKeyDown={(e) => {
// //                   if (e.key === 'Enter' || e.key === ' ') {
// //                     setShowImageModal(true);
// //                   }
// //                 }}
// //                 aria-label={`View ${image.file_name}`}
// //               />
// //               <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
// //                 {image.file_name}
// //               </p>
// //             </div>
// //           ))}
// //         </Slider>
// //       )}
// //       <AnimatePresence>
// //         {showImageModal && (
// //           <ImageModal
// //             images={imageDataUrls.map(img => img.url)}
// //             currentIndex={imageDataUrls.findIndex(img => img.url === (imageDataUrls[0]?.url || ''))}
// //             onClose={() => setShowImageModal(false)}
// //           />
// //         )}
// //       </AnimatePresence>
// //     </>
// //   );
// // };

// // const ReportModal = ({ report, onClose, authData, t }) => {
// //   const [enlargedImage, setEnlargedImage] = useState(null);
// //   const [signatureUrl, setSignatureUrl] = useState(null);
// //   const [signatureLoading, setSignatureLoading] = useState(false);
// //   const [signatureError, setSignatureError] = useState(null);

// //   // Helper function to check if a field has a meaningful value
// //   const hasMeaningfulValue = (field) => {
// //     if (!field || !field.hasOwnProperty('value')) return false;

// //     if (field.type === 'multi_image') {
// //       return Array.isArray(field.value) && field.value.length > 0;
// //     }
// //     if (Array.isArray(field.value)) {
// //       return field.value.length > 0 && field.value.some((val) => val !== '');
// //     }
// //     return field.value !== '' && field.value !== null && field.value !== undefined;
// //   };

// //   // Fetch signature image if signature_url exists
// //   useEffect(() => {
// //     const fetchSignature = async () => {
// //       if (report.signature_url) {
// //         setSignatureLoading(true);
// //         try {
// //           const filename = report.signature_url.split('/').pop();
// //           console.log('Fetching signature for filename:', filename);
// //           const url = await readReportService.fetchImage(filename, authData.access_token);
// //           console.log('Signature URL fetched:', url);
// //           setSignatureUrl(url);
// //           setSignatureLoading(false);
// //         } catch (err) {
// //           console.error('Error fetching signature:', err);
// //           setSignatureError(t('reports.fetch_image_error') || 'Failed to load signature');
// //           setSignatureLoading(false);
// //         }
// //       }
// //     };
// //     fetchSignature();
// //   }, [report.signature_url, authData.access_token, t]);

// //   const renderFieldValue = (field) => {
// //     if (field.type === 'image' && field.value) {
// //       const [imageDataUrl, setImageDataUrl] = useState(null);
// //       const [loading, setLoading] = useState(true);
// //       const [error, setError] = useState(null);

// //       useEffect(() => {
// //         const fetchImage = async () => {
// //           try {
// //             const filename = field.value.split('/').pop();
// //             const url = await readReportService.fetchImage(filename, authData.access_token);
// //             setImageDataUrl(url);
// //             setLoading(false);
// //           } catch (err) {
// //             setError(t('reports.fetch_image_error') || 'Failed to load image');
// //             setLoading(false);
// //           }
// //         };
// //         fetchImage();
// //       }, [field.value, authData.access_token]);

// //       if (loading) return <span className="text-gray-600 dark:text-gray-400">Loading image...</span>;
// //       if (error) return <span className="text-red-600 dark:text-red-400">{error}</span>;

// //       return (
// //         <img
// //           src={imageDataUrl}
// //           alt={field.name}
// //           className="w-32 h-32 object-cover rounded-md cursor-pointer"
// //           onError={(e) => (e.target.src = '/placeholder-image.png')}
// //           onClick={() => setEnlargedImage(imageDataUrl)}
// //         />
// //       );
// //     } else if (field.type === 'multi_image' && Array.isArray(field.value)) {
// //       return <ImageCarousel images={field.value} fieldName={field.name} accessToken={authData.access_token} t={t} />;
// //     } else if (field.type === 'PDF') {
// //       return <span className="text-gray-600 dark:text-gray-400">{t('templates.pdf_upload_placeholder') || 'PDF File'}</span>;
// //     } else if (field.type === 'radio') {
// //       return field.value || t('reports.unknown') || 'N/A';
// //     } else if (field.type === 'Date') {
// //       return field.value ? format(new Date(field.value), 'PPP') : t('reports.unknown') || 'N/A';
// //     } else if (field.type === 'DateTime') {
// //       return field.value ? format(new Date(field.value), 'PPP p') : t('reports.unknown') || 'N/A';
// //     } else if (field.type === 'Time') {
// //       return field.value || t('reports.unknown') || 'N/A';
// //     } else if (Array.isArray(field.value)) {
// //       return field.value.join(', ');
// //     }
// //     return field.value || t('reports.unknown') || 'N/A';
// //   };

// //   const renderSection = (section, subSections, sectionKey) => {
// //     if (!subSections || !Array.isArray(subSections)) return null;

// //     // Filter sub-sections to only include those with at least one meaningful field
// //     const filteredSubSections = subSections
// //       .map((sub) => {
// //         const filteredFields = (sub.fields || []).filter(hasMeaningfulValue);
// //         const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
// //         const filteredSubSub = (sub[subSubKey] || [])
// //           .map((subSub) => {
// //             const filteredSubSubFields = (subSub.fields || []).filter(hasMeaningfulValue);
// //             return filteredSubSubFields.length > 0 ? { ...subSub, fields: filteredSubSubFields } : null;
// //           })
// //           .filter((subSub) => subSub !== null);

// //         return (filteredFields.length > 0 || filteredSubSub.length > 0)
// //           ? { ...sub, fields: filteredFields, [subSubKey]: filteredSubSub }
// //           : null;
// //       })
// //       .filter((sub) => sub !== null);

// //     if (filteredSubSections.length === 0) return null;

// //     return (
// //       <div className={`mb-6 p-6 rounded-xl shadow-md ${
// //         section === 'header' ? 'bg-indigo-50 dark:bg-indigo-900' :
// //         section === 'body' ? 'bg-gray-50 dark:bg-gray-800' :
// //         'bg-blue-50 dark:bg-blue-900'
// //       }`}>
// //         {filteredSubSections.map((sub, subIndex) => (
// //           <div
// //             key={`${sectionKey}-${subIndex}`}
// //             className="border border-gray-200 dark:border-gray-600 p-5 rounded-lg mb-4 bg-gray-100 dark:bg-gray-700 shadow-sm"
// //           >
// //             <h5 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3">
// //               {sub.name || 'Unnamed Section'}
// //             </h5>
// //             {sub.fields.length > 0 && (
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
// //                 {sub.fields.map((field) => (
// //                   <div key={field.name} className="flex flex-col">
// //                     <span className="text-base font-medium text-gray-700 dark:text-gray-300">
// //                       {field.name || 'Unnamed Field'}:
// //                     </span>
// //                     <span className="text-base text-gray-600 dark:text-gray-400">
// //                       {renderFieldValue(field)}
// //                     </span>
// //                   </div>
// //                 ))}
// //               </div>
// //             )}
// //             {(sub[section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'] || []).map(
// //               (subSub, subSubIndex) => (
// //                 <div
// //                   key={`${sectionKey}-${subIndex}-subSub-${subSubIndex}`}
// //                   className="ml-4 mt-4 border-l-2 border-indigo-300 dark:border-indigo-600 pl-4 bg-gray-200 dark:bg-gray-600 rounded-lg p-4"
// //                 >
// //                   <h6 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
// //                     {subSub.name || 'Unnamed Sub-Section'}
// //                   </h6>
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
// //                     {(subSub.fields || []).map((field) => (
// //                       <div key={field.name} className="flex flex-col">
// //                         <span className="text-base font-medium text-gray-700 dark:text-gray-300">
// //                           {field.name || 'Unnamed Field'}:
// //                         </span>
// //                         <span className="text-base text-gray-600 dark:text-gray-400">
// //                           {renderFieldValue(field)}
// //                         </span>
// //                       </div>
// //                     ))}
// //                   </div>
// //                 </div>
// //               )
// //             )}
// //           </div>
// //         ))}
// //       </div>
// //     );
// //   };

// //   return (
// //     <>
// //       <motion.div
// //         initial={{ opacity: 0 }}
// //         animate={{ opacity: 1 }}
// //         exit={{ opacity: 0 }}
// //         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
// //       >
// //         <motion.div
// //           initial={{ scale: 0.8, y: 50 }}
// //           animate={{ scale: 1, y: 0 }}
// //           exit={{ scale: 0.8, y: 50 }}
// //           className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-auto border border-gray-200 dark:border-gray-600"
// //         >
// //           <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-600 pb-4">
// //             <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
// //               {report.name || 'Unnamed Report'} (ID: {report.id || report._id?.$oid || 'N/A'})
// //             </h2>
// //             <button
// //               onClick={onClose}
// //               className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-2"
// //               aria-label={t('reports.close') || 'Close'}
// //             >
// //               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
// //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
// //               </svg>
// //             </button>
// //           </div>
// //           <div className="space-y-6">
// //             <p className="text-lg text-gray-600 dark:text-gray-400">
// //               {t('reports.template_id') || 'Template ID'}: {report.template_id || t('reports.unknown') || 'N/A'}
// //             </p>
// //             <p className="text-lg text-gray-600 dark:text-gray-400">
// //               {t('reports.report_type') || 'Report Type'}: {report.reportType || t('reports.unknown') || 'N/A'}
// //             </p>
// //             <p className="text-lg text-gray-600 dark:text-gray-400">
// //               {t('reports.created_by') || 'Created By'}: {report.user_created_name || t('reports.unknown') || 'Unknown'}
// //             </p>
// //             {report.created_at && (
// //               <p className="text-lg text-gray-600 dark:text-gray-400">
// //                 {t('reports.created_at') || 'Created At'}: {format(new Date(report.created_at), 'PPP')}
// //               </p>
// //             )}
// //             <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
// //               <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
// //                 {t('reports.location_details') || 'Location Details'}
// //               </h4>
// //               <p className="text-lg text-gray-600 dark:text-gray-400">
// //                 {t('reports.main_location') || 'Main Location'}: {report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}
// //               </p>
// //               <p className="text-lg text-gray-600 dark:text-gray-400">
// //                 {t('reports.qa_location') || 'QA Location'}: {report.qa_location || report.structure?.location_details?.locations_qa_id || t('reports.unknown') || 'N/A'}
// //               </p>
// //               <p className="text-lg text-gray-600 dark:text-gray-400">
// //                 {t('reports.qa_section') || 'QA Section'}: {report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}
// //               </p>
// //               <p className="text-lg text-gray-600 dark:text-gray-400">
// //                 {t('reports.qa_sub_section') || 'QA Sub-Section'}: {report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}
// //               </p>
// //             </div>
// //             {report.signature_url && (
// //               <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
// //                 <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
// //                   {t('reports.signature') || 'Signature'}
// //                 </h4>
// //                 {signatureLoading ? (
// //                   <span className="text-gray-600 dark:text-gray-400">Loading signature...</span>
// //                 ) : signatureError ? (
// //                   <span className="text-red-600 dark:text-red-400">{signatureError}</span>
// //                 ) : signatureUrl ? (
// //                   <img
// //                     src={signatureUrl}
// //                     alt="Signature"
// //                     className="w-32 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-600 shadow-sm cursor-pointer"
// //                     onClick={() => setEnlargedImage(signatureUrl)}
// //                     onError={(e) => {
// //                       console.error('Signature image load failed:', report.signature_url);
// //                       e.target.src = '/placeholder-image.png';
// //                     }}
// //                   />
// //                 ) : (
// //                   <span className="text-gray-600 dark:text-gray-400">No signature available</span>
// //                 )}
// //               </div>
// //             )}
// //             {renderSection('header', report.structure?.header?.sub_headers, 'sub_headers')}
// //             {renderSection('body', report.structure?.body?.sub_bodies, 'sub_bodies')}
// //             {renderSection('footer', report.structure?.footer?.sub_footers, 'sub_footers')}
// //           </div>
// //         </motion.div>
// //       </motion.div>
// //       <AnimatePresence>
// //         {enlargedImage && (
// //           <ImageModal imageUrl={enlargedImage} onClose={() => setEnlargedImage(null)} />
// //         )}
// //       </AnimatePresence>
// //     </>
// //   );
// // };

// // const ReportsTable = ({ reports, signatureUrls, t, setSelectedReport }) => {
// //   const [columnFilters, setColumnFilters] = useState({
// //     name: '',
// //     reportType: '',
// //     user_created_name: '',
// //     main_location_name: '',
// //     qa_section: '',
// //     qa_sub_section: '',
// //     created_at: '',
// //   });

// //   const handleColumnFilterChange = (e) => {
// //     const { name, value } = e.target;
// //     setColumnFilters((prev) => ({ ...prev, [name]: value }));
// //   };

// //   const filteredReports = reports.filter((report) => {
// //     return (
// //       (report.name || 'Unnamed Report').toLowerCase().includes(columnFilters.name.toLowerCase()) &&
// //       (report.reportType || '').toLowerCase().includes(columnFilters.reportType.toLowerCase()) &&
// //       (report.user_created_name || '').toLowerCase().includes(columnFilters.user_created_name.toLowerCase()) &&
// //       (report.main_location_name || report.structure?.location_details?.main_location_id || '').toLowerCase().includes(columnFilters.main_location_name.toLowerCase()) &&
// //       (report.qa_section || report.structure?.location_details?.section_qa_id || '').toLowerCase().includes(columnFilters.qa_section.toLowerCase()) &&
// //       (report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || '').toLowerCase().includes(columnFilters.qa_sub_section.toLowerCase()) &&
// //       (report.created_at ? format(new Date(report.created_at), 'PPP') : '').toLowerCase().includes(columnFilters.created_at.toLowerCase())
// //     );
// //   });

// //   return (
// //     <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
// //       <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
// //         <thead className="bg-indigo-50 dark:bg-indigo-900">
// //           <tr>
// //             <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
// //               {t('reports.report_name') || 'Name'}
// //             </th>
// //             <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
// //               {t('reports.report_type') || 'Report Type'}
// //             </th>
// //             <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
// //               {t('reports.created_by') || 'Created By'}
// //             </th>
// //             <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
// //               {t('reports.main_location') || 'Main Location'}
// //             </th>
// //             <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
// //               {t('reports.qa_section') || 'QA Section'}
// //             </th>
// //             <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
// //               {t('reports.qa_sub_section') || 'QA Sub-Section'}
// //             </th>
// //             <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
// //               {t('reports.created_at') || 'Created At'}
// //             </th>
// //           </tr>
// //           <tr className="bg-gray-50 dark:bg-gray-700">
// //             {['name', 'reportType', 'user_created_name', 'main_location_name', 'qa_section', 'qa_sub_section', 'created_at'].map((field) => (
// //               <td key={field} className="px-6 py-2">
// //                 <input
// //                   type="text"
// //                   name={field}
// //                   value={columnFilters[field]}
// //                   onChange={handleColumnFilterChange}
// //                   placeholder={`Filter ${t(`reports.${field}`) || field.replace('_', ' ')}`}
// //                   className="w-full py-1 px-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
// //                 />
// //               </td>
// //             ))}
// //           </tr>
// //         </thead>
// //         <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
// //           {filteredReports.map((report) => {
// //             const reportId = report._id?.$oid || report.id;
// //             return (
// //               <tr
// //                 key={reportId}
// //                 className="hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer transition-colors duration-200"
// //                 onClick={() => setSelectedReport(report)}
// //                 role="button"
// //                 tabIndex={0}
// //                 onKeyDown={(e) => {
// //                   if (e.key === 'Enter' || e.key === ' ') {
// //                     setSelectedReport(report);
// //                   }
// //                 }}
// //                 aria-label={`${t('reports.report_name') || 'Report'}: ${report.name}`}
// //               >
// //                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
// //                   {report.name || 'Unnamed Report'}
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
// //                   {report.reportType || t('reports.unknown') || 'N/A'}
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
// //                   {report.user_created_name || t('reports.unknown') || 'Unknown'}
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
// //                   {report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
// //                   {report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
// //                   {report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
// //                   {report.created_at ? format(new Date(report.created_at), 'PPP') : t('reports.unknown') || 'N/A'}
// //                 </td>
// //               </tr>
// //             );
// //           })}
// //         </tbody>
// //       </table>
// //     </div>
// //   );
// // };

// // const ReadReports = () => {
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
// //   const [perPage, setPerPage] = useState(5); // Default to 5 items per page
// //   const [totalPages, setTotalPages] = useState(1);
// //   const [filters, setFilters] = useState({
// //     startDate: '',
// //     endDate: '',
// //     reportType: '',
// //     sort: '-created_at',
// //   });
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [viewMode, setViewMode] = useState('cards');
// //   const [signatureUrls, setSignatureUrls] = useState({});

// //   useEffect(() => {
// //     if (authLoading) return;

// //     if (!authData?.access_token) {
// //       setError(t('reports.no_permission') || 'No permission to view reports');
// //       setLoading(false);
// //       return;
// //     }

// //     if (authData.privilege_ids?.includes(1)) {
// //       setHasPrivilege(true);
// //       fetchReports();
// //     } else {
// //       setError(t('reports.no_permission') || 'No permission to view reports');
// //       setHasPrivilege(false);
// //       setLoading(false);
// //     }
// //   }, [authData, authLoading, currentPage, language, t, filters.reportType, filters.sort, perPage]);

// //   const fetchReports = async () => {
// //     setLoading(true);
// //     try {
// //       const response = await readReportService.getReports(authData.org_id, {
// //         page: currentPage,
// //         perPage,
// //         reportType: filters.reportType,
// //         sort: filters.sort,
// //         lang: language || 'en',
// //       });

// //       console.log('Fetched reports:', response.data);
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

// //   // Client-side filtering
// //   useEffect(() => {
// //     let filtered = [...reports];

// //     // Apply search filter
// //     if (searchQuery) {
// //       const queryLower = searchQuery.toLowerCase();
// //       filtered = filtered.filter((report) =>
// //         [
// //           report.name,
// //           report.reportType,
// //           report.user_created_name,
// //           report.main_location_name,
// //           report.qa_section,
// //           report.qa_sub_section,
// //         ]
// //           .filter(Boolean)
// //           .map((field) => field.toLowerCase())
// //           .some((field) => field.includes(queryLower))
// //       );
// //     }

// //     // Apply date filters
// //     if (filters.startDate) {
// //       const startDate = new Date(filters.startDate);
// //       filtered = filtered.filter((report) => {
// //         const createdAt = new Date(report.created_at);
// //         return createdAt >= startDate;
// //       });
// //     }

// //     if (filters.endDate) {
// //       const endDate = new Date(filters.endDate);
// //       endDate.setHours(23, 59, 59, 999); // Include the entire end day
// //       filtered = filtered.filter((report) => {
// //         const createdAt = new Date(report.created_at);
// //         return createdAt <= endDate;
// //       });
// //     }

// //     setFilteredReports(filtered);
// //   }, [reports, searchQuery, filters.startDate, filters.endDate]);

// //   // Fetch signatures for reports with signature_url
// //   useEffect(() => {
// //     const fetchSignatures = async () => {
// //       const signatures = {};
// //       for (const report of reports) {
// //         const reportId = report._id?.$oid || report.id;
// //         if (report.signature_url && reportId) {
// //           try {
// //             const filename = report.signature_url.split('/').pop();
// //             console.log(`Fetching signature for report ${reportId}, filename: ${filename}`);
// //             const url = await readReportService.fetchImage(filename, authData.access_token);
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

// //   const handleSearch = (e) => {
// //     const query = e.target.value;
// //     setSearchQuery(query);
// //     setCurrentPage(1);
// //   };

// //   const handleSearchFromModal = (query) => {
// //     setSearchQuery(query);
// //     setCurrentPage(1);
// //   };

// //   const handleFilterChange = (e) => {
// //     const { name, value } = e.target;
// //     setFilters((prev) => ({ ...prev, [name]: value }));
// //     setCurrentPage(1);
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

// //   const toggleViewMode = () => {
// //     setViewMode(viewMode === 'cards' ? 'table' : 'cards');
// //   };

// //   if (authLoading || !authData || loading) {
// //     return <LoadingSpinner />;
// //   }

// //   return (
// //     <div className="flex h-screen overflow-hidden">
// //       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
// //       <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
// //         <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
// //         <main>
// //           <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
// //             {/* Page Header */}
// //             <div className="sm:flex sm:justify-between sm:items-center mb-8">
// //               <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
// //                 {t('reports.view_reports') || 'View Reports'}
// //               </h1>
// //               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
// //                 <LanguageToggle />
// //                 <ModalSearch onSearch={handleSearchFromModal} />
// //                 <ThemeToggle />
// //               </div>
// //             </div>

// //             {/* Search Bar and View Toggle */}
// //             <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
// //               <div className="relative flex-1">
// //                 <input
// //                   type="text"
// //                   value={searchQuery}
// //                   onChange={handleSearch}
// //                   placeholder={t('reports.search_placeholder') || 'Search by name, domain, or description...'}
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
// //               <button
// //                 onClick={toggleViewMode}
// //                 className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                 aria-label={viewMode === 'cards' ? 'Switch to Table View' : 'Switch to Card View'}
// //               >
// //                 {viewMode === 'cards' ? 'Table View' : 'Card View'}
// //               </button>
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
// //                     {viewMode === 'cards' ? (
// //                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// //                         {filteredReports.map((report) => {
// //                           const reportId = report._id?.$oid || report.id;
// //                           return (
// //                             <div
// //                               key={reportId}
// //                               className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
// //                               role="button"
// //                               aria-label={`${t('reports.report_name') || 'Report'}: ${report.name}`}
// //                               onClick={() => setSelectedReport(report)}
// //                               tabIndex={0}
// //                               onKeyDown={(e) => {
// //                                 if (e.key === 'Enter' || e.key === ' ') {
// //                                   setSelectedReport(report);
// //                                 }
// //                               }}
// //                             >
// //                               <div className="space-y-3">
// //                                 <div className="flex justify-between items-start">
// //                                   <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200">
// //                                     {report.name || 'Unnamed Report'}
// //                                   </h3>
// //                                 </div>
// //                                 <div>
// //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                     {t('reports.report_type') || 'Report Type'}
// //                                   </span>
// //                                   <p className="text-gray-800 dark:text-gray-100">{report.reportType || t('reports.unknown') || 'N/A'}</p>
// //                                 </div>
// //                                 <div>
// //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                     {t('reports.created_by') || 'Created By'}
// //                                   </span>
// //                                   <p className="text-gray-800 dark:text-gray-100">{report.user_created_name || t('reports.unknown') || 'Unknown'}</p>
// //                                 </div>
// //                                 <div>
// //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                     {t('reports.main_location') || 'Main Location'}
// //                                   </span>
// //                                   <p className="text-gray-800 dark:text-gray-100">{report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}</p>
// //                                 </div>
// //                                 <div>
// //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                     {t('reports.qa_section') || 'QA Section'}
// //                                   </span>
// //                                   <p className="text-gray-800 dark:text-gray-100">{report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}</p>
// //                                 </div>
// //                                 <div>
// //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                     {t('reports.qa_sub_section') || 'QA Sub-Section'}
// //                                   </span>
// //                                   <p className="text-gray-800 dark:text-gray-100">{report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}</p>
// //                                 </div>
// //                                 {report.created_at && (
// //                                   <div>
// //                                     <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                       {t('reports.created_at') || 'Created At'}
// //                                     </span>
// //                                     <p className="text-gray-800 dark:text-gray-100">{format(new Date(report.created_at), 'PPP')}</p>
// //                                   </div>
// //                                 )}
// //                                 {report.signature_url && (
// //                                   <div>
// //                                     <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                       {t('reports.signature') || 'Signature'}
// //                                     </span>
// //                                     {signatureUrls[reportId] === undefined ? (
// //                                       <span className="text-gray-600 dark:text-gray-400">Loading signature...</span>
// //                                     ) : signatureUrls[reportId] === null ? (
// //                                       <span className="text-red-600 dark:text-red-400">Failed to load signature</span>
// //                                     ) : (
// //                                       <img
// //                                         src={signatureUrls[reportId]}
// //                                         alt="Signature"
// //                                         className="w-24 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-700 shadow-sm mt-2 cursor-pointer"
// //                                         onError={(e) => {
// //                                           console.error('Signature image load failed for report:', reportId);
// //                                           e.target.src = '/placeholder-image.png';
// //                                         }}
// //                                         onClick={() => setSelectedReport(report)}
// //                                       />
// //                                     )}
// //                                   </div>
// //                                 )}
// //                               </div>
// //                             </div>
// //                           );
// //                         })}
// //                       </div>
// //                     ) : (
// //                       <ReportsTable
// //                         reports={filteredReports}
// //                         signatureUrls={signatureUrls}
// //                         t={t}
// //                         setSelectedReport={setSelectedReport}
// //                       />
// //                     )}

// //                     {/* Pagination */}
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
// //                           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
// //                             <button
// //                               key={page}
// //                               onClick={() => handlePageChange(page)}
// //                               className={`px-4 py-2 rounded-lg ${
// //                                 page === currentPage
// //                                   ? 'bg-indigo-500 text-white'
// //                                   : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
// //                               } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
// //                               aria-label={`Page ${page}`}
// //                               aria-current={page === currentPage ? 'page' : undefined}
// //                             >
// //                               {page}
// //                             </button>
// //                           ))}
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
// //                           {[5, 10, 15, 50, 75, 100, 200].map((value) => (
// //                             <option key={value} value={value}>
// //                               {value} {t('reports.items') || 'items'}
// //                             </option>
// //                           ))}
// //                         </select>
// //                       </div>
// //                     )}
// //                   </>
// //                 )}
// //                 <AnimatePresence>
// //                   {selectedReport && (
// //                     <ReportModal
// //                       report={selectedReport}
// //                       onClose={() => setSelectedReport(null)}
// //                       authData={authData}
// //                       t={t}
// //                     />
// //                   )}
// //                 </AnimatePresence>
// //               </>
// //             )}
// //           </div>
// //         </main>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ReadReports;

// // Working Optimised 


// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import ModalSearch from '../../components/ModalSearch';
// import ThemeToggle from '../../components/ThemeToggle';
// import LanguageToggle from '../../components/LanguageToggle';
// import readReportService from '../../lib/readReportService';
// import { format, differenceInDays } from 'date-fns';
// import { AnimatePresence, motion } from 'framer-motion';
// import Slider from 'react-slick';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

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
//           className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
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
//             const url = await readReportService.fetchImage(filename, accessToken);
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

// const ReportModal = ({ report, onClose, authData, t }) => {
//   const [enlargedImage, setEnlargedImage] = useState(null);
//   const [signatureUrl, setSignatureUrl] = useState(null);
//   const [signatureLoading, setSignatureLoading] = useState(false);
//   const [signatureError, setSignatureError] = useState(null);
//   const [statusHistory, setStatusHistory] = useState([]);
//   const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);
//   const [statusHistoryError, setStatusHistoryError] = useState(null);
//   const { language } = useLanguage();

//   const hasMeaningfulValue = (field) => {
//     if (!field || !field.hasOwnProperty('value')) return false;

//     if (field.type === 'multi_image') {
//       return Array.isArray(field.value) && field.value.length > 0;
//     }
//     if (Array.isArray(field.value)) {
//       return field.value.length > 0 && field.value.some((val) => val !== '');
//     }
//     return field.value !== '' && field.value !== null && field.value !== undefined;
//   };

//   useEffect(() => {
//     const fetchSignature = async () => {
//       if (report.signature_url) {
//         setSignatureLoading(true);
//         try {
//           const filename = report.signature_url.split('/').pop();
//           const url = await readReportService.fetchImage(filename, authData.access_token);
//           setSignatureUrl(url);
//           setSignatureLoading(false);
//         } catch (err) {
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
//         const response = await readReportService.getStatusHistory({
//           id: reportId,
//           orgId: authData.org_id,
//           accessToken: authData.access_token
//         });
//         setStatusHistory(response.data || []);
//         setStatusHistoryLoading(false);
//       } catch (err) {
//         setStatusHistoryError(t('reports.status_history_error', { message: err.message }) || `Failed to fetch status history: ${err.message}`);
//         setStatusHistoryLoading(false);
//       }
//     };
//     fetchStatusHistory();
//   }, [report.id, report._id?.$oid, authData.org_id, authData.access_token, t]);

//   const renderFieldValue = (field) => {
//     if (field.type === 'image' && field.value) {
//       const [imageDataUrl, setImageDataUrl] = useState(null);
//       const [loading, setLoading] = useState(true);
//       const [error, setError] = useState(null);

//       useEffect(() => {
//         const fetchImage = async () => {
//           try {
//             const filename = field.value.split('/').pop();
//             const url = await readReportService.fetchImage(filename, authData.access_token);
//             setImageDataUrl(url);
//             setLoading(false);
//           } catch (err) {
//             setError(t('reports.fetch_image_error') || 'Failed to load image');
//             setLoading(false);
//           }
//         };
//         fetchImage();
//       }, [field.value, authData.access_token, t]);

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
//     } else if (field.type === 'multi_image' && Array.isArray(field.value)) {
//       return <ImageCarousel images={field.value} fieldName={field.name} accessToken={authData.access_token} t={t} />;
//     } else if (field.type === 'PDF') {
//       return <span className="text-gray-600 dark:text-gray-400">{t('templates.pdf_upload_placeholder') || 'PDF File'}</span>;
//     } else if (field.type === 'radio') {
//       return field.value || t('reports.unknown') || 'N/A';
//     } else if (field.type === 'Date') {
//       return field.value ? format(new Date(field.value), 'PPP') : t('reports.unknown') || 'N/A';
//     } else if (field.type === 'DateTime') {
//       return field.value ? format(new Date(field.value), 'PPP p') : t('reports.unknown') || 'N/A';
//     } else if (field.type === 'Time') {
//       return field.value || t('reports.unknown') || 'N/A';
//     } else if (Array.isArray(field.value)) {
//       return field.value.join(', ');
//     }
//     return field.value || t('reports.unknown') || 'N/A';
//   };

//   const renderSection = (section, subSections, sectionKey) => {
//     if (!subSections || !Array.isArray(subSections)) return null;

//     const filteredSubSections = subSections
//       .map((sub) => {
//         const filteredFields = (sub.fields || []).filter(hasMeaningfulValue);
//         const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
//         const filteredSubSub = (sub[subSubKey] || [])
//           .map((subSub) => {
//             const filteredSubSubFields = (subSub.fields || []).filter(hasMeaningfulValue);
//             return filteredSubSubFields.length > 0 ? { ...subSub, fields: filteredSubSubFields } : null;
//           })
//           .filter((subSub) => subSub !== null);

//         return (filteredFields.length > 0 || filteredSubSub.length > 0)
//           ? { ...sub, fields: filteredFields, [subSubKey]: filteredSubSub }
//           : null;
//       })
//       .filter((sub) => sub !== null);

//     if (filteredSubSections.length === 0) return null;

//     return (
//       <div className={`mb-6 p-6 rounded-xl shadow-md ${
//         section === 'header' ? 'bg-indigo-50 dark:bg-indigo-900' :
//         section === 'body' ? 'bg-gray-50 dark:bg-gray-800' :
//         'bg-blue-50 dark:bg-blue-900'
//       }`}>
//         {filteredSubSections.map((sub, subIndex) => (
//           <div
//             key={`${sectionKey}-${subIndex}`}
//             className="border border-gray-200 dark:border-gray-600 p-5 rounded-lg mb-4 bg-gray-100 dark:bg-gray-700 shadow-sm"
//           >
//             <h5 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3">
//               {sub.name || 'Unnamed Section'}
//             </h5>
//             {sub.fields.length > 0 && (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
//                 {sub.fields.map((field) => (
//                   <div key={field.name} className="flex flex-col">
//                     <span className="text-base font-medium text-gray-700 dark:text-gray-300">
//                       {field.name || 'Unnamed Field'}:
//                     </span>
//                     <span className="text-base text-gray-600 dark:text-gray-400">
//                       {renderFieldValue(field)}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             )}
//             {(sub[section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'] || []).map(
//               (subSub, subSubIndex) => (
//                 <div
//                   key={`${sectionKey}-${subIndex}-subSub-${subSubIndex}`}
//                   className="ml-4 mt-4 border-l-2 border-indigo-300 dark:border-indigo-600 pl-4 bg-gray-200 dark:bg-gray-600 rounded-lg p-4"
//                 >
//                   <h6 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
//                     {subSub.name || 'Unnamed Sub-Section'}
//                   </h6>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
//                     {(subSub.fields || []).map((field) => (
//                       <div key={field.name} className="flex flex-col">
//                         <span className="text-base font-medium text-gray-700 dark:text-gray-300">
//                           {field.name || 'Unnamed Field'}:
//                         </span>
//                         <span className="text-base text-gray-600 dark:text-gray-400">
//                           {renderFieldValue(field)}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )
//             )}
//           </div>
//         ))}
//       </div>
//     );
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
//       case 'Under Management Action':
//         return 'bg-yellow-600 text-white';
//       case 'Resolved':
//         return 'bg-green-600 text-white';
//       default:
//         return 'bg-gray-600 text-white';
//     }
//   };

//   const currentDate = new Date();
//   let formattedActionDate = '';
//   let isDateViolation = false;
//   if (report.corrective_action_date) {
//     try {
//       const date = new Date(report.corrective_action_date);
//       const monthNames = [
//         'January', 'February', 'March', 'April', 'May', 'June',
//         'July', 'August', 'September', 'October', 'November', 'December'
//       ];
//       formattedActionDate = `${date.getDate()} - ${monthNames[date.getMonth()]} - ${date.getFullYear()}`;
//       isDateViolation = currentDate > date;
//     } catch (e) {
//       console.error('Error formatting corrective action date:', e);
//     }
//   }

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
//           className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-auto border border-gray-200 dark:border-gray-600"
//         >
//           <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-600 pb-4">
//             <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
//               {report.name || 'Unnamed Report'} (ID: {report.id || report._id?.$oid || 'N/A'})
//             </h2>
//             <button
//               onClick={onClose}
//               className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-2"
//               aria-label={t('reports.close') || 'Close'}
//             >
//               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//           <div className="space-y-6">
//             <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
//               <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
//                 {t('reports.status_history') || 'Status History'}
//               </h4>
//               {statusHistoryLoading ? (
//                 <span className="text-gray-600 dark:text-gray-400">{t('reports.loading_status_history') || 'Loading status history...'}</span>
//               ) : statusHistoryError ? (
//                 <span className="text-red-600 dark:text-red-400">{statusHistoryError}</span>
//               ) : statusHistory.length === 0 ? (
//                 <span className="text-gray-600 dark:text-gray-400">{t('reports.no_status_history') || 'No status history available'}</span>
//               ) : (
//                 <div className="relative">
//                   <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
//                   {statusHistory.map((entry, index) => {
//                     const statusKey = `reports.status_${entry.status.toLowerCase().replace(' ', '_')}`;
//                     const translatedStatus = t(statusKey) || entry.status;
//                     const entryDate = new Date(entry.datetime);
//                     const formattedDateTime = format(entryDate, 'yyyy-MM-dd hh:mm a');
//                     const durationDays = differenceInDays(currentDate, entryDate);

//                     const message = t('reports.status_changed_with_duration', {
//                       status: translatedStatus,
//                       datetime: formattedDateTime,
//                       duration: durationDays
//                     });
//                     const fallbackMessage = `Changed to ${translatedStatus} on ${formattedDateTime} duration ${durationDays} days`;

//                     return (
//                       <div key={index} className="mb-4 flex items-start">
//                         <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
//                           <span className="w-4 h-4 bg-indigo-500 rounded-full z-10"></span>
//                         </div>
//                         <div className="ml-4">
//                           <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeClass(entry.status)}`}>
//                             {translatedStatus}
//                           </span>
//                           <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
//                             {message.includes('{{') ? fallbackMessage : message}
//                           </p>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//             {report.status && (
//               <p className="text-base text-gray-600 dark:text-gray-400">
//                 {t('reports.status') || 'Status'}: 
//                 <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeClass(report.status)}`}>
//                   {t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}
//                 </span>
//               </p>
//             )}
//             {report.severity && (
//               <p className="text-base text-gray-600 dark:text-gray-400">
//                 {t('reports.severity') || 'Severity'}: 
//                 <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getSeverityBadgeClass(report.severity)}`}>
//                   {t(`reports.severity_${report.severity.toLowerCase()}`) || report.severity}
//                 </span>
//               </p>
//             )}
//             {report.follow_up_status && (
//               <p className="text-base text-gray-600 dark:text-gray-400">
//                 {t('reports.follow_up_status') || 'Follow Up Status'}: 
//                 <span className={`inline-block ml-2 px-2 py-1 text-xs font-semibold rounded ${getFollowUpStatusBadgeClass(report.follow_up_status)}`}>
//                   {t(`reports.follow_up_${report.follow_up_status.toLowerCase()}`) || report.follow_up_status}
//                 </span>
//               </p>
//             )}
//             <p className="text-base text-gray-600 dark:text-gray-400">
//               {t('reports.template_id') || 'Template ID'}: {report.template_id || t('reports.unknown') || 'N/A'}
//             </p>
//             <p className="text-base text-gray-600 dark:text-gray-400">
//               {t('reports.report_type') || 'Report Type'}: {report.reportType || t('reports.unknown') || 'N/A'}
//             </p>
//             <p className="text-base text-gray-600 dark:text-gray-400">
//               {t('reports.created_by') || 'Created By'}: {report.user_created_name || t('reports.unknown') || 'Unknown'}
//             </p>
//             {report.created_at && (
//               <p className="text-base text-gray-600 dark:text-gray-400">
//                 {t('reports.created_at') || 'Created At'}: {format(new Date(report.created_at), 'PPP')}
//               </p>
//             )}
//             {(report.corrective_action_description || report.corrective_action_date || report.investigation_details || report.management_notes) && (
//               <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
//                 {(report.corrective_action_description || report.corrective_action_date) && (
//                   <div className="mb-4">
//                     <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
//                       {t('reports.corrective_action_details') || 'Corrective Action Details'}
//                     </h4>
//                     {report.corrective_action_description && (
//                       <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
//                         {t('reports.notes') || 'Notes'}: {report.corrective_action_description}
//                       </p>
//                     )}
//                     {report.corrective_action_date && (
//                       <p className={`text-base ${isDateViolation ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'} mb-2`}>
//                         {isDateViolation
//                           ? (t('reports.action_date_violation') || 'Action Date Violation')
//                           : (t('reports.action_date') || 'Action Date')}: {formattedActionDate}
//                       </p>
//                     )}
//                   </div>
//                 )}
//                 {report.investigation_details && (
//                   <div className="mb-4">
//                     <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
//                       {t('reports.investigation_details') || 'Investigation Details'}
//                     </h4>
//                     <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
//                       {t('reports.notes') || 'Notes'}: {report.investigation_details}
//                     </p>
//                   </div>
//                 )}
//                 {report.management_notes && (
//                   <div className="mb-4">
//                     <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
//                       {t('reports.management_notes') || 'Management Notes'}
//                     </h4>
//                     <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
//                       {t('reports.notes') || 'Notes'}: {report.management_notes}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}
//             <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
//               <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
//                 {t('reports.location_details') || 'Location Details'}
//               </h4>
//               <p className="text-base text-gray-600 dark:text-gray-400">
//                 {t('reports.main_location') || 'Main Location'}: {report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}
//               </p>
//               <p className="text-base text-gray-600 dark:text-gray-400">
//                 {t('reports.qa_location') || 'QA Location'}: {report.qa_location || report.structure?.location_details?.locations_qa_id || t('reports.unknown') || 'N/A'}
//               </p>
//               <p className="text-base text-gray-600 dark:text-gray-400">
//                 {t('reports.qa_section') || 'QA Section'}: {report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}
//               </p>
//               <p className="text-base text-gray-600 dark:text-gray-400">
//                 {t('reports.qa_sub_section') || 'QA Sub-Section'}: {report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}
//               </p>
//             </div>
//             {report.signature_url && (
//               <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
//                 <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
//                   {t('reports.signature') || 'Signature'}
//                 </h4>
//                 {signatureLoading ? (
//                   <span className="text-gray-600 dark:text-gray-400">{t('reports.loading_signature') || 'Loading signature...'}</span>
//                 ) : signatureError ? (
//                   <span className="text-red-600 dark:text-red-400">{signatureError}</span>
//                 ) : signatureUrl ? (
//                   <img
//                     src={signatureUrl}
//                     alt="Signature"
//                     className="w-32 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-600 shadow-sm cursor-pointer"
//                     onClick={() => setEnlargedImage(signatureUrl)}
//                     onError={(e) => {
//                       e.target.src = '/placeholder-image.png';
//                     }}
//                   />
//                 ) : (
//                   <span className="text-gray-600 dark:text-gray-400">{t('reports.no_signature') || 'No signature available'}</span>
//                 )}
//               </div>
//             )}
//             {renderSection('header', report.structure?.header?.sub_headers, 'sub_headers')}
//             {renderSection('body', report.structure?.body?.sub_bodies, 'sub_bodies')}
//             {renderSection('footer', report.structure?.footer?.sub_footers, 'sub_footers')}
//           </div>
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

// const ReportsTable = ({ reports, signatureUrls, t, setSelectedReport }) => {
//   const [columnFilters, setColumnFilters] = useState({
//     name: '',
//     reportType: '',
//     user_created_name: '',
//     main_location_name: '',
//     qa_section: '',
//     qa_sub_section: '',
//     created_at: '',
//   });

//   const handleColumnFilterChange = (e) => {
//     const { name, value } = e.target;
//     setColumnFilters((prev) => ({ ...prev, [name]: value }));
//   };

//   const filteredReports = reports.filter((report) => {
//     return (
//       (report.name || 'Unnamed Report').toLowerCase().includes(columnFilters.name.toLowerCase()) &&
//       (report.reportType || '').toLowerCase().includes(columnFilters.reportType.toLowerCase()) &&
//       (report.user_created_name || '').toLowerCase().includes(columnFilters.user_created_name.toLowerCase()) &&
//       (report.main_location_name || report.structure?.location_details?.main_location_id || '').toLowerCase().includes(columnFilters.main_location_name.toLowerCase()) &&
//       (report.qa_section || report.structure?.location_details?.section_qa_id || '').toLowerCase().includes(columnFilters.qa_section.toLowerCase()) &&
//       (report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || '').toLowerCase().includes(columnFilters.qa_sub_section.toLowerCase()) &&
//       (report.created_at ? format(new Date(report.created_at), 'PPP') : '').toLowerCase().includes(columnFilters.created_at.toLowerCase())
//     );
//   });

//   return (
//     <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
//       <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//         <thead className="bg-indigo-50 dark:bg-indigo-900">
//           <tr>
//             <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
//               {t('reports.report_name') || 'Name'}
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
//               {t('reports.report_type') || 'Report Type'}
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
//               {t('reports.created_by') || 'Created By'}
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
//               {t('reports.main_location') || 'Main Location'}
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
//               {t('reports.qa_section') || 'QA Section'}
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
//               {t('reports.qa_sub_section') || 'QA Sub-Section'}
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
//               {t('reports.created_at') || 'Created At'}
//             </th>
//           </tr>
//           <tr className="bg-gray-50 dark:bg-gray-700">
//             {['name', 'reportType', 'user_created_name', 'main_location_name', 'qa_section', 'qa_sub_section', 'created_at'].map((field) => (
//               <td key={field} className="px-6 py-2">
//                 <input
//                   type="text"
//                   name={field}
//                   value={columnFilters[field]}
//                   onChange={handleColumnFilterChange}
//                   placeholder={`Filter ${t(`reports.${field}`) || field.replace('_', ' ')}`}
//                   className="w-full py-1 px-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </td>
//             ))}
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//           {filteredReports.map((report) => {
//             const reportId = report._id?.$oid || report.id;
//             return (
//               <tr
//                 key={reportId}
//                 className="hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer transition-colors duration-200"
//                 onClick={() => setSelectedReport(report)}
//                 role="button"
//                 tabIndex={0}
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter' || e.key === ' ') {
//                     setSelectedReport(report);
//                   }
//                 }}
//                 aria-label={`${t('reports.report_name') || 'Report'}: ${report.name}`}
//               >
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
//                   {report.name || 'Unnamed Report'}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
//                   {report.reportType || t('reports.unknown') || 'N/A'}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
//                   {report.user_created_name || t('reports.unknown') || 'Unknown'}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
//                   {report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
//                   {report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
//                   {report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
//                   {report.created_at ? format(new Date(report.created_at), 'PPP') : t('reports.unknown') || 'N/A'}
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// const ReadReports = () => {
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
//     sort: '-created_at',
//     severity: '',
//     status: '',
//     followUpStatus: '',
//     dateViolation: ''
//   });
//   const [searchQuery, setSearchQuery] = useState('');
//   const [viewMode, setViewMode] = useState('cards');
//   const [signatureUrls, setSignatureUrls] = useState({});

//   useEffect(() => {
//     if (authLoading) return;

//     if (!authData?.access_token) {
//       setError(t('reports.no_permission') || 'No permission to view reports');
//       setLoading(false);
//       return;
//     }

//     if (authData.privilege_ids?.includes(1)) {
//       setHasPrivilege(true);
//       fetchReports();
//     } else {
//       setError(t('reports.no_permission') || 'No permission to view reports');
//       setHasPrivilege(false);
//       setLoading(false);
//     }
//   }, [authData, authLoading, currentPage, language, t, filters.reportType, filters.sort, perPage]);

//   const fetchReports = async () => {
//     setLoading(true);
//     try {
//       const response = await readReportService.getReports(authData.org_id, {
//         page: currentPage,
//         perPage,
//         reportType: filters.reportType,
//         sort: filters.sort,
//         lang: language || 'en',
//       });
//       setReports(Array.isArray(response.data) ? response.data : []);
//       setTotalPages(response.pagination?.total_pages || 1);

//       const uniqueReportTypes = response.data && Array.isArray(response.data)
//         ? [...new Set(response.data.map((report) => report.reportType).filter(Boolean))]
//         : [];
//       setReportTypes(uniqueReportTypes.map((type) => ({ _id: type, name: type })));
//       setLoading(false);
//     } catch (err) {
//       setError(t('reports.fetch_reports_error', { message: err.message }) || `Error: ${err.message}`);
//       setReports([]);
//       setFilteredReports([]);
//       setTotalPages(1);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     let filtered = [...reports];

//     if (searchQuery) {
//       const queryLower = searchQuery.toLowerCase();
//       filtered = filtered.filter((report) =>
//         [
//           report.name,
//           report.reportType,
//           report.user_created_name,
//           report.main_location_name,
//           report.qa_section,
//           report.qa_sub_section,
//         ]
//           .filter(Boolean)
//           .map((field) => field.toLowerCase())
//           .some((field) => field.includes(queryLower))
//       );
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

//     if (filters.status) {
//       filtered = filtered.filter((report) => report.status === filters.status);
//     }

//     if (filters.followUpStatus) {
//       filtered = filtered.filter((report) => report.follow_up_status === filters.followUpStatus);
//     }

//     if (filters.dateViolation) {
//       filtered = filtered.filter((report) => {
//         if (!report.corrective_action_date) return false;
//         const currentDate = new Date();
//         const actionDate = new Date(report.corrective_action_date);
//         const isViolated = currentDate > actionDate;
//         return filters.dateViolation === 'Violated' ? isViolated : !isViolated;
//       });
//     }

//     setFilteredReports(filtered);
//   }, [reports, searchQuery, filters.startDate, filters.endDate, filters.severity, filters.status, filters.followUpStatus, filters.dateViolation]);

//   useEffect(() => {
//     const fetchSignatures = async () => {
//       const signatures = {};
//       for (const report of reports) {
//         const reportId = report._id?.$oid || report.id;
//         if (report.signature_url && reportId) {
//           try {
//             const filename = report.signature_url.split('/').pop();
//             const url = await readReportService.fetchImage(filename, authData.access_token);
//             signatures[reportId] = url;
//           } catch (err) {
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

//   const handleSearch = (e) => {
//     const query = e.target.value;
//     setSearchQuery(query);
//     setCurrentPage(1);
//   };

//   const handleSearchFromModal = (query) => {
//     setSearchQuery(query);
//     setCurrentPage(1);
//   };

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({ ...prev, [name]: value }));
//     setCurrentPage(1);
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

//   const toggleViewMode = () => {
//     setViewMode(viewMode === 'cards' ? 'table' : 'cards');
//   };

//   const getStatusBarClass = (status) => {
//     switch (status) {
//       case 'Escalated':
//         return 'bg-orange-600';
//       case 'Investigated':
//         return 'bg-red-600';
//       case 'Under Management Action':
//         return 'bg-yellow-600';
//       case 'Resolved':
//         return 'bg-green-600';
//       default:
//         return 'bg-gray-600';
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

//   const getFlagBarClass = (report) => {
//     if (report.corrective_action_date && report.follow_up_status) {
//       const currentDate = new Date();
//       const actionDate = new Date(report.corrective_action_date);
//       const isPastDue = currentDate > actionDate;

//       if (isPastDue && ['Open', 'Pending'].includes(report.follow_up_status)) {
//         return 'bg-red-600';
//       } else if (['Resolved', 'Closed'].includes(report.follow_up_status)) {
//         return 'bg-green-600';
//       }
//     }
//     return '';
//   };

//   const handlePrintCard = (reportId) => {
//     const cardElement = document.getElementById(`report-card-${reportId}`);
//     if (!cardElement) return;

//     const printWindow = window.open('', '', 'width=800,height=600');
//     const styles = Array.from(document.styleSheets)
//       .map((sheet) => {
//         try {
//           return Array.from(sheet.cssRules)
//             .map((rule) => rule.cssText)
//             .join('\n');
//         } catch (e) {
//           return '';
//         }
//       })
//       .join('\n');

//     printWindow.document.write(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <meta charset="utf-8">
//           <title>Print Report Card</title>
//           <style>
//             ${styles}
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             img { max-width: 100%; height: auto; }
//           </style>
//         </head>
//         <body>
//           <div style="${window.getComputedStyle(cardElement).cssText}">
//             ${cardElement.innerHTML}
//           </div>
//           <script>
//             window.onload = () => {
//               window.print();
//               window.close();
//             };
//           </script>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//   };

//   if (authLoading || !authData || loading) {
//     return <LoadingSpinner />;
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
//                 {t('reports.view_reports') || 'View Reports'}
//               </h1>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//                 <LanguageToggle />
//                 <ModalSearch onSearch={handleSearchFromModal} />
//                 <ThemeToggle />
//               </div>
//             </div>
//             <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//               <div className="relative flex-1">
//                 <input
//                   type="text"
//                   value={searchQuery}
//                   onChange={handleSearch}
//                   placeholder={t('reports.search_placeholder') || 'Search by name, domain, or description...'}
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
//               <button
//                 onClick={toggleViewMode}
//                 className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                 aria-label={viewMode === 'cards' ? t('reports.switch_to_table') || 'Switch to Table View' : t('reports.switch_to_card') || 'Switch to Card View'}
//               >
//                 {viewMode === 'cards' ? t('reports.table_view') || 'Table View' : t('reports.card_view') || 'Card View'}
//               </button>
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
//                     <option value="">{t('reports.select_severity') || 'All'}</option>
//                     <option value="High">{t('reports.severity_high') || 'High'}</option>
//                     <option value="Medium">{t('reports.severity_medium') || 'Medium'}</option>
//                     <option value="Low">{t('reports.severity_low') || 'Low'}</option>
//                     <option value="Informational">{t('reports.severity_informational') || 'Informational'}</option>
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
//                     <option value="">All</option>
//                     <option value="Escalated">{t('reports.status_escalated') || 'Escalated'}</option>
//                     <option value="Investigated">{t('reports.status_investigated') || 'Investigated'}</option>
//                     <option value="Under Management Action">{t('reports.status_under_management_action') || 'Under Management Action'}</option>
//                     <option value="Resolved">{t('reports.status_resolved') || 'Resolved'}</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     {t('reports.follow_up_status') || 'Follow Up Status'}
//                   </label>
//                   <select
//                     name="followUpStatus"
//                     value={filters.followUpStatus}
//                     onChange={handleFilterChange}
//                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   >
//                     <option value="">{t('reports.select_follow_up_status') || 'All'}</option>
//                     <option value="Open">{t('reports.follow_up_open') || 'Open'}</option>
//                     <option value="Pending">{t('reports.follow_up_pending') || 'Pending'}</option>
//                     <option value="Resolved">{t('reports.follow_up_resolved') || 'Resolved'}</option>
//                     <option value="Closed">{t('reports.follow_up_closed') || 'Closed'}</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Date Violation
//                   </label>
//                   <select
//                     name="dateViolation"
//                     value={filters.dateViolation}
//                     onChange={handleFilterChange}
//                     className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   >
//                     <option value="">All</option>
//                     <option value="Violated">{t('reports.action_date_violation') || 'Violated'}</option>
//                     <option value="Not Violated">Not Violated</option>
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
//                     {viewMode === 'cards' ? (
//                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {filteredReports.map((report) => {
//                           const reportId = report._id?.$oid || report.id;
//                           const statusBarClass = getStatusBarClass(report.status);
//                           const flagBarClass = getFlagBarClass(report);
//                           return (
//                             <div
//                               key={reportId}
//                               id={`report-card-${reportId}`}
//                               className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group relative"
//                               role="button"
//                               aria-label={`${t('reports.report_name') || 'Report'}: ${report.name}`}
//                               onClick={() => setSelectedReport(report)}
//                               tabIndex={0}
//                               onKeyDown={(e) => {
//                                 if (e.key === 'Enter' || e.key === ' ') {
//                                   setSelectedReport(report);
//                                 }
//                               }}
//                             >
//                               {report.status && (
//                                 <div className={`${statusBarClass} text-white text-sm font-bold text-center py-2 rounded-t-lg -mt-6 -mx-6 mb-4`}>
//                                   {t(`reports.status_${report.status.toLowerCase().replace(' ', '_')}`) || report.status}
//                                 </div>
//                               )}
//                               <div className="space-y-3">
//                                 <div className="flex justify-between items-start">
//                                   <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200">
//                                     {report.name || 'Unnamed Report'}
//                                   </h3>
//                                   <div className="flex flex-col gap-2">
//                                     {/* <button
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         handlePrintCard(reportId);
//                                       }}
//                                       className="bg-indigo-500 text-white p-2 rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                       aria-label="Print Card"
//                                     >
//                                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
//                                       </svg>
//                                     </button> */}
//                                     {report.severity && (
//                                       <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getSeverityBadgeClass(report.severity)}`}>
//                                         {t(`reports.severity_${report.severity.toLowerCase()}`) || report.severity}
//                                       </span>
//                                     )}
//                                     {report.follow_up_status && (
//                                       <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getFollowUpStatusBadgeClass(report.follow_up_status)}`}>
//                                         {t(`reports.follow_up_${report.follow_up_status.toLowerCase()}`) || report.follow_up_status}
//                                       </span>
//                                     )}
//                                   </div>
//                                 </div>
//                                 <div>
//                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                     {t('reports.report_type') || 'Report Type'}
//                                   </span>
//                                   <p className="text-gray-800 dark:text-gray-100">{report.reportType || t('reports.unknown') || 'N/A'}</p>
//                                 </div>
//                                 <div>
//                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                     {t('reports.created_by') || 'Created By'}
//                                   </span>
//                                   <p className="text-gray-800 dark:text-gray-100">{report.user_created_name || t('reports.unknown') || 'Unknown'}</p>
//                                 </div>
//                                 <div>
//                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                     {t('reports.main_location') || 'Main Location'}
//                                   </span>
//                                   <p className="text-gray-800 dark:text-gray-100">{report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}</p>
//                                 </div>
//                                 <div>
//                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                     {t('reports.qa_section') || 'QA Section'}
//                                   </span>
//                                   <p className="text-gray-800 dark:text-gray-100">{report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}</p>
//                                 </div>
//                                 <div>
//                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                     {t('reports.qa_sub_section') || 'QA Sub-Section'}
//                                   </span>
//                                   <p className="text-gray-800 dark:text-gray-100">{report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}</p>
//                                 </div>
//                                 {report.created_at && (
//                                   <div>
//                                     <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                       {t('reports.created_at') || 'Created At'}
//                                     </span>
//                                     <p className="text-gray-800 dark:text-gray-100">{format(new Date(report.created_at), 'PPP')}</p>
//                                   </div>
//                                 )}
//                                 {report.signature_url && (
//                                   <div>
//                                     <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                       {t('reports.signature') || 'Signature'}
//                                     </span>
//                                     {signatureUrls[reportId] === undefined ? (
//                                       <span className="text-gray-600 dark:text-gray-400">{t('reports.loading_signature') || 'Loading signature...'}</span>
//                                     ) : signatureUrls[reportId] === null ? (
//                                       <span className="text-red-600 dark:text-red-400">{t('reports.signature_failed') || 'Failed to load signature'}</span>
//                                     ) : (
//                                       <img
//                                         src={signatureUrls[reportId]}
//                                         alt="Signature"
//                                         className="w-24 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-700 shadow-sm mt-2 cursor-pointer"
//                                         onError={(e) => {
//                                           e.target.src = '/placeholder-image.png';
//                                         }}
//                                         onClick={() => setSelectedReport(report)}
//                                       />
//                                     )}
//                                   </div>
//                                 )}
//                               </div>
//                               {flagBarClass && (
//                                 <div className={`${flagBarClass} h-2 absolute bottom-0 left-0 right-0 rounded-b-lg`}></div>
//                               )}
//                             </div>
//                           );
//                         })}
//                       </div>
//                     ) : (
//                       <ReportsTable
//                         reports={filteredReports}
//                         signatureUrls={signatureUrls}
//                         t={t}
//                         setSelectedReport={setSelectedReport}
//                       />
//                     )}
//                       {totalPages > 1 && (
//                         <div className="flex justify-center items-center gap-3 mt-8">
//                           <button
//                             onClick={() => handlePageChange(currentPage - 1)}
//                             disabled={currentPage === 1}
//                             className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                             aria-label={t('reports.previous') || 'Previous'}
//                           >
//                             {t('reports.previous') || 'Previous'}
//                           </button>

//                           {/* Calculate visible page range */}
//                           <div className="flex gap-2">
//                             {Array.from({ length: Math.min(8, totalPages) }, (_, i) => {
//                               const startPage = Math.max(1, currentPage - 3);
//                               const endPage = Math.min(totalPages, startPage + 7);
//                               const page = startPage + i;

//                               if (page <= endPage) {
//                                 return (
//                                   <button
//                                     key={page}
//                                     onClick={() => handlePageChange(page)}
//                                     className={`px-4 py-2 rounded-lg ${
//                                       page === currentPage
//                                         ? 'bg-indigo-500 text-white'
//                                         : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
//                                     } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
//                                     aria-label={`Page ${page}`}
//                                     aria-current={page === currentPage ? 'page' : undefined}
//                                   >
//                                     {page}
//                                   </button>
//                                 );
//                               }
//                               return null;
//                             })}
//                           </div>

//                           <button
//                             onClick={() => handlePageChange(currentPage + 1)}
//                             disabled={currentPage === totalPages}
//                             className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                             aria-label={t('reports.next') || 'Next'}
//                           >
//                             {t('reports.next') || 'Next'}
//                           </button>

//                           <select
//                             value={currentPage}
//                             onChange={(e) => handlePageChange(Number(e.target.value))}
//                             className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                             aria-label={t('reports.jump_to_page') || 'Jump to page'}
//                           >
//                             {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                               <option key={page} value={page}>
//                                 {t('reports.page') || 'Page'} {page}
//                               </option>
//                             ))}
//                           </select>

//                           <select
//                             value={perPage}
//                             onChange={handlePerPageChange}
//                             className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                             aria-label={t('reports.items_per_page') || 'Items per page'}
//                           >
//                             {[5, 10, 15, 50, 75, 100, 200].map((value) => (
//                               <option key={value} value={value}>
//                                 {value} {t('reports.items') || 'items'}
//                               </option>
//                             ))}
//                           </select>
//                         </div>
//                       )}
//                     <AnimatePresence>
//                       {selectedReport && (
//                         <ReportModal
//                           report={selectedReport}
//                           onClose={() => setSelectedReport(null)}
//                           authData={authData}
//                           t={t}
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

// export default ReadReports;


// Working Friday 


import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import readReportService from '../../lib/readReportService';
import { format } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import { PrevArrow, NextArrow, ImageModal, ImageCarousel, ReportModal } from './ReadReportsHelpers';

const ReportsTable = ({ reports, signatureUrls, t, setSelectedReport }) => {
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    reportType: '',
    user_created_name: '',
    main_location_name: '',
    qa_section: '',
    qa_sub_section: '',
    created_at: '',
  });

  const handleColumnFilterChange = (e) => {
    const { name, value } = e.target;
    setColumnFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredReports = reports.filter((report) => {
    return (
      (report.name || 'Unnamed Report').toLowerCase().includes(columnFilters.name.toLowerCase()) &&
      (report.reportType || '').toLowerCase().includes(columnFilters.reportType.toLowerCase()) &&
      (report.user_created_name || '').toLowerCase().includes(columnFilters.user_created_name.toLowerCase()) &&
      (report.main_location_name || report.structure?.location_details?.main_location_id || '').toLowerCase().includes(columnFilters.main_location_name.toLowerCase()) &&
      (report.qa_section || report.structure?.location_details?.section_qa_id || '').toLowerCase().includes(columnFilters.qa_section.toLowerCase()) &&
      (report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || '').toLowerCase().includes(columnFilters.qa_sub_section.toLowerCase()) &&
      (report.created_at ? format(new Date(report.created_at), 'PPP') : '').toLowerCase().includes(columnFilters.created_at.toLowerCase())
    );
  });

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-indigo-50 dark:bg-indigo-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
              {t('reports.report_name') || 'Name'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
              {t('reports.report_type') || 'Report Type'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
              {t('reports.created_by') || 'Created By'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
              {t('reports.main_location') || 'Main Location'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
              {t('reports.qa_section') || 'QA Section'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
              {t('reports.qa_sub_section') || 'QA Sub-Section'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
              {t('reports.created_at') || 'Created At'}
            </th>
          </tr>
          <tr className="bg-gray-50 dark:bg-gray-700">
            {['name', 'reportType', 'user_created_name', 'main_location_name', 'qa_section', 'qa_sub_section', 'created_at'].map((field) => (
              <td key={field} className="px-6 py-2">
                <input
                  type="text"
                  name={field}
                  value={columnFilters[field]}
                  onChange={handleColumnFilterChange}
                  placeholder={`Filter ${t(`reports.${field}`) || field.replace('_', ' ')}`}
                  className="w-full py-1 px-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </td>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredReports.map((report) => {
            const reportId = report._id?.$oid || report.id;
            return (
              <tr
                key={reportId}
                className="hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer transition-colors duration-200"
                onClick={() => setSelectedReport(report)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedReport(report);
                  }
                }}
                aria-label={`${t('reports.report_name') || 'Report'}: ${report.name}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {report.name || 'Unnamed Report'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {report.reportType || t('reports.unknown') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {report.user_created_name || t('reports.unknown') || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {report.main_location_name || report.structure?.location_details?.main_location_id || t('reports.unknown') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {report.qa_section || report.structure?.location_details?.section_qa_id || t('reports.unknown') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {report.qa_sub_section || report.structure?.location_details?.sub_section_qa_id || t('reports.unknown') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                  {report.created_at ? format(new Date(report.created_at), 'PPP') : t('reports.unknown') || 'N/A'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const ReadReports = () => {
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
    sort: '-created_at',
    severity: '',
    status: '',
    followUpStatus: '',
    dateViolation: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [signatureUrls, setSignatureUrls] = useState({});

  // Privilege check function
  const hasPrivilegeCheck = (requiredPrivileges) => {
    return authData?.privilege_ids?.some(id => requiredPrivileges.includes(id)) || false;
  };

  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('reports.no_permission') || 'No permission to view reports');
      setLoading(false);
      return;
    }

    // Check for multiple privileges
    if (hasPrivilegeCheck([5000, 1, 2001,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011])) {
      setHasPrivilege(true);
      fetchReports();
    } else {
      setError(t('reports.no_permission') || 'No permission to view reports');
      setHasPrivilege(false);
      setLoading(false);
    }
  }, [authData, authLoading, currentPage, language, t, filters.reportType, filters.sort, perPage]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await readReportService.getReports(authData.org_id, {
        page: currentPage,
        perPage,
        reportType: filters.reportType,
        sort: filters.sort,
        lang: language || 'en',
      });
      setReports(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.pagination?.total_pages || 1);

      const uniqueReportTypes = response.data && Array.isArray(response.data)
        ? [...new Set(response.data.map((report) => report.reportType).filter(Boolean))]
        : [];
      setReportTypes(uniqueReportTypes.map((type) => ({ _id: type, name: type })));
      setLoading(false);
    } catch (err) {
      setError(t('reports.fetch_reports_error', { message: err.message }) || `Error: ${err.message}`);
      setReports([]);
      setFilteredReports([]);
      setTotalPages(1);
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...reports];

    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter((report) =>
        [
          report.name,
          report.reportType,
          report.user_created_name,
          report.main_location_name,
          report.qa_section,
          report.qa_sub_section,
        ]
          .filter(Boolean)
          .map((field) => field.toLowerCase())
          .some((field) => field.includes(queryLower))
      );
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

    if (filters.status) {
      filtered = filtered.filter((report) => report.status === filters.status);
    }

    if (filters.followUpStatus) {
      filtered = filtered.filter((report) => report.follow_up_status === filters.followUpStatus);
    }

    if (filters.dateViolation) {
      filtered = filtered.filter((report) => {
        if (!report.corrective_action_date) return false;
        const currentDate = new Date();
        const actionDate = new Date(report.corrective_action_date);
        const isViolated = currentDate > actionDate;
        return filters.dateViolation === 'Violated' ? isViolated : !isViolated;
      });
    }

    setFilteredReports(filtered);
  }, [reports, searchQuery, filters.startDate, filters.endDate, filters.severity, filters.status, filters.followUpStatus, filters.dateViolation]);

  useEffect(() => {
    const fetchSignatures = async () => {
      const signatures = {};
      for (const report of reports) {
        const reportId = report._id?.$oid || report.id;
        if (report.signature_url && reportId) {
          try {
            const filename = report.signature_url.split('/').pop();
            const url = await readReportService.fetchImage(filename, authData.access_token);
            signatures[reportId] = url;
          } catch (err) {
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

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSearchFromModal = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
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

  const toggleViewMode = () => {
    setViewMode(viewMode === 'cards' ? 'table' : 'cards');
  };

  const getStatusBarClass = (status) => {
    switch (status) {
      case 'Escalated':
        return 'bg-orange-600';
      case 'Investigated':
        return 'bg-red-600';
      case 'Under Management Action':
        return 'bg-yellow-600';
      case 'Resolved':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
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

  const getFlagBarClass = (report) => {
    if (report.corrective_action_date && report.follow_up_status) {
      const currentDate = new Date();
      const actionDate = new Date(report.corrective_action_date);
      const isPastDue = currentDate > actionDate;

      if (isPastDue && ['Open', 'Pending'].includes(report.follow_up_status)) {
        return 'bg-red-600';
      } else if (['Resolved', 'Closed'].includes(report.follow_up_status)) {
        return 'bg-green-600';
      }
    }
    return '';
  };

  const handlePrintCard = (reportId) => {
    const cardElement = document.getElementById(`report-card-${reportId}`);
    if (!cardElement) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Print Report Card</title>
          <style>
            ${styles}
            body { font-family: Arial, sans-serif; padding: 20px; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <div style="${window.getComputedStyle(cardElement).cssText}">
            ${cardElement.innerHTML}
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (authLoading || !authData || loading) {
    return <LoadingSpinner />;
  }

  // Render the component only if the user has the required privileges
  if (!hasPrivilegeCheck([5000,1,1001,1002,1003,1004,1005,1006,1007])) {
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
                {t('reports.view_reports') || 'View Reports'}
              </h1>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <LanguageToggle />
                <ModalSearch onSearch={handleSearchFromModal} />
                <ThemeToggle />
              </div>
            </div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder={t('reports.search_placeholder') || 'Search by name, domain, or description...'}
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
              <button
                onClick={toggleViewMode}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                aria-label={viewMode === 'cards' ? t('reports.switch_to_table') || 'Switch to Table View' : t('reports.switch_to_card') || 'Switch to Card View'}
              >
                {viewMode === 'cards' ? t('reports.table_view') || 'Table View' : t('reports.card_view') || 'Card View'}
              </button>
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
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
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
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
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
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  >
                    <option value="">{t('reports.select_severity') || 'All'}</option>
                    <option value="High">{t('reports.severity_high') || 'High'}</option>
                    <option value="Medium">{t('reports.severity_medium') || 'Medium'}</option>
                    <option value="Low">{t('reports.severity_low') || 'Low'}</option>
                    <option value="Informational">{t('reports.severity_informational') || 'Informational'}</option>
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
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  >
                    <option value="">All</option>
                    <option value="Escalated">{t('reports.status_escalated') || 'Escalated'}</option>
                    <option value="Investigated">{t('reports.status_investigated') || 'Investigated'}</option>
                    <option value="Under Management Action">{t('reports.status_under_management_action') || 'Under Management Action'}</option>
                    <option value="Resolved">{t('reports.status_resolved') || 'Resolved'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('reports.follow_up_status') || 'Follow Up Status'}
                  </label>
                  <select
                    name="followUpStatus"
                    value={filters.followUpStatus}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  >
                    <option value="">{t('reports.select_follow_up_status') || 'All'}</option>
                    <option value="Open">{t('reports.follow_up_open') || 'Open'}</option>
                    <option value="Pending">{t('reports.follow_up_pending') || 'Pending'}</option>
                    <option value="Resolved">{t('reports.follow_up_resolved') || 'Resolved'}</option>
                    <option value="Closed">{t('reports.follow_up_closed') || 'Closed'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date Violation
                  </label>
                  <select
                    name="dateViolation"
                    value={filters.dateViolation}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  >
                    <option value="">All</option>
                    <option value="Violated">{t('reports.action_date_violation') || 'Violated'}</option>
                    <option value="Not Violated">Not Violated</option>
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
                    {viewMode === 'cards' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredReports.map((report) => {
                          const reportId = report._id?.$oid || report.id;
                          const statusBarClass = getStatusBarClass(report.status);
                          const flagBarClass = getFlagBarClass(report);
                          return (
                            <div
                              key={reportId}
                              id={`report-card-${reportId}`}
                              className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group relative"
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
                                    {/* <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePrintCard(reportId);
                                      }}
                                      className="bg-indigo-500 text-white p-2 rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      aria-label="Print Card"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                      </svg>
                                    </button> */}
                                    {report.severity && (
                                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getSeverityBadgeClass(report.severity)}`}>
                                        {t(`reports.severity_${report.severity.toLowerCase()}`) || report.severity}
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
                                          e.target.src = '/placeholder-image.png';
                                        }}
                                        onClick={() => setSelectedReport(report)}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                              {flagBarClass && (
                                <div className={`${flagBarClass} h-2 absolute bottom-0 left-0 right-0 rounded-b-lg`}></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <ReportsTable
                        reports={filteredReports}
                        signatureUrls={signatureUrls}
                        t={t}
                        setSelectedReport={setSelectedReport}
                      />
                    )}
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
                          {[5, 10, 15, 50, 75, 100, 200, 1000 ,  10000 , 1000000].map((value) => (
                            <option key={value} value={value}>
                              {value} {t('reports.items') || 'items'}
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

export default ReadReports;