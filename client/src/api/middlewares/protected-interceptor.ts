import axios from "axios";
import CONFIG_KEYS from "../../config";

const STORAGE_KEY = "gh_auth";

interface StoredAuth {
  accessToken: string | null;
  refreshToken: string | null;
}

function getStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export const api = axios.create({
  baseURL: CONFIG_KEYS.API_BASE_URL,
  withCredentials: false,
});

/**
 * Request interceptor:
 * - Reads stored access token from localStorage.
 * - Attaches Authorization header when available.
 */
api.interceptors.request.use(
  (config) => {
    const stored = getStoredAuth();
    const token = stored?.accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor:
 * - On 401, clears stored auth to force re-authentication.
 * - Keeps behavior simple and predictable.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEY);
    }
    return Promise.reject(error);
  }
);

export default api;
