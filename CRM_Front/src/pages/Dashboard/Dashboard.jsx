// // import React, { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import Sidebar from '../../partials/Sidebar';
// // import Header from '../../partials/Header';
// // import FilterButton from '../../components/DropdownFilter';
// // import Datepicker from '../../components/Datepicker';
// // import DashboardCard01 from '../../partials/dashboard/DashboardCard01';
// // import DashboardCard02 from '../../partials/dashboard/DashboardCard02';
// // import DashboardCard03 from '../../partials/dashboard/DashboardCard03';
// // import DashboardCard04 from '../../partials/dashboard/DashboardCard04';
// // import DashboardCard05 from '../../partials/dashboard/DashboardCard05';
// // import DashboardCard06 from '../../partials/dashboard/DashboardCard06';
// // import DashboardCard07 from '../../partials/dashboard/DashboardCard07';
// // import DashboardCard08 from '../../partials/dashboard/DashboardCard08';
// // import DashboardCard09 from '../../partials/dashboard/DashboardCard09';
// // import DashboardCard10 from '../../partials/dashboard/DashboardCard10';
// // import DashboardCard11 from '../../partials/dashboard/DashboardCard11';
// // import DashboardCard12 from '../../partials/dashboard/DashboardCard12';
// // import DashboardCard13 from '../../partials/dashboard/DashboardCard13';
// // import Banner from '../../partials/Banner';

// // function Dashboard() {
// //   const [sidebarOpen, setSidebarOpen] = useState(false);
// //   const navigate = useNavigate();

// //   const handleLogout = () => {
// //     // Clear tokens from localStorage
// //     localStorage.removeItem('access_token');
// //     localStorage.removeItem('refresh_token');
// //     // Redirect to login
// //     navigate('/login');
// //   };

// //   return (
// //     <div className="flex h-screen overflow-hidden">
// //       {/* Sidebar */}
// //       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

// //       {/* Content area */}
// //       <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
// //         {/* Site header */}
// //         <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} />

// //         <main className="grow">
// //           <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
// //             {/* Dashboard actions */}
// //             <div className="sm:flex sm:justify-between sm:items-center mb-8">
// //               {/* Left: Title and Welcome message */}
// //               <div className="mb-4 sm:mb-0">
// //                 <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Dashboard</h1>
// //                 <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Welcome Admin</p>
// //               </div>

// //               {/* Right: Actions */}
// //               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
// //                 {/* Filter button */}
// //                 <FilterButton align="right" />
// //                 {/* Datepicker built with React Day Picker */}
// //                 <Datepicker align="right" />
// //                 {/* Add view button */}
// //                 <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
// //                   <svg className="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16">
// //                     <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
// //                   </svg>
// //                   <span className="max-xs:sr-only">Add View</span>
// //                 </button>
// //               </div>
// //             </div>

// //             {/* Cards */}
// //             <div className="grid grid-cols-12 gap-6">
// //               <DashboardCard01 />
// //               <DashboardCard02 />
// //               <DashboardCard03 />
// //               <DashboardCard04 />
// //               <DashboardCard05 />
// //               <DashboardCard06 />
// //               <DashboardCard07 />
// //               <DashboardCard08 />
// //               <DashboardCard09 />
// //               <DashboardCard10 />
// //               <DashboardCard11 />
// //               <DashboardCard12 />
// //               <DashboardCard13 />
// //             </div>
// //           </div>
// //         </main>

// //         <Banner />
// //       </div>
// //     </div>
// //   );
// // }

// // export default Dashboard;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useLanguage } from '../../context/LanguageContext'; // Import useLanguage
// import Sidebar from '../../partials/Sidebar';
// import Header from '../../partials/Header';
// import FilterButton from '../../components/DropdownFilter';
// import Datepicker from '../../components/Datepicker';
// import LanguageToggle from '../../components/LanguageToggle'; // Import LanguageToggle
// import DashboardCard01 from '../../partials/dashboard/DashboardCard01';
// import DashboardCard02 from '../../partials/dashboard/DashboardCard02';
// import DashboardCard03 from '../../partials/dashboard/DashboardCard03';
// import DashboardCard04 from '../../partials/dashboard/DashboardCard04';
// import DashboardCard05 from '../../partials/dashboard/DashboardCard05';
// import DashboardCard06 from '../../partials/dashboard/DashboardCard06';
// import DashboardCard07 from '../../partials/dashboard/DashboardCard07';
// import DashboardCard08 from '../../partials/dashboard/DashboardCard08';
// import DashboardCard09 from '../../partials/dashboard/DashboardCard09';
// import DashboardCard10 from '../../partials/dashboard/DashboardCard10';
// import DashboardCard11 from '../../partials/dashboard/DashboardCard11';
// import DashboardCard12 from '../../partials/dashboard/DashboardCard12';
// import DashboardCard13 from '../../partials/dashboard/DashboardCard13';
// import Banner from '../../partials/Banner';

// function Dashboard() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const navigate = useNavigate();
//   const { t } = useLanguage(); // Use useLanguage for translations

//   const handleLogout = () => {
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('refresh_token');
//     navigate('/login');
//   };

//   return (
//     <div className="flex h-screen overflow-hidden">
//       {/* Sidebar */}
//       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

//       {/* Content area */}
//       <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
//         {/* Site header */}
//         <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} />

//         <main className="grow">
//           <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
//             {/* Dashboard actions */}
//             <div className="sm:flex sm:justify-between sm:items-center mb-8">
//               {/* Left: Title and Welcome message */}
//               <div className="mb-4 sm:mb-0">
//                 <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
//                   {t('dashboard.title')} {/* Use translation key */}
//                 </h1>
//                 <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
//                   {t('dashboard.welcome_admin')} {/* Use translation key */}
//                 </p>
//               </div>

//               {/* Right: Actions */}
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//                 {/* Filter button */}
//                 <FilterButton align="right" />
//                 {/* Datepicker built with React Day Picker */}
//                 <Datepicker align="right" />
//                 {/* Language Toggle */}
//                 <LanguageToggle /> {/* Add LanguageToggle component */}
//                 {/* Add view button */}
//                 <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
//                   <svg className="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16">
//                     <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
//                   </svg>
//                   <span className="max-xs:sr-only">{t('dashboard.add_view')}</span> {/* Use translation key */}
//                 </button>
//               </div>
//             </div>

//             {/* Cards */}
//             <div className="grid grid-cols-12 gap-6">
//               <DashboardCard01 />
//               <DashboardCard02 />
//               <DashboardCard03 />
//               <DashboardCard04 />
//               <DashboardCard05 />
//               <DashboardCard06 />
//               <DashboardCard07 />
//               <DashboardCard08 />
//               <DashboardCard09 />
//               <DashboardCard10 />
//               <DashboardCard11 />
//               <DashboardCard12 />
//               <DashboardCard13 />
//             </div>
//           </div>
//         </main>
//         <Banner />
//       </div>
//     </div>
//   );
// }

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Sidebar from '../../partials/Sidebar';
import Header from '../../partials/Header';
import FilterButton from '../../components/DropdownFilter';
import Datepicker from '../../components/Datepicker';
import LanguageToggle from '../../components/LanguageToggle';
import LoadingSpinner from '../../components/LoadingSpinner';
import DashboardCard01 from '../../partials/dashboard/DashboardCard01';
import DashboardCard02 from '../../partials/dashboard/DashboardCard02';
import DashboardCard03 from '../../partials/dashboard/DashboardCard03';
import DashboardCard04 from '../../partials/dashboard/DashboardCard04';
import DashboardCard05 from '../../partials/dashboard/DashboardCard05';
import DashboardCard06 from '../../partials/dashboard/DashboardCard06';
import DashboardCard07 from '../../partials/dashboard/DashboardCard07';
import DashboardCard08 from '../../partials/dashboard/DashboardCard08';
import DashboardCard09 from '../../partials/dashboard/DashboardCard09';
import DashboardCard10 from '../../partials/dashboard/DashboardCard10';
import DashboardCard11 from '../../partials/dashboard/DashboardCard11';
import DashboardCard12 from '../../partials/dashboard/DashboardCard12';
import DashboardCard13 from '../../partials/dashboard/DashboardCard13';
import Banner from '../../partials/Banner';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { authData, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  // Check authentication and privileges
  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('dashboard.no_permission'));
      setLoading(false);
      return;
    }

    // Assuming privilege ID 1 is required for dashboard access (adjust as needed)
    if (authData.privilege_ids.includes(1)) {
      setHasPrivilege(true);
    } else {
      setError(t('dashboard.no_permission'));
      setHasPrivilege(false);
    }

    setLoading(false);
  }, [authData, authLoading, t]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Error Display */}
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

            {/* Dashboard actions */}
            {hasPrivilege ? (
              <>
                <div className="sm:flex sm:justify-between sm:items-center mb-8">
                  {/* Left: Title and Welcome message */}
                  <div className="mb-4 sm:mb-0">
                    <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                      {t('dashboard.title')}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                      {t('dashboard.welcome_admin')}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                    {/* Filter button */}
                    <FilterButton align="right" />
                    {/* Datepicker built with React Day Picker */}
                    <Datepicker align="right" />
                    {/* Language Toggle */}
                    <LanguageToggle />
                    {/* Add view button */}
                    <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                      <svg className="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16">
                        <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                      </svg>
                      <span className="max-xs:sr-only">{t('dashboard.add_view')}</span>
                    </button>
                  </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-12 gap-6">
                  <DashboardCard01 />
                  <DashboardCard02 />
                  <DashboardCard03 />
                  <DashboardCard04 />
                  <DashboardCard05 />
                  <DashboardCard06 />
                  <DashboardCard07 />
                  <DashboardCard08 />
                  <DashboardCard09 />
                  <DashboardCard10 />
                  <DashboardCard11 />
                  <DashboardCard12 />
                  <DashboardCard13 />
                </div>
              </>
            ) : (
              <div className="text-gray-600">{t('dashboard.no_access')}</div>
            )}
          </div>
        </main>

        <Banner />
      </div>
    </div>
  );
}

export default Dashboard;