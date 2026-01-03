
const API_LIST_URL = `${import.meta.env.VITE_API_BASE_URL}/api/reports/report_with_ai_only`;
const SOCKET_URL = `${import.meta.env.VITE_API_BASE_URL}`; // assumes same origin provides socket.io

const checkToken = () => {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No access token found. Please log in.');
  return token;
};

const refreshTokenAndRetry = async (url, options) => {
  const refreshToken = localStorage.getItem('refresh_token');
  const refreshResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!refreshResponse.ok) throw new Error('Failed to refresh token');
  const { access_token, refresh_token } = await refreshResponse.json();
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
  options.headers['x-access-tokens'] = access_token;
  return fetch(url, options);
};

const handleResponse = async (response) => {
  if (response.ok) return response.json();
  const data = await response.json().catch(()=>({}));
  const msg = data.message || data.error || response.statusText;
  throw new Error(`${response.status}: ${msg}`);
};

export const aiDashboardService = {
  async fetchAIReports(org_id, params={}, accessToken) {
    const token = accessToken || checkToken();
    const url = new URL(API_LIST_URL);
    url.searchParams.append('org_id', org_id);
    Object.entries(params).forEach(([k,v])=>{
      if (v === '' || v == null) return;
      if (Array.isArray(v)) v.forEach(x=>url.searchParams.append(`${k}[]`, x));
      else url.searchParams.append(k, v);
    });
    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'x-access-tokens': token } });
    if (response.status === 401) {
      try {
        return await refreshTokenAndRetry(url, { method: 'GET', headers: { 'Content-Type': 'application/json', 'x-access-tokens': token } }).then(r=>r.json());
      } catch (e) {
        localStorage.clear();
        window.location.href = '/login';
        throw e;
      }
    }
    return handleResponse(response);
  },

  getSocket(accessToken, org_id) {
    const token = accessToken || checkToken();
    // lazy load socket.io-client only in browser
    const { io } = window.__socketIOClient__ || {};
    if (!io) {
      // consumer must ensure socket.io client is loaded globally (e.g. in index.html)
      console.warn('socket.io-client not found on window; live updates limited to polling');
      return { on(){}, off(){}, emit(){}, disconnect(){} };
    }
    const socket = io(SOCKET_URL, { transports: ['websocket'], auth: { token }, query: { org_id } });
    return socket;
  }
};
