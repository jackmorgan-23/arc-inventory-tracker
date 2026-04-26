const GATEWAY_URL = 'https://arc-inventory-gateway-7sn18qso.ue.gateway.dev';
const ITEMS_FN_URL = 'https://fn-items-qfu2armj7q-ue.a.run.app';
const INVENTORY_FN_URL = 'https://fn-inventory-qfu2armj7q-ue.a.run.app';

// For backward compatibility with any components still importing this
export const API_BASE_URL = window.location.hostname === 'localhost' 
  ? INVENTORY_FN_URL 
  : GATEWAY_URL;

/**
 * Resolves the base URL for a given endpoint.
 */
export function getBaseUrl(endpoint) {
  if (window.location.hostname !== 'localhost') return GATEWAY_URL;
  return endpoint.startsWith('/items') ? ITEMS_FN_URL : INVENTORY_FN_URL;
}

export async function fetchWithAuth(endpoint, options = {}) {
  let headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const baseUrl = getBaseUrl(endpoint);
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  const useBearerFallback = window.location.hostname === 'localhost';

  if (useBearerFallback) {
    const token = localStorage.getItem('google_id_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const sessionId = localStorage.getItem('session_id');
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  getLoadouts: () => fetchWithAuth('/loadouts'),
  getLoadout: (index) => fetchWithAuth(`/loadouts/${index}`),
  saveLoadout: (index, data) => fetchWithAuth(`/loadouts/${index}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteLoadout: (index) => fetchWithAuth(`/loadouts/${index}`, {
    method: 'DELETE'
  }),
  verifyToken: (idToken) => {
    const baseUrl = getBaseUrl('/verifyToken');
    return fetch(`${baseUrl}/verifyToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      credentials: 'include',
    }).then(res => res.json());
  },
  logout: () => fetchWithAuth('/logout', {
    method: 'POST',
  }),
};
