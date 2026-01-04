/* import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check auth status on initial load
  useEffect(() => {
    const checkAuth = () => {
      setLoading(true);
      const storedToken = localStorage.getItem('access_token');
      const expiration = localStorage.getItem('access_token_expiration');

      if (storedToken && expiration && new Date(expiration) > new Date()) {
        const storedAuthData = {
          access_token: storedToken,
          refresh_token: localStorage.getItem('refresh_token'),
          access_token_expiration: expiration,
          country_id: parseInt(localStorage.getItem('country_id')),
          email: localStorage.getItem('email'),
          org_id: parseInt(localStorage.getItem('org_id')),
          org_name_ar: localStorage.getItem('org_name_ar'),
          org_name_en: localStorage.getItem('org_name_en'),
          privilege_ids: JSON.parse(localStorage.getItem('privilege_ids') || '[]'),
          refresh_token_expiration: localStorage.getItem('refresh_token_expiration'),
          subscription_id: parseInt(localStorage.getItem('subscription_id')),
          user_id: parseInt(localStorage.getItem('user_id')),
        };
        setAuthData(storedAuthData);
      } else {
        localStorage.clear();
        setAuthData(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback((data) => {
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
    });
    setAuthData(data);
    navigate('/dashboard');
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.clear();
    setAuthData(null);
    navigate('/login');
  }, [navigate]);

  const contextValue = useMemo(() => ({
    authData,
    loading,
    login,
    logout,
    isAuthenticated: !!authData?.access_token
  }), [authData, loading, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); */

// import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [authData, setAuthData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // Check auth status on initial load
//   useEffect(() => {
//     const checkAuth = () => {
//       setLoading(true);
//       console.log('AuthContext: Checking auth status...');

//       const storedToken = localStorage.getItem('access_token');
//       const expiration = localStorage.getItem('access_token_expiration');
//       console.log('AuthContext: Stored token:', storedToken);
//       console.log('AuthContext: Expiration:', expiration);
//       console.log('AuthContext: Current time:', new Date().toISOString());
//       console.log('AuthContext: Expiration time:', expiration ? new Date(expiration).toISOString() : 'N/A');
//       console.log('AuthContext: Is token valid?', storedToken && expiration && new Date(expiration) > new Date());

//       if (storedToken && expiration && new Date(expiration) > new Date()) {
//         const storedAuthData = {
//           access_token: storedToken,
//           refresh_token: localStorage.getItem('refresh_token'),
//           access_token_expiration: expiration,
//           country_id: parseInt(localStorage.getItem('country_id')),
//           email: localStorage.getItem('email'),
//           org_id: parseInt(localStorage.getItem('org_id')),
//           org_name_ar: localStorage.getItem('org_name_ar'),
//           org_name_en: localStorage.getItem('org_name_en'),
//           privilege_ids: JSON.parse(localStorage.getItem('privilege_ids') || '[]'),
//           refresh_token_expiration: localStorage.getItem('refresh_token_expiration'),
//           subscription_id: parseInt(localStorage.getItem('subscription_id')),
//           user_id: parseInt(localStorage.getItem('user_id')),
//         };
//         console.log('AuthContext: Setting authData:', storedAuthData);
//         setAuthData(storedAuthData);
//       } else {
//         console.log('AuthContext: Token invalid or expired, clearing localStorage');
//         localStorage.clear();
//         setAuthData(null);
//       }
//       setLoading(false);
//       console.log('AuthContext: Loading set to false');
//     };

//     checkAuth();
//   }, []);

//   const login = useCallback((data) => {
//     Object.entries(data).forEach(([key, value]) => {
//       localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
//     });
//     setAuthData(data);
//     navigate('/dashboard');
//   }, [navigate]);

//   const logout = useCallback(() => {
//     localStorage.clear();
//     setAuthData(null);
//     navigate('/login');
//   }, [navigate]);

//   const contextValue = useMemo(() => ({
//     authData,
//     loading,
//     login,
//     logout,
//     isAuthenticated: !!authData?.access_token
//   }), [authData, loading, login, logout]);

//   return (
//     <AuthContext.Provider value={contextValue}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check auth status on initial load
  useEffect(() => {
    const checkAuth = () => {
      setLoading(true);
      console.log('AuthContext: Checking auth status...');

      const storedToken = localStorage.getItem('access_token');
      const expiration = localStorage.getItem('access_token_expiration');
      console.log('AuthContext: Stored token:', storedToken);
      console.log('AuthContext: Expiration:', expiration);
      console.log('AuthContext: Current time:', new Date().toISOString());
      console.log('AuthContext: Expiration time:', expiration ? new Date(expiration).toISOString() : 'N/A');
      console.log('AuthContext: Is token valid?', storedToken && expiration && new Date(expiration) > new Date());

      if (storedToken && expiration && new Date(expiration) > new Date()) {
        const storedAuthData = {
          access_token: storedToken,
          refresh_token: localStorage.getItem('refresh_token'),
          access_token_expiration: expiration,
          country_id: localStorage.getItem('country_id'), // Keep as string
          email: localStorage.getItem('email'),
          org_id: localStorage.getItem('org_id'), // Keep as string
          org_name_ar: localStorage.getItem('org_name_ar'),
          org_name_en: localStorage.getItem('org_name_en'),
          privilege_ids: JSON.parse(localStorage.getItem('privilege_ids') || '[]'),
          refresh_token_expiration: localStorage.getItem('refresh_token_expiration'),
          user_id: localStorage.getItem('user_id'), // Keep as string
          subscription_id: localStorage.getItem('subscription_id'), // Keep as string
          branch: localStorage.getItem('branch') || '', // User's branch location
        };
        console.log('AuthContext: Setting authData:', storedAuthData);
        setAuthData(storedAuthData);
      } else {
        console.log('AuthContext: Token invalid or expired, clearing localStorage');
        localStorage.clear();
        setAuthData(null);
      }
      setLoading(false);
      console.log('AuthContext: Loading set to false');
    };

    checkAuth();
  }, []);

  const login = useCallback((data) => {
    console.log('AuthContext: Storing login data:', data);
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
    });
    setAuthData(data);
    navigate('/home');
  }, [navigate]);

  const logout = useCallback(() => {
    console.log('AuthContext: Logging out');
    localStorage.clear();
    setAuthData(null);
    navigate('/login');
  }, [navigate]);

  const contextValue = useMemo(() => ({
    authData,
    loading,
    login,
    logout,
    isAuthenticated: !!authData?.access_token
  }), [authData, loading, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);