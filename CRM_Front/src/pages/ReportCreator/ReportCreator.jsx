
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import ModalSearch from '../../components/ModalSearch';
// import ThemeToggle from '../../components/ThemeToggle';
// import LanguageToggle from '../../components/LanguageToggle';
// import reportService from '../../lib/reportService';

// const ReportCreator = () => {
//   const { authData, loading: authLoading } = useAuth();
//   const { language, t } = useLanguage();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [hasPrivilege, setHasPrivilege] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [template, setTemplate] = useState(null);
//   const [templates, setTemplates] = useState([]);
//   const [selectedTemplateId, setSelectedTemplateId] = useState('');
//   const [reportData, setReportData] = useState({
//     header: { sub_headers: [] },
//     body: { sub_bodies: [] },
//     footer: { sub_footers: [] },
//     reportType: '',
//     name: '',
//   });
//   const [reportResult, setReportResult] = useState('');
//   const [mainLocations, setMainLocations] = useState([]);
//   const [locationsQa, setLocationsQa] = useState([]);
//   const [sectionsQa, setSectionsQa] = useState([]);
//   const [subSectionsQa, setSubSectionsQa] = useState([]);
//   const [selectedMainLocationId, setSelectedMainLocationId] = useState('');
//   const [selectedLocationsQaId, setSelectedLocationsQaId] = useState('');
//   const [selectedSectionQaId, setSelectedSectionQaId] = useState('');
//   const [selectedSubSectionQaId, setSelectedSubSectionQaId] = useState('');
//   const [imagePreviews, setImagePreviews] = useState({});

//   useEffect(() => {
//     if (authLoading) return;

//     if (!authData?.access_token) {
//       setError(t('reports.no_permission'));
//       setLoading(false);
//       return;
//     }

//     if (authData.privilege_ids.includes(1)) {
//       setHasPrivilege(true);
//       fetchTemplateNames();
//       fetchMainLocations();
//     } else {
//       setError(t('reports.no_permission'));
//       setHasPrivilege(false);
//       setLoading(false);
//     }
//   }, [authData, authLoading, t]);

//   const fetchTemplateNames = async () => {
//     try {
//       const templates = await reportService.getTemplateNames();
//       setTemplates(templates);
//       setLoading(false);
//     } catch (err) {
//       setError(t('reports.fetch_template_names_error', { message: err.message }));
//       setLoading(false);
//     }
//   };

//   const fetchTemplate = async (templateId) => {
//     try {
//       const data = await reportService.fetchTemplate(templateId);
//       setTemplate(data);
//       const initialReportData = {
//         header: {
//           sub_headers: data?.structure?.header?.sub_headers?.map((sub) => ({
//             name: sub.name,
//             fields: sub.fields.map((field) => ({
//               name: field.name,
//               type: field.type,
//               value:
//                 field.type === 'checkbox' || field.type === 'array'
//                   ? []
//                   : field.type === 'image' ||
//                     field.type === 'multi_image' ||
//                     field.type === 'PDF' ||
//                     field.type === 'radio' ||
//                     field.type === 'Date' ||
//                     field.type === 'DateTime' ||
//                     field.type === 'Time'
//                   ? ''
//                   : field.type === 'dropdown'
//                   ? field.options?.[0] || ''
//                   : '',
//             })),
//             sub_sub_headers: sub.sub_sub_headers?.map((subSub) => ({
//               name: subSub.name,
//               fields: subSub.fields.map((field) => ({
//                 name: field.name,
//                 type: field.type,
//                 value:
//                   field.type === 'checkbox' || field.type === 'array'
//                     ? []
//                     : field.type === 'image' ||
//                       field.type === 'multi_image' ||
//                       field.type === 'PDF' ||
//                       field.type === 'radio' ||
//                       field.type === 'Date' ||
//                       field.type === 'DateTime' ||
//                       field.type === 'Time'
//                     ? ''
//                     : field.type === 'dropdown'
//                     ? field.options?.[0] || ''
//                     : '',
//               })),
//             })) || [],
//           })) || [],
//         },
//         body: {
//           sub_bodies: data?.structure?.body?.sub_bodies?.map((sub) => ({
//             name: sub.name,
//             fields: sub.fields.map((field) => ({
//               name: field.name,
//               type: field.type,
//               value:
//                 field.type === 'checkbox' || field.type === 'array'
//                   ? []
//                   : field.type === 'image' ||
//                     field.type === 'multi_image' ||
//                     field.type === 'PDF' ||
//                     field.type === 'radio' ||
//                     field.type === 'Date' ||
//                     field.type === 'DateTime' ||
//                     field.type === 'Time'
//                   ? ''
//                   : field.type === 'dropdown'
//                   ? field.options?.[0] || ''
//                   : '',
//             })),
//             sub_sub_bodies: sub.sub_sub_bodies?.map((subSub) => ({
//               name: subSub.name,
//               fields: subSub.fields.map((field) => ({
//                 name: field.name,
//                 type: field.type,
//                 value:
//                   field.type === 'checkbox' || field.type === 'array'
//                     ? []
//                     : field.type === 'image' ||
//                       field.type === 'multi_image' ||
//                       field.type === 'PDF' ||
//                       field.type === 'radio' ||
//                       field.type === 'Date' ||
//                       field.type === 'DateTime' ||
//                       field.type === 'Time'
//                     ? ''
//                     : field.type === 'dropdown'
//                     ? field.options?.[0] || ''
//                     : '',
//               })),
//             })) || [],
//           })) || [],
//         },
//         footer: {
//           sub_footers: data?.structure?.footer?.sub_footers?.map((sub) => ({
//             name: sub.name,
//             fields: sub.fields.map((field) => ({
//               name: field.name,
//               type: field.type,
//               value:
//                 field.type === 'checkbox' || field.type === 'array'
//                   ? []
//                   : field.type === 'image' ||
//                     field.type === 'multi_image' ||
//                     field.type === 'PDF' ||
//                     field.type === 'radio' ||
//                     field.type === 'Date' ||
//                     field.type === 'DateTime' ||
//                     field.type === 'Time'
//                   ? ''
//                   : field.type === 'dropdown'
//                   ? field.options?.[0] || ''
//                   : '',
//             })),
//             sub_sub_footers: sub.sub_sub_footers?.map((subSub) => ({
//               name: subSub.name,
//               fields: subSub.fields.map((field) => ({
//                 name: field.name,
//                 type: field.type,
//                 value:
//                   field.type === 'checkbox' || field.type === 'array'
//                     ? []
//                     : field.type === 'image' ||
//                       field.type === 'multi_image' ||
//                       field.type === 'PDF' ||
//                       field.type === 'radio' ||
//                       field.type === 'Date' ||
//                       field.type === 'DateTime' ||
//                       field.type === 'Time'
//                     ? ''
//                     : field.type === 'dropdown'
//                     ? field.options?.[0] || ''
//                     : '',
//               })),
//             })) || [],
//           })) || [],
//         },
//         reportType: data.reportType || '',
//         name: data.name || '',
//       };
//       setReportData(initialReportData);
//       setImagePreviews({});
//       console.log('Initial reportData set:', JSON.stringify(initialReportData, null, 2));
//     } catch (err) {
//       setError(t('reports.fetch_template_error', { message: err.message }));
//     }
//   };

//   useEffect(() => {
//     if (selectedTemplateId) {
//       fetchTemplate(selectedTemplateId);
//     } else {
//       setTemplate(null);
//       setReportData({
//         header: { sub_headers: [] },
//         body: { sub_bodies: [] },
//         footer: { sub_footers: [] },
//         reportType: '',
//         name: '',
//       });
//       setImagePreviews({});
//     }
//   }, [selectedTemplateId]);

//   const fetchMainLocations = async () => {
//     try {
//       const data = await reportService.getMainLocations(authData.org_id);
//       setMainLocations(data);
//     } catch (err) {
//       setError(t('reports.fetch_main_locations_error', { message: err.message }));
//     }
//   };

//   useEffect(() => {
//     if (selectedMainLocationId) {
//       reportService.getLocationsQa({ orgId: authData.org_id, mainLocationId: selectedMainLocationId })
//         .then((data) => {
//           setLocationsQa(data);
//           setSelectedLocationsQaId('');
//           setSectionsQa([]);
//           setSelectedSectionQaId('');
//           setSubSectionsQa([]);
//           setSelectedSubSectionQaId('');
//         })
//         .catch((err) => {
//           setError(t('reports.fetch_locations_qa_error', { message: err.message }));
//         });
//     } else {
//       setLocationsQa([]);
//       setSelectedLocationsQaId('');
//       setSectionsQa([]);
//       setSelectedSectionQaId('');
//       setSubSectionsQa([]);
//       setSelectedSubSectionQaId('');
//     }
//   }, [selectedMainLocationId, authData?.org_id, t]);

//   useEffect(() => {
//     if (selectedLocationsQaId) {
//       reportService.getSectionsQa({ orgId: authData.org_id, locationsQaId: selectedLocationsQaId })
//         .then((data) => {
//           setSectionsQa(data);
//           setSelectedSectionQaId('');
//           setSubSectionsQa([]);
//           setSelectedSubSectionQaId('');
//         })
//         .catch((err) => {
//           setError(t('reports.fetch_sections_qa_error', { message: err.message }));
//         });
//     } else {
//       setSectionsQa([]);
//       setSelectedSectionQaId('');
//       setSubSectionsQa([]);
//       setSelectedSubSectionQaId('');
//     }
//   }, [selectedLocationsQaId, authData?.org_id, t]);

//   useEffect(() => {
//     if (selectedSectionQaId) {
//       reportService.getSubSectionsQa({ orgId: authData.org_id, sectionQaId: selectedSectionQaId })
//         .then((data) => {
//           setSubSectionsQa(data);
//           setSelectedSubSectionQaId('');
//         })
//         .catch((err) => {
//           setError(t('reports.fetch_sub_sections_qa_error', { message: err.message }));
//         });
//     } else {
//       setSubSectionsQa([]);
//       setSelectedSubSectionQaId('');
//     }
//   }, [selectedSectionQaId, authData?.org_id, t]);

//   const handleFieldChange = (section, subIndex, fieldIndex, value, isCheckbox = false, isRadio = false, subSubIndex = null) => {
//     setReportData((prev) => {
//       const sectionKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
//       const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
//       const updatedSection = { ...prev[section] };
//       const updatedSubSections = [...updatedSection[sectionKey]];

//       if (subSubIndex !== null) {
//         const updatedSubSection = { ...updatedSubSections[subIndex] };
//         const updatedSubSubSections = [...(updatedSubSection[subSubKey] || [])];
//         const updatedSubSubSection = { ...updatedSubSubSections[subSubIndex] };
//         const updatedFields = [...updatedSubSubSection.fields];
//         const field = { ...updatedFields[fieldIndex] };

//         if (isCheckbox) {
//           const currentValues = Array.isArray(field.value) ? [...field.value] : [];
//           field.value = currentValues.includes(value)
//             ? currentValues.filter((v) => v !== value)
//             : [...currentValues, value];
//           console.log(`Checkbox updated - ${section}.${sectionKey}[${subIndex}].${subSubKey}[${subSubIndex}].fields[${fieldIndex}].value:`, field.value);
//         } else if (isRadio || field.type === 'dropdown') {
//           field.value = value;
//           console.log(`${field.type} updated - ${section}.${sectionKey}[${subIndex}].${subSubKey}[${subSubIndex}].fields[${fieldIndex}].value:`, value);
//         } else if (field.type === 'image') {
//           const file = value[0];
//           field.value = file ? URL.createObjectURL(file) : '';
//           setImagePreviews((prev) => ({
//             ...prev,
//             [`${section}_${subIndex}_${subSubIndex}_${fieldIndex}`]: field.value,
//           }));
//           console.log(`Image updated - ${section}.${sectionKey}[${subIndex}].${subSubKey}[${subSubIndex}].fields[${fieldIndex}].value:`, field.value);
//         } else if (field.type === 'multi_image') {
//           const files = Array.from(value);
//           field.value = files.map((file) => URL.createObjectURL(file));
//           setImagePreviews((prev) => ({
//             ...prev,
//             [`${section}_${subIndex}_${subSubIndex}_${fieldIndex}`]: field.value,
//           }));
//           console.log(`Multi-image updated - ${section}.${sectionKey}[${subIndex}].${subSubKey}[${subSubIndex}].fields[${fieldIndex}].value:`, field.value);
//         } else if (field.type === 'PDF') {
//           const file = value[0];
//           field.value = file ? URL.createObjectURL(file) : '';
//           console.log(`PDF updated - ${section}.${sectionKey}[${subIndex}].${subSubKey}[${subSubIndex}].fields[${fieldIndex}].value:`, field.value);
//         } else {
//           field.value = value;
//           console.log(`Field updated - ${section}.${sectionKey}[${subIndex}].${subSubKey}[${subSubIndex}].fields[${fieldIndex}].value:`, value);
//         }

//         updatedFields[fieldIndex] = field;
//         updatedSubSubSection.fields = updatedFields;
//         updatedSubSubSections[subSubIndex] = updatedSubSubSection;
//         updatedSubSection[subSubKey] = updatedSubSubSections;
//         updatedSubSections[subIndex] = updatedSubSection;
//       } else {
//         const updatedSubSection = { ...updatedSubSections[subIndex] };
//         const updatedFields = [...updatedSubSection.fields];
//         const field = { ...updatedFields[fieldIndex] };

//         if (isCheckbox) {
//           const currentValues = Array.isArray(field.value) ? [...field.value] : [];
//           field.value = currentValues.includes(value)
//             ? currentValues.filter((v) => v !== value)
//             : [...currentValues, value];
//           console.log(`Checkbox updated - ${section}.${sectionKey}[${subIndex}].fields[${fieldIndex}].value:`, field.value);
//         } else if (isRadio || field.type === 'dropdown') {
//           field.value = value;
//           console.log(`${field.type} updated - ${section}.${sectionKey}[${subIndex}].fields[${fieldIndex}].value:`, value);
//         } else if (field.type === 'image') {
//           const file = value[0];
//           field.value = file ? URL.createObjectURL(file) : '';
//           setImagePreviews((prev) => ({
//             ...prev,
//             [`${section}_${subIndex}_${fieldIndex}`]: field.value,
//           }));
//           console.log(`Image updated - ${section}.${sectionKey}[${subIndex}].fields[${fieldIndex}].value:`, field.value);
//         } else if (field.type === 'multi_image') {
//           const files = Array.from(value);
//           field.value = files.map((file) => URL.createObjectURL(file));
//           setImagePreviews((prev) => ({
//             ...prev,
//             [`${section}_${subIndex}_${fieldIndex}`]: field.value,
//           }));
//           console.log(`Multi-image updated - ${section}.${sectionKey}[${subIndex}].fields[${fieldIndex}].value:`, field.value);
//         } else if (field.type === 'PDF') {
//           const file = value[0];
//           field.value = file ? URL.createObjectURL(file) : '';
//           console.log(`PDF updated - ${section}.${sectionKey}[${subIndex}].fields[${fieldIndex}].value:`, field.value);
//         } else {
//           field.value = value;
//           console.log(`Field updated - ${section}.${sectionKey}[${subIndex}].fields[${fieldIndex}].value:`, value);
//         }

//         updatedFields[fieldIndex] = field;
//         updatedSubSection.fields = updatedFields;
//         updatedSubSections[subIndex] = updatedSubSection;
//       }

//       updatedSection[sectionKey] = updatedSubSections;

//       return {
//         ...prev,
//         [section]: updatedSection,
//       };
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('reports.no_permission'));
//       return;
//     }
//     if (!selectedTemplateId) {
//       setError(t('reports.select_template'));
//       return;
//     }
//     if (!selectedMainLocationId || !selectedLocationsQaId || !selectedSectionQaId || !selectedSubSectionQaId) {
//       setError(t('reports.select_location_details'));
//       return;
//     }

//     const orgId = parseInt(authData.org_id, 10);
//     if (isNaN(orgId)) {
//       setError(t('reports.invalid_org_id') || 'Invalid organization ID');
//       return;
//     }

//     const selectedTemplate = templates.find((temp) => temp._id === selectedTemplateId);
//     const report = {
//       name: reportData.name || selectedTemplate?.name || 'Untitled Report',
//       reportType: reportData.reportType || selectedTemplate?.reportType || 'Unknown',
//       template_id: selectedTemplateId,
//       created_by: authData.user_id || 'user_001',
//       structure: {
//         ...reportData,
//         location_details: {
//           main_location_id: selectedMainLocationId,
//           locations_qa_id: selectedLocationsQaId,
//           section_qa_id: selectedSectionQaId,
//           sub_section_qa_id: selectedSubSectionQaId,
//         },
//       },
//       org_id: orgId,
//     };

//     console.log('Submitting report:', JSON.stringify(report, null, 2));

//     try {
//       const result = await reportService.createReport(report, orgId);
//       setReportResult(t('reports.created_success', { id: result.insertedId }));
//       setError('');
//       setSelectedTemplateId('');
//       setTemplate(null);
//       setReportData({
//         header: { sub_headers: [] },
//         body: { sub_bodies: [] },
//         footer: { sub_footers: [] },
//         reportType: '',
//         name: '',
//       });
//       setSelectedMainLocationId('');
//       setSelectedLocationsQaId('');
//       setSelectedSectionQaId('');
//       setSelectedSubSectionQaId('');
//       setImagePreviews({});
//     } catch (err) {
//       setError(t('reports.create_error', { message: err.message }));
//       setReportResult('');
//     }
//   };

//   const renderSection = (section, subSections, sectionKey) => (
//     <div className="mb-6">
//       <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
//         {t(`templates.${section}`)}
//       </h3>
//       {subSections.map((sub, subIndex) => (
//         <div key={sub.name} className="border p-4 rounded-md mb-4 bg-gray-50 dark:bg-gray-700">
//           <h4 className="text-md font-medium mb-2 text-gray-800 dark:text-gray-100">{sub.name}</h4>
//           <div className="space-y-4">
//             {sub.fields.map((field, fieldIndex) => (
//               <div key={field.name} className="flex flex-col">
//                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   {field.name}
//                 </label>
//                 {field.type === 'text' ? (
//                   <input
//                     type="text"
//                     value={field.value || ''}
//                     onChange={(e) =>
//                       handleFieldChange(section, subIndex, fieldIndex, e.target.value)
//                     }
//                     className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                 ) : field.type === 'checkbox' || field.type === 'array' ? (
//                   <div className="flex flex-wrap gap-4">
//                     {template?.structure[section][sectionKey][subIndex].fields[fieldIndex].options?.map(
//                       (option) => (
//                         <label key={option} className="inline-flex items-center">
//                           <input
//                             type="checkbox"
//                             checked={Array.isArray(field.value) && field.value.includes(option)}
//                             onChange={() =>
//                               handleFieldChange(section, subIndex, fieldIndex, option, true)
//                             }
//                             className="h-4 w-4 text-indigo-600 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 focus:ring-indigo-500"
//                           />
//                           <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option}</span>
//                         </label>
//                       )
//                     )}
//                   </div>
//                 ) : field.type === 'dropdown' ? (
//                   <select
//                     value={field.value || ''}
//                     onChange={(e) =>
//                       handleFieldChange(section, subIndex, fieldIndex, e.target.value)
//                     }
//                     className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                   >
//                     <option value="">{t('templates.select_option')}</option>
//                     {template?.structure[section][sectionKey][subIndex].fields[fieldIndex].options?.map(
//                       (option) => (
//                         <option key={option} value={option}>
//                           {option}
//                         </option>
//                       )
//                     )}
//                   </select>
//                 ) : field.type === 'image' ? (
//                   <div className="space-y-2">
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) =>
//                         handleFieldChange(section, subIndex, fieldIndex, e.target.files)
//                       }
//                       className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                     />
//                     {imagePreviews[`${section}_${subIndex}_${fieldIndex}`] && (
//                       <img
//                         src={imagePreviews[`${section}_${subIndex}_${fieldIndex}`]}
//                         alt="Preview"
//                         className="w-32 h-32 object-cover rounded-md"
//                       />
//                     )}
//                   </div>
//                 ) : field.type === 'multi_image' ? (
//                   <div className="space-y-2">
//                     <input
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) =>
//                         handleFieldChange(section, subIndex, fieldIndex, e.target.files)
//                       }
//                       className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                     />
//                     {imagePreviews[`${section}_${subIndex}_${fieldIndex}`]?.map((url, idx) => (
//                       <img
//                         key={idx}
//                         src={url}
//                         alt={`Preview ${idx}`}
//                         className="w-32 h-32 object-cover rounded-md inline-block mr-2"
//                       />
//                     ))}
//                   </div>
//                 ) : field.type === 'PDF' ? (
//                   <div className="space-y-2">
//                     <input
//                       type="file"
//                       accept="application/pdf"
//                       onChange={(e) =>
//                         handleFieldChange(section, subIndex, fieldIndex, e.target.files)
//                       }
//                       className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                     />
//                     {field.value && (
//                       <a
//                         href={field.value}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-indigo-600 dark:text-indigo-400 hover:underline"
//                       >
//                         {t('templates.view_pdf') || 'View PDF'}
//                       </a>
//                     )}
//                   </div>
//                 ) : field.type === 'radio' ? (
//                   <div className="flex flex-wrap gap-4">
//                     {template?.structure[section][sectionKey][subIndex].fields[fieldIndex].options?.map(
//                       (option) => (
//                         <label key={option} className="inline-flex items-center">
//                           <input
//                             type="radio"
//                             name={`${section}_${subIndex}_${fieldIndex}`}
//                             value={option}
//                             checked={field.value === option}
//                             onChange={(e) =>
//                               handleFieldChange(section, subIndex, fieldIndex, e.target.value, false, true)
//                             }
//                             className="h-4 w-4 text-indigo-600 border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:ring-indigo-500"
//                           />
//                           <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option}</span>
//                         </label>
//                       )
//                     )}
//                   </div>
//                 ) : field.type === 'Date' ? (
//                   <input
//                     type="date"
//                     value={field.value || ''}
//                     onChange={(e) =>
//                       handleFieldChange(section, subIndex, fieldIndex, e.target.value)
//                     }
//                     className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                 ) : field.type === 'DateTime' ? (
//                   <input
//                     type="datetime-local"
//                     value={field.value || ''}
//                     onChange={(e) =>
//                       handleFieldChange(section, subIndex, fieldIndex, e.target.value)
//                     }
//                     className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                 ) : field.type === 'Time' ? (
//                   <input
//                     type="time"
//                     value={field.value || ''}
//                     onChange={(e) =>
//                       handleFieldChange(section, subIndex, fieldIndex, e.target.value)
//                     }
//                     className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                   />
//                 ) : null}
//               </div>
//             ))}
//             {(sub[section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'] || []).map(
//               (subSub, subSubIndex) => (
//                 <div key={subSub.name} className="ml-4 mt-4 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
//                   <h5 className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-100">{subSub.name}</h5>
//                   <div className="space-y-4">
//                     {subSub.fields.map((field, fieldIndex) => (
//                       <div key={field.name} className="flex flex-col">
//                         <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                           {field.name}
//                         </label>
//                         {field.type === 'text' ? (
//                           <input
//                             type="text"
//                             value={field.value || ''}
//                             onChange={(e) =>
//                               handleFieldChange(section, subIndex, fieldIndex, e.target.value, false, false, subSubIndex)
//                             }
//                             className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                           />
//                         ) : field.type === 'checkbox' || field.type === 'array' ? (
//                           <div className="flex flex-wrap gap-4">
//                             {template?.structure[section][sectionKey][subIndex][
//                               section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'
//                             ][subSubIndex].fields[fieldIndex].options?.map(
//                               (option) => (
//                                 <label key={option} className="inline-flex items-center">
//                                   <input
//                                     type="checkbox"
//                                     checked={Array.isArray(field.value) && field.value.includes(option)}
//                                     onChange={() =>
//                                       handleFieldChange(section, subIndex, fieldIndex, option, true, false, subSubIndex)
//                                     }
//                                     className="h-4 w-4 text-indigo-600 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 focus:ring-indigo-500"
//                                   />
//                                   <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option}</span>
//                                 </label>
//                               )
//                             )}
//                           </div>
//                         ) : field.type === 'dropdown' ? (
//                           <select
//                             value={field.value || ''}
//                             onChange={(e) =>
//                               handleFieldChange(section, subIndex, fieldIndex, e.target.value, false, false, subSubIndex)
//                             }
//                             className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                           >
//                             <option value="">{t('templates.select_option')}</option>
//                             {template?.structure[section][sectionKey][subIndex][
//                               section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'
//                             ][subSubIndex].fields[fieldIndex].options?.map(
//                               (option) => (
//                                 <option key={option} value={option}>
//                                   {option}
//                                 </option>
//                               )
//                             )}
//                           </select>
//                         ) : field.type === 'image' ? (
//                           <div className="space-y-2">
//                             <input
//                               type="file"
//                               accept="image/*"
//                               onChange={(e) =>
//                                 handleFieldChange(section, subIndex, fieldIndex, e.target.files, false, false, subSubIndex)
//                               }
//                               className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                             />
//                             {imagePreviews[`${section}_${subIndex}_${subSubIndex}_${fieldIndex}`] && (
//                               <img
//                                 src={imagePreviews[`${section}_${subIndex}_${subSubIndex}_${fieldIndex}`]}
//                                 alt="Preview"
//                                 className="w-32 h-32 object-cover rounded-md"
//                               />
//                             )}
//                           </div>
//                         ) : field.type === 'multi_image' ? (
//                           <div className="space-y-2">
//                             <input
//                               type="file"
//                               accept="image/*"
//                               multiple
//                               onChange={(e) =>
//                                 handleFieldChange(section, subIndex, fieldIndex, e.target.files, false, false, subSubIndex)
//                               }
//                               className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                             />
//                             {imagePreviews[`${section}_${subIndex}_${subSubIndex}_${fieldIndex}`]?.map((url, idx) => (
//                               <img
//                                 key={idx}
//                                 src={url}
//                                 alt={`Preview ${idx}`}
//                                 className="w-32 h-32 object-cover rounded-md inline-block mr-2"
//                               />
//                             ))}
//                           </div>
//                         ) : field.type === 'PDF' ? (
//                           <div className="space-y-2">
//                             <input
//                               type="file"
//                               accept="application/pdf"
//                               onChange={(e) =>
//                                 handleFieldChange(section, subIndex, fieldIndex, e.target.files, false, false, subSubIndex)
//                               }
//                               className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                             />
//                             {field.value && (
//                               <a
//                                 href={field.value}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="text-indigo-600 dark:text-indigo-400 hover:underline"
//                               >
//                                 {t('templates.view_pdf') || 'View PDF'}
//                               </a>
//                             )}
//                           </div>
//                         ) : field.type === 'radio' ? (
//                           <div className="flex flex-wrap gap-4">
//                             {template?.structure[section][sectionKey][subIndex][
//                               section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'
//                             ][subSubIndex].fields[fieldIndex].options?.map(
//                               (option) => (
//                                 <label key={option} className="inline-flex items-center">
//                                   <input
//                                     type="radio"
//                                     name={`${section}_${subIndex}_${subSubIndex}_${fieldIndex}`}
//                                     value={option}
//                                     checked={field.value === option}
//                                     onChange={(e) =>
//                                       handleFieldChange(section, subIndex, fieldIndex, e.target.value, false, true, subSubIndex)
//                                     }
//                                     className="h-4 w-4 text-indigo-600 border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:ring-indigo-500"
//                                   />
//                                   <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option}</span>
//                                 </label>
//                               )
//                             )}
//                           </div>
//                         ) : field.type === 'Date' ? (
//                           <input
//                             type="date"
//                             value={field.value || ''}
//                             onChange={(e) =>
//                               handleFieldChange(section, subIndex, fieldIndex, e.target.value, false, false, subSubIndex)
//                             }
//                             className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                           />
//                         ) : field.type === 'DateTime' ? (
//                           <input
//                             type="datetime-local"
//                             value={field.value || ''}
//                             onChange={(e) =>
//                               handleFieldChange(section, subIndex, fieldIndex, e.target.value, false, false, subSubIndex)
//                             }
//                             className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                           />
//                         ) : field.type === 'Time' ? (
//                           <input
//                             type="time"
//                             value={field.value || ''}
//                             onChange={(e) =>
//                               handleFieldChange(section, subIndex, fieldIndex, e.target.value, false, false, subSubIndex)
//                             }
//                             className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                           />
//                         ) : null}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   );

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
//                 {t('reports.title')}
//               </h1>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//                 <LanguageToggle />
//                 <ModalSearch />
//                 <ThemeToggle />
//               </div>
//             </div>

//             {error && (
//               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//                 <span>{error}</span>
//                 <button
//                   onClick={() => setError('')}
//                   className="absolute top-0 right-0 px-4 py-3"
//                   aria-label={t('common.dismiss_error')}
//                 >
//                   <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
//                     <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
//                   </svg>
//                 </button>
//               </div>
//             )}

//             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
//               <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
//                 {t('reports.create_report')}
//               </h2>
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="mb-4">
//                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     {t('reports.report_template')}
//                   </label>
//                   <select
//                     value={selectedTemplateId}
//                     onChange={(e) => setSelectedTemplateId(e.target.value)}
//                     className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                   >
//                     <option value="">{t('reports.select_template_name')}</option>
//                     {templates.map((temp) => (
//                       <option key={temp._id} value={temp._id}>
//                         {temp.name} (Type: {temp.reportType}, ID: {temp._id})
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 {template && (
//                   <div className="mb-6">
//                     <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
//                       {t('reports.template_details')}
//                     </h3>
//                     <div className="space-y-4">
//                       <div className="flex flex-col">
//                         <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                           {t('reports.report_type')}
//                         </label>
//                         <input
//                           type="text"
//                           value={reportData.reportType}
//                           readOnly
//                           className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 bg-gray-100"
//                         />
//                       </div>
//                       <div className="flex flex-col">
//                         <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                           {t('reports.template_name')}
//                         </label>
//                         <input
//                           type="text"
//                           value={reportData.name}
//                           readOnly
//                           className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 bg-gray-100"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}
//                 {template && (
//                   <div className="mb-6">
//                     <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
//                       {t('reports.location_details')}
//                     </h3>
//                     <div className="space-y-4">
//                       <div className="flex flex-col">
//                         <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                           {t('reports.main_location')}
//                         </label>
//                         <select
//                           value={selectedMainLocationId}
//                           onChange={(e) => setSelectedMainLocationId(e.target.value)}
//                           className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                         >
//                           <option value="">{t('reports.select_main_location')}</option>
//                           {mainLocations.map((loc) => (
//                             <option key={loc.id} value={loc.id}>
//                               {language === 'en' ? loc.main_location_name_en : loc.main_location_ar}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                       <div className="flex flex-col">
//                         <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                           {t('reports.location_qa')}
//                         </label>
//                         <select
//                           value={selectedLocationsQaId}
//                           onChange={(e) => setSelectedLocationsQaId(e.target.value)}
//                           className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                           disabled={!selectedMainLocationId}
//                         >
//                           <option value="">{t('reports.select_location_qa')}</option>
//                           {locationsQa.map((loc) => (
//                             <option key={loc.locations_qa_id} value={loc.locations_qa_id}>
//                               {language === 'en' ? loc.location_en : loc.location_ar}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                       <div className="flex flex-col">
//                         <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                           {t('reports.section_qa')}
//                         </label>
//                         <select
//                           value={selectedSectionQaId}
//                           onChange={(e) => setSelectedSectionQaId(e.target.value)}
//                           className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                           disabled={!selectedLocationsQaId}
//                         >
//                           <option value="">{t('reports.select_section_qa')}</option>
//                           {sectionsQa.map((sec) => (
//                             <option key={sec.section_qa_id} value={sec.section_qa_id}>
//                               {language === 'en' ? sec.section_en : sec.section_ar}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                       <div className="flex flex-col">
//                         <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                           {t('reports.sub_section_qa')}
//                         </label>
//                         <select
//                           value={selectedSubSectionQaId}
//                           onChange={(e) => setSelectedSubSectionQaId(e.target.value)}
//                           className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
//                           disabled={!selectedSectionQaId}
//                         >
//                           <option value="">{t('reports.select_sub_section_qa')}</option>
//                           {subSectionsQa.map((sub) => (
//                             <option key={sub.id} value={sub.id}>
//                               {language === 'en' ? sub.name_en : sub.name_ar}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//                 {template && (
//                   <>
//                     {renderSection('header', reportData.header.sub_headers, 'sub_headers')}
//                     {renderSection('body', reportData.body.sub_bodies, 'sub_bodies')}
//                     {renderSection('footer', reportData.footer.sub_footers, 'sub_footers')}
//                   </>
//                 )}
//                 <button
//                   type="submit"
//                   className="w-full bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-md transition duration-200"
//                 >
//                   {t('reports.save_report')}
//                 </button>
//               </form>
//               {reportResult && (
//                 <div className="mt-4 text-sm text-green-600">{reportResult}</div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default ReportCreator;



// Working 100 100 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import reportService from '../../lib/reportService';

const ReportCreator = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [reportData, setReportData] = useState({
    header: { sub_headers: [] },
    body: { sub_bodies: [] },
    footer: { sub_footers: [] },
    reportType: '',
    name: '',
  });
  const [reportResult, setReportResult] = useState('');
  const [mainLocations, setMainLocations] = useState([]);
  const [locationsQa, setLocationsQa] = useState([]);
  const [sectionsQa, setSectionsQa] = useState([]);
  const [subSectionsQa, setSubSectionsQa] = useState([]);
  const [selectedMainLocationId, setSelectedMainLocationId] = useState('');
  const [selectedLocationsQaId, setSelectedLocationsQaId] = useState('');
  const [selectedSectionQaId, setSelectedSectionQaId] = useState('');
  const [selectedSubSectionQaId, setSelectedSubSectionQaId] = useState('');
  const [imagePreviews, setImagePreviews] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('reports.no_permission'));
      setLoading(false);
      return;
    }

    if (authData.privilege_ids.includes(1)) {
      setHasPrivilege(true);
      fetchTemplateNames();
      fetchMainLocations();
    } else {
      setError(t('reports.no_permission'));
      setHasPrivilege(false);
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  const fetchTemplateNames = async () => {
    try {
      const templates = await reportService.getTemplateNames();
      setTemplates(templates);
      setLoading(false);
    } catch (err) {
      setError(t('reports.fetch_template_names_error', { message: err.message }));
      setLoading(false);
    }
  };

  const fetchTemplate = async (templateId) => {
    try {
      const data = await reportService.fetchTemplate(templateId);
      setTemplate(data);
      const initialReportData = {
        header: {
          sub_headers: data?.structure?.header?.sub_headers?.map((sub) => ({
            name: sub.name,
            mandatory: sub.mandatory || false,
            fields: sub.fields.map((field) => ({
              name: field.name,
              type: field.type,
              value:
                field.type === 'checkbox' || field.type === 'array'
                  ? []
                  : field.type === 'image' ||
                    field.type === 'multi_image' ||
                    field.type === 'PDF' ||
                    field.type === 'radio' ||
                    field.type === 'score' ||
                    field.type === 'Date' ||
                    field.type === 'DateTime' ||
                    field.type === 'Time'
                  ? ''
                  : field.type === 'dropdown'
                  ? field.options?.[0] || ''
                  : '',
              mandatory: field.mandatory || false,
            })),
            sub_sub_headers: sub.sub_sub_headers?.map((subSub) => ({
              name: subSub.name,
              mandatory: subSub.mandatory || false,
              fields: subSub.fields.map((field) => ({
                name: field.name,
                type: field.type,
                value:
                  field.type === 'checkbox' || field.type === 'array'
                    ? []
                    : field.type === 'image' ||
                      field.type === 'multi_image' ||
                      field.type === 'PDF' ||
                      field.type === 'radio' ||
                      field.type === 'score' ||
                      field.type === 'Date' ||
                      field.type === 'DateTime' ||
                      field.type === 'Time'
                    ? ''
                    : field.type === 'dropdown'
                    ? field.options?.[0] || ''
                    : '',
                mandatory: field.mandatory || false,
              })),
            })) || [],
          })) || [],
        },
        body: {
          sub_bodies: data?.structure?.body?.sub_bodies?.map((sub) => ({
            name: sub.name,
            mandatory: sub.mandatory || false,
            fields: sub.fields.map((field) => ({
              name: field.name,
              type: field.type,
              value:
                field.type === 'checkbox' || field.type === 'array'
                  ? []
                  : field.type === 'image' ||
                    field.type === 'multi_image' ||
                    field.type === 'PDF' ||
                    field.type === 'radio' ||
                    field.type === 'score' ||
                    field.type === 'Date' ||
                    field.type === 'DateTime' ||
                    field.type === 'Time'
                  ? ''
                  : field.type === 'dropdown'
                  ? field.options?.[0] || ''
                  : '',
              mandatory: field.mandatory || false,
            })),
            sub_sub_bodies: sub.sub_sub_bodies?.map((subSub) => ({
              name: subSub.name,
              mandatory: subSub.mandatory || false,
              fields: subSub.fields.map((field) => ({
                name: field.name,
                type: field.type,
                value:
                  field.type === 'checkbox' || field.type === 'array'
                    ? []
                    : field.type === 'image' ||
                      field.type === 'multi_image' ||
                      field.type === 'PDF' ||
                      field.type === 'radio' ||
                      field.type === 'score' ||
                      field.type === 'Date' ||
                      field.type === 'DateTime' ||
                      field.type === 'Time'
                    ? ''
                    : field.type === 'dropdown'
                    ? field.options?.[0] || ''
                    : '',
                mandatory: field.mandatory || false,
              })),
            })) || [],
          })) || [],
        },
        footer: {
          sub_footers: data?.structure?.footer?.sub_footers?.map((sub) => ({
            name: sub.name,
            mandatory: sub.mandatory || false,
            fields: sub.fields.map((field) => ({
              name: field.name,
              type: field.type,
              value:
                field.type === 'checkbox' || field.type === 'array'
                  ? []
                  : field.type === 'image' ||
                    field.type === 'multi_image' ||
                    field.type === 'PDF' ||
                    field.type === 'radio' ||
                    field.type === 'score' ||
                    field.type === 'Date' ||
                    field.type === 'DateTime' ||
                    field.type === 'Time'
                  ? ''
                  : field.type === 'dropdown'
                  ? field.options?.[0] || ''
                  : '',
              mandatory: field.mandatory || false,
            })),
            sub_sub_footers: sub.sub_sub_footers?.map((subSub) => ({
              name: subSub.name,
              mandatory: subSub.mandatory || false,
              fields: subSub.fields.map((field) => ({
                name: field.name,
                type: field.type,
                value:
                  field.type === 'checkbox' || field.type === 'array'
                    ? []
                    : field.type === 'image' ||
                      field.type === 'multi_image' ||
                      field.type === 'PDF' ||
                      field.type === 'radio' ||
                      field.type === 'score' ||
                      field.type === 'Date' ||
                      field.type === 'DateTime' ||
                      field.type === 'Time'
                    ? ''
                    : field.type === 'dropdown'
                    ? field.options?.[0] || ''
                    : '',
                mandatory: field.mandatory || false,
              })),
            })) || [],
          })) || [],
        },
        reportType: data.reportType || '',
        name: data.name || '',
      };
      setReportData(initialReportData);
      setImagePreviews({});
      console.log('Initial reportData set:', JSON.stringify(initialReportData, null, 2));
    } catch (err) {
      setError(t('reports.fetch_template_error', { message: err.message }));
    }
  };

  useEffect(() => {
    if (selectedTemplateId) {
      fetchTemplate(selectedTemplateId);
    } else {
      setTemplate(null);
      setReportData({
        header: { sub_headers: [] },
        body: { sub_bodies: [] },
        footer: { sub_footers: [] },
        reportType: '',
        name: '',
      });
      setImagePreviews({});
    }
  }, [selectedTemplateId]);

  const fetchMainLocations = async () => {
    try {
      const data = await reportService.getMainLocations(authData.org_id);
      setMainLocations(data);
    } catch (err) {
      setError(t('reports.fetch_main_locations_error', { message: err.message }));
    }
  };

  useEffect(() => {
    if (selectedMainLocationId) {
      reportService.getLocationsQa({ orgId: authData.org_id, mainLocationId: selectedMainLocationId })
        .then((data) => {
          setLocationsQa(data);
          setSelectedLocationsQaId('');
          setSectionsQa([]);
          setSelectedSectionQaId('');
          setSubSectionsQa([]);
          setSelectedSubSectionQaId('');
        })
        .catch((err) => {
          setError(t('reports.fetch_locations_qa_error', { message: err.message }));
        });
    } else {
      setLocationsQa([]);
      setSelectedLocationsQaId('');
      setSectionsQa([]);
      setSelectedSectionQaId('');
      setSubSectionsQa([]);
      setSelectedSubSectionQaId('');
    }
  }, [selectedMainLocationId, authData?.org_id, t]);

  useEffect(() => {
    if (selectedLocationsQaId) {
      reportService.getSectionsQa({ orgId: authData.org_id, locationsQaId: selectedLocationsQaId })
        .then((data) => {
          setSectionsQa(data);
          setSelectedSectionQaId('');
          setSubSectionsQa([]);
          setSelectedSubSectionQaId('');
        })
        .catch((err) => {
          setError(t('reports.fetch_sections_qa_error', { message: err.message }));
        });
    } else {
      setSectionsQa([]);
      setSelectedSectionQaId('');
      setSubSectionsQa([]);
      setSelectedSubSectionQaId('');
    }
  }, [selectedLocationsQaId, authData?.org_id, t]);

  useEffect(() => {
    if (selectedSectionQaId) {
      reportService.getSubSectionsQa({ orgId: authData.org_id, sectionQaId: selectedSectionQaId })
        .then((data) => {
          setSubSectionsQa(data);
          setSelectedSubSectionQaId('');
        })
        .catch((err) => {
          setError(t('reports.fetch_sub_sections_qa_error', { message: err.message }));
        });
    } else {
      setSubSectionsQa([]);
      setSelectedSubSectionQaId('');
    }
  }, [selectedSectionQaId, authData?.org_id, t]);

  const handleFieldChange = (section, subIndex, fieldIndex, value, isCheckbox = false, isRadio = false, subSubIndex = null) => {
    setReportData((prev) => {
      const sectionKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
      const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
      const updatedSection = { ...prev[section] };
      const updatedSubSections = [...updatedSection[sectionKey]];

      if (subSubIndex !== null) {
        const updatedSubSection = { ...updatedSubSections[subIndex] };
        const updatedSubSubSections = [...(updatedSubSection[subSubKey] || [])];
        const updatedSubSubSection = { ...updatedSubSubSections[subSubIndex] };
        const updatedFields = [...updatedSubSubSection.fields];
        const field = { ...updatedFields[fieldIndex] };

        if (isCheckbox) {
          const currentValues = Array.isArray(field.value) ? [...field.value] : [];
          field.value = currentValues.includes(value)
            ? currentValues.filter((v) => v !== value)
            : [...currentValues, value];
          console.log(`Checkbox updated - ${section}.${sectionKey}[${subIndex}].${subSubKey}[${subSubIndex}].fields[${fieldIndex}].value:`, field.value);
        } else if (isRadio || field.type === 'dropdown' || field.type === 'score') {
          field.value = value;
          console.log(`${field.type} updated - ${section}.${sectionKey}[${subIndex}].${subSubKey}[${subSubIndex}].fields[${fieldIndex}].value:`, value);
        } else if (field.type === 'image') {
          const file = value[0];
          field.value = file ? URL.createObjectURL(file) : '';
          setImagePreviews((prev) => ({
            ...prev,
            [`${section}_${subIndex}_${subSubIndex}_${fieldIndex}`]: field.value,
          }));
          console.log(`Image updated - ${section}.${sectionKey}[${subIndex}].${subSubKey}[${subSubIndex}].fields[${fieldIndex}].value:`, field.value);
        } else if (field.type === 'multi_image') {
          const files = Array.from(value);
          field.value = files.map((file) => URL.createObjectURL(file));
          setImagePreviews((prev) => ({
            ...prev,
            [`${section}_${subIndex}_${subSubIndex}_${fieldIndex}`]: field.value,
          }));
          console.log(`Multi-image updated - ${section}.${sectionKey}[${subIndex}].${subSubKey}[${subSubIndex}].fields[${fieldIndex}].value:`, field.value);
        } else if (field.type === 'PDF') {
          const file = value[0];
          field.value = file ? URL.createObjectURL(file) : '';
          console.log(`PDF updated - ${section}.${sectionKey}[${subIndex}].${subSubKey}[${subSubIndex}].fields[${fieldIndex}].value:`, field.value);
        } else {
          field.value = value;
          console.log(`Field updated - ${section}.${sectionKey}[${subIndex}].${subSubKey}[${subSubIndex}].fields[${fieldIndex}].value:`, value);
        }

        updatedFields[fieldIndex] = field;
        updatedSubSubSection.fields = updatedFields;
        updatedSubSubSections[subSubIndex] = updatedSubSubSection;
        updatedSubSection[subSubKey] = updatedSubSubSections;
        updatedSubSections[subIndex] = updatedSubSection;
      } else {
        const updatedSubSection = { ...updatedSubSections[subIndex] };
        const updatedFields = [...updatedSubSection.fields];
        const field = { ...updatedFields[fieldIndex] };

        if (isCheckbox) {
          const currentValues = Array.isArray(field.value) ? [...field.value] : [];
          field.value = currentValues.includes(value)
            ? currentValues.filter((v) => v !== value)
            : [...currentValues, value];
          console.log(`Checkbox updated - ${section}.${sectionKey}[${subIndex}].fields[${fieldIndex}].value:`, field.value);
        } else if (isRadio || field.type === 'dropdown' || field.type === 'score') {
          field.value = value;
          console.log(`${field.type} updated - ${section}.${sectionKey}[${subIndex}].fields[${fieldIndex}].value:`, value);
        } else if (field.type === 'image') {
          const file = value[0];
          field.value = file ? URL.createObjectURL(file) : '';
          setImagePreviews((prev) => ({
            ...prev,
            [`${section}_${subIndex}_${fieldIndex}`]: field.value,
          }));
          console.log(`Image updated - ${section}.${sectionKey}[${subIndex}].fields[${fieldIndex}].value:`, field.value);
        } else if (field.type === 'multi_image') {
          const files = Array.from(value);
          field.value = files.map((file) => URL.createObjectURL(file));
          setImagePreviews((prev) => ({
            ...prev,
            [`${section}_${subIndex}_${fieldIndex}`]: field.value,
          }));
          console.log(`Multi-image updated - ${section}.${sectionKey}[${subIndex}].fields[${fieldIndex}].value:`, field.value);
        } else if (field.type === 'PDF') {
          const file = value[0];
          field.value = file ? URL.createObjectURL(file) : '';
          console.log(`PDF updated - ${section}.${sectionKey}[${subIndex}].fields[${fieldIndex}].value:`, field.value);
        } else {
          field.value = value;
          console.log(`Field updated - ${section}.${sectionKey}[${subIndex}].fields[${fieldIndex}].value:`, value);
        }

        updatedFields[fieldIndex] = field;
        updatedSubSection.fields = updatedFields;
        updatedSubSections[subIndex] = updatedSubSection;
      }

      updatedSection[sectionKey] = updatedSubSections;

      return {
        ...prev,
        [section]: updatedSection,
      };
    });
  };

  const validateReportData = () => {
    const errors = [];
    ['header', 'body', 'footer'].forEach((section) => {
      const sectionKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
      const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
      template?.structure[section][sectionKey].forEach((sub, subIndex) => {
        const subMandatory = sub.mandatory || false;
        sub.fields.forEach((field, fieldIndex) => {
          const fieldMandatory = subMandatory || field.mandatory || false;
          const value = reportData[section][sectionKey][subIndex].fields[fieldIndex].value;
          if (fieldMandatory) {
            if (
              !value ||
              (Array.isArray(value) && value.length === 0) ||
              (typeof value === 'string' && value.trim() === '')
            ) {
              errors.push(t('reports.mandatory_field_missing', { name: `${sub.name} - ${field.name}` }));
            }
          }
        });
        sub[subSubKey]?.forEach((subSub, subSubIndex) => {
          const subSubMandatory = subSub.mandatory || subMandatory || false;
          subSub.fields.forEach((field, fieldIndex) => {
            const fieldMandatory = subSubMandatory || field.mandatory || false;
            const value = reportData[section][sectionKey][subIndex][subSubKey][subSubIndex].fields[fieldIndex].value;
            if (fieldMandatory) {
              if (
                !value ||
                (Array.isArray(value) && value.length === 0) ||
                (typeof value === 'string' && value.trim() === '')
              ) {
                errors.push(t('reports.mandatory_field_missing', { name: `${sub.name} - ${subSub.name} - ${field.name}` }));
              }
            }
          });
        });
      });
    });
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('reports.no_permission'));
      return;
    }
    if (!selectedTemplateId) {
      setError(t('reports.select_template'));
      return;
    }
    if (!selectedMainLocationId || !selectedLocationsQaId || !selectedSectionQaId || !selectedSubSectionQaId) {
      setError(t('reports.select_location_details'));
      return;
    }

    const validationErrors = validateReportData();
    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);
      setError(t('reports.validation_errors'));
      return;
    }

    const orgId = parseInt(authData.org_id, 10);
    if (isNaN(orgId)) {
      setError(t('reports.invalid_org_id') || 'Invalid organization ID');
      return;
    }

    const selectedTemplate = templates.find((temp) => temp._id === selectedTemplateId);
    const report = {
      name: reportData.name || selectedTemplate?.name || 'Untitled Report',
      reportType: reportData.reportType || selectedTemplate?.reportType || 'Unknown',
      template_id: selectedTemplateId,
      created_by: authData.user_id || 'user_001',
      structure: {
        ...reportData,
        location_details: {
          main_location_id: selectedMainLocationId,
          locations_qa_id: selectedLocationsQaId,
          section_qa_id: selectedSectionQaId,
          sub_section_qa_id: selectedSubSectionQaId,
        },
      },
      org_id: orgId,
    };

    console.log('Submitting report:', JSON.stringify(report, null, 2));

    try {
      const result = await reportService.createReport(report, orgId);
      setReportResult(t('reports.created_success', { id: result.insertedId }));
      setError('');
      setValidationErrors([]);
      setSelectedTemplateId('');
      setTemplate(null);
      setReportData({
        header: { sub_headers: [] },
        body: { sub_bodies: [] },
        footer: { sub_footers: [] },
        reportType: '',
        name: '',
      });
      setSelectedMainLocationId('');
      setSelectedLocationsQaId('');
      setSelectedSectionQaId('');
      setSelectedSubSectionQaId('');
      setImagePreviews({});
    } catch (err) {
      setError(t('reports.create_error', { message: err.message }));
      setReportResult('');
    }
  };

  const renderSection = (section, subSections, sectionKey) => (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
        {t(`templates.${section}`)}
      </h3>
      {subSections.map((sub, subIndex) => (
        <div key={sub.name} className="border p-4 rounded-md mb-4 bg-gray-50 dark:bg-gray-700">
          <h4 className="text-md font-medium mb-2 text-gray-800 dark:text-gray-100">
            {sub.name} {sub.mandatory ? <span className="text-red-500">*</span> : ''}
          </h4>
          <div className="space-y-4">
            {sub.fields.map((field, fieldIndex) => (
              <div key={field.name} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.name} {(field.mandatory || sub.mandatory) ? <span className="text-red-500">*</span> : ''}
                </label>
                {field.type === 'text' ? (
                  <input
                    type="text"
                    value={field.value || ''}
                    onChange={(e) =>
                      handleFieldChange(section, subIndex, fieldIndex, e.target.value)
                    }
                    className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : field.type === 'checkbox' || field.type === 'array' ? (
                  <div className="flex flex-wrap gap-4">
                    {template?.structure[section][sectionKey][subIndex].fields[fieldIndex].options?.map(
                      (option) => (
                        <label key={option} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={Array.isArray(field.value) && field.value.includes(option)}
                            onChange={() =>
                              handleFieldChange(section, subIndex, fieldIndex, option, true)
                            }
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option}</span>
                        </label>
                      )
                    )}
                  </div>
                ) : field.type === 'dropdown' ? (
                  <select
                    value={field.value || ''}
                    onChange={(e) =>
                      handleFieldChange(section, subIndex, fieldIndex, e.target.value)
                    }
                    className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">{t('templates.select_option')}</option>
                    {template?.structure[section][sectionKey][subIndex].fields[fieldIndex].options?.map(
                      (option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      )
                    )}
                  </select>
                ) : field.type === 'image' ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFieldChange(section, subIndex, fieldIndex, e.target.files)
                      }
                      className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {imagePreviews[`${section}_${subIndex}_${fieldIndex}`] && (
                      <img
                        src={imagePreviews[`${section}_${subIndex}_${fieldIndex}`]}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    )}
                  </div>
                ) : field.type === 'multi_image' ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        handleFieldChange(section, subIndex, fieldIndex, e.target.files)
                      }
                      className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {imagePreviews[`${section}_${subIndex}_${fieldIndex}`]?.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Preview ${idx}`}
                        className="w-32 h-32 object-cover rounded-md inline-block mr-2"
                      />
                    ))}
                  </div>
                ) : field.type === 'PDF' ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) =>
                        handleFieldChange(section, subIndex, fieldIndex, e.target.files)
                      }
                      className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {field.value && (
                      <a
                        href={field.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {t('templates.view_pdf') || 'View PDF'}
                      </a>
                    )}
                  </div>
                ) : field.type === 'radio' || field.type === 'score' ? (
                  <div className="flex flex-wrap gap-4">
                    {template?.structure[section][sectionKey][subIndex].fields[fieldIndex].options?.map(
                      (option) => (
                        <label key={option} className="inline-flex items-center">
                          <input
                            type="radio"
                            name={`${section}_${subIndex}_${fieldIndex}`}
                            value={option}
                            checked={field.value === option}
                            onChange={(e) =>
                              handleFieldChange(section, subIndex, fieldIndex, e.target.value, false, true)
                            }
                            className="h-4 w-4 text-indigo-600 border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option}</span>
                        </label>
                      )
                    )}
                  </div>
                ) : field.type === 'Date' ? (
                  <input
                    type="date"
                    value={field.value || ''}
                    onChange={(e) =>
                      handleFieldChange(section, subIndex, fieldIndex, e.target.value)
                    }
                    className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : field.type === 'DateTime' ? (
                  <input
                    type="datetime-local"
                    value={field.value || ''}
                    onChange={(e) =>
                      handleFieldChange(section, subIndex, fieldIndex, e.target.value)
                    }
                    className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : field.type === 'Time' ? (
                  <input
                    type="time"
                    value={field.value || ''}
                    onChange={(e) =>
                      handleFieldChange(section, subIndex, fieldIndex, e.target.value)
                    }
                    className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : null}
              </div>
            ))}
            {(sub[section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'] || []).map(
              (subSub, subSubIndex) => (
                <div key={subSub.name} className="ml-4 mt-4 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                  <h5 className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-100">
                    {subSub.name} {(subSub.mandatory || sub.mandatory) ? <span className="text-red-500">*</span> : ''}
                  </h5>
                  <div className="space-y-4">
                    {subSub.fields.map((field, fieldIndex) => (
                      <div key={field.name} className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {field.name} {(field.mandatory || subSub.mandatory || sub.mandatory) ? <span className="text-red-500">*</span> : ''}
                        </label>
                        {field.type === 'text' ? (
                          <input
                            type="text"
                            value={field.value || ''}
                            onChange={(e) =>
                              handleFieldChange(section, subIndex, fieldIndex, e.target.value, false, false, subSubIndex)
                            }
                            className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : field.type === 'checkbox' || field.type === 'array' ? (
                          <div className="flex flex-wrap gap-4">
                            {template?.structure[section][sectionKey][subIndex][
                              section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'
                            ][subSubIndex].fields[fieldIndex].options?.map(
                              (option) => (
                                <label key={option} className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={Array.isArray(field.value) && field.value.includes(option)}
                                    onChange={() =>
                                      handleFieldChange(section, subIndex, fieldIndex, option, true, false, subSubIndex)
                                    }
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600 focus:ring-indigo-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option}</span>
                                </label>
                              )
                            )}
                          </div>
                        ) : field.type === 'dropdown' ? (
                          <select
                            value={field.value || ''}
                            onChange={(e) =>
                              handleFieldChange(section, subIndex, fieldIndex, e.target.value, false, false, subSubIndex)
                            }
                            className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">{t('templates.select_option')}</option>
                            {template?.structure[section][sectionKey][subIndex][
                              section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'
                            ][subSubIndex].fields[fieldIndex].options?.map(
                              (option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              )
                            )}
                          </select>
                        ) : field.type === 'image' ? (
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFieldChange(section, subIndex, fieldIndex, e.target.files, false, false, subSubIndex)
                              }
                              className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            {imagePreviews[`${section}_${subIndex}_${subSubIndex}_${fieldIndex}`] && (
                              <img
                                src={imagePreviews[`${section}_${subIndex}_${subSubIndex}_${fieldIndex}`]}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-md"
                              />
                            )}
                          </div>
                        ) : field.type === 'multi_image' ? (
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) =>
                                handleFieldChange(section, subIndex, fieldIndex, e.target.files, false, false, subSubIndex)
                              }
                              className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            {imagePreviews[`${section}_${subIndex}_${subSubIndex}_${fieldIndex}`]?.map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`Preview ${idx}`}
                                className="w-32 h-32 object-cover rounded-md inline-block mr-2"
                              />
                            ))}
                          </div>
                        ) : field.type === 'PDF' ? (
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) =>
                                handleFieldChange(section, subIndex, fieldIndex, e.target.files, false, false, subSubIndex)
                              }
                              className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            {field.value && (
                              <a
                                href={field.value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                {t('templates.view_pdf') || 'View PDF'}
                              </a>
                            )}
                          </div>
                        ) : field.type === 'radio' || field.type === 'score' ? (
                          <div className="flex flex-wrap gap-4">
                            {template?.structure[section][sectionKey][subIndex][
                              section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'
                            ][subSubIndex].fields[fieldIndex].options?.map(
                              (option) => (
                                <label key={option} className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    name={`${section}_${subIndex}_${subSubIndex}_${fieldIndex}`}
                                    value={option}
                                    checked={field.value === option}
                                    onChange={(e) =>
                                      handleFieldChange(section, subIndex, fieldIndex, e.target.value, false, true, subSubIndex)
                                    }
                                    className="h-4 w-4 text-indigo-600 border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:ring-indigo-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option}</span>
                                </label>
                              )
                            )}
                          </div>
                        ) : field.type === 'Date' ? (
                          <input
                            type="date"
                            value={field.value || ''}
                            onChange={(e) =>
                              handleFieldChange(section, subIndex, fieldIndex, e.target.value, false, false, subSubIndex)
                            }
                            className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : field.type === 'DateTime' ? (
                          <input
                            type="datetime-local"
                            value={field.value || ''}
                            onChange={(e) =>
                              handleFieldChange(section, subIndex, fieldIndex, e.target.value, false, false, subSubIndex)
                            }
                            className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : field.type === 'Time' ? (
                          <input
                            type="time"
                            value={field.value || ''}
                            onChange={(e) =>
                              handleFieldChange(section, subIndex, fieldIndex, e.target.value, false, false, subSubIndex)
                            }
                            className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );

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
                {t('reports.title')}
              </h1>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <LanguageToggle />
                <ModalSearch />
                <ThemeToggle />
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span>{error}</span>
                {validationErrors.length > 0 && (
                  <ul className="list-disc ml-4 mt-2">
                    {validationErrors.map((err, idx) => (
                      <li key={idx} className="text-sm">{err}</li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => { setError(''); setValidationErrors([]); }}
                  className="absolute top-0 right-0 px-4 py-3"
                  aria-label={t('common.dismiss_error')}
                >
                  <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                  </svg>
                </button>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {t('reports.create_report')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('reports.report_template')}
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">{t('reports.select_template_name')}</option>
                    {templates.map((temp) => (
                      <option key={temp._id} value={temp._id}>
                        {temp.name} (Type: {temp.reportType}, ID: {temp._id})
                      </option>
                    ))}
                  </select>
                </div>
                {template && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
                      {t('reports.template_details')}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('reports.report_type')}
                        </label>
                        <input
                          type="text"
                          value={reportData.reportType}
                          readOnly
                          className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 bg-gray-100"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('reports.template_name')}
                        </label>
                        <input
                          type="text"
                          value={reportData.name}
                          readOnly
                          className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {template && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
                      {t('reports.location_details')}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('reports.main_location')}
                        </label>
                        <select
                          value={selectedMainLocationId}
                          onChange={(e) => setSelectedMainLocationId(e.target.value)}
                          className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">{t('reports.select_main_location')}</option>
                          {mainLocations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                              {language === 'en' ? loc.main_location_name_en : loc.main_location_ar}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('reports.location_qa')}
                        </label>
                        <select
                          value={selectedLocationsQaId}
                          onChange={(e) => setSelectedLocationsQaId(e.target.value)}
                          className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                          disabled={!selectedMainLocationId}
                        >
                          <option value="">{t('reports.select_location_qa')}</option>
                          {locationsQa.map((loc) => (
                            <option key={loc.locations_qa_id} value={loc.locations_qa_id}>
                              {language === 'en' ? loc.location_en : loc.location_ar}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('reports.section_qa')}
                        </label>
                        <select
                          value={selectedSectionQaId}
                          onChange={(e) => setSelectedSectionQaId(e.target.value)}
                          className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                          disabled={!selectedLocationsQaId}
                        >
                          <option value="">{t('reports.select_section_qa')}</option>
                          {sectionsQa.map((sec) => (
                            <option key={sec.section_qa_id} value={sec.section_qa_id}>
                              {language === 'en' ? sec.section_en : sec.section_ar}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('reports.sub_section_qa')}
                        </label>
                        <select
                          value={selectedSubSectionQaId}
                          onChange={(e) => setSelectedSubSectionQaId(e.target.value)}
                          className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                          disabled={!selectedSectionQaId}
                        >
                          <option value="">{t('reports.select_sub_section_qa')}</option>
                          {subSectionsQa.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {language === 'en' ? sub.name_en : sub.name_ar}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                {template && (
                  <>
                    {renderSection('header', reportData.header.sub_headers, 'sub_headers')}
                    {renderSection('body', reportData.body.sub_bodies, 'sub_bodies')}
                    {renderSection('footer', reportData.footer.sub_footers, 'sub_footers')}
                  </>
                )}
                <button
                  type="submit"
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-md transition duration-200"
                >
                  {t('reports.save_report')}
                </button>
              </form>
              {reportResult && (
                <div className="mt-4 text-sm text-green-600">{reportResult}</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportCreator;