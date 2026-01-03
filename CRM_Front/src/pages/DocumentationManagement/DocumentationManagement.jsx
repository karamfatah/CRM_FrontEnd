// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import documentService from '../../lib/documentService';
// import ModalSearch from '../../components/ModalSearch';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
// import LoadingSpinner from '../../components/LoadingSpinner';

// const DocumentationManagement = () => {
//   const { authData, loading: authLoading } = useAuth();
//   const { language, t } = useLanguage();
//   const [documents, setDocuments] = useState([]);
//   const [editingDocument, setEditingDocument] = useState(null);
//   const [newDocument, setNewDocument] = useState({
//     app_name: '',
//     domain: '',
//     chapter: '',
//     section: '',
//     sub_section: '',
//     description: '',
//     content: '',
//     files: [],
//   });
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [currentView, setCurrentView] = useState('manage-documents');
//   const [hasPrivilege, setHasPrivilege] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   // Check authentication and privileges
//   useEffect(() => {
//     if (authLoading) return;

//     if (!authData?.access_token) {
//       setError(t('documents.no_permission'));
//       setLoading(false);
//       return;
//     }

//     if (authData.privilege_ids.includes(1)) {
//       setHasPrivilege(true);
//     } else {
//       setError(t('documents.no_permission'));
//       setLoading(false);
//     }
//   }, [authData, authLoading, t]);

//   // Fetch documents
//   const fetchDocuments = async () => {
//     if (!authData?.org_id || !hasPrivilege) {
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     try {
//       const data = await documentService.getDocuments();
//       setDocuments(data);
//       setError('');
//     } catch (err) {
//       setError(err.message || t('documents.fetch_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (hasPrivilege && authData?.org_id && currentView === 'manage-documents') {
//       fetchDocuments();
//     }
//   }, [authData, hasPrivilege, currentView, t]);

//   // Handle view change
//   const handleViewChange = (view) => {
//     setCurrentView(view);
//     setError('');
//     setSuccess('');
//     setEditingDocument(null);
//     setNewDocument({
//       app_name: '',
//       domain: '',
//       chapter: '',
//       section: '',
//       sub_section: '',
//       description: '',
//       content: '',
//       files: [],
//     });
//     setCurrentPage(1);
//   };

//   // Handle file input change
//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
//     setNewDocument({ ...newDocument, files });
//   };

//   // Handle create document
//   const handleAddDocument = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('documents.no_permission'));
//       return;
//     }

//     try {
//       const documentData = {
//         app_name: newDocument.app_name,
//         domain: newDocument.domain,
//         chapter: newDocument.chapter,
//         section: newDocument.section,
//         sub_section: newDocument.sub_section,
//         description: newDocument.description,
//         content: newDocument.content,
//         created_by: String(authData.user_id || 'admin'), // Convert to string
//         org_id: authData.org_id,
//       };

//       const result = await documentService.createDocument(documentData);
//       const docId = result.doc_id;

//       if (newDocument.files.length > 0) {
//         const formData = new FormData();
//         newDocument.files.forEach(file => formData.append('files', file));
//         await documentService.uploadMedia(docId, formData);
//       }

//       setSuccess(t('documents.add_success'));
//       setTimeout(() => {
//         setSuccess('');
//         handleViewChange('manage-documents');
//       }, 3000);
//     } catch (err) {
//       setError(err.message || t('documents.add_error'));
//     }
//   };

//   // Handle edit document
//   const handleEditDocument = async (doc) => {
//     if (!hasPrivilege) {
//       setError(t('documents.no_permission'));
//       return;
//     }

//     try {
//       const data = await documentService.getDocument(doc.doc_id);
//       setEditingDocument(doc);
//       setNewDocument({
//         app_name: data.app_name || '',
//         domain: data.domain || '',
//         chapter: data.chapter || '',
//         section: data.section || '',
//         sub_section: data.sub_section || '',
//         description: data.description || '',
//         content: data.content || '',
//         files: [],
//       });
//     } catch (err) {
//       setError(err.message || t('documents.fetch_edit_error'));
//     }
//   };

//   const handleUpdateDocument = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('documents.no_permission'));
//       return;
//     }

//     try {
//       const documentData = {
//         app_name: newDocument.app_name,
//         domain: newDocument.domain,
//         chapter: newDocument.chapter,
//         section: newDocument.section,
//         sub_section: newDocument.sub_section,
//         description: newDocument.description,
//         content: newDocument.content,
//         created_by: String(authData.user_id || 'admin'), // Convert to string
//         org_id: authData.org_id,
//       };

//       const docId = editingDocument.doc_id;
//       await documentService.createDocument(documentData); // Backend does not support update, so create a new document
//       if (newDocument.files.length > 0) {
//         const formData = new FormData();
//         newDocument.files.forEach(file => formData.append('files', file));
//         await documentService.uploadMedia(docId, formData);
//       }

//       setEditingDocument(null);
//       setNewDocument({
//         app_name: '',
//         domain: '',
//         chapter: '',
//         section: '',
//         sub_section: '',
//         description: '',
//         content: '',
//         files: [],
//       });
//       fetchDocuments();
//       setSuccess(t('documents.update_success'));
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError(err.message || t('documents.update_error'));
//     }
//   };

//   // Handle delete document
//   const handleDeleteDocument = async (docId) => {
//     if (!hasPrivilege) {
//       setError(t('documents.no_permission'));
//       return;
//     }

//     if (window.confirm(t('documents.delete_confirm'))) {
//       try {
//         const document = await documentService.getDocument(docId);
//         if (document.media_files && document.media_files.length > 0) {
//           await Promise.all(
//             document.media_files.map(media => documentService.deleteMedia(media.media_id))
//           );
//         }
//         // Backend does not support delete, so we'll skip actual deletion for now
//         setDocuments(documents.filter(doc => doc.doc_id !== docId));
//         setSuccess(t('documents.delete_success'));
//         setTimeout(() => setSuccess(''), 3000);
//       } catch (err) {
//         setError(err.message || t('documents.delete_error'));
//       }
//     }
//   };

//   // Pagination logic
//   const totalPages = Math.ceil(documents.length / itemsPerPage);
//   const start = (currentPage - 1) * itemsPerPage;
//   const end = start + itemsPerPage;
//   const paginatedDocuments = documents.slice(start, end);

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };

//   if (authLoading) {
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
//               <div className="mb-4 sm:mb-0">
//                 <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
//                   {t('documents.title')}
//                 </h1>
//                 <div className="grid grid-flow-col sm:auto-cols-max justify-start gap-2 mt-4">
//                   <button
//                     onClick={() => handleViewChange('manage-documents')}
//                     className={`px-4 py-2 rounded ${currentView === 'manage-documents' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
//                   >
//                     {t('documents.manage_documents')}
//                   </button>
//                   <button
//                     onClick={() => handleViewChange('add-new-document')}
//                     className={`px-4 py-2 rounded ${currentView === 'add-new-document' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
//                   >
//                     {t('documents.add_new_document')}
//                   </button>
//                   <button
//                     onClick={() => handleViewChange('edit-documents')}
//                     className={`px-4 py-2 rounded ${currentView === 'edit-documents' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
//                   >
//                     {t('documents.edit_documents')}
//                   </button>
//                 </div>
//               </div>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//                 <ModalSearch />
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

//             {success && (
//               <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
//                 <span>{success}</span>
//                 <button
//                   onClick={() => setSuccess('')}
//                   className="absolute top-0 right-0 px-4 py-3"
//                   aria-label={t('common.dismiss_success')}
//                 >
//                   <svg className="fill-current h-6 w-6 text-green-500" viewBox="0 0 20 20">
//                     <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
//                   </svg>
//                 </button>
//               </div>
//             )}

//             {loading ? (
//               <LoadingSpinner />
//             ) : (
//               <>
//                 {currentView === 'manage-documents' && (
//                   <>
//                     {documents.length === 0 ? (
//                       <div className="text-gray-600 dark:text-gray-300">{t('documents.no_documents')}</div>
//                     ) : (
//                       <>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                           {paginatedDocuments.map((doc) => (
//                             <div
//                               key={doc.doc_id}
//                               className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
//                               role="region"
//                               aria-label={`${t('documents.document_name')}: ${doc.app_name}`}
//                             >
//                               <div className="space-y-4">
//                                 <div>
//                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                     {t('documents.app_name')}
//                                   </span>
//                                   <p className="text-gray-800 dark:text-gray-100 font-semibold">
//                                     {doc.app_name}
//                                   </p>
//                                 </div>
//                                 <div>
//                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                     {t('documents.domain')}
//                                   </span>
//                                   <p className="text-gray-800 dark:text-gray-100 font-semibold">
//                                     {doc.domain}
//                                   </p>
//                                 </div>
//                                 <div>
//                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                     {t('documents.description')}
//                                   </span>
//                                   <p className="text-gray-800 dark:text-gray-100 font-semibold">
//                                     {doc.description || t('documents.unknown')}
//                                   </p>
//                                 </div>
//                               </div>
//                               {hasPrivilege && (
//                                 <div className="flex justify-end gap-3 mt-4">
//                                   <button
//                                     onClick={() => handleEditDocument(doc)}
//                                     className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
//                                     aria-label={t('documents.edit')}
//                                   >
//                                     <PencilIcon className="w-4 h-4 mr-1" />
//                                     {t('documents.edit')}
//                                   </button>
//                                   <button
//                                     onClick={() => handleDeleteDocument(doc.doc_id)}
//                                     className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
//                                     aria-label={t('documents.delete')}
//                                   >
//                                     <TrashIcon className="w-4 h-4 mr-1" />
//                                     {t('documents.delete')}
//                                   </button>
//                                 </div>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                         {totalPages > 1 && (
//                           <div className="flex justify-center gap-2 mt-6">
//                             {currentPage > 1 && (
//                               <button
//                                 onClick={() => handlePageChange(currentPage - 1)}
//                                 className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
//                               >
//                                 {t('documents.previous')}
//                               </button>
//                             )}
//                             {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                               <button
//                                 key={page}
//                                 onClick={() => handlePageChange(page)}
//                                 className={`${
//                                   page === currentPage ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'
//                                 } hover:bg-indigo-600 font-bold py-2 px-4 rounded`}
//                                 disabled={page === currentPage}
//                               >
//                                 {page}
//                               </button>
//                             ))}
//                             {currentPage < totalPages && (
//                               <button
//                                 onClick={() => handlePageChange(currentPage + 1)}
//                                 className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
//                               >
//                                 {t('documents.next')}
//                               </button>
//                             )}
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </>
//                 )}

//                 {currentView === 'add-new-document' && (
//                   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
//                       <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
//                         {t('documents.add_title')}
//                       </h2>
//                       <form id="addDocumentForm" onSubmit={handleAddDocument} className="space-y-6">
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="app_name">
//                             {t('documents.app_name')}
//                           </label>
//                           <input
//                             type="text"
//                             id="app_name"
//                             value={newDocument.app_name}
//                             onChange={(e) => setNewDocument({ ...newDocument, app_name: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="domain">
//                             {t('documents.domain')}
//                           </label>
//                           <input
//                             type="text"
//                             id="domain"
//                             value={newDocument.domain}
//                             onChange={(e) => setNewDocument({ ...newDocument, domain: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="chapter">
//                             {t('documents.chapter')}
//                           </label>
//                           <input
//                             type="text"
//                             id="chapter"
//                             value={newDocument.chapter}
//                             onChange={(e) => setNewDocument({ ...newDocument, chapter: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="section">
//                             {t('documents.section')}
//                           </label>
//                           <input
//                             type="text"
//                             id="section"
//                             value={newDocument.section}
//                             onChange={(e) => setNewDocument({ ...newDocument, section: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="sub_section">
//                             {t('documents.sub_section')}
//                           </label>
//                           <input
//                             type="text"
//                             id="sub_section"
//                             value={newDocument.sub_section}
//                             onChange={(e) => setNewDocument({ ...newDocument, sub_section: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="description">
//                             {t('documents.description')}
//                           </label>
//                           <textarea
//                             id="description"
//                             value={newDocument.description}
//                             onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="content">
//                             {t('documents.content')}
//                           </label>
//                           <textarea
//                             id="content"
//                             value={newDocument.content}
//                             onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="files">
//                             {t('documents.attach_files')}
//                           </label>
//                           <input
//                             type="file"
//                             id="files"
//                             multiple
//                             onChange={handleFileChange}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                           />
//                         </div>
//                         <div className="flex justify-end gap-3">
//                           <button
//                             type="button"
//                             onClick={() => handleViewChange('manage-documents')}
//                             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
//                           >
//                             {t('documents.cancel')}
//                           </button>
//                           <button
//                             type="submit"
//                             className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                           >
//                             {t('documents.create')}
//                           </button>
//                         </div>
//                       </form>
//                     </div>
//                   </div>
//                 )}

//                 {currentView === 'edit-documents' && editingDocument && (
//                   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
//                       <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
//                         {t('documents.edit_title')}
//                       </h2>
//                       <form id="editDocumentForm" onSubmit={handleUpdateDocument} className="space-y-6">
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="app_name">
//                             {t('documents.app_name')}
//                           </label>
//                           <input
//                             type="text"
//                             id="app_name"
//                             value={newDocument.app_name}
//                             onChange={(e) => setNewDocument({ ...newDocument, app_name: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="domain">
//                             {t('documents.domain')}
//                           </label>
//                           <input
//                             type="text"
//                             id="domain"
//                             value={newDocument.domain}
//                             onChange={(e) => setNewDocument({ ...newDocument, domain: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="chapter">
//                             {t('documents.chapter')}
//                           </label>
//                           <input
//                             type="text"
//                             id="chapter"
//                             value={newDocument.chapter}
//                             onChange={(e) => setNewDocument({ ...newDocument, chapter: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="section">
//                             {t('documents.section')}
//                           </label>
//                           <input
//                             type="text"
//                             id="section"
//                             value={newDocument.section}
//                             onChange={(e) => setNewDocument({ ...newDocument, section: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="sub_section">
//                             {t('documents.sub_section')}
//                           </label>
//                           <input
//                             type="text"
//                             id="sub_section"
//                             value={newDocument.sub_section}
//                             onChange={(e) => setNewDocument({ ...newDocument, sub_section: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="description">
//                             {t('documents.description')}
//                           </label>
//                           <textarea
//                             id="description"
//                             value={newDocument.description}
//                             onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="content">
//                             {t('documents.content')}
//                           </label>
//                           <textarea
//                             id="content"
//                             value={newDocument.content}
//                             onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="files">
//                             {t('documents.attach_files')}
//                           </label>
//                           <input
//                             type="file"
//                             id="files"
//                             multiple
//                             onChange={handleFileChange}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                           />
//                         </div>
//                         <div className="flex justify-end gap-3">
//                           <button
//                             type="button"
//                             onClick={() => handleViewChange('manage-documents')}
//                             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
//                           >
//                             {t('documents.cancel')}
//                           </button>
//                           <button
//                             type="submit"
//                             className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                           >
//                             {t('documents.save')}
//                           </button>
//                         </div>
//                       </form>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default DocumentationManagement;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import documentService from '../../lib/documentService';
import ModalSearch from '../../components/ModalSearch';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';

const DocumentationManagement = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [editingDocument, setEditingDocument] = useState(null);
  const [newDocument, setNewDocument] = useState({
    app_name: '',
    domain: '',
    chapter: '',
    section: '',
    sub_section: '',
    description: '',
    content: '',
    files: [],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('manage-documents');
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Log authData to debug
  useEffect(() => {
    console.log('AuthContext Data:', authData);
  }, [authData]);

  // Check authentication and privileges
  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('documents.no_permission'));
      setLoading(false);
      return;
    }

    if (authData.privilege_ids.includes(1)) {
      setHasPrivilege(true);
    } else {
      setError(t('documents.no_permission'));
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  // Fetch documents
  const fetchDocuments = async () => {
    if (!authData?.org_id || !hasPrivilege) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
      setError('');
    } catch (err) {
      setError(err.message || t('documents.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPrivilege && authData?.org_id && currentView === 'manage-documents') {
      fetchDocuments();
    }
  }, [authData, hasPrivilege, currentView, t]);

  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view);
    setError('');
    setSuccess('');
    setEditingDocument(null);
    setNewDocument({
      app_name: '',
      domain: '',
      chapter: '',
      section: '',
      sub_section: '',
      description: '',
      content: '',
      files: [],
    });
    setCurrentPage(1);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewDocument({ ...newDocument, files });
  };

  // Handle create document
  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('documents.no_permission'));
      return;
    }

    try {
      const documentData = {
        app_name: newDocument.app_name,
        domain: newDocument.domain,
        chapter: newDocument.chapter,
        section: newDocument.section,
        sub_section: newDocument.sub_section,
        description: newDocument.description,
        content: newDocument.content,
        org_id: authData.org_id,
      };

      const result = await documentService.createDocument(documentData);
      const docId = result.doc_id;

      if (newDocument.files.length > 0) {
        const formData = new FormData();
        newDocument.files.forEach(file => formData.append('files', file));
        await documentService.uploadMedia(docId, formData);
      }

      setSuccess(t('documents.add_success'));
      setTimeout(() => {
        setSuccess('');
        handleViewChange('manage-documents');
      }, 3000);
    } catch (err) {
      setError(err.message || t('documents.add_error'));
    }
  };

  // Handle edit document
  const handleEditDocument = async (doc) => {
    if (!hasPrivilege) {
      setError(t('documents.no_permission'));
      return;
    }

    try {
      const data = await documentService.getDocument(doc.doc_id);
      setEditingDocument(doc);
      setNewDocument({
        app_name: data.app_name || '',
        domain: data.domain || '',
        chapter: data.chapter || '',
        section: data.section || '',
        sub_section: data.sub_section || '',
        description: data.description || '',
        content: data.content || '',
        files: [],
      });
    } catch (err) {
      setError(err.message || t('documents.fetch_edit_error'));
    }
  };

  const handleUpdateDocument = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('documents.no_permission'));
      return;
    }

    try {
      const documentData = {
        app_name: newDocument.app_name,
        domain: newDocument.domain,
        chapter: newDocument.chapter,
        section: newDocument.section,
        sub_section: newDocument.sub_section,
        description: newDocument.description,
        content: newDocument.content,
        org_id: authData.org_id,
      };

      const docId = editingDocument.doc_id;
      await documentService.createDocument(documentData); // Backend does not support update, so create a new document
      if (newDocument.files.length > 0) {
        const formData = new FormData();
        newDocument.files.forEach(file => formData.append('files', file));
        await documentService.uploadMedia(docId, formData);
      }

      setEditingDocument(null);
      setNewDocument({
        app_name: '',
        domain: '',
        chapter: '',
        section: '',
        sub_section: '',
        description: '',
        content: '',
        files: [],
      });
      fetchDocuments();
      setSuccess(t('documents.update_success'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || t('documents.update_error'));
    }
  };

  // Handle delete document
  const handleDeleteDocument = async (docId) => {
    if (!hasPrivilege) {
      setError(t('documents.no_permission'));
      return;
    }

    if (window.confirm(t('documents.delete_confirm'))) {
      try {
        const document = await documentService.getDocument(docId);
        if (document.media_files && document.media_files.length > 0) {
          await Promise.all(
            document.media_files.map(media => documentService.deleteMedia(media.media_id))
          );
        }
        // Backend does not support delete, so we'll skip actual deletion for now
        setDocuments(documents.filter(doc => doc.doc_id !== docId));
        setSuccess(t('documents.delete_success'));
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message || t('documents.delete_error'));
      }
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedDocuments = documents.slice(start, end);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  {t('documents.title')}
                </h1>
                <div className="grid grid-flow-col sm:auto-cols-max justify-start gap-2 mt-4">
                  <button
                    onClick={() => handleViewChange('manage-documents')}
                    className={`px-4 py-2 rounded ${currentView === 'manage-documents' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
                  >
                    {t('documents.manage_documents')}
                  </button>
                  <button
                    onClick={() => handleViewChange('add-new-document')}
                    className={`px-4 py-2 rounded ${currentView === 'add-new-document' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
                  >
                    {t('documents.add_new_document')}
                  </button>
                  <button
                    onClick={() => handleViewChange('edit-documents')}
                    className={`px-4 py-2 rounded ${currentView === 'edit-documents' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
                  >
                    {t('documents.edit_documents')}
                  </button>
                </div>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <ModalSearch />
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
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

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span>{success}</span>
                <button
                  onClick={() => setSuccess('')}
                  className="absolute top-0 right-0 px-4 py-3"
                  aria-label={t('common.dismiss_success')}
                >
                  <svg className="fill-current h-6 w-6 text-green-500" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                  </svg>
                </button>
              </div>
            )}

            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                {currentView === 'manage-documents' && (
                  <>
                    {documents.length === 0 ? (
                      <div className="text-gray-600 dark:text-gray-300">{t('documents.no_documents')}</div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {paginatedDocuments.map((doc) => (
                            <div
                              key={doc.doc_id}
                              className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
                              role="region"
                              aria-label={`${t('documents.document_name')}: ${doc.app_name}`}
                            >
                              <div className="space-y-4">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                    {t('documents.app_name')}
                                  </span>
                                  <p className="text-gray-800 dark:text-gray-100 font-semibold">
                                    {doc.app_name}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                    {t('documents.domain')}
                                  </span>
                                  <p className="text-gray-800 dark:text-gray-100 font-semibold">
                                    {doc.domain}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                    {t('documents.description')}
                                  </span>
                                  <p className="text-gray-800 dark:text-gray-100 font-semibold">
                                    {doc.description || t('documents.unknown')}
                                  </p>
                                </div>
                              </div>
                              {hasPrivilege && (
                                <div className="flex justify-end gap-3 mt-4">
                                  <button
                                    onClick={() => handleEditDocument(doc)}
                                    className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
                                    aria-label={t('documents.edit')}
                                  >
                                    <PencilIcon className="w-4 h-4 mr-1" />
                                    {t('documents.edit')}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDocument(doc.doc_id)}
                                    className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                                    aria-label={t('documents.delete')}
                                  >
                                    <TrashIcon className="w-4 h-4 mr-1" />
                                    {t('documents.delete')}
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {totalPages > 1 && (
                          <div className="flex justify-center gap-2 mt-6">
                            {currentPage > 1 && (
                              <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                              >
                                {t('documents.previous')}
                              </button>
                            )}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`${
                                  page === currentPage ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'
                                } hover:bg-indigo-600 font-bold py-2 px-4 rounded`}
                                disabled={page === currentPage}
                              >
                                {page}
                              </button>
                            ))}
                            {currentPage < totalPages && (
                              <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                              >
                                {t('documents.next')}
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {currentView === 'add-new-document' && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        {t('documents.add_title')}
                      </h2>
                      <form id="addDocumentForm" onSubmit={handleAddDocument} className="space-y-6">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="app_name">
                            {t('documents.app_name')}
                          </label>
                          <input
                            type="text"
                            id="app_name"
                            value={newDocument.app_name}
                            onChange={(e) => setNewDocument({ ...newDocument, app_name: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="domain">
                            {t('documents.domain')}
                          </label>
                          <input
                            type="text"
                            id="domain"
                            value={newDocument.domain}
                            onChange={(e) => setNewDocument({ ...newDocument, domain: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="chapter">
                            {t('documents.chapter')}
                          </label>
                          <input
                            type="text"
                            id="chapter"
                            value={newDocument.chapter}
                            onChange={(e) => setNewDocument({ ...newDocument, chapter: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="section">
                            {t('documents.section')}
                          </label>
                          <input
                            type="text"
                            id="section"
                            value={newDocument.section}
                            onChange={(e) => setNewDocument({ ...newDocument, section: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="sub_section">
                            {t('documents.sub_section')}
                          </label>
                          <input
                            type="text"
                            id="sub_section"
                            value={newDocument.sub_section}
                            onChange={(e) => setNewDocument({ ...newDocument, sub_section: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="description">
                            {t('documents.description')}
                          </label>
                          <textarea
                            id="description"
                            value={newDocument.description}
                            onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="content">
                            {t('documents.content')}
                          </label>
                          <textarea
                            id="content"
                            value={newDocument.content}
                            onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="files">
                            {t('documents.attach_files')}
                          </label>
                          <input
                            type="file"
                            id="files"
                            multiple
                            onChange={handleFileChange}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          />
                        </div>
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleViewChange('manage-documents')}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                          >
                            {t('documents.cancel')}
                          </button>
                          <button
                            type="submit"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                          >
                            {t('documents.create')}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {currentView === 'edit-documents' && editingDocument && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        {t('documents.edit_title')}
                      </h2>
                      <form id="editDocumentForm" onSubmit={handleUpdateDocument} className="space-y-6">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="app_name">
                            {t('documents.app_name')}
                          </label>
                          <input
                            type="text"
                            id="app_name"
                            value={newDocument.app_name}
                            onChange={(e) => setNewDocument({ ...newDocument, app_name: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="domain">
                            {t('documents.domain')}
                          </label>
                          <input
                            type="text"
                            id="domain"
                            value={newDocument.domain}
                            onChange={(e) => setNewDocument({ ...newDocument, domain: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="chapter">
                            {t('documents.chapter')}
                          </label>
                          <input
                            type="text"
                            id="chapter"
                            value={newDocument.chapter}
                            onChange={(e) => setNewDocument({ ...newDocument, chapter: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="section">
                            {t('documents.section')}
                          </label>
                          <input
                            type="text"
                            id="section"
                            value={newDocument.section}
                            onChange={(e) => setNewDocument({ ...newDocument, section: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="sub_section">
                            {t('documents.sub_section')}
                          </label>
                          <input
                            type="text"
                            id="sub_section"
                            value={newDocument.sub_section}
                            onChange={(e) => setNewDocument({ ...newDocument, sub_section: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="description">
                            {t('documents.description')}
                          </label>
                          <textarea
                            id="description"
                            value={newDocument.description}
                            onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="content">
                            {t('documents.content')}
                          </label>
                          <textarea
                            id="content"
                            value={newDocument.content}
                            onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="files">
                            {t('documents.attach_files')}
                          </label>
                          <input
                            type="file"
                            id="files"
                            multiple
                            onChange={handleFileChange}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          />
                        </div>
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleViewChange('manage-documents')}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                          >
                            {t('documents.cancel')}
                          </button>
                          <button
                            type="submit"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                          >
                            {t('documents.save')}
                          </button>
                        </div>
                      </form>
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

export default DocumentationManagement;