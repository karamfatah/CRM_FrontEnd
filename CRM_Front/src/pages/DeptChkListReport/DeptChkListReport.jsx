// import React, { useState, useEffect, useRef } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import ModalSearch from '../../components/ModalSearch';
// import ThemeToggle from '../../components/ThemeToggle';
// import LanguageToggle from '../../components/LanguageToggle';
// import readReportService from '../../lib/readReportService';
// import { format } from 'date-fns';
// import { AnimatePresence, motion } from 'framer-motion';
// import Slider from 'react-slick';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

// // Custom debounce hook
// const useDebounce = (value, delay) => {
//   const [debouncedValue, setDebouncedValue] = useState(value);

//   useEffect(() => {
//     const handler = setTimeout(() => setDebouncedValue(value), delay);
//     return () => clearTimeout(handler);
//   }, [value, delay]);

//   return debouncedValue;
// };

// // Correct section name typos
// const correctSectionName = (name) => {
//   const corrections = {
//     Doores: 'Doors',
//     'Equipment’s': 'Equipment',
//   };
//   return corrections[name] || name;
// };

// // Calculate section score
// const calculateSectionScore = (subSection) => {
//   console.log(`Calculating section score for: ${subSection?.name || 'Unnamed'}`);
//   const failCount = (subSection.sub_sub_bodies || []).reduce((count, subSub) => {
//     const failFields = (subSub.fields || []).filter(
//       (field) => field.name === "score" && field.value === "Fail"
//     );
//     return count + failFields.length;
//   }, 0);
//   const passCount = (subSection.sub_sub_bodies || []).reduce((count, subSub) => {
//     const passFields = (subSub.fields || []).filter(
//       (field) => field.name === "score" && field.value === "Pass"
//     );
//     return count + passFields.length;
//   }, 0);
//   const score = failCount === 0 ? 10 : failCount <= 3 ? 5 : 0;
//   return { score, failCount, passCount };
// };

// // Calculate report score
// const calculateReportScore = (report) => {
//   console.log(`Calculating report score for report ID: ${report._id?.$oid || report.id}`);
//   const failCount = (report.structure?.body?.sub_bodies || []).reduce((total, subSection) => {
//     const sectionFailCount = (subSection.sub_sub_bodies || []).reduce((count, subSub) => {
//       const failFields = (subSub.fields || []).filter(
//         (field) => field.name === "score" && field.value === "Fail"
//       );
//       return count + failFields.length;
//     }, 0);
//     return total + sectionFailCount;
//   }, 0);
//   const passCount = (report.structure?.body?.sub_bodies || []).reduce((total, subSection) => {
//     const sectionPassCount = (subSection.sub_sub_bodies || []).reduce((count, subSub) => {
//       const passFields = (subSub.fields || []).filter(
//         (field) => field.name === "score" && field.value === "Pass"
//       );
//       return count + passFields.length;
//     }, 0);
//     return total + sectionPassCount;
//   }, 0);
//   const emptyCount = (report.structure?.body?.sub_bodies || []).reduce((total, subSection) => {
//     const sectionEmptyCount = (subSection.sub_sub_bodies || []).reduce((count, subSub) => {
//       const emptyFields = (subSub.fields || []).filter(
//         (field) => field.name === "score" && field.value === ""
//       );
//       return count + emptyFields.length;
//     }, 0);
//     return total + sectionEmptyCount;
//   }, 0);
//   const sectionFailCount = (report.structure?.body?.sub_bodies || []).reduce((count, subSection) => {
//     const sectionScore = calculateSectionScore(subSection).score;
//     return count + (sectionScore === 0 ? 1 : 0);
//   }, 0);
//   const passFailTrend = (report.structure?.body?.sub_bodies || []).map((subSection) => {
//     const { passCount, failCount } = calculateSectionScore(subSection);
//     const total = passCount + failCount;
//     return total > 0 ? passCount / total : 0;
//   });
//   return {
//     score: failCount === 0 ? 10 : failCount <= 3 ? 5 : 0,
//     failCount,
//     passCount,
//     emptyCount,
//     sectionFailCount,
//     passFailTrend
//   };
// };

// // Custom arrows for the slider
// const PrevArrow = ({ onClick }) => (
//   <button
//     onClick={onClick}
//     className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-full shadow-lg z-10 hover:bg-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//     aria-label="Previous Image"
//   >
//     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6" />
//     </svg>
//   </button>
// );

// const NextArrow = ({ onClick }) => (
//   <button
//     onClick={onClick}
//     className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-full shadow-lg z-10 hover:bg-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//     aria-label="Next Image"
//   >
//     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" />
//     </svg>
//   </button>
// );

// const ImageModal = ({ imageUrl, onClose, images = [], currentIndex = 0 }) => {
//   const [index, setIndex] = useState(currentIndex);

//   const nextImage = () => setIndex((prev) => (prev + 1) % images.length);
//   const prevImage = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

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
//           className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-lg"
//         />
//         {images.length > 1 && (
//           <>
//             <button
//               onClick={prevImage}
//               className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-700 text-white p-3 rounded-full shadow-lg hover:bg-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               aria-label="Previous Image"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18l-6-6 6-6" />
//               </svg>
//             </button>
//             <button
//               onClick={nextImage}
//               className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 dark:bg-gray-700 text-white p-3 rounded-full shadow-lg hover:bg-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               aria-label="Next Image"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 18l6-6-6-6" />
//               </svg>
//             </button>
//             <div className="text-center mt-2 text-sm font-medium text-white dark:text-gray-200">
//               {index + 1} / {images.length}
//             </div>
//           </>
//         )}
//         <button
//           onClick={onClose}
//           className="absolute top-2 right-2 bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-full shadow-lg hover:bg-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
//             className="w-full max-w-md h-auto object-contain rounded-lg border border-gray-200 dark:border-gray-700 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
//             onClick={() => setShowImageModal(true)}
//             role="button"
//             tabIndex={0}
//             onKeyDown={(e) => {
//               if (e.key === 'Enter' || e.key === ' ') setShowImageModal(true);
//             }}
//             aria-label={`View ${imageDataUrls[0].file_name}`}
//           />
//           <p className="text-center text-gray-600 dark:text-gray-300 mt-2 text-sm">
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
//                 className="w-full h-64 object-contain rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow"
//                 onClick={() => setShowImageModal(true)}
//                 role="button"
//                 tabIndex={0}
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter' || e.key === ' ') setShowImageModal(true);
//                 }}
//                 aria-label={`View ${image.file_name}`}
//               />
//               <p className="text-center text-gray-600 dark:text-gray-300 mt-2 text-sm">
//                 {image.file_name}
//               </p>
//             </div>
//           ))}
//         </Slider>
//       )}
//       <AnimatePresence>
//         {showImageModal && (
//           <ImageModal
//             images={imageDataUrls.map((img) => img.url)}
//             currentIndex={imageDataUrls.findIndex((img) => img.url === (imageDataUrls[0]?.url || ''))}
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

//   useEffect(() => {
//     console.log('ReportModal opened with report ID:', report._id?.$oid || report.id);
//     console.log('Report structure:', report.structure);
//   }, [report]);

//   // Calculate score, ignoring empty scores
//   const calculateScore = (failCount) => {
//     if (failCount === 0) return 10;
//     if (failCount <= 3) return 5;
//     return 0;
//   };

//   // Fetch signature image
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
//       }, [field.value, authData.access_token]);

//       if (loading) return <span className="text-gray-600 dark:text-gray-400">Loading image...</span>;
//       if (error) return <span className="text-red-600 dark:text-red-400">{error}</span>;

//       return (
//         <img
//           src={imageDataUrl}
//           alt={field.name}
//           className="w-32 h-32 object-cover rounded-md cursor-pointer shadow-md hover:shadow-lg transition-shadow"
//           onError={(e) => (e.target.src = '/placeholder-image.png')}
//           onClick={() => setEnlargedImage(imageDataUrl)}
//         />
//       );
//     } else if (field.type === 'multi_image' && Array.isArray(field.value)) {
//       return <ImageCarousel images={field.value} fieldName={field.name} accessToken={authData.access_token} t={t} />;
//     } else if (field.type === 'PDF') {
//       return <span className="text-gray-600 dark:text-gray-400">{t('templates.pdf_upload_placeholder') || 'PDF File'}</span>;
//     } else if (field.type === 'radio') {
//       return (
//         <span className="flex items-center gap-1">
//           {field.value === 'Pass' && <span role="img" aria-label="Pass">✅</span>}
//           {field.value === 'Fail' && <span role="img" aria-label="Fail">❌</span>}
//           {field.value || t('reports.unknown') || 'N/A'}
//         </span>
//       );
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
//     console.log(`Rendering section: ${section}, subSections length: ${subSections?.length || 0}`);
//     if (!subSections || !Array.isArray(subSections) || subSections.length === 0) {
//       console.log(`No valid subSections for ${section}`);
//       return null;
//     }

//     const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';

//     const filteredSubSections = subSections
//       .map((sub) => {
//         if (!sub) return null;
//         const filteredFields = (sub.fields || []).filter(hasMeaningfulValue);
//         const filteredSubSub = (sub[subSubKey] || [])
//           .map((subSub) => {
//             if (!subSub) return null;
//             const filteredSubSubFields = (subSub.fields || []).filter(hasMeaningfulValue);
//             return filteredSubSubFields.length > 0 ? { ...subSub, fields: filteredSubSubFields } : null;
//           })
//           .filter(Boolean);

//         return (filteredFields.length > 0 || filteredSubSub.length > 0)
//           ? { ...sub, fields: filteredFields, [subSubKey]: filteredSubSub }
//           : null;
//       })
//       .filter(Boolean);

//     if (filteredSubSections.length === 0) {
//       console.log(`No filtered subSections for ${section}`);
//       return null;
//     }

//     return (
//       <div className="mb-6">
//         <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100 capitalize">
//           {section}
//         </h4>
//         {filteredSubSections.map((sub, subIndex) => {
//           console.log(`Rendering subSection: ${sub.name}, subSubKey: ${subSubKey}`);
//           const { score, passCount, failCount } = calculateSectionScore(sub);
//           const total = passCount + failCount;
//           const passPercentage = total > 0 ? (passCount / total) * 100 : 0;
//           return (
//             <div
//               key={`${sectionKey}-${subIndex}`}
//               className="border p-5 rounded-xl mb-4 bg-gray-50 dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
//             >
//               <div className="flex items-center justify-between mb-3">
//                 <h5 className="text-xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900 px-3 py-1 rounded-md shadow-sm">
//                   {correctSectionName(sub.name || 'Unnamed Section')}
//                 </h5>
//                 <span
//                   className={`text-sm font-medium px-3 py-1 rounded-full text-white ${
//                     score === 10 ? 'bg-green-500' : score === 5 ? 'bg-gray-500' : 'bg-red-500'
//                   }`}
//                 >
//                   Score: {score}
//                 </span>
//               </div>
//               {total > 0 && (
//                 <div className="mb-3">
//                   <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
//                     <div
//                       className="bg-green-500 h-2.5 rounded-full"
//                       style={{ width: `${passPercentage}%` }}
//                     ></div>
//                   </div>
//                   <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
//                     {passCount} Pass ✅ / {failCount} Fail ❌
//                   </p>
//                 </div>
//               )}
//               {sub.fields.length > 0 && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
//                   {sub.fields.map((field) => (
//                     <div key={field.name} className="flex flex-col">
//                       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                         {field.name || 'Unnamed Field'}:
//                       </span>
//                       <span className="text-sm text-gray-600 dark:text-gray-400">
//                         {renderFieldValue(field)}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//               {sub[subSubKey]?.length > 0 && (
//                 <div>
//                   {sub[subSubKey].map((subSub, subSubIndex) => (
//                     <div
//                       key={`${sectionKey}-${subIndex}-subSub-${subSubIndex}`}
//                       className="ml-4 mt-3 border-l-2 border-gray-200 dark:border-gray-600 pl-4"
//                     >
//                       <h6 className="text-sm font-medium text-gray-800 dark:text-gray-100">
//                         {subSub.name || 'Unnamed Sub-Section'}
//                       </h6>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
//                         {(subSub.fields || []).map((field) => (
//                           <div key={field.name} className="flex flex-col">
//                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                               {field.name || 'Unnamed Field'}:
//                             </span>
//                             <span className="text-sm text-gray-600 dark:text-gray-400">
//                               {renderFieldValue(field)}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   const { score, passCount, failCount, emptyCount } = calculateReportScore(report);

//   return (
//     <>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//       >
//         <motion.div
//           initial={{ scale: 0.8, y: 50 }}
//           animate={{ scale: 1, y: 0 }}
//           exit={{ scale: 0.8, y: 50 }}
//           className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
//         >
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
//               {report.name || 'Unnamed Report'} (ID: {report.id || report._id?.$oid || 'N/A'})
//             </h2>
//             <div className="flex items-center gap-4">
//               <span
//                 className={`text-sm font-medium px-3 py-1 rounded-full text-white ${
//                   score === 10 ? 'bg-green-500' : score === 5 ? 'bg-gray-500' : 'bg-red-500'
//                 }`}
//               >
//                 Overall Score: {score}
//               </span>
//               <button
//                 onClick={() => {
//                   console.log('Closing modal');
//                   onClose();
//                 }}
//                 className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 aria-label={t('reports.close') || 'Close'}
//               >
//                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//           <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
//             <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100 mb-2">
//               Summary
//             </h4>
//             <div className="flex gap-4">
//               <div className="flex-1 text-center p-3 border-2 border-green-500 rounded-md">
//                 <p className="text-lg font-bold text-green-600 dark:text-green-400">{passCount}</p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Pass ✅</p>
//               </div>
//               <div className="flex-1 text-center p-3 border-2 border-red-500 rounded-md">
//                 <p className="text-lg font-bold text-red-600 dark:text-red-400">{failCount}</p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">Fail ❌</p>
//               </div>
//             </div>
//           </div>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
//             {t('reports.template_id') || 'Template ID'}: {report.template_id || t('reports.unknown') || 'N/A'}
//           </p>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
//             {t('reports.report_type') || 'Report Type'}: {report.reportType || t('reports.unknown') || 'N/A'}
//           </p>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//             {t('reports.created_by') || 'Created By'}: {report.user_created_name || t('reports.unknown') || 'Unknown'}
//           </p>
//           {report.created_at && (
//             <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
//               {t('reports.created_at') || 'Created At'}: {format(new Date(report.created_at), 'PPP')}
//             </p>
//           )}
//           <div className="mb-4">
//             <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100">
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
//               <h4 className="text-md font-semibold text-gray-800 dark:text-gray-100">
//                 {t('reports.signature') || 'Signature'}
//               </h4>
//               {signatureLoading ? (
//                 <span className="text-gray-600 dark:text-gray-400">Loading signature...</span>
//               ) : signatureError ? (
//                 <span className="text-red-600 dark:text-red-400">{signatureError}</span>
//               ) : signatureUrl ? (
//                 <img
//                   src={signatureUrl}
//                   alt="Signature"
//                   className="w-32 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-700 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
//                   onClick={() => setEnlargedImage(signatureUrl)}
//                   onError={(e) => (e.target.src = '/placeholder-image.png')}
//                 />
//               ) : (
//                 <span className="text-gray-600 dark:text-gray-400">No signature available</span>
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

// // Sparkline component for Pass/Fail trend
// const Sparkline = ({ data, width = 100, height = 30 }) => {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const dpr = window.devicePixelRatio || 1;
//     canvas.width = width * dpr;
//     canvas.height = height * dpr;
//     ctx.scale(dpr, dpr);

//     ctx.clearRect(0, 0, width, height);
//     ctx.beginPath();
//     ctx.strokeStyle = '#3B82F6'; // Indigo-500
//     ctx.lineWidth = 2;

//     const max = Math.max(...data, 1); // Avoid division by zero
//     const stepX = width / (data.length - 1);
//     data.forEach((value, i) => {
//       const x = i * stepX;
//       const y = height - (value / max) * (height - 5);
//       if (i === 0) ctx.moveTo(x, y);
//       else ctx.lineTo(x, y);
//     });

//     ctx.stroke();
//   }, [data, width, height]);

//   return (
//     <canvas
//       ref={canvasRef}
//       width={width}
//       height={height}
//       className="inline-block"
//       aria-label="Pass/Fail trend"
//     />
//   );
// };

// const DeptChkListReport = () => {
//   const { authData, loading: authLoading } = useAuth();
//   const { language, t } = useLanguage();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [hasPrivilege, setHasPrivilege] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [reports, setReports] = useState([]);
//   const [reportTypes, setReportTypes] = useState([]);
//   const [selectedReport, setSelectedReport] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [perPage] = useState(6);
//   const [totalPages, setTotalPages] = useState(1);
//   const [filters, setFilters] = useState({
//     startDate: '',
//     endDate: '',
//     reportType: '',
//     search: '',
//     sort: '-created_at',
//   });
//   const [searchInput, setSearchInput] = useState('');
//   const debouncedSearch = useDebounce(searchInput, 1000);
//   const [signatureUrls, setSignatureUrls] = useState({});
//   const [showTable, setShowTable] = useState({
//     totalPass: false,
//     totalFail: false,
//     mediumScores: false,
//     totalChecks: false,
//     passRate: false,
//     criticalSections: false,
//   });

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

//     if (authData.privilege_ids?.includes(1)) {
//       setHasPrivilege(true);
//       fetchReports();
//     } else {
//       setError(t('reports.no_permission') || 'No permission to view reports');
//       setHasPrivilege(false);
//       setLoading(false);
//     }
//   }, [authData, authLoading, currentPage, filters, language, t]);

//   const fetchReports = async () => {
//     setLoading(true);
//     try {
//       const response = await readReportService.getReports(authData.org_id, {
//         page: currentPage,
//         perPage,
//         reportType: "Score Reports",
//         sort: filters.sort,
//         lang: language || 'en',
//       });
//       const filteredReports = response.data.filter((report) => report.reportType === "Score Reports");
//       console.log('Fetched reports:', response.data);
//       console.log('Filtered reports:', filteredReports);
//       setReports(Array.isArray(filteredReports) ? filteredReports : []);
//       setTotalPages(Math.ceil(filteredReports.length / perPage) || 1);

//       const uniqueReportTypes = filteredReports
//         ? [...new Set(filteredReports.map((report) => report.reportType).filter(Boolean))]
//         : [];
//       setReportTypes(uniqueReportTypes.map((type) => ({ _id: type, name: type })));
//       setLoading(false);
//     } catch (err) {
//       setError(t('reports.fetch_reports_error', { message: err.message }) || `Error: ${err.message}`);
//       setReports([]);
//       setTotalPages(1);
//       setLoading(false);
//     }
//   };

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

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     if (name === 'search') {
//       setSearchInput(value);
//     } else {
//       setFilters((prev) => ({ ...prev, [name]: value }));
//       setCurrentPage(1);
//     }
//   };

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const summaryCounts = reports.reduce(
//     (acc, report) => {
//       const { score, passCount, failCount, emptyCount, sectionFailCount } = calculateReportScore(report);
//       if (score === 10) acc.pass++;
//       else if (score === 5) acc.medium++;
//       else acc.fail++;
//       acc.totalPass += passCount;
//       acc.totalFail += failCount;
//       acc.totalChecks += passCount + failCount;
//       acc.criticalSections += sectionFailCount;
//       return acc;
//     },
//     { pass: 0, medium: 0, fail: 0, totalPass: 0, totalFail: 0, totalChecks: 0, criticalSections: 0 }
//   );

//   const passRate = summaryCounts.totalChecks > 0 ? ((summaryCounts.totalPass / summaryCounts.totalChecks) * 100).toFixed(1) : 0;

//   const toggleTable = (type) => {
//     console.log(`Toggling table for: ${type}`);
//     setShowTable((prev) => ({ ...prev, [type]: !prev[type] }));
//   };

//   const handleReportClick = (report) => {
//     console.log('Card clicked, setting selectedReport:', report._id?.$oid || report.id);
//     setSelectedReport({ ...report });
//   };

//   const getPassDetails = () => {
//     const details = [];
//     reports.forEach((report) => {
//       (report.structure?.body?.sub_bodies || []).forEach((subSection) => {
//         const { passCount } = calculateSectionScore(subSection);
//         if (passCount > 0) {
//           details.push({ section: correctSectionName(subSection.name || 'Unnamed'), passes: passCount });
//         }
//       });
//     });
//     return details;
//   };

//   const getFailDetails = () => {
//     const details = [];
//     reports.forEach((report) => {
//       (report.structure?.body?.sub_bodies || []).forEach((subSection) => {
//         const { failCount } = calculateSectionScore(subSection);
//         if (failCount > 0) {
//           details.push({ section: correctSectionName(subSection.name || 'Unnamed'), fails: failCount });
//         }
//       });
//     });
//     return details;
//   };

//   const getMediumDetails = () => {
//     const details = [];
//     reports.forEach((report) => {
//       (report.structure?.body?.sub_bodies || []).forEach((subSection) => {
//         const { score } = calculateSectionScore(subSection);
//         if (score === 5) {
//           details.push({ section: correctSectionName(subSection.name || 'Unnamed'), score });
//         }
//       });
//     });
//     return details;
//   };

//   const getCheckDetails = () => {
//     const details = [];
//     reports.forEach((report) => {
//       (report.structure?.body?.sub_bodies || []).forEach((subSection) => {
//         const { passCount, failCount } = calculateSectionScore(subSection);
//         const total = passCount + failCount;
//         if (total > 0) {
//           details.push({ section: correctSectionName(subSection.name || 'Unnamed'), total });
//         }
//       });
//     });
//     return details;
//   };

//   const getPassRateDetails = () => {
//     const details = [];
//     reports.forEach((report) => {
//       (report.structure?.body?.sub_bodies || []).forEach((subSection) => {
//         const { passCount, failCount } = calculateSectionScore(subSection);
//         const total = passCount + failCount;
//         const rate = total > 0 ? ((passCount / total) * 100).toFixed(1) : 0;
//         if (total > 0) {
//           details.push({ section: correctSectionName(subSection.name || 'Unnamed'), rate });
//         }
//       });
//     });
//     return details;
//   };

//   const getCriticalDetails = () => {
//     const details = [];
//     reports.forEach((report) => {
//       (report.structure?.body?.sub_bodies || []).forEach((subSection) => {
//         const { score } = calculateSectionScore(subSection);
//         if (score === 0) {
//           details.push({ section: correctSectionName(subSection.name || 'Unnamed'), score });
//         }
//       });
//     });
//     return details;
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
//                 {t('reports.dept_checklist_f') || 'Department Checklist F Reports'}
//               </h1>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//                 <LanguageToggle />
//                 <ModalSearch />
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
//             </div>

//             {error && (
//               <div
//                 className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-400 px-4 py-3 rounded-lg shadow-sm relative mb-6"
//                 role="alert"
//               >
//                 <span>{error}</span>
//                 <button
//                   onClick={() => setError('')}
//                   className="absolute top-0 right-0 px-4 py-3"
//                   aria-label={t('common.dismiss_error') || 'Dismiss error'}
//                 >
//                   <svg className="fill-current h-6 w-6 text-red-500 dark:text-red-400" viewBox="0 0 20 20">
//                     <path d="M10 8.586L2.929 1.515 1.515 2.929L8.586 10l-7-7 1.414 1.414L10 11.414l7-7 1.414-1.414L11.414 10l7-7-1.414-1.414L10 8.586z" />
//                   </svg>
//                 </button>
//               </div>
//             )}

//             <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
//               <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Report Summary</h2>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 <motion.div
//                   className="text-center p-4 border-2 border-green-500 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 cursor-pointer"
//                   onClick={() => toggleTable('totalPass')}
//                 >
//                   <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summaryCounts.totalPass}</p>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">{t('reports.total_pass') || 'Total Passes'} ✅</p>
//                 </motion.div>
//                 <motion.div
//                   className="text-center p-4 border-2 border-red-500 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 cursor-pointer"
//                   onClick={() => toggleTable('totalFail')}
//                 >
//                   <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summaryCounts.totalFail}</p>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">{t('reports.total_fail') || 'Total Fails'} ❌</p>
//                 </motion.div>
//                 <motion.div
//                   className="text-center p-4 border-2 border-gray-500 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 cursor-pointer"
//                   onClick={() => toggleTable('mediumScores')}
//                 >
//                   <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{summaryCounts.medium}</p>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">{t('reports.medium_scores') || 'Medium Scores (1-3 Fails)'}</p>
//                 </motion.div>
//                 <motion.div
//                   className="text-center p-4 border-2 border-blue-500 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 cursor-pointer"
//                   onClick={() => toggleTable('totalChecks')}
//                 >
//                   <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summaryCounts.totalChecks}</p>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">{t('reports.total_checks') || 'Total Checks'}</p>
//                 </motion.div>
//                 <motion.div
//                   className="text-center p-4 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg shadow-sm cursor-pointer"
//                   onClick={() => toggleTable('passRate')}
//                 >
//                   <p className="text-2xl font-bold text-green-600 dark:text-green-400">{passRate}%</p>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">{t('reports.pass_percentage') || 'Pass Rate'}</p>
//                 </motion.div>
//                 <motion.div
//                   className="text-center p-4 border-2 border-orange-500 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 cursor-pointer"
//                   onClick={() => toggleTable('criticalSections')}
//                 >
//                   <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summaryCounts.criticalSections}</p>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">{t('reports.critical_sections') || 'Critical Sections'}</p>
//                 </motion.div>
//               </div>
//               {showTable.totalPass && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
//                 >
//                   <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{t('reports.total_pass') || 'Total Passes'} Details</h3>
//                   <table className="w-full text-sm text-gray-700 dark:text-gray-300">
//                     <thead>
//                       <tr className="bg-gray-100 dark:bg-gray-700">
//                         <th className="py-2 px-4 border-b">{t('reports.section') || 'Section'}</th>
//                         <th className="py-2 px-4 border-b">{t('reports.passes') || 'Passes'}</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {getPassDetails().map((item, index) => (
//                         <tr key={index} className="border-b dark:border-gray-600">
//                           <td className="py-2 px-4">{item.section}</td>
//                           <td className="py-2 px-4">{item.passes}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </motion.div>
//               )}
//               {showTable.totalFail && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
//                 >
//                   <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{t('reports.total_fail') || 'Total Fails'} Details</h3>
//                   <table className="w-full text-sm text-gray-700 dark:text-gray-300">
//                     <thead>
//                       <tr className="bg-gray-100 dark:bg-gray-700">
//                         <th className="py-2 px-4 border-b">{t('reports.section') || 'Section'}</th>
//                         <th className="py-2 px-4 border-b">{t('reports.fails') || 'Fails'}</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {getFailDetails().map((item, index) => (
//                         <tr key={index} className="border-b dark:border-gray-600">
//                           <td className="py-2 px-4">{item.section}</td>
//                           <td className="py-2 px-4">{item.fails}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </motion.div>
//               )}
//               {showTable.mediumScores && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
//                 >
//                   <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{t('reports.medium_scores') || 'Medium Scores'} Details</h3>
//                   <table className="w-full text-sm text-gray-700 dark:text-gray-300">
//                     <thead>
//                       <tr className="bg-gray-100 dark:bg-gray-700">
//                         <th className="py-2 px-4 border-b">{t('reports.section') || 'Section'}</th>
//                         <th className="py-2 px-4 border-b">{t('reports.score') || 'Score'}</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {getMediumDetails().map((item, index) => (
//                         <tr key={index} className="border-b dark:border-gray-600">
//                           <td className="py-2 px-4">{item.section}</td>
//                           <td className="py-2 px-4">{item.score}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </motion.div>
//               )}
//               {showTable.totalChecks && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
//                 >
//                   <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{t('reports.total_checks') || 'Total Checks'} Details</h3>
//                   <table className="w-full text-sm text-gray-700 dark:text-gray-300">
//                     <thead>
//                       <tr className="bg-gray-100 dark:bg-gray-700">
//                         <th className="py-2 px-4 border-b">{t('reports.section') || 'Section'}</th>
//                         <th className="py-2 px-4 border-b">{t('reports.total') || 'Total'}</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {getCheckDetails().map((item, index) => (
//                         <tr key={index} className="border-b dark:border-gray-600">
//                           <td className="py-2 px-4">{item.section}</td>
//                           <td className="py-2 px-4">{item.total}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </motion.div>
//               )}
//               {showTable.passRate && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
//                 >
//                   <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{t('reports.pass_percentage') || 'Pass Rate'} Details</h3>
//                   <table className="w-full text-sm text-gray-700 dark:text-gray-300">
//                     <thead>
//                       <tr className="bg-gray-100 dark:bg-gray-700">
//                         <th className="py-2 px-4 border-b">{t('reports.section') || 'Section'}</th>
//                         <th className="py-2 px-4 border-b">{t('reports.rate') || 'Rate (%)'}</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {getPassRateDetails().map((item, index) => (
//                         <tr key={index} className="border-b dark:border-gray-600">
//                           <td className="py-2 px-4">{item.section}</td>
//                           <td className="py-2 px-4">{item.rate}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </motion.div>
//               )}
//               {showTable.criticalSections && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
//                 >
//                   <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{t('reports.critical_sections') || 'Critical Sections'} Details</h3>
//                   <table className="w-full text-sm text-gray-700 dark:text-gray-300">
//                     <thead>
//                       <tr className="bg-gray-100 dark:bg-gray-700">
//                         <th className="py-2 px-4 border-b">{t('reports.section') || 'Section'}</th>
//                         <th className="py-2 px-4 border-b">{t('reports.score') || 'Score'}</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {getCriticalDetails().map((item, index) => (
//                         <tr key={index} className="border-b dark:border-gray-600">
//                           <td className="py-2 px-4">{item.section}</td>
//                           <td className="py-2 px-4">{item.score}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </motion.div>
//               )}
//             </div>

//             <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
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
//               </div>
//             </div>

//             {loading ? (
//               <LoadingSpinner />
//             ) : (
//               <>
//                 {reports.length === 0 ? (
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
//                       {reports.map((report) => {
//                         const reportId = report._id?.$oid || report.id;
//                         const { score, passCount, failCount, emptyCount, sectionFailCount, passFailTrend } = calculateReportScore(report);
//                         return (
//                           <motion.div
//                             key={reportId}
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ duration: 0.3 }}
//                             className="bg-white dark:bg-gray-900 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
//                             role="button"
//                             aria-label={`${t('reports.report_name') || 'Report'}: ${report.name}`}
//                             onClick={() => handleReportClick(report)}
//                             onKeyDown={(e) => {
//                               if (e.key === 'Enter' || e.key === ' ') handleReportClick(report);
//                             }}
//                             tabIndex={0}
//                           >
//                             <div className="space-y-4">
//                               <div className="flex justify-between items-center">
//                                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200">
//                                   {report.name || 'Unnamed Report'}
//                                 </h3>
//                                 <span
//                                   className={`text-sm font-medium px-3 py-1 rounded-full text-white ${
//                                     score === 10 ? 'bg-green-500' : score === 5 ? 'bg-gray-500' : 'bg-red-500'
//                                   } shadow-md`}
//                                 >
//                                   Score: {score}
//                                 </span>
//                               </div>
//                               <div className="flex gap-2 flex-wrap">
//                                 <span className="text-sm text-green-600 dark:text-green-400">
//                                   {passCount} ✅
//                                 </span>
//                                 <span className="text-sm text-red-600 dark:text-red-400">
//                                   {failCount} ❌
//                                 </span>
//                                 <span
//                                   className="text-sm font-medium px-2 py-1 rounded-full text-white bg-orange-500"
//                                   aria-label={t('reports.section_fails') || 'Failed Sections'}
//                                 >
//                                   {sectionFailCount} {t('reports.section_fails') || 'Failed Sections'}
//                                 </span>
//                                 <span
//                                   className="text-sm font-medium px-2 py-1 rounded-full text-white bg-yellow-500"
//                                   aria-label={t('reports.empty_scores') || 'Empty Scores'}
//                                 >
//                                   {emptyCount} {t('reports.empty_scores') || 'Empty Scores'}
//                                 </span>
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <span className="text-sm text-gray-600 dark:text-gray-400">
//                                   {t('reports.pass_fail_trend') || 'Pass/Fail Trend'}:
//                                 </span>
//                                 <Sparkline data={passFailTrend} width={80} height={20} />
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
//                               {report.signature_url && (
//                                 <div>
//                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                     {t('reports.signature') || 'Signature'}
//                                   </span>
//                                   {signatureUrls[reportId] === undefined ? (
//                                     <span className="text-gray-600 dark:text-gray-400">Loading signature...</span>
//                                   ) : signatureUrls[reportId] === null ? (
//                                     <span className="text-red-600 dark:text-red-400">Failed to load signature</span>
//                                   ) : (
//                                     <img
//                                       src={signatureUrls[reportId]}
//                                       alt="Signature"
//                                       className="w-24 h-auto object-contain rounded-md border border-gray-200 dark:border-gray-700 shadow-md mt-2 cursor-pointer hover:shadow-lg transition-shadow"
//                                       onError={(e) => (e.target.src = '/placeholder-image.png')}
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         handleReportClick(report);
//                                       }}
//                                     />
//                                   )}
//                                 </div>
//                               )}
//                             </div>
//                           </motion.div>
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
//                           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                             <button
//                               key={page}
//                               onClick={() => handlePageChange(page)}
//                               className={`px-4 py-2 rounded-lg ${
//                                 page === currentPage
//                                   ? 'bg-indigo-500 text-white'
//                                   : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
//                               } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
//                               aria-label={`Page ${page}`}
//                               aria-current={page === currentPage ? 'page' : undefined}
//                             >
//                               {page}
//                             </button>
//                           ))}
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
//                       </div>
//                     )}
//                     <AnimatePresence>
//                       {selectedReport && (
//                         <ReportModal
//                           report={selectedReport}
//                           onClose={() => {
//                             console.log('Closing modal');
//                             setSelectedReport(null);
//                           }}
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

// export default DeptChkListReport;

// Working befor tabel update 




import React, { useState, useEffect, useRef } from 'react';
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
import { AnimatePresence, motion } from 'framer-motion';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Correct section name typos
const correctSectionName = (name) => {
  const corrections = {
    Doores: 'Doors',
    'Equipment’s': 'Equipment',
  };
  return corrections[name] || name;
};

// Calculate section score
const calculateSectionScore = (subSection) => {
  console.log(`Calculating section score for: ${subSection?.name || 'Unnamed'}`);
  const failCount = (subSection.sub_sub_bodies || []).reduce((count, subSub) => {
    const failFields = (subSub.fields || []).filter(
      (field) => field.name === "score" && field.value === "Fail"
    );
    return count + failFields.length;
  }, 0);
  const passCount = (subSection.sub_sub_bodies || []).reduce((count, subSub) => {
    const passFields = (subSub.fields || []).filter(
      (field) => field.name === "score" && field.value === "Pass"
    );
    return count + passFields.length;
  }, 0);
  const score = failCount === 0 ? 10 : failCount <= 3 ? 5 : 0;
  return { score, failCount, passCount };
};

// Calculate report score
const calculateReportScore = (report) => {
  console.log(`Calculating report score for report ID: ${report._id?.$oid || report.id}`);
  const failCount = (report.structure?.body?.sub_bodies || []).reduce((total, subSection) => {
    const sectionFailCount = (subSection.sub_sub_bodies || []).reduce((count, subSub) => {
      const failFields = (subSub.fields || []).filter(
        (field) => field.name === "score" && field.value === "Fail"
      );
      return count + failFields.length;
    }, 0);
    return total + sectionFailCount;
  }, 0);
  const passCount = (report.structure?.body?.sub_bodies || []).reduce((total, subSection) => {
    const sectionPassCount = (subSection.sub_sub_bodies || []).reduce((count, subSub) => {
      const passFields = (subSub.fields || []).filter(
        (field) => field.name === "score" && field.value === "Pass"
      );
      return count + passFields.length;
    }, 0);
    return total + sectionPassCount;
  }, 0);
  const emptyCount = (report.structure?.body?.sub_bodies || []).reduce((total, subSection) => {
    const sectionEmptyCount = (subSection.sub_sub_bodies || []).reduce((count, subSub) => {
      const emptyFields = (subSub.fields || []).filter(
        (field) => field.name === "score" && field.value === ""
      );
      return count + emptyFields.length;
    }, 0);
    return total + sectionEmptyCount;
  }, 0);
  const sectionFailCount = (report.structure?.body?.sub_bodies || []).reduce((count, subSection) => {
    const sectionScore = calculateSectionScore(subSection).score;
    return count + (sectionScore === 0 ? 1 : 0);
  }, 0);
  const passFailTrend = (report.structure?.body?.sub_bodies || []).map((subSection) => {
    const { passCount, failCount } = calculateSectionScore(subSection);
    const total = passCount + failCount;
    return total > 0 ? passCount / total : 0;
  });
  return {
    score: failCount === 0 ? 10 : failCount <= 3 ? 5 : 0,
    failCount,
    passCount,
    emptyCount,
    sectionFailCount,
    passFailTrend
  };
};

// Custom arrows for the slider
const PrevArrow = ({ onClick }) => (
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

const NextArrow = ({ onClick }) => (
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

const ImageModal = ({ imageUrl, onClose, images = [], currentIndex = 0 }) => {
  const [index, setIndex] = useState(currentIndex);

  const nextImage = () => setIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

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
          className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
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
            const url = await readReportService.fetchImage(filename, accessToken);
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
          <p className="text-center text-gray-600 dark:text-gray-300 mt-2 text-sm">
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
                className="w-full h-64 object-contain rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 shadow-sm"
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
              <p className="text-center text-gray-600 dark:text-gray-300 mt-2 text-sm">
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

const ReportModal = ({ report, onClose, authData, t }) => {
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [signatureLoading, setSignatureLoading] = useState(false);
  const [signatureError, setSignatureError] = useState(null);
  const { language } = useLanguage();

  useEffect(() => {
    console.log('ReportModal opened with report ID:', report._id?.$oid || report.id);
    console.log('Report structure:', report.structure);
  }, [report]);

  // Calculate score, ignoring empty scores
  const calculateScore = (failCount) => {
    if (failCount === 0) return 10;
    if (failCount <= 3) return 5;
    return 0;
  };

  // Fetch signature image
  useEffect(() => {
    const fetchSignature = async () => {
      if (report.signature_url) {
        setSignatureLoading(true);
        try {
          const filename = report.signature_url.split('/').pop();
          const url = await readReportService.fetchImage(filename, authData.access_token);
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
      return (
        <span className="flex items-center gap-1">
          {field.value === 'Pass' && <span role="img" aria-label="Pass">✅</span>}
          {field.value === 'Fail' && <span role="img" aria-label="Fail">❌</span>}
          {field.value || t('reports.unknown') || 'N/A'}
        </span>
      );
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
    console.log(`Rendering section: ${section}, subSections length: ${subSections?.length || 0}`);
    if (!subSections || !Array.isArray(subSections) || subSections.length === 0) {
      console.log(`No valid subSections for ${section}`);
      return null;
    }

    const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';

    const filteredSubSections = subSections
      .map((sub) => {
        if (!sub) return null;
        const filteredFields = (sub.fields || []).filter(hasMeaningfulValue);
        const filteredSubSub = (sub[subSubKey] || [])
          .map((subSub) => {
            if (!subSub) return null;
            const filteredSubSubFields = (subSub.fields || []).filter(hasMeaningfulValue);
            return filteredSubSubFields.length > 0 ? { ...subSub, fields: filteredSubSubFields } : null;
          })
          .filter(Boolean);

        return (filteredFields.length > 0 || filteredSubSub.length > 0)
          ? { ...sub, fields: filteredFields, [subSubKey]: filteredSubSub }
          : null;
      })
      .filter(Boolean);

    if (filteredSubSections.length === 0) {
      console.log(`No filtered subSections for ${section}`);
      return null;
    }

    return (
      <div className={`mb-6 p-6 rounded-xl shadow-md ${
        section === 'header' ? 'bg-indigo-50 dark:bg-indigo-900' :
        section === 'body' ? 'bg-gray-50 dark:bg-gray-800' :
        'bg-blue-50 dark:bg-blue-900'
      }`}>
        {filteredSubSections.map((sub, subIndex) => {
          console.log(`Rendering subSection: ${sub.name}, subSubKey: ${subSubKey}`);
          const { score, passCount, failCount } = calculateSectionScore(sub);
          const total = passCount + failCount;
          const passPercentage = total > 0 ? (passCount / total) * 100 : 0;
          return (
            <div
              key={`${sectionKey}-${subIndex}`}
              className="border border-gray-200 dark:border-gray-600 p-5 rounded-lg mb-4 bg-gray-100 dark:bg-gray-700 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xl font-medium text-gray-800 dark:text-gray-100">
                  {correctSectionName(sub.name || 'Unnamed Section')}
                </h5>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full text-white ${
                    score === 10 ? 'bg-green-500' : score === 5 ? 'bg-gray-500' : 'bg-red-500'
                  }`}
                >
                  {t('reports.score') || 'Score'}: {score}
                </span>
              </div>
              {total > 0 && (
                <div className="mb-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: `${passPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {passCount} {t('reports.pass') || 'Pass'} ✅ / {failCount} {t('reports.fail') || 'Fail'} ❌
                  </p>
                </div>
              )}
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
              {sub[subSubKey]?.length > 0 && (
                <div>
                  {sub[subSubKey].map((subSub, subSubIndex) => (
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
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const { score, passCount, failCount, emptyCount } = calculateReportScore(report);

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
            <div className="flex items-center gap-4">
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full text-white ${
                  score === 10 ? 'bg-green-500' : score === 5 ? 'bg-gray-500' : 'bg-red-500'
                }`}
              >
                {t('reports.overall_score') || 'Overall Score'}: {score}
              </span>
              <button
                onClick={() => {
                  console.log('Closing modal');
                  onClose();
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-2"
                aria-label={t('reports.close') || 'Close'}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
              <h4 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">
                {t('reports.summary') || 'Summary'}
              </h4>
              <div className="flex gap-4">
                <div className="flex-1 text-center p-3 border-2 border-green-500 rounded-md">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{passCount}</p>
                  <p className="text-base text-gray-600 dark:text-gray-400">{t('reports.pass') || 'Pass'} ✅</p>
                </div>
                <div className="flex-1 text-center p-3 border-2 border-red-500 rounded-md">
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">{failCount}</p>
                  <p className="text-base text-gray-600 dark:text-gray-400">{t('reports.fail') || 'Fail'} ❌</p>
                </div>
              </div>
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
              {t('reports.template_id') || 'Template ID'}: {report.template_id || t('reports.unknown') || 'N/A'}
            </p>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
              {t('reports.report_type') || 'Report Type'}: {report.reportType || t('reports.unknown') || 'N/A'}
            </p>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
              {t('reports.created_by') || 'Created By'}: {report.user_created_name || t('reports.unknown') || 'Unknown'}
            </p>
            {report.created_at && (
              <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
                {t('reports.created_at') || 'Created At'}: {format(new Date(report.created_at), 'PPP')}
              </p>
            )}
            <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
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
            {report.signature_url && (
              <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
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
                    onError={(e) => (e.target.src = '/placeholder-image.png')}
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

const Sparkline = ({ data, width = 100, height = 30 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;

    const max = Math.max(...data, 1);
    const stepX = width / (data.length - 1);
    data.forEach((value, i) => {
      const x = i * stepX;
      const y = height - (value / max) * (height - 5);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }, [data, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="inline-block"
      aria-label="Pass/Fail trend"
    />
  );
};

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

const DeptChkListReport = () => {
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
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [signatureUrls, setSignatureUrls] = useState({});
  const [showTable, setShowTable] = useState({
    totalPass: false,
    totalFail: false,
    mediumScores: false,
    totalChecks: false,
    passRate: false,
    criticalSections: false,
  });

  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('reports.no_permission') || 'No permission to view reports');
      setLoading(false);
      return;
    }

    if (authData.privilege_ids?.includes(1)) {
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
      const response = await readReportService.getReports(authData.org_id, {
        page: currentPage,
        perPage,
        reportType: "Score Reports",
        sort: filters.sort,
        lang: language || 'en',
      });
      const filteredReports = response.data.filter((report) => report.reportType === "Score Reports");
      console.log('Fetched reports:', response.data);
      console.log('Filtered reports:', filteredReports);
      setReports(Array.isArray(filteredReports) ? filteredReports : []);
      setTotalPages(response.pagination?.total_pages || 1);

      const uniqueReportTypes = filteredReports
        ? [...new Set(filteredReports.map((report) => report.reportType).filter(Boolean))]
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

    setFilteredReports(filtered);
  }, [reports, searchQuery, filters.startDate, filters.endDate]);

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

  const summaryCounts = reports.reduce(
    (acc, report) => {
      const { score, passCount, failCount, emptyCount, sectionFailCount } = calculateReportScore(report);
      if (score === 10) acc.pass++;
      else if (score === 5) acc.medium++;
      else acc.fail++;
      acc.totalPass += passCount;
      acc.totalFail += failCount;
      acc.totalChecks += passCount + failCount;
      acc.criticalSections += sectionFailCount;
      return acc;
    },
    { pass: 0, medium: 0, fail: 0, totalPass: 0, totalFail: 0, totalChecks: 0, criticalSections: 0 }
  );

  const passRate = summaryCounts.totalChecks > 0 ? ((summaryCounts.totalPass / summaryCounts.totalChecks) * 100).toFixed(1) : 0;

  const toggleTable = (type) => {
    console.log(`Toggling table for: ${type}`);
    setShowTable((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleReportClick = (report) => {
    console.log('Card clicked, setting selectedReport:', report._id?.$oid || report.id);
    setSelectedReport({ ...report });
  };

  const getPassDetails = () => {
    const details = [];
    reports.forEach((report) => {
      (report.structure?.body?.sub_bodies || []).forEach((subSection) => {
        const { passCount } = calculateSectionScore(subSection);
        if (passCount > 0) {
          details.push({ section: correctSectionName(subSection.name || 'Unnamed'), passes: passCount });
        }
      });
    });
    return details;
  };

  const getFailDetails = () => {
    const details = [];
    reports.forEach((report) => {
      (report.structure?.body?.sub_bodies || []).forEach((subSection) => {
        const { failCount } = calculateSectionScore(subSection);
        if (failCount > 0) {
          details.push({ section: correctSectionName(subSection.name || 'Unnamed'), fails: failCount });
        }
      });
    });
    return details;
  };

  const getMediumDetails = () => {
    const details = [];
    reports.forEach((report) => {
      (report.structure?.body?.sub_bodies || []).forEach((subSection) => {
        const { score } = calculateSectionScore(subSection);
        if (score === 5) {
          details.push({ section: correctSectionName(subSection.name || 'Unnamed'), score });
        }
      });
    });
    return details;
  };

  const getCheckDetails = () => {
    const details = [];
    reports.forEach((report) => {
      (report.structure?.body?.sub_bodies || []).forEach((subSection) => {
        const { passCount, failCount } = calculateSectionScore(subSection);
        const total = passCount + failCount;
        if (total > 0) {
          details.push({ section: correctSectionName(subSection.name || 'Unnamed'), total });
        }
      });
    });
    return details;
  };

  const getPassRateDetails = () => {
    const details = [];
    reports.forEach((report) => {
      (report.structure?.body?.sub_bodies || []).forEach((subSection) => {
        const { passCount, failCount } = calculateSectionScore(subSection);
        const total = passCount + failCount;
        const rate = total > 0 ? ((passCount / total) * 100).toFixed(1) : 0;
        if (total > 0) {
          details.push({ section: correctSectionName(subSection.name || 'Unnamed'), rate });
        }
      });
    });
    return details;
  };

  const getCriticalDetails = () => {
    const details = [];
    reports.forEach((report) => {
      (report.structure?.body?.sub_bodies || []).forEach((subSection) => {
        const { score } = calculateSectionScore(subSection);
        if (score === 0) {
          details.push({ section: correctSectionName(subSection.name || 'Unnamed'), score });
        }
      });
    });
    return details;
  };

  if (authLoading || !authData || loading) {
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
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                {t('reports.dept_checklist_f') || 'Department Checklist F Reports'}
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
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm relative mb-6"
                role="alert"
              >
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
            <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{t('reports.report_summary') || 'Report Summary'}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                  className="text-center p-4 border-2 border-green-500 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 cursor-pointer"
                  onClick={() => toggleTable('totalPass')}
                >
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summaryCounts.totalPass}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('reports.total_pass') || 'Total Passes'} ✅</p>
                </motion.div>
                <motion.div
                  className="text-center p-4 border-2 border-red-500 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 cursor-pointer"
                  onClick={() => toggleTable('totalFail')}
                >
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summaryCounts.totalFail}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('reports.total_fail') || 'Total Fails'} ❌</p>
                </motion.div>
                <motion.div
                  className="text-center p-4 border-2 border-gray-500 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 cursor-pointer"
                  onClick={() => toggleTable('mediumScores')}
                >
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{summaryCounts.medium}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('reports.medium_scores') || 'Medium Scores (1-3 Fails)'}</p>
                </motion.div>
                <motion.div
                  className="text-center p-4 border-2 border-blue-500 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 cursor-pointer"
                  onClick={() => toggleTable('totalChecks')}
                >
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summaryCounts.totalChecks}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('reports.total_checks') || 'Total Checks'}</p>
                </motion.div>
                <motion.div
                  className="text-center p-4 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg shadow-sm cursor-pointer"
                  onClick={() => toggleTable('passRate')}
                >
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{passRate}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('reports.pass_percentage') || 'Pass Rate'}</p>
                </motion.div>
                <motion.div
                  className="text-center p-4 border-2 border-orange-500 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900 cursor-pointer"
                  onClick={() => toggleTable('criticalSections')}
                >
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summaryCounts.criticalSections}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('reports.critical_sections') || 'Critical Sections'}</p>
                </motion.div>
              </div>
              {showTable.totalPass && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{t('reports.total_pass') || 'Total Passes'} {t('reports.details') || 'Details'}</h3>
                  <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="py-2 px-4 border-b">{t('reports.section') || 'Section'}</th>
                        <th className="py-2 px-4 border-b">{t('reports.passes') || 'Passes'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPassDetails().map((item, index) => (
                        <tr key={index} className="border-b dark:border-gray-600">
                          <td className="py-2 px-4">{item.section}</td>
                          <td className="py-2 px-4">{item.passes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
              {showTable.totalFail && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{t('reports.total_fail') || 'Total Fails'} {t('reports.details') || 'Details'}</h3>
                  <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="py-2 px-4 border-b">{t('reports.section') || 'Section'}</th>
                        <th className="py-2 px-4 border-b">{t('reports.fails') || 'Fails'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFailDetails().map((item, index) => (
                        <tr key={index} className="border-b dark:border-gray-600">
                          <td className="py-2 px-4">{item.section}</td>
                          <td className="py-2 px-4">{item.fails}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
              {showTable.mediumScores && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{t('reports.medium_scores') || 'Medium Scores'} {t('reports.details') || 'Details'}</h3>
                  <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="py-2 px-4 border-b">{t('reports.section') || 'Section'}</th>
                        <th className="py-2 px-4 border-b">{t('reports.score') || 'Score'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getMediumDetails().map((item, index) => (
                        <tr key={index} className="border-b dark:border-gray-600">
                          <td className="py-2 px-4">{item.section}</td>
                          <td className="py-2 px-4">{item.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
              {showTable.totalChecks && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{t('reports.total_checks') || 'Total Checks'} {t('reports.details') || 'Details'}</h3>
                  <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="py-2 px-4 border-b">{t('reports.section') || 'Section'}</th>
                        <th className="py-2 px-4 border-b">{t('reports.total') || 'Total'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCheckDetails().map((item, index) => (
                        <tr key={index} className="border-b dark:border-gray-600">
                          <td className="py-2 px-4">{item.section}</td>
                          <td className="py-2 px-4">{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
              {showTable.passRate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{t('reports.pass_percentage') || 'Pass Rate'} {t('reports.details') || 'Details'}</h3>
                  <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="py-2 px-4 border-b">{t('reports.section') || 'Section'}</th>
                        <th className="py-2 px-4 border-b">{t('reports.rate') || 'Rate (%)'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPassRateDetails().map((item, index) => (
                        <tr key={index} className="border-b dark:border-gray-600">
                          <td className="py-2 px-4">{item.section}</td>
                          <td className="py-2 px-4">{item.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
              {showTable.criticalSections && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{t('reports.critical_sections') || 'Critical Sections'} {t('reports.details') || 'Details'}</h3>
                  <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="py-2 px-4 border-b">{t('reports.section') || 'Section'}</th>
                        <th className="py-2 px-4 border-b">{t('reports.score') || 'Score'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCriticalDetails().map((item, index) => (
                        <tr key={index} className="border-b dark:border-gray-600">
                          <td className="py-2 px-4">{item.section}</td>
                          <td className="py-2 px-4">{item.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </div>
            <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{t('reports.filters') || 'Filters'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reports.start_date') || 'Start Date'}</label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reports.end_date') || 'End Date'}</label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reports.report_type') || 'Report Type'}</label>
                  <select
                    name="reportType"
                    value={filters.reportType}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  >
                    <option value="">{t('reports.all_report_types') || 'All Report Types'}</option>
                    {reportTypes.map((type) => (
                      <option key={type._id} value={type.name}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reports.sort') || 'Sort'}</label>
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
                          const { score, passCount, failCount, emptyCount, sectionFailCount, passFailTrend } = calculateReportScore(report);
                          return (
                            <motion.div
                              key={reportId}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                              role="button"
                              aria-label={`${t('reports.report_name') || 'Report'}: ${report.name}`}
                              onClick={() => handleReportClick(report)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') handleReportClick(report);
                              }}
                              tabIndex={0}
                            >
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200">
                                    {report.name || 'Unnamed Report'}
                                  </h3>
                                  <span
                                    className={`text-sm font-medium px-3 py-1 rounded-full text-white ${
                                      score === 10 ? 'bg-green-500' : score === 5 ? 'bg-gray-500' : 'bg-red-500'
                                    }`}
                                  >
                                    {t('reports.score') || 'Score'}: {score}
                                  </span>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  <span className="text-sm text-green-600 dark:text-green-400">{passCount} ✅</span>
                                  <span className="text-sm text-red-600 dark:text-red-400">{failCount} ❌</span>
                                  <span
                                    className="text-sm font-medium px-2 py-1 rounded-full text-white bg-orange-500"
                                    aria-label={t('reports.section_fails') || 'Failed Sections'}
                                  >
                                    {sectionFailCount} {t('reports.section_fails') || 'Failed Sections'}
                                  </span>
                                  <span
                                    className="text-sm font-medium px-2 py-1 rounded-full text-white bg-yellow-500"
                                    aria-label={t('reports.empty_scores') || 'Empty Scores'}
                                  >
                                    {emptyCount} {t('reports.empty_scores') || 'Empty Scores'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {t('reports.pass_fail_trend') || 'Pass/Fail Trend'}:
                                  </span>
                                  <Sparkline data={passFailTrend} width={80} height={20} />
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
                                        onError={(e) => (e.target.src = '/placeholder-image.png')}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleReportClick(report);
                                        }}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            </motion.div>
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
                          {[5, 10, 15, 50, 75, 100, 200].map((value) => (
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
                          onClose={() => {
                            console.log('Closing modal');
                            setSelectedReport(null);
                          }}
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

export default DeptChkListReport;