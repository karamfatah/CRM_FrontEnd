// import React, { useState } from 'react';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const { login } = useAuth(); // Use AuthContext's login function

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
//         email,
//         password,
//       });
//       const {
//         access_token,
//         refresh_token,
//         access_token_expiration,
//         country_id,
//         email: responseEmail,
//         org_id,
//         org_name_ar,
//         org_name_en,
//         privilege_ids,
//         refresh_token_expiration,
//         subscription_id,
//         user_id,
//       } = response.data;

//       // Use AuthContext's login function to store data and navigate
//       login({
//         access_token,
//         refresh_token,
//         access_token_expiration,
//         country_id,
//         email: responseEmail,
//         org_id,
//         org_name_ar,
//         org_name_en,
//         privilege_ids,
//         refresh_token_expiration,
//         subscription_id,
//         user_id,
//       });
//     } catch (err) {
//       setError('Invalid email or password');
//       console.error('Login error:', err);
//     }
//   };

//   return (
//     <div 
//       className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
//       style={{ backgroundImage: `url(/images/loginimage.jpg)` }}
//     >
//       <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
//         <div className="flex justify-center mb-6">
//           <div className="w-12 h-12 flex items-center justify-center rounded-full bg-violet-500">
//             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-2 4-2 4m-4-4c0-1.1-.9-2-2-2s-2 .9-2 2 2 4 2 4m8-4h4m-4 4h4M6 4h12M6 20h12"></path>
//             </svg>
//           </div>
//         </div>
//         <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-2">TQM Quality Management</h2>
//         <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">Please sign in to continue</p>
//         {error && (
//           <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md text-sm">
//             {error}
//           </div>
//         )}
//         <div className="space-y-4">
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Email address
//             </label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
//               placeholder="you@example.com"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
//               placeholder="••••••••"
//               required
//             />
//           </div>
//           <button
//             onClick={handleLogin}
//             className="w-full py-2 px-4 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
//           >
//             Sign in
//           </button>
//         </div>
//         <footer className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
//           Powerd by G-LAPS LLC. All Rights reserved
//         </footer>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });
      const {
        access_token,
        refresh_token,
        access_token_expiration,
        country_id,
        email: responseEmail,
        org_id,
        org_name_ar,
        org_name_en,
        privilege_ids,
        refresh_token_expiration,
        subscription_id,
        user_id,
      } = response.data;

      login({
        access_token,
        refresh_token,
        access_token_expiration,
        country_id,
        email: responseEmail,
        org_id,
        org_name_ar,
        org_name_en,
        privilege_ids,
        refresh_token_expiration,
        subscription_id,
        user_id,
      });
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(/images/loginimage.jpg)` }}
    >
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="flex justify-center mb-6">
          <img
            src="/images/logo.png"
            alt="TQM 360 Logo"
            className="w-16 h-16 object-cover rounded-full"
          />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-1">TQM 360</h2>
        <p className="text-lg font-medium text-gray-900 dark:text-white text-center mb-2">Total Management System</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">Please sign in to continue</p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.79m0 0L21 21"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-2 px-4 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
          >
            Sign in
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Don't have an account?{' '}
            <a
              href="https://www.tqm-360.io"
              className="text-violet-500 hover:text-violet-600 font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              Register your organization now
            </a>
          </p>
        </div>
        <footer className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Powered by G-LAPS LLC. All Rights reserved
        </footer>
      </div>
    </div>
  );
};

export default Login;