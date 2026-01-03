// import React from 'react';

// const LoadingSpinner = () => {
//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       <span className="sr-only">Loading...</span>
//     </div>
//   );
// };

// export default LoadingSpinner;

import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-black bg-opacity-75 z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;