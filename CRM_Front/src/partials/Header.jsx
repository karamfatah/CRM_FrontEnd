// // // // import React, { useState } from 'react';

// // // // import SearchModal from '../components/ModalSearch';
// // // // import Notifications from '../components/DropdownNotifications';
// // // // import Help from '../components/DropdownHelp';
// // // // import UserMenu from '../components/DropdownProfile';
// // // // import ThemeToggle from '../components/ThemeToggle';

// // // // function Header({
// // // //   sidebarOpen,
// // // //   setSidebarOpen,
// // // //   variant = 'default',
// // // // }) {

// // // //   const [searchModalOpen, setSearchModalOpen] = useState(false)

// // // //   return (
// // // //     <header className={`sticky top-0 before:absolute before:inset-0 before:backdrop-blur-md max-lg:before:bg-white/90 dark:max-lg:before:bg-gray-800/90 before:-z-10 z-30 ${variant === 'v2' || variant === 'v3' ? 'before:bg-white after:absolute after:h-px after:inset-x-0 after:top-full after:bg-gray-200 dark:after:bg-gray-700/60 after:-z-10' : 'max-lg:shadow-xs lg:before:bg-gray-100/90 dark:lg:before:bg-gray-900/90'} ${variant === 'v2' ? 'dark:before:bg-gray-800' : ''} ${variant === 'v3' ? 'dark:before:bg-gray-900' : ''}`}>
// // // //       <div className="px-4 sm:px-6 lg:px-8">
// // // //         <div className={`flex items-center justify-between h-16 ${variant === 'v2' || variant === 'v3' ? '' : 'lg:border-b border-gray-200 dark:border-gray-700/60'}`}>

// // // //           {/* Header: Left side */}
// // // //           <div className="flex">

// // // //             {/* Hamburger button */}
// // // //             <button
// // // //               className="text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 lg:hidden"
// // // //               aria-controls="sidebar"
// // // //               aria-expanded={sidebarOpen}
// // // //               onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
// // // //             >
// // // //               <span className="sr-only">Open sidebar</span>
// // // //               <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
// // // //                 <rect x="4" y="5" width="16" height="2" />
// // // //                 <rect x="4" y="11" width="16" height="2" />
// // // //                 <rect x="4" y="17" width="16" height="2" />
// // // //               </svg>
// // // //             </button>

// // // //           </div>

// // // //           {/* Header: Right side */}
// // // //           <div className="flex items-center space-x-3">
// // // //             <div>
// // // //               <button
// // // //                 className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 lg:hover:bg-gray-200 dark:hover:bg-gray-700/50 dark:lg:hover:bg-gray-800 rounded-full ml-3 ${searchModalOpen && 'bg-gray-200 dark:bg-gray-800'}`}
// // // //                 onClick={(e) => { e.stopPropagation(); setSearchModalOpen(true); }}
// // // //                 aria-controls="search-modal"
// // // //               >
// // // //                 <span className="sr-only">Search</span>
// // // //                 <svg
// // // //                   className="fill-current text-gray-500/80 dark:text-gray-400/80"
// // // //                   width={16}
// // // //                   height={16}
// // // //                   viewBox="0 0 16 16"
// // // //                   xmlns="http://www.w3.org/2000/svg"
// // // //                 >
// // // //                   <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7ZM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5Z" />
// // // //                   <path d="m13.314 11.9 2.393 2.393a.999.999 0 1 1-1.414 1.414L11.9 13.314a8.019 8.019 0 0 0 1.414-1.414Z" />
// // // //                 </svg>
// // // //               </button>
// // // //               <SearchModal id="search-modal" searchId="search" modalOpen={searchModalOpen} setModalOpen={setSearchModalOpen} />
// // // //             </div>
// // // //             <Notifications align="right" />
// // // //             <Help align="right" />
// // // //             <ThemeToggle />
// // // //             {/*  Divider */}
// // // //             <hr className="w-px h-6 bg-gray-200 dark:bg-gray-700/60 border-none" />
// // // //             <UserMenu align="right" />

// // // //           </div>

// // // //         </div>
// // // //       </div>
// // // //     </header>
// // // //   );
// // // // }

// // // // export default Header;
// // // import React, { useState, useEffect } from 'react';
// // // import { NavLink } from 'react-router-dom';
// // // import { useLanguage } from '../context/LanguageContext';
// // // import { useAuth } from '../context/AuthContext';
// // // import SearchModal from '../components/ModalSearch';
// // // import Notifications from '../components/DropdownNotifications';
// // // import Help from '../components/DropdownHelp';
// // // import UserMenu from '../components/DropdownProfile';
// // // import ThemeToggle from '../components/ThemeToggle';
// // // import LanguageToggle from '../components/LanguageToggle';

// // // function Header({
// // //   sidebarOpen,
// // //   setSidebarOpen,
// // //   variant = 'default',
// // //   handleLogout,
// // // }) {
// // //   const [searchModalOpen, setSearchModalOpen] = useState(false);
// // //   const [org, setOrg] = useState({});
// // //   const [error, setError] = useState(null);
// // //   const { t, language } = useLanguage();
// // //   const { authData, loading } = useAuth();
// // //   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// // //   /**
// // //    * Checks if an access token is available in localStorage.
// // //    * @throws {Error} If no token is found.
// // //    */
// // //   const checkToken = () => {
// // //     const token = localStorage.getItem('access_token');
// // //     if (!token) {
// // //       throw new Error('No access token found. Please log in.');
// // //     }
// // //     return token;
// // //   };

// // //   /**
// // //    * Handles HTTP response errors based on status codes.
// // //    * @param {Response} response - The Fetch API response object.
// // //    * @returns {Promise<object>} Parsed JSON response if successful.
// // //    * @throws {Error} Specific error based on status code or generic error.
// // //    */
// // //   const handleResponse = async (response) => {
// // //     if (response.ok) {
// // //       return response.json();
// // //     }

// // //     const errorData = await response.json().catch(() => ({}));
// // //     const errorMessage = errorData.message || errorData.error || 'No message';

// // //     switch (response.status) {
// // //       case 401:
// // //         throw new Error('Unauthorized: Please log in again.');
// // //       case 403:
// // //         throw new Error('Forbidden: You lack the required permissions.');
// // //       case 404:
// // //         throw new Error(`Not Found: ${errorMessage}`);
// // //       case 400:
// // //         throw new Error(`Bad Request: ${errorMessage}`);
// // //       default:
// // //         throw new Error(`Failed: ${response.status} - ${errorMessage}`);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     const fetchOrg = async () => {
// // //       if (loading || !authData || !authData.org_id) {
// // //         setError(authData ? 'No organization ID available' : 'Please log in');
// // //         return;
// // //       }

// // //       try {
// // //         const token = checkToken();
// // //         const url = `${API_BASE_URL}/api/orgs?org_id=${authData.org_id}`;

// // //         if (process.env.NODE_ENV !== 'production') {
// // //           console.debug('Fetching organization for org_id:', authData.org_id);
// // //         }

// // //         const response = await fetch(url, {
// // //           method: 'GET',
// // //           headers: {
// // //             'Content-Type': 'application/json',
// // //             'x-access-tokens': token,
// // //           },
// // //         });

// // //         const data = await handleResponse(response);
// // //         setOrg({
// // //           org_id: data.org_id,
// // //           org_name_en: data.org_name_en,
// // //           org_name_ar: data.org_name_ar,
// // //           org_logo: data.org_logo,
// // //           org_address: data.org_address,
// // //           org_phone: data.org_phone,
// // //           org_website: data.org_website,
// // //           country_id: data.country_id,
// // //         });
// // //         setError(null);
// // //       } catch (err) {
// // //         console.error('Failed to fetch organization:', err);
// // //         setError(err.message);
// // //       }
// // //     };

// // //     fetchOrg();
// // //   }, [API_BASE_URL, authData, loading]);

// // //   return (
// // //     <header
// // //       className={`sticky top-0 before:absolute before:inset-0 before:backdrop-blur-md max-lg:before:bg-white/90 dark:max-lg:before:bg-gray-800/90 before:-z-10 z-30 ${variant === 'v2' || variant === 'v3' ? 'before:bg-white after:absolute after:h-px after:inset-x-0 after:top-full after:bg-gray-200 dark:after:bg-gray-700/60 after:-z-10' : 'max-lg:shadow-xs lg:before:bg-gray-100/90 dark:lg:before:bg-gray-900/90'} ${variant === 'v2' ? 'dark:before:bg-gray-800' : ''} ${variant === 'v3' ? 'dark:before:bg-gray-900' : ''}`}
// // //     >
// // //       <div className="px-4 sm:px-6 lg:px-8">
// // //         <div
// // //           className={`flex items-center justify-between h-16 ${variant === 'v2' || variant === 'v3' ? '' : 'lg:border-b border-gray-200 dark:border-gray-700/60'}`}
// // //         >
// // //           {/* Header: Left side */}
// // //           <div className="flex items-center">
// // //             <NavLink end to="/" className="flex items-center">
// // //               {org.org_logo && !error ? (
// // //                 <img
// // //                   src={`data:image/png;base64,${org.org_logo}`}
// // //                   alt={language === 'ar' ? org.org_name_ar : org.org_name_en || 'Organization Logo'}
// // //                   className="w-22 h-22 object-contain" // Added object-contain
// // //                   onError={() => {
// // //                     setError('Failed to load logo');
// // //                   }}
// // //                 />
// // //               ) : (
// // //                 <svg
// // //                   className="fill-violet-500"
// // //                   xmlns="http://www.w3.org/2000/svg"
// // //                   width={32}
// // //                   height={32}
// // //                 >
// // //                   <path d="M31.956 14.8C31.372 6.92 25.08.628 17.2.044V5.76a9.04 9.04 0 0 0 9.04 9.04h5.716ZM14.8 26.24v5.716C6.92 31.372.63 25.08.044 17.2H5.76a9.04 9.04 0 0 1 9.04 9.04Zm11.44-9.04h5.716c-.584 7.88-6.876 14.172-14.756 14.756V26.24a9.04 9.04 0 0 1 9.04-9.04ZM.044 14.8C.63 6.92 6.92.628 14.8.044V5.76a9.04 9.04 0 0 1-9.04 9.04H.044Z" />
// // //                 </svg>
// // //               )}
// // //             </NavLink>
// // //             {/* Hamburger button */}
// // //             <button
// // //               className="text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 lg:hidden ml-3"
// // //               aria-controls="sidebar"
// // //               aria-expanded={sidebarOpen}
// // //               onClick={(e) => {
// // //                 e.stopPropagation();
// // //                 setSidebarOpen(!sidebarOpen);
// // //               }}
// // //             >
// // //               <span className="sr-only">{t('common.open_sidebar')}</span>
// // //               <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
// // //                 <rect x="4" y="5" width="16" height="2" />
// // //                 <rect x="4" y="11" width="16" height="2" />
// // //                 <rect x="4" y="17" width="16" height="2" />
// // //               </svg>
// // //             </button>
// // //             {error && <div className="text-red-500 text-sm ml-3">{error}</div>}
// // //           </div>

// // //           {/* Header: Right side */}
// // //           <div className="flex items-center space-x-3">
// // //             <div>
// // //               <button
// // //                 className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 lg:hover:bg-gray-200 dark:hover:bg-gray-700/50 dark:lg:hover:bg-gray-800 rounded-full ml-3 ${searchModalOpen && 'bg-gray-200 dark:bg-gray-800'}`}
// // //                 onClick={(e) => {
// // //                   e.stopPropagation();
// // //                   setSearchModalOpen(true);
// // //                 }}
// // //                 aria-controls="search-modal"
// // //               >
// // //                 <span className="sr-only">{t('common.search')}</span>
// // //                 <svg
// // //                   className="fill-current text-gray-500/80 dark:text-gray-400/80"
// // //                   width={16}
// // //                   height={16}
// // //                   viewBox="0 0 16 16"
// // //                   xmlns="http://www.w3.org/2000/svg"
// // //                 >
// // //                   <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7ZM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5Z" />
// // //                   <path d="m13.314 11.9 2.393 2.393a.999.999 0 1 1-1.414 1.414L11.9 13.314a8.019 8.019 0 0 0 1.414-1.414Z" />
// // //                 </svg>
// // //               </button>
// // //               <SearchModal
// // //                 id="search-modal"
// // //                 searchId="search"
// // //                 modalOpen={searchModalOpen}
// // //                 setModalOpen={setSearchModalOpen}
// // //               />
// // //             </div>
// // //             <LanguageToggle />
// // //             <Notifications align="right" />
// // //             <Help align="right" />
// // //             <ThemeToggle />
// // //             <hr className="w-px h-6 bg-gray-200 dark:bg-gray-700/60 border-none" />
// // //             <UserMenu align="right" handleLogout={handleLogout} />
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </header>
// // //   );
// // // }

// // // export default Header;
// // // //ok



// // import React, { useState, useEffect } from 'react';
// // import { NavLink } from 'react-router-dom';
// // import { useLanguage } from '../context/LanguageContext';
// // import { useAuth } from '../context/AuthContext';
// // import SearchModal from '../components/ModalSearch';
// // import Notifications from '../components/DropdownNotifications';
// // import Help from '../components/DropdownHelp';
// // import UserMenu from '../components/DropdownProfile';
// // import ThemeToggle from '../components/ThemeToggle';
// // import LanguageToggle from '../components/LanguageToggle';

// // function Header({
// //   sidebarOpen,
// //   setSidebarOpen,
// //   variant = 'default',
// //   handleLogout,
// // }) {
// //   const [searchModalOpen, setSearchModalOpen] = useState(false);
// //   const [org, setOrg] = useState({});
// //   const [error, setError] = useState(null);
// //   const [logoUrl, setLogoUrl] = useState('');
// //   const { t, language } = useLanguage();
// //   const { authData, loading } = useAuth();
// //   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// //   /**
// //    * Checks if an access token is available in localStorage.
// //    * @throws {Error} If no token is found.
// //    */
// //   const checkToken = () => {
// //     const token = localStorage.getItem('access_token');
// //     if (!token) {
// //       throw new Error('No access token found. Please log in.');
// //     }
// //     return token;
// //   };

// //   /**
// //    * Handles HTTP response errors based on status codes.
// //    * @param {Response} response - The Fetch API response object.
// //    * @returns {Promise<object>} Parsed JSON response if successful.
// //    * @throws {Error} Specific error based on status code or generic error.
// //    */
// //   const handleResponse = async (response) => {
// //     if (response.ok) {
// //       return response.json();
// //     }

// //     const errorData = await response.json().catch(() => ({}));
// //     const errorMessage = errorData.message || errorData.error || 'No message';

// //     switch (response.status) {
// //       case 401:
// //         throw new Error('Unauthorized: Please log in again.');
// //       case 403:
// //         throw new Error('Forbidden: You lack the required permissions.');
// //       case 404:
// //         throw new Error(`Not Found: ${errorMessage}`);
// //       case 400:
// //         throw new Error(`Bad Request: ${errorMessage}`);
// //       default:
// //         throw new Error(`Failed: ${response.status} - ${errorMessage}`);
// //     }
// //   };

// //   useEffect(() => {
// //     const fetchOrg = async () => {
// //       if (loading || !authData || !authData.org_id) {
// //         setError(authData ? 'No organization ID available' : 'Please log in');
// //         return;
// //       }

// //       try {
// //         const token = checkToken();
// //         const url = `${API_BASE_URL}/api/orgs?org_id=${authData.org_id}`;

// //         if (process.env.NODE_ENV !== 'production') {
// //           console.debug('Fetching organization for org_id:', authData.org_id);
// //         }

// //         const response = await fetch(url, {
// //           method: 'GET',
// //           headers: {
// //             'Content-Type': 'application/json',
// //             'x-access-tokens': token,
// //           },
// //         });

// //         const data = await handleResponse(response);
// //         // Handle array response
// //         const orgData = Array.isArray(data) && data.length > 0 ? data[0] : data;
// //         if (!orgData.org_id) {
// //           throw new Error('Invalid organization data received');
// //         }

// //         setOrg({
// //           org_id: orgData.org_id,
// //           org_name_en: orgData.org_name_en || '',
// //           org_name_ar: orgData.org_name_ar || '',
// //           org_logo: orgData.org_logo || '',
// //           org_address: orgData.org_address || '',
// //           org_phone: orgData.org_phone || '',
// //           org_website: orgData.org_website || '',
// //           country_id: orgData.country_id || null,
// //         });
// //         setError(null);
// //       } catch (err) {
// //         console.error('Failed to fetch organization:', err);
// //         setError(err.message);
// //       }
// //     };

// //     fetchOrg();
// //   }, [API_BASE_URL, authData, loading]);

// //   useEffect(() => {
// //     const fetchLogo = async () => {
// //       if (!org.org_logo || !authData?.org_id) return;
// //       try {
// //         const token = checkToken();
// //         const response = await fetch(`${API_BASE_URL}/api/orgs/${authData.org_id}/logo`, {
// //           headers: { 'x-access-tokens': token },
// //         });
// //         if (!response.ok) {
// //           const errorData = await response.json().catch(() => ({}));
// //           throw new Error(errorData.error || 'Failed to fetch logo');
// //         }
// //         const blob = await response.blob();
// //         setLogoUrl(URL.createObjectURL(blob));
// //       } catch (err) {
// //         console.error('Failed to fetch logo:', err);
// //         setError('Failed to load logo');
// //       }
// //     };
// //     fetchLogo();
// //   }, [org.org_logo, authData, API_BASE_URL]);

// //   return (
// //     <header
// //       className={`sticky top-0 before:absolute before:inset-0 before:backdrop-blur-md max-lg:before:bg-white/90 dark:max-lg:before:bg-gray-800/90 before:-z-10 z-30 ${variant === 'v2' || variant === 'v3' ? 'before:bg-white after:absolute after:h-px after:inset-x-0 after:top-full after:bg-gray-200 dark:after:bg-gray-700/60 after:-z-10' : 'max-lg:shadow-xs lg:before:bg-gray-100/90 dark:lg:before:bg-gray-900/90'} ${variant === 'v2' ? 'dark:before:bg-gray-800' : ''} ${variant === 'v3' ? 'dark:before:bg-gray-900' : ''}`}
// //     >
// //       <div className="px-4 sm:px-6 lg:px-8">
// //         <div
// //           className={`flex items-center justify-between h-16 ${variant === 'v2' || variant === 'v3' ? '' : 'lg:border-b border-gray-200 dark:border-gray-700/60'}`}
// //         >
// //           {/* Header: Left side */}
// //           <div className="flex items-center">
// //             <NavLink end to="/" className="flex items-center">
// //               {org.org_logo && logoUrl && !error ? (
// //                 <img
// //                   src={logoUrl}
// //                   alt={language === 'ar' ? org.org_name_ar : org.org_name_en || 'Organization Logo'}
// //                   className="w-10 h-10 rounded-full object-cover"
// //                   onError={() => {
// //                     setError('Failed to load logo');
// //                   }}
// //                 />
// //               ) : (
// //                 <svg
// //                   className="fill-violet-500"
// //                   xmlns="http://www.w3.org/2000/svg"
// //                   width={32}
// //                   height={32}
// //                 >
// //                   <path d="M31.956 14.8C31.372 6.92 25.08.628 17.2.044V5.76a9.04 9.04 0 0 0 9.04 9.04h5.716ZM14.8 26.24v5.716C6.92 31.372.63 25.08.044 17.2H5.76a9.04 9.04 0 0 1 9.04 9.04Zm11.44-9.04h5.716c-.584 7.88-6.876 14.172-14.756 14.756V26.24a9.04 9.04 0 0 1 9.04-9.04ZM.044 14.8C.63 6.92 6.92.628 14.8.044V5.76a9.04 9.04 0 0 1-9.04 9.04H.044Z" />
// //                 </svg>
// //               )}
// //             </NavLink>
// //             {/* Hamburger button */}
// //             <button
// //               className="text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 lg:hidden ml-3"
// //               aria-controls="sidebar"
// //               aria-expanded={sidebarOpen}
// //               onClick={(e) => {
// //                 e.stopPropagation();
// //                 setSidebarOpen(!sidebarOpen);
// //               }}
// //             >
// //               <span className="sr-only">{t('common.open_sidebar')}</span>
// //               <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
// //                 <rect x="4" y="5" width="16" height="2" />
// //                 <rect x="4" y="11" width="16" height="2" />
// //                 <rect x="4" y="17" width="16" height="2" />
// //               </svg>
// //             </button>
// //             {error && <div className="text-red-500 text-sm ml-3">{error}</div>}
// //           </div>

// //           {/* Header: Right side */}
// //           <div className="flex items-center space-x-3">
// //             <div>
// //               <button
// //                 className={`w-8 h-8 flex items-center justify-center hover:bg-gray-100 lg:hover:bg-gray-200 dark:hover:bg-gray-700/50 dark:lg:hover:bg-gray-800 rounded-full ml-3 ${searchModalOpen && 'bg-gray-200 dark:bg-gray-800'}`}
// //                 onClick={(e) => {
// //                   e.stopPropagation();
// //                   setSearchModalOpen(true);
// //                 }}
// //                 aria-controls="search-modal"
// //               >
// //                 <span className="sr-only">{t('common.search')}</span>
// //                 <svg
// //                   className="fill-current text-gray-500/80 dark:text-gray-400/80"
// //                   width={16}
// //                   height={16}
// //                   viewBox="0 0 16 16"
// //                   xmlns="http://www.w3.org/2000/svg"
// //                 >
// //                   <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7ZM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5Z" />
// //                   <path d="m13.314 11.9 2.393 2.393a.999.999 0 1 1-1.414 1.414L11.9 13.314a8.019 8.019 0 0 0 1.414-1.414Z" />
// //                 </svg>
// //               </button>
// //               <SearchModal
// //                 id="search-modal"
// //                 searchId="search"
// //                 modalOpen={searchModalOpen}
// //                 setModalOpen={setSearchModalOpen}
// //               />
// //             </div>
// //             <LanguageToggle />
// //             <Notifications align="right" />
// //             <Help align="right" />
// //             <ThemeToggle />
// //             <hr className="w-px h-6 bg-gray-200 dark:bg-gray-700/60 border-none" />
// //             <UserMenu align="right" handleLogout={handleLogout} />
// //           </div>
// //         </div>
// //       </div>
// //     </header>
// //   );
// // }

// // export default Header;


// import React, { useState, useEffect } from 'react';
// import { NavLink } from 'react-router-dom';
// import { useLanguage } from '../context/LanguageContext';
// import { useAuth } from '../context/AuthContext';
// import Notifications from '../components/DropdownNotifications';
// import Help from '../components/DropdownHelp';
// import UserMenu from '../components/DropdownProfile';
// import ThemeToggle from '../components/ThemeToggle';
// import LanguageToggle from '../components/LanguageToggle';

// function Header({
//   sidebarOpen,
//   setSidebarOpen,
//   variant = 'default',
//   handleLogout,
// }) {
//   const [org, setOrg] = useState({});
//   const [error, setError] = useState(null);
//   const [logoUrl, setLogoUrl] = useState('');
//   const { t, language } = useLanguage();
//   const { authData, loading } = useAuth();
//   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//   /**
//    * Checks if an access token is available in localStorage.
//    * @throws {Error} If no token is found.
//    */
//   const checkToken = () => {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       throw new Error('No access token found. Please log in.');
//     }
//     return token;
//   };

//   /**
//    * Handles HTTP response errors based on status codes.
//    * @param {Response} response - The Fetch API response object.
//    * @returns {Promise<object>} Parsed JSON response if successful.
//    * @throws {Error} Specific error based on status code or generic error.
//    */
//   const handleResponse = async (response) => {
//     if (response.ok) {
//       return response.json();
//     }

//     const errorData = await response.json().catch(() => ({}));
//     const errorMessage = errorData.message || errorData.error || 'No message';

//     switch (response.status) {
//       case 401:
//         throw new Error('Unauthorized: Please log in again.');
//       case 403:
//         throw new Error('Forbidden: You lack the required permissions.');
//       case 404:
//         throw new Error(`Not Found: ${errorMessage}`);
//       case 400:
//         throw new Error(`Bad Request: ${errorMessage}`);
//       default:
//         throw new Error(`Failed: ${response.status} - ${errorMessage}`);
//     }
//   };

//   useEffect(() => {
//     const fetchOrg = async () => {
//       if (loading || !authData || !authData.org_id) {
//         setError(authData ? 'No organization ID available' : 'Please log in');
//         return;
//       }

//       try {
//         const token = checkToken();
//         const url = `${API_BASE_URL}/api/orgs?org_id=${authData.org_id}`;

//         if (process.env.NODE_ENV !== 'production') {
//           console.debug('Fetching organization for org_id:', authData.org_id);
//         }

//         const response = await fetch(url, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             'x-access-tokens': token,
//           },
//         });

//         const data = await handleResponse(response);
//         // Handle array response
//         const orgData = Array.isArray(data) && data.length > 0 ? data[0] : data;
//         if (!orgData.org_id) {
//           throw new Error('Invalid organization data received');
//         }

//         setOrg({
//           org_id: orgData.org_id,
//           org_name_en: orgData.org_name_en || '',
//           org_name_ar: orgData.org_name_ar || '',
//           org_logo: orgData.org_logo || '',
//           org_address: orgData.org_address || '',
//           org_phone: orgData.org_phone || '',
//           org_website: orgData.org_website || '',
//           country_id: orgData.country_id || null,
//         });
//         setError(null);
//       } catch (err) {
//         console.error('Failed to fetch organization:', err);
//         setError(err.message);
//       }
//     };

//     fetchOrg();
//   }, [API_BASE_URL, authData, loading]);

//   useEffect(() => {
//     const fetchLogo = async () => {
//       if (!org.org_logo || !authData?.org_id) return;
//       try {
//         const token = checkToken();
//         const response = await fetch(`${API_BASE_URL}/api/orgs/${authData.org_id}/logo`, {
//           headers: { 'x-access-tokens': token },
//         });
//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({}));
//           throw new Error(errorData.error || 'Failed to fetch logo');
//         }
//         const blob = await response.blob();
//         setLogoUrl(URL.createObjectURL(blob));
//       } catch (err) {
//         console.error('Failed to fetch logo:', err);
//         setError('Failed to load logo');
//       }
//     };
//     fetchLogo();
//   }, [org.org_logo, authData, API_BASE_URL]);

//   return (
//     <header
//       className={`sticky top-0 before:absolute before:inset-0 before:backdrop-blur-md max-lg:before:bg-white/90 dark:max-lg:before:bg-gray-800/90 before:-z-10 z-30 ${variant === 'v2' || variant === 'v3' ? 'before:bg-white after:absolute after:h-px after:inset-x-0 after:top-full after:bg-gray-200 dark:after:bg-gray-700/60 after:-z-10' : 'max-lg:shadow-xs lg:before:bg-gray-100/90 dark:lg:before:bg-gray-900/90'} ${variant === 'v2' ? 'dark:before:bg-gray-800' : ''} ${variant === 'v3' ? 'dark:before:bg-gray-900' : ''}`}
//     >
//       <div className="px-4 sm:px-6 lg:px-8">
//         <div
//           className={`flex items-center justify-between h-16 ${variant === 'v2' || variant === 'v3' ? '' : 'lg:border-b border-gray-200 dark:border-gray-700/60'}`}
//         >
//           {/* Header: Left side */}
//             <div className="flex items-center">
//               <NavLink end to="/" className="flex items-center">
//                 {org.org_logo && logoUrl && !error ? (
//                   <img
//                     src={logoUrl}
//                     alt={language === 'ar' ? org.org_name_ar : org.org_name_en || 'Organization Logo'}
//                     className="w-10 h-10 rounded-full object-cover"
//                     onError={() => {
//                       setError('Failed to load logo');
//                     }}
//                   />
//                 ) : (
//                   <svg
//                     className="fill-violet-500"
//                     xmlns="http://www.w3.org/2000/svg"
//                     width={32}
//                     height={32}
//                   >
//                     <path d="M31.956 14.8C31.372 6.92 25.08.628 17.2.044V5.76a9.04 9.04 0 0 0 9.04 9.04h5.716ZM14.8 26.24v5.716C6.92 31.372.63 25.08.044 17.2H5.76a9.04 9.04 0 0 1 9.04 9.04Zm11.44-9.04h5.716c-.584 7.88-6.876 14.172-14.756 14.756V26.24a9.04 9.04 0 0 1 9.04-9.04ZM.044 14.8C.63 6.92 6.92.628 14.8.044V5.76a9.04 9.04 0 0 1-9.04 9.04H.044Z" />
//                   </svg>
//                 )}
//                 {/* Add Welcome: Company Name */}
//                 <span className="ml-3 text-gray-800 dark:text-gray-200 text-sm font-medium">
//                   {t('common.welcome')}: {language === 'ar' ? org.org_name_ar : org.org_name_en || 'Company Name'}
//                 </span>
//               </NavLink>
//               {/* Hamburger button */}
//               <button
//                 className="text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 lg:hidden ml-3"
//                 aria-controls="sidebar"
//                 aria-expanded={sidebarOpen}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setSidebarOpen(!sidebarOpen);
//                 }}
//               >
//                 <span className="sr-only">{t('common.open_sidebar')}</span>
//                 <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <rect x="4" y="5" width="16" height="2" />
//                   <rect x="4" y="11" width="16" height="2" />
//                   <rect x="4" y="17" width="16" height="2" />
//                 </svg>
//               </button>
//               {error && <div className="text-red-500 text-sm ml-3">{error}</div>}
//             </div>

//           {/* Header: Right side */}
//           <div className="flex items-center space-x-3">
//             <LanguageToggle />
//             <Notifications align="right" />
//             <Help align="right" />
//             <ThemeToggle />
//             <hr className="w-px h-6 bg-gray-200 dark:bg-gray-700/60 border-none" />
//             <UserMenu align="right" handleLogout={handleLogout} />
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Header;


// Enahnce Loop ORG Profile 

// src/partials/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Notifications from '../components/DropdownNotifications';
import Help from '../components/DropdownHelp';
import UserMenu from '../components/DropdownProfile';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';

function Header({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
  handleLogout,
}) {
  const [logoUrl, setLogoUrl] = useState('');
  const { t, language } = useLanguage();
  const { authData, loading } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Conditional cache helpers for logo
  const logoEtagRef = useRef(null);
  const logoLastModRef = useRef(null);
  const logoAbortRef = useRef(null);
  const prevOrgIdRef = useRef(null);

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [logoUrl]);

  /**
   * Checks if an access token is available in localStorage.
   * @throws {Error} If no token is found.
   */
  const checkToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }
    return token;
  };

  // ===== Fetch LOGO with 304 handling and request de-duplication =====
  useEffect(() => {
    const orgId = authData?.org_id;
    if (loading || !orgId) return;

    // Skip if same org_id already loaded and we have a URL
    if (prevOrgIdRef.current === orgId && logoUrl) return;
    prevOrgIdRef.current = orgId;

    // Abort any previous in-flight logo request
    if (logoAbortRef.current) logoAbortRef.current.abort();
    const controller = new AbortController();
    logoAbortRef.current = controller;

    (async () => {
      try {
        const token = checkToken();
        const url = `${API_BASE_URL}/api/orgs/${orgId}/logo`;

        const headers = { 'x-access-tokens': token };
        if (logoEtagRef.current) headers['If-None-Match'] = logoEtagRef.current;
        if (logoLastModRef.current) headers['If-Modified-Since'] = logoLastModRef.current;

        const response = await fetch(url, {
          method: 'GET',
          headers,
          cache: 'no-cache',
          signal: controller.signal,
        });

        // 304: Not Modified — keep current logoUrl; do not set error.
        if (response.status === 304) return;

        if (!response.ok) {
          // Don't clobber existing logo on transient errors
          console.warn('Logo fetch non-OK:', response.status);
          return;
        }

        // Update caching validators
        const et = response.headers.get('ETag');
        const lm = response.headers.get('Last-Modified');
        if (et) logoEtagRef.current = et;
        if (lm) logoLastModRef.current = lm;

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setLogoUrl((old) => {
          if (old && old !== objectUrl) URL.revokeObjectURL(old);
          return objectUrl;
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch logo:', err);
          // Keep previous logo; do not set persistent error here
        }
      }
    })();

    // Cleanup / cancel when deps change
    return () => {
      controller.abort();
    };
  }, [API_BASE_URL, authData?.org_id, loading, logoUrl]);

  return (
    <header
      className={`sticky top-0 before:absolute before:inset-0 before:backdrop-blur-md max-lg:before:bg-white/90 dark:max-lg:before:bg-gray-800/90 before:-z-10 z-30 ${
        variant === 'v2' || variant === 'v3'
          ? 'before:bg-white after:absolute after:h-px after:inset-x-0 after:top-full after:bg-gray-200 dark:after:bg-gray-700/60 after:-z-10'
          : 'max-lg:shadow-xs lg:before:bg-gray-100/90 dark:lg:before:bg-gray-900/90'
      } ${variant === 'v2' ? 'dark:before:bg-gray-800' : ''} ${variant === 'v3' ? 'dark:before:bg-gray-900' : ''}`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between h-16 ${
            variant === 'v2' || variant === 'v3' ? '' : 'lg:border-b border-gray-200 dark:border-gray-700/60'
          }`}
        >
          {/* Header: Left side */}
          <div className="flex items-center">
            <NavLink end to="/" className="flex items-center">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Organization Logo"
                  className="w-10 h-10 rounded-full object-cover"
                  onError={() => {
                    console.warn('Logo <img> onError fired');
                  }}
                />
              ) : (
                <svg
                  className="fill-violet-500"
                  xmlns="http://www.w3.org/2000/svg"
                  width={32}
                  height={32}
                >
                  <path d="M31.956 14.8C31.372 6.92 25.08.628 17.2.044V5.76a9.04 9.04 0 0 0 9.04 9.04h5.716ZM14.8 26.24v5.716C6.92 31.372.63 25.08.044 17.2H5.76a9.04 9.04 0 0 1 9.04 9.04Zm11.44-9.04h5.716c-.584 7.88-6.876 14.172-14.756 14.756V26.24a9.04 9.04 0 0 1 9.04-9.04ZM.044 14.8C.63 6.92 6.92.628 14.8.044V5.76a9.04 9.04 0 0 1-9.04 9.04H.044Z" />
                </svg>
              )}
            </NavLink>
            {/* Hamburger button */}
            <button
              className="text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 lg:hidden ml-3"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(!sidebarOpen);
              }}
            >
              <span className="sr-only">{t('common.open_sidebar')}</span>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="5" width="16" height="2" />
                <rect x="4" y="11" width="16" height="2" />
                <rect x="4" y="17" width="16" height="2" />
              </svg>
            </button>
          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            <LanguageToggle />
            <Notifications align="right" />
            <Help align="right" />
            <ThemeToggle />
            <hr className="w-px h-6 bg-gray-200 dark:bg-gray-700/60 border-none" />
            <UserMenu align="right" handleLogout={handleLogout} />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
