// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import { useParams, useNavigate } from 'react-router-dom';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import ModalSearch from '../../components/ModalSearch';
// import ThemeToggle from '../../components/ThemeToggle';
// import LanguageToggle from '../../components/LanguageToggle';
// import templateService from '../../lib/templateService';

// const TemplateEditor = () => {
//   const { authData, loading: authLoading } = useAuth();
//   const { t } = useLanguage();
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [hasPrivilege, setHasPrivilege] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [templateName, setTemplateName] = useState('');
//   const [createdBy, setCreatedBy] = useState('');
//   const [selectedReportType, setSelectedReportType] = useState('');
//   const [reportNames, setReportNames] = useState([]);
//   const [structure, setStructure] = useState({
//     header: { sub_headers: [] },
//     body: { sub_bodies: [] },
//     footer: { sub_footers: [] },
//   });
//   const [currentSubSection, setCurrentSubSection] = useState({
//     header: null,
//     body: null,
//     footer: null,
//   });
//   const [currentSubSubSection, setCurrentSubSubSection] = useState({
//     header: null,
//     body: null,
//     footer: null,
//   });
//   const [subNames, setSubNames] = useState({
//     header: '',
//     body: '',
//     footer: '',
//   });
//   const [subSubNames, setSubSubNames] = useState({
//     header: '',
//     body: '',
//     footer: '',
//   });
//   const [fieldInputs, setFieldInputs] = useState({
//     header: { name: '', type: 'text', options: '', value: '' },
//     body: { name: '', type: 'text', options: '', value: '' },
//     footer: { name: '', type: 'text', options: '', value: '' },
//   });
//   const [templateResult, setTemplateResult] = useState('');
//   const [selectedSection, setSelectedSection] = useState('header');
//   const [selectedSubHeader, setSelectedSubHeader] = useState({
//     header: null,
//     body: null,
//     footer: null,
//   });
//   const [editingSubHeader, setEditingSubHeader] = useState(null);
//   const [editingSubSubHeader, setEditingSubSubHeader] = useState(null);
//   const [editingField, setEditingField] = useState(null);
//   const [checkboxStates, setCheckboxStates] = useState({});
//   const [previewData, setPreviewData] = useState(null);

//   useEffect(() => {
//     if (authLoading) return;

//     if (!authData?.access_token) {
//       setError(t('templates.no_permission'));
//       setLoading(false);
//       return;
//     }

//     if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
//       setError(t('templates.invalid_template_id'));
//       setLoading(false);
//       return;
//     }

//     if (authData.privilege_ids.includes(1)) {
//       setHasPrivilege(true);
//       setCreatedBy(authData.user_id || 'user_001');

//       const fetchData = async () => {
//         try {
//           const reportData = await templateService.fetchReportNames(authData.access_token);
//           if (!Array.isArray(reportData)) {
//             throw new Error('fetchReportNames did not return an array');
//           }
//           setReportNames(reportData);

//           const template = await templateService.fetchTemplateById(id, authData.access_token);
//           if (!template || typeof template !== 'object') {
//             throw new Error('fetchTemplateById returned invalid template data');
//           }
//           if (!template.name || !template.structure) {
//             throw new Error('Template missing required fields (name or structure)');
//           }
//           setTemplateName(template.name);
//           setSelectedReportType(template.reportType || '');
//           setStructure(template.structure || { header: { sub_headers: [] }, body: { sub_bodies: [] }, footer: { sub_footers: [] } });
//           setCreatedBy(template.created_by || authData.user_id || 'user_001');
//           updatePreviews(template.name, template.created_by, template.reportType);
//         } catch (err) {
//           console.error('Fetch data error:', err);
//           setError(t('templates.fetch_error', { message: err.message || 'Unknown error' }));
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchData();
//     } else {
//       setError(t('templates.no_permission'));
//       setHasPrivilege(false);
//       setLoading(false);
//     }
//   }, [authData, authLoading, id, t]);

//   useEffect(() => {
//     if (!previewData) return;

//     try {
//       const templatePreview = document.getElementById('templatePreview');
//       if (templatePreview) {
//         templatePreview.textContent = JSON.stringify(previewData, null, 2);
//       }

//       ['header', 'body', 'footer'].forEach((section) => {
//         const uiFieldsContainer = document.getElementById(`userUI${section.charAt(0).toUpperCase() + section.slice(1)}Fields`);
//         if (uiFieldsContainer) {
//           uiFieldsContainer.innerHTML = '';
//           const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
//           const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
//           previewData.structure[section][subKey].forEach((subSection) => {
//             const subDiv = document.createElement('div');
//             subDiv.className = 'mb-4';
//             subDiv.innerHTML = `<h4 class="text-md font-medium mb-2">${subSection.name}</h4>`;

//             const subFieldsDiv = document.createElement('div');
//             subFieldsDiv.className = 'space-y-2';
//             (subSection.fields || []).forEach((field) => {
//               const fieldDiv = document.createElement('div');
//               fieldDiv.className = 'border p-2 rounded-md grid grid-cols-2 gap-2 items-center';
//               if (field.type === 'text') {
//                 fieldDiv.innerHTML = `
//                   <div class="col-span-1">
//                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                     <input type="text" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
//                   </div>
//                 `;
//               } else if (field.type === 'checkbox' || field.type === 'array') {
//                 fieldDiv.innerHTML = `
//                   <div class="col-span-1">
//                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                     <div class="mt-1 flex flex-wrap gap-2">
//                       ${field.options
//                         .map(
//                           (opt) => {
//                             const fieldId = `${section}_${subSection.name}_${field.name}_${opt}`;
//                             const isChecked = checkboxStates[fieldId] ?? field.value.includes(opt);
//                             return `
//                               <label class="inline-flex items-center">
//                                 <input type="checkbox" ${isChecked ? 'checked' : ''} class="mr-1" onchange="window.updateCheckboxState('${fieldId}', this.checked)">
//                                 <span>${opt}</span>
//                               </label>
//                             `;
//                           }
//                         )
//                         .join('')}
//                     </div>
//                   </div>
//                 `;
//               } else if (field.type === 'dropdown') {
//                 fieldDiv.innerHTML = `
//                   <div class="col-span-1">
//                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                     <select class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" disabled>
//                       <option value="">${t('templates.select_option')}</option>
//                       ${field.options.map(opt => `<option value="${opt}" ${field.value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
//                     </select>
//                   </div>
//                 `;
//               } else if (field.type === 'image') {
//                 fieldDiv.innerHTML = `
//                   <div class="col-span-1">
//                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                     <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
//                       ${t('templates.image_upload_placeholder')}
//                     </div>
//                   </div>
//                 `;
//               } else if (field.type === 'multi_image') {
//                 fieldDiv.innerHTML = `
//                   <div class="col-span-1">
//                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                     <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
//                       ${t('templates.multi_image_upload_placeholder')}
//                     </div>
//                   </div>
//                 `;
//               } else if (field.type === 'PDF') {
//                 fieldDiv.innerHTML = `
//                   <div class="col-span-1">
//                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                     <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
//                       ${t('templates.pdf_upload_placeholder')}
//                     </div>
//                   </div>
//                 `;
//               } else if (field.type === 'radio') {
//                 fieldDiv.innerHTML = `
//                   <div class="col-span-1">
//                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                     <div class="mt-1 flex flex-wrap gap-2">
//                       ${field.options
//                         .map(
//                           (opt) => {
//                             const fieldId = `${section}_${subSection.name}_${field.name}_${opt}`;
//                             const isChecked = field.value === opt;
//                             return `
//                               <label class="inline-flex items-center">
//                                 <input type="radio" name="${fieldId}" ${isChecked ? 'checked' : ''} class="mr-1" disabled>
//                                 <span>${opt}</span>
//                               </label>
//                             `;
//                           }
//                         )
//                         .join('')}
//                     </div>
//                   </div>
//                 `;
//               } else if (field.type === 'Date') {
//                 fieldDiv.innerHTML = `
//                   <div class="col-span-1">
//                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                     <input type="date" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
//                   </div>
//                 `;
//               } else if (field.type === 'DateTime') {
//                 fieldDiv.innerHTML = `
//                   <div class="col-span-1">
//                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                     <input type="datetime-local" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
//                   </div>
//                 `;
//               } else if (field.type === 'Time') {
//                 fieldDiv.innerHTML = `
//                   <div class="col-span-1">
//                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                     <input type="time" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
//                   </div>
//                 `;
//               }
//               subFieldsDiv.appendChild(fieldDiv);
//             });
//             subDiv.appendChild(subFieldsDiv);

//             const subSubSections = subSection[subSubKey] || [];
//             subSubSections.forEach((subSubSection) => {
//               const subSubDiv = document.createElement('div');
//               subSubDiv.className = 'ml-4 mb-3';
//               subSubDiv.innerHTML = `<h5 class="text-sm font-medium mb-2">${subSubSection.name}</h5>`;
//               const fieldsDiv = document.createElement('div');
//               fieldsDiv.className = 'space-y-2';
//               subSubSection.fields.forEach((field) => {
//                 const fieldDiv = document.createElement('div');
//                 fieldDiv.className = 'border p-2 rounded-md grid grid-cols-2 gap-2 items-center';
//                 if (field.type === 'text') {
//                   fieldDiv.innerHTML = `
//                     <div class="col-span-1">
//                       <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                       <input type="text" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
//                     </div>
//                   `;
//                 } else if (field.type === 'checkbox' || field.type === 'array') {
//                   fieldDiv.innerHTML = `
//                     <div class="col-span-1">
//                       <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                       <div class="mt-1 flex flex-wrap gap-2">
//                         ${field.options
//                           .map(
//                             (opt) => {
//                               const fieldId = `${section}_${subSection.name}_${subSubSection.name}_${field.name}_${opt}`;
//                               const isChecked = checkboxStates[fieldId] ?? field.value.includes(opt);
//                               return `
//                                 <label class="inline-flex items-center">
//                                   <input type="checkbox" ${isChecked ? 'checked' : ''} class="mr-1" onchange="window.updateCheckboxState('${fieldId}', this.checked)">
//                                   <span>${opt}</span>
//                                 </label>
//                               `;
//                             }
//                           )
//                           .join('')}
//                       </div>
//                     </div>
//                   `;
//                 } else if (field.type === 'dropdown') {
//                   fieldDiv.innerHTML = `
//                     <div class="col-span-1">
//                       <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                       <select class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" disabled>
//                         <option value="">${t('templates.select_option')}</option>
//                         ${field.options.map(opt => `<option value="${opt}" ${field.value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
//                       </select>
//                     </div>
//                   `;
//                 } else if (field.type === 'image') {
//                   fieldDiv.innerHTML = `
//                     <div class="col-span-1">
//                       <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                       <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
//                         ${t('templates.image_upload_placeholder')}
//                       </div>
//                     </div>
//                   `;
//                 } else if (field.type === 'multi_image') {
//                   fieldDiv.innerHTML = `
//                     <div class="col-span-1">
//                       <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                       <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
//                         ${t('templates.multi_image_upload_placeholder')}
//                       </div>
//                     </div>
//                   `;
//                 } else if (field.type === 'PDF') {
//                   fieldDiv.innerHTML = `
//                     <div class="col-span-1">
//                       <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                       <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
//                         ${t('templates.pdf_upload_placeholder')}
//                       </div>
//                     </div>
//                   `;
//                 } else if (field.type === 'radio') {
//                   fieldDiv.innerHTML = `
//                     <div class="col-span-1">
//                       <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                       <div class="mt-1 flex flex-wrap gap-2">
//                         ${field.options
//                           .map(
//                             (opt) => {
//                               const fieldId = `${section}_${subSection.name}_${subSubSection.name}_${field.name}_${opt}`;
//                               const isChecked = field.value === opt;
//                               return `
//                                 <label class="inline-flex items-center">
//                                   <input type="radio" name="${fieldId}" ${isChecked ? 'checked' : ''} class="mr-1" disabled>
//                                   <span>${opt}</span>
//                                 </label>
//                               `;
//                             }
//                           )
//                           .join('')}
//                       </div>
//                     </div>
//                   `;
//                 } else if (field.type === 'Date') {
//                   fieldDiv.innerHTML = `
//                     <div class="col-span-1">
//                       <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                       <input type="date" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
//                     </div>
//                   `;
//                 } else if (field.type === 'DateTime') {
//                   fieldDiv.innerHTML = `
//                     <div class="col-span-1">
//                       <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                       <input type="datetime-local" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
//                     </div>
//                   `;
//                 } else if (field.type === 'Time') {
//                   fieldDiv.innerHTML = `
//                     <div class="col-span-1">
//                       <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name}</label>
//                       <input type="time" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
//                     </div>
//                   `;
//                 }
//                 fieldsDiv.appendChild(fieldDiv);
//               });
//               subSubDiv.appendChild(fieldsDiv);
//               subDiv.appendChild(subSubDiv);
//             });
//             uiFieldsContainer.appendChild(subDiv);
//           });
//         }
//       });

//       window.updateCheckboxState = (fieldId, isChecked) => {
//         setCheckboxStates((prev) => ({ ...prev, [fieldId]: isChecked }));
//       };
//     } catch (err) {
//       console.error('Preview update error:', err);
//       setError(t('templates.preview_error', { message: err.message || 'Unknown error' }));
//     }
//   }, [previewData, checkboxStates, t]);

//   const updatePreviews = (
//     overrideTemplateName = templateName,
//     overrideCreatedBy = createdBy,
//     overrideSubNames = subNames,
//     overrideSubSubNames = subSubNames,
//     overrideFieldInputs = fieldInputs,
//     overrideReportType = selectedReportType
//   ) => {
//     try {
//       const template = {
//         reportType: overrideReportType || '',
//         name: overrideTemplateName || 'Unnamed Template',
//         description: 'Dynamic NCR template',
//         created_by: overrideCreatedBy || 'Unknown User',
//         created_at: new Date().toISOString(),
//         structure,
//       };
//       setPreviewData(template);
//     } catch (err) {
//       console.error('Update previews error:', err);
//       setError(t('templates.preview_error', { message: err.message || 'Unknown error' }));
//     }
//   };

//   const addSubSection = (section) => {
//     if (!hasPrivilege) {
//       setError(t('templates.no_permission'));
//       return;
//     }
//     const subName = subNames[section].trim();
//     if (!subName) {
//       setError(t('templates.enter_sub_name'));
//       return;
//     }

//     const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
//     const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';

//     const isDuplicate = structure[section][subKey].some(
//       (sub) => sub.name.toLowerCase() === subName.toLowerCase() && sub.name !== (editingSubHeader?.name || '')
//     );
//     if (isDuplicate) {
//       setError(t('templates.duplicate_sub_name'));
//       return;
//     }

//     if (editingSubHeader && editingSubHeader.section === section) {
//       setStructure((prev) => {
//         const updatedSubSections = prev[section][subKey].map((sub) =>
//           sub.name === editingSubHeader.name ? { ...sub, name: subName } : sub
//         );
//         return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
//       });
//       setEditingSubHeader(null);
//       if (selectedSubHeader[section] === editingSubHeader.name) {
//         setSelectedSubHeader((prev) => ({ ...prev, [section]: subName }));
//       }
//       if (currentSubSection[section]?.name === editingSubHeader.name) {
//         setCurrentSubSection((prev) => ({ ...prev, [section]: { ...prev[section], name: subName } }));
//       }
//     } else {
//       const newSubSection = { name: subName, fields: [], [subSubKey]: [] };
//       setStructure((prev) => ({
//         ...prev,
//         [section]: {
//           ...prev[section],
//           [subKey]: [...prev[section][subKey], newSubSection],
//         },
//       }));
//       setCurrentSubSection((prev) => ({ ...prev, [section]: newSubSection }));
//       setCurrentSubSubSection((prev) => ({ ...prev, [section]: null }));
//       setSelectedSubHeader((prev) => ({ ...prev, [section]: subName }));
//     }
//     setSubNames((prev) => ({ ...prev, [section]: '' }));
//     setError('');
//     updatePreviews();
//   };

//   const editSubSection = (section, subHeaderName) => {
//     if (!hasPrivilege) {
//       setError(t('templates.no_permission'));
//       return;
//     }
//     const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
//     const subSection = structure[section][subKey].find((sub) => sub.name === subHeaderName);
//     if (!subSection) {
//       setError(t('templates.sub_section_not_found'));
//       return;
//     }
//     setEditingSubHeader({ section, name: subHeaderName });
//     setSubNames((prev) => ({ ...prev, [section]: subHeaderName }));
//     setEditingSubSubHeader(null);
//     setSubSubNames((prev) => ({ ...prev, [section]: '' }));
//   };

//   const deleteSubSection = (section, subHeaderName) => {
//     if (!hasPrivilege) {
//       setError(t('templates.no_permission'));
//       return;
//     }
//     setStructure((prev) => {
//       const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
//       const updatedSubSections = prev[section][subKey].filter((sub) => sub.name !== subHeaderName);
//       return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
//     });
//     if (currentSubSection[section]?.name === subHeaderName) {
//       setCurrentSubSection((prev) => ({ ...prev, [section]: null }));
//       setCurrentSubSubSection((prev) => ({ ...prev, [section]: null }));
//     }
//     if (selectedSubHeader[section] === subHeaderName) {
//       setSelectedSubHeader((prev) => ({ ...prev, [section]: null }));
//     }
//     setEditingSubHeader(null);
//     setSubNames((prev) => ({ ...prev, [section]: '' }));
//     setError('');
//     updatePreviews();
//   };

//   const addSubSubSection = (section) => {
//     if (!hasPrivilege) {
//       setError(t('templates.no_permission'));
//       return;
//     }
//     const selectedHeaderName = selectedSubHeader[section];
//     if (!selectedHeaderName) {
//       setError(t('templates.select_sub_header_first'));
//       return;
//     }

//     const subSubName = subSubNames[section].trim();
//     if (!subSubName) {
//       setError(t('templates.enter_sub_sub_name'));
//       return;
//     }

//     const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
//     const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';

//     const parentSubSection = structure[section][subKey].find((sub) => sub.name === selectedHeaderName);
//     const isDuplicate = parentSubSection[subSubKey]?.some(
//       (subSub) => subSub.name.toLowerCase() === subSubName.toLowerCase() && subSub.name !== (editingSubSubHeader?.name || '')
//     );
//     if (isDuplicate) {
//       setError(t('templates.duplicate_sub_sub_name'));
//       return;
//     }

//     if (editingSubSubHeader && editingSubSubHeader.section === section) {
//       setStructure((prev) => {
//         const updatedSubSections = prev[section][subKey].map((sub) =>
//           sub.name === selectedHeaderName
//             ? {
//                 ...sub,
//                 [subSubKey]: sub[subSubKey].map((subSub) =>
//                   subSub.name === editingSubSubHeader.name ? { ...subSub, name: subSubName } : subSub
//                 ),
//               }
//             : sub
//         );
//         return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
//       });
//       setEditingSubSubHeader(null);
//       if (currentSubSubSection[section]?.name === editingSubSubHeader.name) {
//         setCurrentSubSubSection((prev) => ({ ...prev, [section]: { ...prev[section], name: subSubName } }));
//       }
//     } else {
//       const newSubSubSection = { name: subSubName, fields: [] };
//       setStructure((prev) => {
//         const updatedSubSections = prev[section][subKey].map((sub) =>
//           sub.name === selectedHeaderName
//             ? { ...sub, [subSubKey]: [...(sub[subSubKey] || []), newSubSubSection] }
//             : sub
//         );
//         return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
//       });
//       setCurrentSubSubSection((prev) => ({ ...prev, [section]: newSubSubSection }));
//     }
//     setSubSubNames((prev) => ({ ...prev, [section]: '' }));
//     setError('');
//     updatePreviews();
//   };

//   const editSubSubSection = (section, subSubHeaderName) => {
//     if (!hasPrivilege) {
//       setError(t('templates.no_permission'));
//       return;
//     }
//     const selectedHeaderName = selectedSubHeader[section];
//     if (!selectedHeaderName) {
//       setError(t('templates.select_sub_header_first'));
//       return;
//     }
//     const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
//     const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
//     const parentSubSection = structure[section][subKey].find((sub) => sub.name === selectedHeaderName);
//     const subSubSection = parentSubSection[subSubKey]?.find((subSub) => subSub.name === subSubHeaderName);
//     if (!subSubSection) {
//       setError(t('templates.sub_sub_section_not_found'));
//       return;
//     }
//     setEditingSubSubHeader({ section, name: subSubHeaderName });
//     setSubSubNames((prev) => ({ ...prev, [section]: subSubHeaderName }));
//     setEditingSubHeader(null);
//     setSubNames((prev) => ({ ...prev, [section]: '' }));
//   };

//   const deleteSubSubSection = (section, subHeaderName, subSubHeaderName) => {
//     if (!hasPrivilege) {
//       setError(t('templates.no_permission'));
//       return;
//     }
//     setStructure((prev) => {
//       const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
//       const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
//       const updatedSubSections = prev[section][subKey].map((sub) =>
//         sub.name === subHeaderName
//           ? { ...sub, [subSubKey]: sub[subSubKey].filter((subSub) => subSub.name !== subSubHeaderName) }
//           : sub
//       );
//       return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
//     });
//     if (currentSubSubSection[section]?.name === subSubHeaderName) {
//       setCurrentSubSubSection((prev) => ({ ...prev, [section]: null }));
//     }
//     setEditingSubSubHeader(null);
//     setSubSubNames((prev) => ({ ...prev, [section]: '' }));
//     setError('');
//     updatePreviews();
//   };

//   const addField = (section) => {
//     if (!hasPrivilege) {
//       setError(t('templates.no_permission'));
//       return;
//     }
//     const selectedHeaderName = selectedSubHeader[section];
//     if (!selectedHeaderName) {
//       setError(t('templates.select_sub_header_first'));
//       return;
//     }

//     const { name, type, options, value } = fieldInputs[section];
//     if (!name.trim()) {
//       setError(t('templates.enter_field_name'));
//       return;
//     }

//     const newField = {
//       name: name.trim(),
//       type,
//       options:
//         type === 'image' || type === 'multi_image' || type === 'PDF' || type === 'Date' || type === 'DateTime' || type === 'Time'
//           ? []
//           : options
//           ? options.split(',').map((s) => s.trim()).filter((s) => s)
//           : [],
//       value:
//         type === 'image' || type === 'multi_image' || type === 'PDF' || type === 'Time'
//           ? ''
//           : type === 'checkbox' || type === 'array'
//           ? []
//           : type === 'dropdown' || type === 'radio'
//           ? value || ''
//           : type === 'Date' || type === 'DateTime'
//           ? value || ''
//           : value || '',
//     };

//     setStructure((prev) => {
//       const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
//       const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
//       const updatedSubSections = prev[section][subKey].map((sub) => {
//         if (sub.name !== selectedHeaderName) return sub;

//         if (editingField && editingField.section === section) {
//           if (editingField.level === 'subHeader') {
//             return {
//               ...sub,
//               fields: sub.fields.map((field) =>
//                 field.name === editingField.fieldName ? newField : field
//               ),
//             };
//           } else if (editingField.level === 'subSubHeader') {
//             return {
//               ...sub,
//               [subSubKey]: sub[subSubKey].map((subSub) =>
//                 subSub.name === editingField.subSubHeaderName
//                   ? {
//                       ...subSub,
//                       fields: subSub.fields.map((field) =>
//                         field.name === editingField.fieldName ? newField : field
//                       ),
//                     }
//                   : subSub
//               ),
//             };
//           }
//         }

//         if (currentSubSubSection[section]) {
//           return {
//             ...sub,
//             [subSubKey]: sub[subSubKey].map((subSub) =>
//               subSub.name === currentSubSubSection[section].name
//                 ? { ...subSub, fields: [...subSub.fields, newField] }
//                 : subSub
//             ),
//           };
//         } else {
//           return {
//             ...sub,
//             fields: [...(sub.fields || []), newField],
//           };
//         }
//       });
//       return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
//     });
//     setFieldInputs((prev) => ({ ...prev, [section]: { name: '', type: 'text', options: '', value: '' } }));
//     setEditingField(null);
//     setError('');
//     updatePreviews();
//   };

//   const editField = (section, fieldName, fieldData, level, subHeaderName, subSubHeaderName = null) => {
//     if (!hasPrivilege) {
//       setError(t('templates.no_permission'));
//       return;
//     }
//     setEditingField({ section, fieldName, level, subHeaderName, subSubHeaderName });
//     setFieldInputs((prev) => ({
//       ...prev,
//       [section]: {
//         name: fieldData.name,
//         type: fieldData.type,
//         options: fieldData.options ? fieldData.options.join(', ') : '',
//         value: Array.isArray(fieldData.value) ? fieldData.value.join(', ') : fieldData.value || '',
//       },
//     }));
//     updatePreviews();
//   };

//   const deleteField = (section, subHeaderName, fieldName, level, subSubHeaderName = null) => {
//     if (!hasPrivilege) {
//       setError(t('templates.no_permission'));
//       return;
//     }
//     setStructure((prev) => {
//       const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
//       const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
//       const updatedSubSections = prev[section][subKey].map((sub) => {
//         if (sub.name !== subHeaderName) return sub;

//         if (level === 'subHeader') {
//           return {
//             ...sub,
//             fields: sub.fields.filter((field) => field.name !== fieldName),
//           };
//         } else if (level === 'subSubHeader') {
//           return {
//             ...sub,
//             [subSubKey]: sub[subSubKey].map((subSub) =>
//               subSub.name === subSubHeaderName
//                 ? { ...subSub, fields: subSub.fields.filter((field) => field.name !== fieldName) }
//                 : subSub
//             ),
//           };
//         }
//         return sub;
//       });
//       return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
//     });
//     setEditingField(null);
//     setError('');
//     updatePreviews();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('templates.no_permission'));
//       return;
//     }
//     if (!selectedReportType) {
//       setError(t('templates.select_report_type'));
//       return;
//     }
//     if (!templateName.trim()) {
//       setError(t('templates.enter_template_name'));
//       return;
//     }
//     if (!structure.header.sub_headers.length && !structure.body.sub_bodies.length && !structure.footer.sub_footers.length) {
//       setError(t('templates.add_sub_section'));
//       return;
//     }

//     const template = {
//       reportType: selectedReportType,
//       name: templateName.trim(),
//       description: 'Dynamic NCR template',
//       created_by: createdBy,
//       created_at: new Date().toISOString(),
//       structure,
//     };

//     try {
//       await templateService.updateTemplate(id, template, authData.org_id, authData.access_token);
//       setTemplateResult(t('templates.updated_success'));
//       setError('');
//     } catch (err) {
//       console.error('Update template error:', err);
//       setError(t('templates.update_error', { message: err.message || 'Unknown error' }));
//       setTemplateResult('');
//     }
//   };

//   const handleDelete = async () => {
//     if (!hasPrivilege) {
//       setError(t('templates.no_permission'));
//       return;
//     }

//     if (!window.confirm(t('templates.confirm_delete'))) {
//       return;
//     }

//     try {
//       await templateService.deleteTemplate(id, authData.access_token);
//       setTemplateResult(t('templates.deleted_success'));
//       setError('');
//       navigate('/templates/select');
//     } catch (err) {
//       console.error('Delete template error:', err);
//       setError(t('templates.delete_error', { message: err.message || 'Unknown error' }));
//       setTemplateResult('');
//     }
//   };

//   const handleFieldTypeChange = (section, newType) => {
//     setFieldInputs((prev) => {
//       const currentField = prev[section];
//       let updatedOptions = currentField.options;
//       let updatedValue = currentField.value;

//       if (['image', 'multi_image', 'PDF', 'Date', 'DateTime', 'Time'].includes(newType)) {
//         updatedOptions = '';
//         updatedValue = ['image', 'multi_image', 'PDF', 'Time'].includes(newType) ? '' : updatedValue;
//       } else if (newType === 'checkbox' || newType === 'array') {
//         updatedValue = [];
//       } else if (newType === 'dropdown' || newType === 'radio') {
//         updatedValue = '';
//       }

//       return {
//         ...prev,
//         [section]: {
//           ...currentField,
//           type: newType,
//           options: updatedOptions,
//           value: updatedValue,
//         },
//       };
//     });
//     updatePreviews();
//   };

//   const renderSection = (section) => (
//     <div>
//       <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
//         {t(`templates.${section}`)}
//       </h3>
//       <div id={`${section}SubList`} className="space-y-2 mb-4">
//         {structure[section][section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers'].map(
//           (sub) => (
//             <div key={sub.name} className="border p-2 rounded-md bg-gray-50 dark:bg-gray-800">
//               <div className="flex items-center mb-2">
//                 <input
//                   type="radio"
//                   name={`${section}-sub-header`}
//                   value={sub.name}
//                   checked={selectedSubHeader[section] === sub.name}
//                   onChange={() => {
//                     setSelectedSubHeader((prev) => ({ ...prev, [section]: sub.name }));
//                     setCurrentSubSection((prev) => ({ ...prev, [section]: sub }));
//                     setCurrentSubSubSection((prev) => ({ ...prev, [section]: null }));
//                     setEditingSubSubHeader(null);
//                     setSubSubNames((prev) => ({ ...prev, [section]: '' }));
//                   }}
//                   className="mr-2"
//                 />
//                 <p className="font-semibold flex-1 text-gray-800 dark:text-gray-300">{sub.name}</p>
//                 <div className="flex space-x-2">
//                   <button
//                     type="button"
//                     onClick={() => editSubSection(section, sub.name)}
//                     className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
//                   >
//                     {t('common.edit')}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => deleteSubSection(section, sub.name)}
//                     className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
//                   >
//                     {t('common.delete')}
//                   </button>
//                 </div>
//               </div>
//               <div
//                 id={`${section}_${sub.name.replace(/\s+/g, '_')}_sub_sub`}
//                 className="ml-4 space-y-2"
//               >
//                 {(sub.fields || []).map((field) => (
//                   <div key={field.name} className="border p-2 rounded-md flex items-center bg-white dark:bg-gray-700">
//                     <div className="flex-1 grid grid-cols-2 gap-2">
//                       <div>
//                         <p className="text-sm"><strong>{t('templates.field_name')}:</strong> {field.name}</p>
//                         <p className="text-sm"><strong>{t('templates.field_type')}:</strong> {field.type}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm"><strong>{t('templates.field_options')}:</strong> {field.options?.length ? field.options.join(', ') : 'N/A'}</p>
//                         <p className="text-sm"><strong>{t('templates.field_default')}:</strong> {Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}</p>
//                       </div>
//                     </div>
//                     <div className="flex space-x-2">
//                       <button
//                         type="button"
//                         onClick={() => editField(section, field.name, field, 'subHeader', sub.name)}
//                         className="bg-blue-600 text-white dark:text-gray-200 px-3 py-1 rounded-md hover:bg-blue-700"
//                       >
//                         {t('common.edit')}
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => deleteField(section, sub.name, fieldName, level)}
//                         className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
//                       >
//                         {t('common.delete')}
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//                 {(sub[section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers'] || []).map(
//                   (subSub) => (
//                     <div key={subSub.name} className="border p-2 rounded-md bg-gray-200 dark:bg-gray-800">
//                       <div className="flex items-center mb-3">
//                         <p className="font-semibold flex-1 text-gray-900 dark:text-gray-300">{subSub.name}</p>
//                         <div className="flex space-x-2">
//                           <button
//                             type="button"
//                             onClick={() => editSubSubSection(section, subSub.name)}
//                             className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 dark"
//                           >
//                             {t('common.edit')}
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => deleteSubSubSection(section, sub.name, subSub.name)}
//                             className="bg-red-600 text-white dark:text-gray-200 px-3 py-1 rounded-md hover:bg-red-700"
//                           >
//                             {t('common.delete')}
//                           </button>
//                         </div>
//                       </div>
//                       <div
//                         id={`${section}_${sub.name.replace(/\s+/g, '_')}_${subSub.name.replace(/\s+/g, '_')}_fields`}
//                         className="ml-4 space-y-2"
//                       >
//                         {subSub.fields.map((field) => (
//                           <div key={field.name} className="border p-2 rounded-md flex items-center bg-white dark:bg-gray-700">
//                             <div className="flex-1 grid grid-cols-2 gap-2">
//                               <div>
//                                 <p className="text-sm"><strong>{t('templates.field_name')}:</strong> {field.name}</p>
//                                 <p className="text-sm"><strong>{t('templates.field_type')}:</strong> {field.type}</p>
//                               </div>
//                               <div>
//                                 <p className="text-sm"><strong>{t('templates.field_options')}:</strong> {field.options?.length ? field.options.join(', ') : 'N/A'}</p>
//                                 <p className="text-sm"><strong>{t('templates.field_default')}:</strong> {Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}</p>
//                               </div>
//                             </div>
//                             <div className="flex space-x-2">
//                               <button
//                                 type="button"
//                                 onClick={() => editField(section, field.name, field, 'subSubHeader', sub.name, subSub.name)}
//                                 className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
//                               >
//                                 {t('common.edit')}
//                               </button>
//                               <button
//                                 type="button"
//                                 onClick={() => deleteField(section, sub.name, field.name, 'subSubHeader', subSub.name)}
//                                 className="bg-red-600 text-white dark:text-gray-300 px-3 py-2 rounded-md hover:bg-red-700"
//                               >
//                                 {t('common.delete')}
//                               </button>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )
//                 )}
//             </div>
//             </div>
//           ))}
//       </div>
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//           {t(`templates.${section}_sub_name`)}
//         </label>
//         <div className="flex items-center space-x-2">
//           <input
//             type="text"
//             value={subNames[section]}
//             onChange={(e) => setSubNames((prev) => ({ ...prev, [section]: e.target.value }))}
//             onInput={(e) => {
//               const updatedSubNames = { ...subNames, [section]: e.target.value };
//               updatePreviews(updatedSubNames);
//             }}
//             className="flex-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
//             placeholder={t(`templates.${section}_sub_placeholder`)}
//             autoFocus={editingSubHeader?.section === section}
//           />
//           <button
//             type="button"
//             onClick={() => addSubSection(section)}
//             className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
//           >
//             {editingSubHeader?.section === section ? t('common.save') : t(`templates.add_${section}_sub`)}
//           </button>
//           {editingSubHeader?.section === section && (
//             <button
//               type="button"
//               onClick={() => {
//                 setEditingSubHeader(null);
//                 setSubNames((prev) => ({ ...prev, [section]: '' }));
//                 updatePreviews();
//               }}
//               className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 dark"
//             >
//               {t('common.cancel')}
//             </button>
//           )}
//         </div>
//       </div>
//       {structure[section][section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers'].length > 0 && (
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//             {t(`templates.${section}_sub_sub_name`)}
//           </label>
//           <div className="flex items-center space-x-2">
//             <input
//               type="text"
//               value={subSubNames[section]}
//               onChange={(e) => setSubSubNames((prev) => ({ ...prev, [section]: e.target.value }))}
//               onInput={(e) => {
//                 const updatedSubSubNames = { ...subSubNames, [section]: e.target.value };
//                 updatePreviews(updatedSubSubNames);
//               }}
//               className="flex-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
//               placeholder={t(`templates.${section}_sub_sub_placeholder`)}
//               autoFocus={editingSubSubHeader?.section === section}
//             />
//             <button
//               type="button"
//               onClick={() => addSubSubSection(section)}
//               className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
//             >
//               {editingSubSubHeader?.section === section ? t('common.save') : t(`templates.add_${section}_sub_sub`)}
//             </button>
//             {editingSubSubHeader?.section === section && (
//               <button
//                 type="button"
//                 onClick={() => {
//                   setEditingSubSubHeader(null);
//                   setSubSubNames((prev) => ({ ...prev, [section]: '' }));
//                   updatePreviews();
//                 }}
//                 className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 dark"
//               >
//                 {t('common.cancel')}
//               </button>
//             )}
//           </div>
//         </div>
//       )}
//       {selectedSubHeader[section] && (
//         <div>
//           <div className="flex items-center gap-x-4 mb-4">
//             <div className="flex-1">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 {t('templates.field_name')}
//               </label>
//               <input
//                 type="text"
//                 value={fieldInputs[section].name}
//                 onChange={(e) => setFieldInputs((prev) => ({ ...prev, [section]: { ...prev[section], name: e.target.value } }))}
//                 onInput={(e) => {
//                   const updatedFieldInputs = { ...fieldInputs, [section]: { ...fieldInputs[section], name: e.target.value } };
//                   updatePreviews(updatedFieldInputs);
//                 }}
//                 className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
//                 placeholder={t(`templates.${section}_field_name_placeholder`)}
//               />
//             </div>
//             <div className="flex-1">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 {t('templates.field_type')}
//               </label>
//               <select
//                 value={fieldInputs[section].type}
//                 onChange={(e) => handleFieldTypeChange(section, e.target.value)}
//                 className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
//               >
//                 <option value="text">{t('templates.type_text')}</option>
//                 <option value="checkbox">{t('templates.type_checkbox')}</option>
//                 <option value="array">{t('templates.type_array')}</option>
//                 <option value="dropdown">{t('templates.type_dropdown')}</option>
//                 <option value="image">{t('templates.type_image')}</option>
//                 <option value="multi_image">{t('templates.type_multi_image')}</option>
//                 <option value="PDF">{t('templates.type_pdf')}</option>
//                 <option value="radio">{t('templates.type_radio')}</option>
//                 <option value="Date">{t('templates.type_date')}</option>
//                 <option value="DateTime">{t('templates.type_datetime')}</option>
//                 <option value="Time">{t('templates.type_time')}</option>
//               </select>
//             </div>
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               {t('templates.field_options')}
//             </label>
//             <input
//               type="text"
//               value={fieldInputs[section].options}
//               onChange={(e) => setFieldInputs((prev) => ({ ...prev, [section]: { ...prev[section], options: e.target.value } }))}
//               onInput={(e) => {
//                 const updatedFieldInputs = { ...fieldInputs, [section]: { ...fieldInputs[section], options: e.target.value } };
//                 updatePreviews(updatedFieldInputs);
//               }}
//               className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
//               placeholder={t('templates.field_options_placeholder')}
//               disabled={['image', 'multi_image', 'PDF', 'Date', 'DateTime', 'Time'].includes(fieldInputs[section].type)}
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               {t('templates.field_default')}
//             </label>
//             <input
//               type="text"
//               value={fieldInputs[section].value}
//               onChange={(e) => setFieldInputs((prev) => ({ ...prev, [section]: { ...prev[section], value: e.target.value } }))}
//               onInput={(e) => {
//                 const updatedFieldInputs = { ...fieldInputs, [section]: { ...fieldInputs[section], value: e.target.value } };
//                 updatePreviews(updatedFieldInputs);
//               }}
//               className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
//               placeholder={t('templates.field_default_placeholder')}
//               disabled={['image', 'multi_image', 'PDF', 'Time'].includes(fieldInputs[section].type)}
//             />
//           </div>
//           <div className="flex items-center space-x-2">
//             <button
//               type="button"
//               onClick={() => addField(section)}
//               className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
//             >
//               {editingField?.section === section ? t('common.save') : t('templates.add_field')}
//             </button>
//             {editingField?.section === section && (
//               <button
//                 type="button"
//                 onClick={() => {
//                   setEditingField(null);
//                   setFieldInputs((prev) => ({ ...prev, [section]: { name: '', type: 'text', options: '', value: '' } }));
//                   updatePreviews();
//                 }}
//                 className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 dark"
//               >
//                 {t('common.cancel')}
//               </button>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   if (authLoading || loading) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <div className="flex h-screen overflow-hidden">
//       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//       <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
//         <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//         <main className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
//           <div className="sm:flex sm:justify-between sm:items-center mb-8">
//             <div className="mb-4 sm:mb-0">
//               <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-200 font-bold">
//                 {t('templates.edit_title')}
//               </h1>
//             </div>
//             <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//               <LanguageToggle />
//               <ModalSearch />
//               <ThemeToggle />
//             </div>
//           </div>

//           {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">
//               <span>{error}</span>
//               <button
//                 onClick={() => setError('')}
//                 className="absolute top-0 right-0 px-4 py-3"
//                 aria-label={t('common.dismiss_error')}
//               >
//                 <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
//                   <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
//                 </svg>
//               </button>
//             </div>
//           )}

//           <div className="flex flex-col lg:flex-row gap-8">
//             <div className="w-full lg:w-1/2 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
//               <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
//                 {t('templates.edit_template')}
//               </h2>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     {t('templates.report_type')}
//                   </label>
//                   <select
//                     value={selectedReportType}
//                     onChange={(e) => {
//                       setSelectedReportType(e.target.value);
//                       updatePreviews(templateName, createdBy, subNames, subSubNames, fieldInputs, e.target.value);
//                     }}
//                     className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
//                     required
//                   >
//                     <option value="">{t('templates.select_report_type')}</option>
//                     {reportNames.map((report) => (
//                       <option key={report._id} value={report.name}>
//                         {report.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     {t('templates.template_name')}
//                   </label>
//                   <input
//                     type="text"
//                     value={templateName}
//                     onChange={(e) => {
//                       setTemplateName(e.target.value);
//                       updatePreviews(e.target.value, createdBy, subNames, subSubNames, fieldInputs, selectedReportType);
//                     }}
//                     className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     {t('templates.created_by')}
//                   </label>
//                   <input
//                     type="text"
//                     value={createdBy}
//                     onChange={(e) => {
//                       setCreatedBy(e.target.value);
//                       updatePreviews(templateName, e.target.value, subNames, subSubNames, fieldInputs, selectedReportType);
//                     }}
//                     className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
//                     required
//                     readOnly
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     {t('templates.select_section')}
//                   </label>
//                   <select
//                     value={selectedSection}
//                     onChange={(e) => setSelectedSection(e.target.value)}
//                     className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
//                   >
//                     <option value="header">{t('templates.header')}</option>
//                     <option value="body">{t('templates.body')}</option>
//                     <option value="footer">{t('templates.footer')}</option>
//                   </select>
//                 </div>
//                 {renderSection(selectedSection)}
//                 <div className="flex gap-4">
//                   <button
//                     type="submit"
//                     className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
//                   >
//                     {t('templates.update_template')}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={handleDelete}
//                     className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
//                   >
//                     {t('templates.delete_template')}
//                   </button>
//                 </div>
//               </form>
//               {templateResult && (
//                 <div className="mt-4 text-sm text-green-600">{templateResult}</div>
//               )}
//             </div>

//             <div className="w-full lg:w-1/4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
//               <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
//                 {t('templates.json_preview')}
//               </h2>
//               <pre
//                 id="templatePreview"
//                 className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto h-[80vh] text-xs text-gray-800 dark:text-gray-300"
//               ></pre>
//             </div>

//             <div className="w-full lg:w-1/2 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
//                   {t('templates.ui_preview')}
//                 </h2>
//                 <button
//                   type="button"
//                   onClick={() => updatePreviews()}
//                   className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
//                 >
//                   {t('common.sync_ui_preview')}
//                 </button>
//               </div>
//               <div className="space-y-4 h-[80vh] overflow-y-auto">
//                 <div>
//                   <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
//                     {t('templates.header')}
//                   </h3>
//                   <div id="userUIHeaderFields" className="space-y-2"></div>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
//                     {t('templates.body')}
//                   </h3>
//                   <div id="userUIBodyFields" className="space-y-2"></div>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
//                     {t('templates.footer')}
//                   </h3>
//                   <div id="userUIFooterFields" className="space-y-2"></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default TemplateEditor;







import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import templateService from '../../lib/templateService';

const TemplateEditor = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [templateName, setTemplateName] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('');
  const [reportNames, setReportNames] = useState([]);
  const [structure, setStructure] = useState({
    header: { sub_headers: [] },
    body: { sub_bodies: [] },
    footer: { sub_footers: [] },
  });
  const [currentSubSection, setCurrentSubSection] = useState({
    header: null,
    body: null,
    footer: null,
  });
  const [currentSubSubSection, setCurrentSubSubSection] = useState({
    header: null,
    body: null,
    footer: null,
  });
  const [subNames, setSubNames] = useState({
    header: '',
    body: '',
    footer: '',
  });
  const [subSubNames, setSubSubNames] = useState({
    header: '',
    body: '',
    footer: '',
  });
  const [fieldInputs, setFieldInputs] = useState({
    header: { name: '', type: 'text', options: '', value: '', mandatory: false },
    body: { name: '', type: 'text', options: '', value: '', mandatory: false },
    footer: { name: '', type: 'text', options: '', value: '', mandatory: false },
  });
  const [templateResult, setTemplateResult] = useState('');
  const [selectedSection, setSelectedSection] = useState('header');
  const [selectedSubHeader, setSelectedSubHeader] = useState({
    header: null,
    body: null,
    footer: null,
  });
  const [editingSubHeader, setEditingSubHeader] = useState(null);
  const [editingSubSubHeader, setEditingSubSubHeader] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [checkboxStates, setCheckboxStates] = useState({});
  const [previewData, setPreviewData] = useState(null);
  const [subMandatory, setSubMandatory] = useState({
    header: false,
    body: false,
    footer: false,
  });
  const [subSubMandatory, setSubSubMandatory] = useState({
    header: false,
    body: false,
    footer: false,
  });
  const [targetSubSection, setTargetSubSection] = useState({
    header: null,
    body: null,
    footer: null,
  });
  const [targetSubSubSection, setTargetSubSubSection] = useState({
    header: null,
    body: null,
    footer: null,
  });

  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('templates.no_permission'));
      setLoading(false);
      return;
    }

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      setError(t('templates.invalid_template_id'));
      setLoading(false);
      return;
    }

    if (authData.privilege_ids.includes(1)) {
      setHasPrivilege(true);
      setCreatedBy(authData.user_id || 'user_001');

      const fetchData = async () => {
        try {
          const reportData = await templateService.fetchReportNames(authData.access_token);
          if (!Array.isArray(reportData)) {
            throw new Error('fetchReportNames did not return an array');
          }
          setReportNames(reportData);

          const template = await templateService.fetchTemplateById(id, authData.access_token);
          if (!template || typeof template !== 'object') {
            throw new Error('fetchTemplateById returned invalid template data');
          }
          if (!template.name || !template.structure) {
            throw new Error('Template missing required fields (name or structure)');
          }
          setTemplateName(template.name);
          setSelectedReportType(template.reportType || '');
          setStructure(template.structure || { header: { sub_headers: [] }, body: { sub_bodies: [] }, footer: { sub_footers: [] } });
          setCreatedBy(template.created_by || authData.user_id || 'user_001');
          updatePreviews(template.name, template.created_by, template.reportType);
        } catch (err) {
          console.error('Fetch data error:', err);
          setError(t('templates.fetch_error', { message: err.message || 'Unknown error' }));
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      setError(t('templates.no_permission'));
      setHasPrivilege(false);
      setLoading(false);
    }
  }, [authData, authLoading, id, t]);

  useEffect(() => {
    if (!previewData) return;

    try {
      const templatePreview = document.getElementById('templatePreview');
      if (templatePreview) {
        templatePreview.textContent = JSON.stringify(previewData, null, 2);
      }

      ['header', 'body', 'footer'].forEach((section) => {
        const uiFieldsContainer = document.getElementById(`userUI${section.charAt(0).toUpperCase() + section.slice(1)}Fields`);
        if (uiFieldsContainer) {
          uiFieldsContainer.innerHTML = '';
          const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
          const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
          previewData.structure[section][subKey].forEach((subSection) => {
            const mandatoryIndicator = subSection.mandatory ? '<span class="text-red-500">*</span>' : '';
            const subDiv = document.createElement('div');
            subDiv.className = 'mb-4';
            subDiv.innerHTML = `<h4 class="text-md font-medium mb-2">${subSection.name} ${mandatoryIndicator}</h4>`;

            const subFieldsDiv = document.createElement('div');
            subFieldsDiv.className = 'space-y-2';
            (subSection.fields || []).forEach((field) => {
              const fieldMandatoryIndicator = field.mandatory || subSection.mandatory ? '<span class="text-red-500">*</span>' : '';
              const fieldDiv = document.createElement('div');
              fieldDiv.className = 'border p-2 rounded-md grid grid-cols-2 gap-2 items-center';
              if (field.type === 'text') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <input type="text" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
                  </div>
                `;
              } else if (field.type === 'checkbox' || field.type === 'array') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <div class="mt-1 flex flex-wrap gap-2">
                      ${field.options
                        .map(
                          (opt) => {
                            const fieldId = `${section}_${subSection.name}_${field.name}_${opt}`;
                            const isChecked = checkboxStates[fieldId] ?? field.value.includes(opt);
                            return `
                              <label class="inline-flex items-center">
                                <input type="checkbox" ${isChecked ? 'checked' : ''} class="mr-1" onchange="window.updateCheckboxState('${fieldId}', this.checked)">
                                <span>${opt}</span>
                              </label>
                            `;
                          }
                        )
                        .join('')}
                    </div>
                  </div>
                `;
              } else if (field.type === 'dropdown') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <select class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" disabled>
                      <option value="">${t('templates.select_option')}</option>
                      ${field.options.map(opt => `<option value="${opt}" ${field.value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>
                  </div>
                `;
              } else if (field.type === 'image') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
                      ${t('templates.image_upload_placeholder')}
                    </div>
                  </div>
                `;
              } else if (field.type === 'multi_image') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
                      ${t('templates.multi_image_upload_placeholder')}
                    </div>
                  </div>
                `;
              } else if (field.type === 'PDF') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
                      ${t('templates.pdf_upload_placeholder')}
                    </div>
                  </div>
                `;
              } else if (field.type === 'radio') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <div class="mt-1 flex flex-wrap gap-2">
                      ${field.options
                        .map(
                          (opt) => {
                            const fieldId = `${section}_${subSection.name}_${field.name}_${opt}`;
                            const isChecked = field.value === opt;
                            return `
                              <label class="inline-flex items-center">
                                <input type="radio" name="${fieldId}" ${isChecked ? 'checked' : ''} class="mr-1" disabled>
                                <span>${opt}</span>
                              </label>
                            `;
                          }
                        )
                        .join('')}
                    </div>
                  </div>
                `;
              } else if (field.type === 'Date') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <input type="date" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
                  </div>
                `;
              } else if (field.type === 'DateTime') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <input type="datetime-local" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
                  </div>
                `;
              } else if (field.type === 'Time') {
                fieldDiv.innerHTML = `
                  <div class="col-span-1">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                    <input type="time" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
                  </div>
                `;
              }
              subFieldsDiv.appendChild(fieldDiv);
            });
            subDiv.appendChild(subFieldsDiv);

            const subSubSections = subSection[subSubKey] || [];
            subSubSections.forEach((subSubSection) => {
              const subSubMandatoryIndicator = subSubSection.mandatory || subSection.mandatory ? '<span class="text-red-500">*</span>' : '';
              const subSubDiv = document.createElement('div');
              subSubDiv.className = 'ml-4 mb-3';
              subSubDiv.innerHTML = `<h5 class="text-sm font-medium mb-2">${subSubSection.name} ${subSubMandatoryIndicator}</h5>`;
              const fieldsDiv = document.createElement('div');
              fieldsDiv.className = 'space-y-2';
              subSubSection.fields.forEach((field) => {
                const fieldMandatoryIndicator = field.mandatory || subSubSection.mandatory || subSection.mandatory ? '<span class="text-red-500">*</span>' : '';
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'border p-2 rounded-md grid grid-cols-2 gap-2 items-center';
                if (field.type === 'text') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <input type="text" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
                    </div>
                  `;
                } else if (field.type === 'checkbox' || field.type === 'array') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <div class="mt-1 flex flex-wrap gap-2">
                        ${field.options
                          .map(
                            (opt) => {
                              const fieldId = `${section}_${subSection.name}_${subSubSection.name}_${field.name}_${opt}`;
                              const isChecked = checkboxStates[fieldId] ?? field.value.includes(opt);
                              return `
                                <label class="inline-flex items-center">
                                  <input type="checkbox" ${isChecked ? 'checked' : ''} class="mr-1" onchange="window.updateCheckboxState('${fieldId}', this.checked)">
                                  <span>${opt}</span>
                                </label>
                              `;
                            }
                          )
                          .join('')}
                      </div>
                    </div>
                  `;
                } else if (field.type === 'dropdown') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <select class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" disabled>
                        <option value="">${t('templates.select_option')}</option>
                        ${field.options.map(opt => `<option value="${opt}" ${field.value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                      </select>
                    </div>
                  `;
                } else if (field.type === 'image') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
                        ${t('templates.image_upload_placeholder')}
                      </div>
                    </div>
                  `;
                } else if (field.type === 'multi_image') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
                        ${t('templates.multi_image_upload_placeholder')}
                      </div>
                    </div>
                  `;
                } else if (field.type === 'PDF') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <div class="mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500">
                        ${t('templates.pdf_upload_placeholder')}
                      </div>
                    </div>
                  `;
                } else if (field.type === 'radio') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <div class="mt-1 flex flex-wrap gap-2">
                        ${field.options
                          .map(
                            (opt) => {
                              const fieldId = `${section}_${subSection.name}_${subSubSection.name}_${field.name}_${opt}`;
                              const isChecked = field.value === opt;
                              return `
                                <label class="inline-flex items-center">
                                  <input type="radio" name="${fieldId}" ${isChecked ? 'checked' : ''} class="mr-1" disabled>
                                  <span>${opt}</span>
                                </label>
                              `;
                            }
                          )
                          .join('')}
                      </div>
                    </div>
                  `;
                } else if (field.type === 'Date') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <input type="date" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
                    </div>
                  `;
                } else if (field.type === 'DateTime') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <input type="datetime-local" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
                    </div>
                  `;
                } else if (field.type === 'Time') {
                  fieldDiv.innerHTML = `
                    <div class="col-span-1">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">${field.name} ${fieldMandatoryIndicator}</label>
                      <input type="time" class="mt-1 block w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-600" value="${field.value}" readonly />
                    </div>
                  `;
                }
                fieldsDiv.appendChild(fieldDiv);
              });
              subSubDiv.appendChild(fieldsDiv);
              subDiv.appendChild(subSubDiv);
            });
            uiFieldsContainer.appendChild(subDiv);
          });
        }
      });

      window.updateCheckboxState = (fieldId, isChecked) => {
        setCheckboxStates((prev) => ({ ...prev, [fieldId]: isChecked }));
      };
    } catch (err) {
      console.error('Preview update error:', err);
      setError(t('templates.preview_error', { message: err.message || 'Unknown error' }));
    }
  }, [previewData, checkboxStates, t]);

  const updatePreviews = (
    overrideTemplateName = templateName,
    overrideCreatedBy = createdBy,
    overrideSubNames = subNames,
    overrideSubSubNames = subSubNames,
    overrideFieldInputs = fieldInputs,
    overrideReportType = selectedReportType
  ) => {
    try {
      const template = {
        reportType: overrideReportType || '',
        name: overrideTemplateName || 'Unnamed Template',
        description: 'Dynamic NCR template',
        created_by: overrideCreatedBy || 'Unknown User',
        created_at: new Date().toISOString(),
        structure,
      };
      setPreviewData(template);
    } catch (err) {
      console.error('Update previews error:', err);
      setError(t('templates.preview_error', { message: err.message || 'Unknown error' }));
    }
  };

  const addSubSection = (section) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    const subName = subNames[section].trim();
    if (!subName) {
      setError(t('templates.enter_sub_name'));
      return;
    }

    const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
    const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';

    const isDuplicate = structure[section][subKey].some(
      (sub) => sub.name.toLowerCase() === subName.toLowerCase() && sub.name !== (editingSubHeader?.name || '')
    );
    if (isDuplicate) {
      setError(t('templates.duplicate_sub_name'));
      return;
    }

    if (editingSubHeader && editingSubHeader.section === section) {
      setStructure((prev) => {
        const updatedSubSections = prev[section][subKey].map((sub) =>
          sub.name === editingSubHeader.name ? { ...sub, name: subName, mandatory: subMandatory[section] } : sub
        );
        return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
      });
      setEditingSubHeader(null);
      if (selectedSubHeader[section] === editingSubHeader.name) {
        setSelectedSubHeader((prev) => ({ ...prev, [section]: subName }));
      }
      if (currentSubSection[section]?.name === editingSubHeader.name) {
        setCurrentSubSection((prev) => ({ ...prev, [section]: { ...prev[section], name: subName, mandatory: subMandatory[section] } }));
      }
    } else {
      const newSubSection = { name: subName, fields: [], [subSubKey]: [], mandatory: subMandatory[section] };
      setStructure((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subKey]: [...prev[section][subKey], newSubSection],
        },
      }));
      setCurrentSubSection((prev) => ({ ...prev, [section]: newSubSection }));
      setCurrentSubSubSection((prev) => ({ ...prev, [section]: null }));
      setSelectedSubHeader((prev) => ({ ...prev, [section]: subName }));
    }
    setSubNames((prev) => ({ ...prev, [section]: '' }));
    setSubMandatory((prev) => ({ ...prev, [section]: false }));
    setTargetSubSection((prev) => ({ ...prev, [section]: null }));
    setTargetSubSubSection((prev) => ({ ...prev, [section]: null }));
    setError('');
    updatePreviews();
  };

  const editSubSection = (section, subHeaderName) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
    const subSection = structure[section][subKey].find((sub) => sub.name === subHeaderName);
    if (!subSection) {
      setError(t('templates.sub_section_not_found'));
      return;
    }
    setEditingSubHeader({ section, name: subHeaderName });
    setSubNames((prev) => ({ ...prev, [section]: subHeaderName }));
    setSubMandatory((prev) => ({ ...prev, [section]: subSection.mandatory || false }));
    setEditingSubSubHeader(null);
    setSubSubNames((prev) => ({ ...prev, [section]: '' }));
    setSubSubMandatory((prev) => ({ ...prev, [section]: false }));
    setTargetSubSection((prev) => ({ ...prev, [section]: subHeaderName }));
    setTargetSubSubSection((prev) => ({ ...prev, [section]: null }));
  };

  const deleteSubSection = (section, subHeaderName) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    setStructure((prev) => {
      const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
      const updatedSubSections = prev[section][subKey].filter((sub) => sub.name !== subHeaderName);
      return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
    });
    if (currentSubSection[section]?.name === subHeaderName) {
      setCurrentSubSection((prev) => ({ ...prev, [section]: null }));
      setCurrentSubSubSection((prev) => ({ ...prev, [section]: null }));
    }
    if (selectedSubHeader[section] === subHeaderName) {
      setSelectedSubHeader((prev) => ({ ...prev, [section]: null }));
    }
    setEditingSubHeader(null);
    setSubNames((prev) => ({ ...prev, [section]: '' }));
    setSubMandatory((prev) => ({ ...prev, [section]: false }));
    setTargetSubSection((prev) => ({ ...prev, [section]: null }));
    setTargetSubSubSection((prev) => ({ ...prev, [section]: null }));
    setError('');
    updatePreviews();
  };

  const addSubSubSection = (section) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    const selectedHeaderName = targetSubSection[section] || selectedSubHeader[section];
    if (!selectedHeaderName) {
      setError(t('templates.select_sub_header_first'));
      return;
    }

    const subSubName = subSubNames[section].trim();
    if (!subSubName) {
      setError(t('templates.enter_sub_sub_name'));
      return;
    }

    const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
    const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';

    const parentSubSection = structure[section][subKey].find((sub) => sub.name === selectedHeaderName);
    if (!parentSubSection) {
      setError(t('templates.sub_section_not_found'));
      return;
    }

    const isDuplicate = parentSubSection[subSubKey]?.some(
      (subSub) => subSub.name.toLowerCase() === subSubName.toLowerCase() && subSub.name !== (editingSubSubHeader?.name || '')
    );
    if (isDuplicate) {
      setError(t('templates.duplicate_sub_sub_name'));
      return;
    }

    if (editingSubSubHeader && editingSubSubHeader.section === section) {
      setStructure((prev) => {
        const updatedSubSections = prev[section][subKey].map((sub) =>
          sub.name === selectedHeaderName
            ? {
                ...sub,
                [subSubKey]: sub[subSubKey].map((subSub) =>
                  subSub.name === editingSubSubHeader.name ? { ...subSub, name: subSubName, mandatory: subSubMandatory[section] } : subSub
                ),
              }
            : sub
        );
        return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
      });
      setEditingSubSubHeader(null);
      if (currentSubSubSection[section]?.name === editingSubSubHeader.name) {
        setCurrentSubSubSection((prev) => ({ ...prev, [section]: { ...prev[section], name: subSubName, mandatory: subSubMandatory[section] } }));
      }
    } else {
      const newSubSubSection = { name: subSubName, fields: [], mandatory: subSubMandatory[section] };
      setStructure((prev) => {
        const updatedSubSections = prev[section][subKey].map((sub) =>
          sub.name === selectedHeaderName
            ? { ...sub, [subSubKey]: [...(sub[subSubKey] || []), newSubSubSection] }
            : sub
        );
        return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
      });
      setCurrentSubSubSection((prev) => ({ ...prev, [section]: newSubSubSection }));
    }
    setSubSubNames((prev) => ({ ...prev, [section]: '' }));
    setSubSubMandatory((prev) => ({ ...prev, [section]: false }));
    setTargetSubSubSection((prev) => ({ ...prev, [section]: null }));
    setError('');
    updatePreviews();
  };

  const editSubSubSection = (section, subSubHeaderName) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    const selectedHeaderName = targetSubSection[section] || selectedSubHeader[section];
    if (!selectedHeaderName) {
      setError(t('templates.select_sub_header_first'));
      return;
    }
    const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
    const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
    const parentSubSection = structure[section][subKey].find((sub) => sub.name === selectedHeaderName);
    if (!parentSubSection) {
      setError(t('templates.sub_section_not_found'));
      return;
    }
    const subSubSection = parentSubSection[subSubKey]?.find((subSub) => subSub.name === subSubHeaderName);
    if (!subSubSection) {
      setError(t('templates.sub_sub_section_not_found'));
      return;
    }
    setEditingSubSubHeader({ section, name: subSubHeaderName });
    setSubSubNames((prev) => ({ ...prev, [section]: subSubHeaderName }));
    setSubSubMandatory((prev) => ({ ...prev, [section]: subSubSection.mandatory || false }));
    setEditingSubHeader(null);
    setSubNames((prev) => ({ ...prev, [section]: '' }));
    setSubMandatory((prev) => ({ ...prev, [section]: false }));
    setTargetSubSubSection((prev) => ({ ...prev, [section]: subSubHeaderName }));
  };

  const deleteSubSubSection = (section, subHeaderName, subSubHeaderName) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    setStructure((prev) => {
      const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
      const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
      const updatedSubSections = prev[section][subKey].map((sub) =>
        sub.name === subHeaderName
          ? { ...sub, [subSubKey]: sub[subSubKey].filter((subSub) => subSub.name !== subSubHeaderName) }
          : sub
      );
      return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
    });
    if (currentSubSubSection[section]?.name === subSubHeaderName) {
      setCurrentSubSubSection((prev) => ({ ...prev, [section]: null }));
    }
    setEditingSubSubHeader(null);
    setSubSubNames((prev) => ({ ...prev, [section]: '' }));
    setSubSubMandatory((prev) => ({ ...prev, [section]: false }));
    setTargetSubSubSection((prev) => ({ ...prev, [section]: null }));
    setError('');
    updatePreviews();
  };

  const addField = (section) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    const selectedHeaderName = targetSubSection[section] || selectedSubHeader[section];
    if (!selectedHeaderName) {
      setError(t('templates.select_sub_header_first'));
      return;
    }

    const { name, type, options, value, mandatory } = fieldInputs[section];
    if (!name.trim()) {
      setError(t('templates.enter_field_name'));
      return;
    }

    const newField = {
      name: name.trim(),
      type,
      options:
        type === 'image' || type === 'multi_image' || type === 'PDF' || type === 'Date' || type === 'DateTime' || type === 'Time'
          ? []
          : options
          ? options.split(',').map((s) => s.trim()).filter((s) => s)
          : [],
      value:
        type === 'image' || type === 'multi_image' || type === 'PDF' || type === 'Time'
          ? ''
          : type === 'checkbox' || type === 'array'
          ? []
          : type === 'dropdown' || type === 'radio'
          ? value || ''
          : type === 'Date' || type === 'DateTime'
          ? value || ''
          : value || '',
      mandatory,
    };

    setStructure((prev) => {
      const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
      const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
      const updatedSubSections = prev[section][subKey].map((sub) => {
        if (sub.name !== selectedHeaderName) return sub;

        if (editingField && editingField.section === section) {
          if (editingField.level === 'subHeader') {
            return {
              ...sub,
              fields: sub.fields.map((field) =>
                field.name === editingField.fieldName ? newField : field
              ),
            };
          } else if (editingField.level === 'subSubHeader') {
            return {
              ...sub,
              [subSubKey]: sub[subSubKey].map((subSub) =>
                subSub.name === editingField.subSubHeaderName
                  ? {
                      ...subSub,
                      fields: subSub.fields.map((field) =>
                        field.name === editingField.fieldName ? newField : field
                      ),
                    }
                  : subSub
              ),
            };
          }
        }

        const targetSubSubName = targetSubSubSection[section];
        if (targetSubSubName) {
          return {
            ...sub,
            [subSubKey]: sub[subSubKey].map((subSub) =>
              subSub.name === targetSubSubName
                ? { ...subSub, fields: [...subSub.fields, newField] }
                : subSub
            ),
          };
        } else {
          return {
            ...sub,
            fields: [...(sub.fields || []), newField],
          };
        }
      });
      return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
    });
    setFieldInputs((prev) => ({ ...prev, [section]: { name: '', type: 'text', options: '', value: '', mandatory: false } }));
    setEditingField(null);
    setError('');
    updatePreviews();
  };

  const editField = (section, fieldName, fieldData, level, subHeaderName, subSubHeaderName = null) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    setEditingField({ section, fieldName, level, subHeaderName, subSubHeaderName });
    setFieldInputs((prev) => ({
      ...prev,
      [section]: {
        name: fieldData.name,
        type: fieldData.type,
        options: fieldData.options ? fieldData.options.join(', ') : '',
        value: Array.isArray(fieldData.value) ? fieldData.value.join(', ') : fieldData.value || '',
        mandatory: fieldData.mandatory || false,
      },
    }));
    setTargetSubSection((prev) => ({ ...prev, [section]: subHeaderName }));
    setTargetSubSubSection((prev) => ({ ...prev, [section]: subSubHeaderName }));
    updatePreviews();
  };

  const deleteField = (section, subHeaderName, fieldName, level, subSubHeaderName = null) => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    setStructure((prev) => {
      const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
      const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
      const updatedSubSections = prev[section][subKey].map((sub) => {
        if (sub.name !== subHeaderName) return sub;

        if (level === 'subHeader') {
          return {
            ...sub,
            fields: sub.fields.filter((field) => field.name !== fieldName),
          };
        } else if (level === 'subSubHeader') {
          return {
            ...sub,
            [subSubKey]: sub[subSubKey].map((subSub) =>
              subSub.name === subSubHeaderName
                ? { ...subSub, fields: subSub.fields.filter((field) => field.name !== fieldName) }
                : subSub
            ),
          };
        }
        return sub;
      });
      return { ...prev, [section]: { ...prev[section], [subKey]: updatedSubSections } };
    });
    setEditingField(null);
    setError('');
    updatePreviews();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }
    if (!selectedReportType) {
      setError(t('templates.select_report_type'));
      return;
    }
    if (!templateName.trim()) {
      setError(t('templates.enter_template_name'));
      return;
    }
    if (!structure.header.sub_headers.length && !structure.body.sub_bodies.length && !structure.footer.sub_footers.length) {
      setError(t('templates.add_sub_section'));
      return;
    }

    const template = {
      reportType: selectedReportType,
      name: templateName.trim(),
      description: 'Dynamic NCR template',
      created_by: createdBy,
      created_at: new Date().toISOString(),
      structure,
    };

    try {
      await templateService.updateTemplate(id, template, authData.org_id, authData.access_token);
      setTemplateResult(t('templates.updated_success'));
      setError('');
    } catch (err) {
      console.error('Update template error:', err);
      setError(t('templates.update_error', { message: err.message || 'Unknown error' }));
      setTemplateResult('');
    }
  };

  const handleDelete = async () => {
    if (!hasPrivilege) {
      setError(t('templates.no_permission'));
      return;
    }

    if (!window.confirm(t('templates.confirm_delete'))) {
      return;
    }

    try {
      await templateService.deleteTemplate(id, authData.access_token);
      setTemplateResult(t('templates.deleted_success'));
      setError('');
      navigate('/templates/select');
    } catch (err) {
      console.error('Delete template error:', err);
      setError(t('templates.delete_error', { message: err.message || 'Unknown error' }));
      setTemplateResult('');
    }
  };

  const handleFieldTypeChange = (section, newType) => {
    setFieldInputs((prev) => {
      const currentField = prev[section];
      let updatedOptions = currentField.options;
      let updatedValue = currentField.value;

      if (['image', 'multi_image', 'PDF', 'Date', 'DateTime', 'Time'].includes(newType)) {
        updatedOptions = '';
        updatedValue = ['image', 'multi_image', 'PDF', 'Time'].includes(newType) ? '' : updatedValue;
      } else if (newType === 'checkbox' || newType === 'array') {
        updatedValue = [];
      } else if (newType === 'dropdown' || newType === 'radio') {
        updatedValue = '';
      }

      return {
        ...prev,
        [section]: {
          ...currentField,
          type: newType,
          options: updatedOptions,
          value: updatedValue,
        },
      };
    });
    updatePreviews();
  };

  const renderSection = (section) => {
    const subKey = section === 'header' ? 'sub_headers' : section === 'body' ? 'sub_bodies' : 'sub_footers';
    const subSubKey = section === 'header' ? 'sub_sub_headers' : section === 'body' ? 'sub_sub_bodies' : 'sub_sub_footers';
    const subSections = structure[section][subKey] || [];

    return (
      <div>
        <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
          {t(`templates.${section}`)}
        </h3>
        <div id={`${section}SubList`} className="space-y-2 mb-4">
          {subSections.map((sub) => (
            <div key={sub.name} className="border p-2 rounded-md bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  name={`${section}-sub-header`}
                  value={sub.name}
                  checked={selectedSubHeader[section] === sub.name}
                  onChange={() => {
                    setSelectedSubHeader((prev) => ({ ...prev, [section]: sub.name }));
                    setCurrentSubSection((prev) => ({ ...prev, [section]: sub }));
                    setCurrentSubSubSection((prev) => ({ ...prev, [section]: null }));
                    setEditingSubSubHeader(null);
                    setSubSubNames((prev) => ({ ...prev, [section]: '' }));
                    setSubSubMandatory((prev) => ({ ...prev, [section]: false }));
                    setTargetSubSection((prev) => ({ ...prev, [section]: sub.name }));
                    setTargetSubSubSection((prev) => ({ ...prev, [section]: null }));
                  }}
                  className="mr-2"
                />
                <p className="font-semibold flex-1 text-gray-800 dark:text-gray-300">{sub.name} {sub.mandatory ? <span className="text-red-500">*</span> : ''}</p>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => editSubSection(section, sub.name)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSubSection(section, sub.name)}
                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
              <div id={`${section}_${sub.name.replace(/\s+/g, '_')}_sub_sub`} className="ml-4 space-y-2">
                {(sub.fields || []).map((field) => (
                  <div key={field.name} className="border p-2 rounded-md flex items-center bg-white dark:bg-gray-700">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm"><strong>{t('templates.field_name')}:</strong> {field.name}</p>
                        <p className="text-sm"><strong>{t('templates.field_type')}:</strong> {field.type}</p>
                      </div>
                      <div>
                        <p className="text-sm"><strong>{t('templates.field_options')}:</strong> {field.options?.length ? field.options.join(', ') : 'N/A'}</p>
                        <p className="text-sm"><strong>{t('templates.field_default')}:</strong> {Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}</p>
                        <p className="text-sm"><strong>{t('templates.field_mandatory')}:</strong> {field.mandatory || sub.mandatory ? t('common.yes') : t('common.no')}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => editField(section, field.name, field, 'subHeader', sub.name)}
                        className="bg-blue-600 text-white dark:text-gray-200 px-3 py-1 rounded-md hover:bg-blue-700"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteField(section, sub.name, field.name, 'subHeader')}
                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                ))}
                {(sub[subSubKey] || []).map((subSub) => (
                  <div key={subSub.name} className="border p-2 rounded-md bg-gray-200 dark:bg-gray-800">
                    <div className="flex items-center mb-3">
                      <p className="font-semibold flex-1 text-gray-900 dark:text-gray-300">{subSub.name} {subSub.mandatory || sub.mandatory ? <span className="text-red-500">*</span> : ''}</p>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => editSubSubSection(section, subSub.name)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 dark"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSubSubSection(section, sub.name, subSub.name)}
                          className="bg-red-600 text-white dark:text-gray-200 px-3 py-1 rounded-md hover:bg-red-700"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </div>
                    <div id={`${section}_${sub.name.replace(/\s+/g, '_')}_${subSub.name.replace(/\s+/g, '_')}_fields`} className="ml-4 space-y-2">
                      {subSub.fields.map((field) => (
                        <div key={field.name} className="border p-2 rounded-md flex items-center bg-white dark:bg-gray-700">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm"><strong>{t('templates.field_name')}:</strong> {field.name}</p>
                              <p className="text-sm"><strong>{t('templates.field_type')}:</strong> {field.type}</p>
                            </div>
                            <div>
                              <p className="text-sm"><strong>{t('templates.field_options')}:</strong> {field.options?.length ? field.options.join(', ') : 'N/A'}</p>
                              <p className="text-sm"><strong>{t('templates.field_default')}:</strong> {Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}</p>
                              <p className="text-sm"><strong>{t('templates.field_mandatory')}:</strong> {field.mandatory || subSub.mandatory || sub.mandatory ? t('common.yes') : t('common.no')}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => editField(section, field.name, field, 'subSubHeader', sub.name, subSub.name)}
                              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                            >
                              {t('common.edit')}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteField(section, sub.name, field.name, 'subSubHeader', subSub.name)}
                              className="bg-red-600 text-white dark:text-gray-300 px-3 py-1 rounded-md hover:bg-red-700"
                            >
                              {t('common.delete')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t(`templates.${section}_sub_name`)}
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={subNames[section]}
              onChange={(e) => setSubNames((prev) => ({ ...prev, [section]: e.target.value }))}
              onInput={(e) => {
                const updatedSubNames = { ...subNames, [section]: e.target.value };
                updatePreviews(templateName, createdBy, updatedSubNames, subSubNames, fieldInputs, selectedReportType);
              }}
              className="flex-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              placeholder={t(`templates.${section}_sub_placeholder`)}
              autoFocus={editingSubHeader?.section === section}
            />
            <button
              type="button"
              onClick={() => addSubSection(section)}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {editingSubHeader?.section === section ? t('common.save') : t(`templates.add_${section}_sub`)}
            </button>
            {editingSubHeader?.section === section && (
              <button
                type="button"
                onClick={() => {
                  setEditingSubHeader(null);
                  setSubNames((prev) => ({ ...prev, [section]: '' }));
                  setSubMandatory((prev) => ({ ...prev, [section]: false }));
                  setTargetSubSection((prev) => ({ ...prev, [section]: null }));
                  updatePreviews();
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 dark"
              >
                {t('common.cancel')}
              </button>
            )}
          </div>
          <div className="mt-2">
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={subMandatory[section]}
                onChange={(e) => setSubMandatory((prev) => ({ ...prev, [section]: e.target.checked }))}
                className="mr-2"
              />
              {t('templates.sub_mandatory')}
            </label>
          </div>
        </div>
        {subSections.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t(`templates.select_target_sub`)}
            </label>
            <select
              value={targetSubSection[section] || ''}
              onChange={(e) => {
                setTargetSubSection((prev) => ({ ...prev, [section]: e.target.value || null }));
                setTargetSubSubSection((prev) => ({ ...prev, [section]: null }));
              }}
              className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            >
              <option value="">{t('templates.select_sub_section')}</option>
              {subSections.map((sub) => (
                <option key={sub.name} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {targetSubSection[section] && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t(`templates.${section}_sub_sub_name`)}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={subSubNames[section]}
                onChange={(e) => setSubSubNames((prev) => ({ ...prev, [section]: e.target.value }))}
                onInput={(e) => {
                  const updatedSubSubNames = { ...subSubNames, [section]: e.target.value };
                  updatePreviews(templateName, createdBy, subNames, updatedSubSubNames, fieldInputs, selectedReportType);
                }}
                className="flex-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                placeholder={t(`templates.${section}_sub_sub_placeholder`)}
                autoFocus={editingSubSubHeader?.section === section}
              />
              <button
                type="button"
                onClick={() => addSubSubSection(section)}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {editingSubSubHeader?.section === section ? t('common.save') : t(`templates.add_${section}_sub_sub`)}
              </button>
              {editingSubSubHeader?.section === section && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSubSubHeader(null);
                    setSubSubNames((prev) => ({ ...prev, [section]: '' }));
                    setSubSubMandatory((prev) => ({ ...prev, [section]: false }));
                    setTargetSubSubSection((prev) => ({ ...prev, [section]: null }));
                    updatePreviews();
                  }}
                  className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 dark"
                >
                  {t('common.cancel')}
                </button>
              )}
            </div>
            <div className="mt-2">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={subSubMandatory[section]}
                  onChange={(e) => setSubSubMandatory((prev) => ({ ...prev, [section]: e.target.checked }))}
                  className="mr-2"
                />
                {t('templates.sub_sub_mandatory')}
              </label>
            </div>
          </div>
        )}
        {targetSubSection[section] && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t(`templates.select_target_sub_sub`)}
            </label>
            <select
              value={targetSubSubSection[section] || ''}
              onChange={(e) => setTargetSubSubSection((prev) => ({ ...prev, [section]: e.target.value || null }))}
              className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            >
              <option value="">{t('templates.select_sub_sub_section')}</option>
              {subSections
                .find((sub) => sub.name === targetSubSection[section])?.[subSubKey]
                ?.map((subSub) => (
                  <option key={subSub.name} value={subSub.name}>
                    {subSub.name}
                  </option>
                ))}
            </select>
          </div>
        )}
        {targetSubSection[section] && (
          <div>
            <div className="flex items-center gap-x-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('templates.field_name')}
                </label>
                <input
                  type="text"
                  value={fieldInputs[section].name}
                  onChange={(e) => setFieldInputs((prev) => ({ ...prev, [section]: { ...prev[section], name: e.target.value } }))}
                  onInput={(e) => {
                    const updatedFieldInputs = { ...fieldInputs, [section]: { ...fieldInputs[section], name: e.target.value } };
                    updatePreviews(templateName, createdBy, subNames, subSubNames, updatedFieldInputs, selectedReportType);
                  }}
                  className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  placeholder={t(`templates.${section}_field_name_placeholder`)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('templates.field_type')}
                </label>
                <select
                  value={fieldInputs[section].type}
                  onChange={(e) => handleFieldTypeChange(section, e.target.value)}
                  className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                >
                  <option value="text">{t('templates.type_text')}</option>
                  <option value="checkbox">{t('templates.type_checkbox')}</option>
                  <option value="array">{t('templates.type_array')}</option>
                  <option value="dropdown">{t('templates.type_dropdown')}</option>
                  <option value="image">{t('templates.type_image')}</option>
                  <option value="multi_image">{t('templates.type_multi_image')}</option>
                  <option value="PDF">{t('templates.type_pdf')}</option>
                  <option value="radio">{t('templates.type_radio')}</option>
                  <option value="Date">{t('templates.type_date')}</option>
                  <option value="DateTime">{t('templates.type_datetime')}</option>
                  <option value="Time">{t('templates.type_time')}</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('templates.field_options')}
              </label>
              <input
                type="text"
                value={fieldInputs[section].options}
                onChange={(e) => setFieldInputs((prev) => ({ ...prev, [section]: { ...prev[section], options: e.target.value } }))}
                onInput={(e) => {
                  const updatedFieldInputs = { ...fieldInputs, [section]: { ...fieldInputs[section], options: e.target.value } };
                  updatePreviews(templateName, createdBy, subNames, subSubNames, updatedFieldInputs, selectedReportType);
                }}
                className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                placeholder={t('templates.field_options_placeholder')}
                disabled={['image', 'multi_image', 'PDF', 'Date', 'DateTime', 'Time'].includes(fieldInputs[section].type)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('templates.field_default')}
              </label>
              <input
                type="text"
                value={fieldInputs[section].value}
                onChange={(e) => setFieldInputs((prev) => ({ ...prev, [section]: { ...prev[section], value: e.target.value } }))}
                onInput={(e) => {
                  const updatedFieldInputs = { ...fieldInputs, [section]: { ...fieldInputs[section], value: e.target.value } };
                  updatePreviews(templateName, createdBy, subNames, subSubNames, updatedFieldInputs, selectedReportType);
                }}
                className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                placeholder={t('templates.field_default_placeholder')}
                disabled={['image', 'multi_image', 'PDF', 'Time'].includes(fieldInputs[section].type)}
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={fieldInputs[section].mandatory}
                  onChange={(e) => setFieldInputs((prev) => ({ ...prev, [section]: { ...prev[section], mandatory: e.target.checked } }))}
                  className="mr-2"
                />
                {t('templates.field_mandatory')}
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => addField(section)}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {editingField?.section === section ? t('common.save') : t('templates.add_field')}
              </button>
              {editingField?.section === section && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingField(null);
                    setFieldInputs((prev) => ({ ...prev, [section]: { name: '', type: 'text', options: '', value: '', mandatory: false } }));
                    updatePreviews();
                  }}
                  className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 dark"
                >
                  {t('common.cancel')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
          <div className="sm:flex sm:justify-between sm:items-center mb-8">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-200 font-bold">
                {t('templates.edit_title')}
              </h1>
            </div>
            <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
              <LanguageToggle />
              <ModalSearch />
              <ThemeToggle />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">
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

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/2 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                {t('templates.edit_template')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('templates.report_type')}
                  </label>
                  <select
                    value={selectedReportType}
                    onChange={(e) => {
                      setSelectedReportType(e.target.value);
                      updatePreviews(templateName, createdBy, subNames, subSubNames, fieldInputs, e.target.value);
                    }}
                    className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                    required
                  >
                    <option value="">{t('templates.select_report_type')}</option>
                    {reportNames.map((report) => (
                      <option key={report._id} value={report.name}>
                        {report.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('templates.template_name')}
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => {
                      setTemplateName(e.target.value);
                      updatePreviews(e.target.value, createdBy, subNames, subSubNames, fieldInputs, selectedReportType);
                    }}
                    className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('templates.created_by')}
                  </label>
                  <input
                    type="text"
                    value={createdBy}
                    onChange={(e) => {
                      setCreatedBy(e.target.value);
                      updatePreviews(templateName, e.target.value, subNames, subSubNames, fieldInputs, selectedReportType);
                    }}
                    className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                    required
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('templates.select_section')}
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="p-2 border rounded-md w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                  >
                    <option value="header">{t('templates.header')}</option>
                    <option value="body">{t('templates.body')}</option>
                    <option value="footer">{t('templates.footer')}</option>
                  </select>
                </div>
                {renderSection(selectedSection)}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                  >
                    {t('templates.update_template')}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                  >
                    {t('templates.delete_template')}
                  </button>
                </div>
              </form>
              {templateResult && (
                <div className="mt-4 text-sm text-green-600">{templateResult}</div>
              )}
            </div>

            <div className="w-full lg:w-1/4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                {t('templates.json_preview')}
              </h2>
              <pre
                id="templatePreview"
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto h-[80vh] text-xs text-gray-800 dark:text-gray-300"
              ></pre>
            </div>

            <div className="w-full lg:w-1/2 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {t('templates.ui_preview')}
                </h2>
                <button
                  type="button"
                  onClick={() => updatePreviews()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                >
                  {t('common.sync_ui_preview')}
                </button>
              </div>
              <div className="space-y-4 h-[80vh] overflow-y-auto">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
                    {t('templates.header')}
                  </h3>
                  <div id="userUIHeaderFields" className="space-y-2"></div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
                    {t('templates.body')}
                  </h3>
                  <div id="userUIBodyFields" className="space-y-2"></div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
                    {t('templates.footer')}
                  </h3>
                  <div id="userUIFooterFields" className="space-y-2"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TemplateEditor;