// src/lib/ratingsService.js
const API_URL = import.meta.env.VITE_API_BASE_URL;

// ---- tiny authorized fetch with one refresh attempt -------------------------
// You can pass an optional tokenOverride to bypass localStorage for the access token.
async function authorizedFetch(input, init = {}, tokenOverride) {
  const url = typeof input === 'string' ? input : input.toString();
  const headers = { ...(init.headers || {}) };

  let accessToken = tokenOverride || localStorage.getItem('access_token');
  if (!accessToken) throw new Error('No access token found. Please log in.');
  headers['x-access-tokens'] = accessToken;

  const doFetch = () => fetch(url, { ...init, headers });

  // first attempt
  let res = await doFetch();
  if (res.status !== 401 || tokenOverride) return res; 
  // If caller provided tokenOverride, we won't try to refresh silently —
  // the caller should handle renewing the token they passed.

  // refresh (only when using localStorage token)
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    localStorage.clear();
    // best-effort redirect (only in browser)
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized and no refresh token found');
  }

  const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!refreshRes.ok) {
    localStorage.clear();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Failed to refresh token');
  }

  const { access_token, refresh_token } = await refreshRes.json();
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);

  // retry with new token
  headers['x-access-tokens'] = access_token;
  res = await doFetch();
  return res;
}

function buildQuery(params = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      v.forEach((vv) => {
        if (vv !== undefined && vv !== null && `${vv}` !== '') q.append(k, vv);
      });
    } else if (`${v}` !== '') {
      q.append(k, v);
    }
  }
  return q.toString();
}

// ---- service ----------------------------------------------------------------
const ratingsService = {
  /**
   * Fetch ratings with server-side filters & pagination
   * @param {number} orgId
   * @param {object} opts { page, per_page, rating, location_id, employee_id, q, start_date, end_date, sort }
   * @param {string} [accessTokenOverride] optional bearer from context (avoids LS read + refresh flow)
   * @returns {Promise<{data: Array, pagination: {page:number, per_page:number, total_items:number, total_pages:number, sort:string}}>}
   */
  async fetchRatings(orgId, opts = {}, accessTokenOverride) {
    if (!orgId) throw new Error('orgId is required');
    const query = buildQuery({ org_id: orgId, ...opts });
    const res = await authorizedFetch(`${API_URL}/api/ratings?${query}`, { method: 'GET' }, accessTokenOverride);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to fetch ratings: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`);
    }
    return res.json();
  },

  /**
   * Backward-compat alias (matches your original API name).
   * Keeps existing imports working: ratingsService.getRatings(...)
   */
  async getRatings(orgId, opts = {}) {
    return this.fetchRatings(orgId, opts);
  },

  /**
   * Convenience: fetch all pages up to a max (client-side aggregation).
   * @param {number} orgId
   * @param {object} opts same as fetchRatings (page/per_page are auto-managed here)
   * @param {number} [maxItems=10000] safety cap
   * @param {string} [accessTokenOverride]
   * @returns {Promise<{data:Array, pagination: {page:number, per_page:number, total_items:number, total_pages:number, sort:string}}>}
   */
  async fetchAll(orgId, opts = {}, maxItems = 10000, accessTokenOverride) {
    const perPage = Math.min(100, Math.max(1, parseInt(opts.per_page || 100, 10)));
    let page = 1;
    let all = [];
    let lastPagination = null;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data, pagination } = await this.fetchRatings(
        orgId,
        { ...opts, page, per_page: perPage },
        accessTokenOverride
      );
      all = all.concat(data || []);
      lastPagination = pagination || null;

      if (!pagination || page >= pagination.total_pages) break;
      if (all.length >= maxItems) break;
      page += 1;
    }

    // mimic single response shape
    return {
      data: all.slice(0, maxItems),
      pagination: lastPagination || {
        page: 1,
        per_page: perPage,
        total_items: all.length,
        total_pages: 1,
        sort: (opts.sort || '-date_created')
      }
    };
  },
};

export { ratingsService };
export default ratingsService;
