import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, } from "axios";
import { useAuthStore } from "../stores/authStore";
import { useToastStore } from "../stores/toastStore";
import { getRefreshToken, setRefreshToken } from "../utility/secureStore";

// Create a configured Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 60000,
});

// --- Global refresh lock
let isRefreshing = false;
let refreshQueue: ((token: string | null) => void)[] = [];

// --- Helper for queued calls
const processQueue = (token: string | null) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

// --- Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = useAuthStore.getState().accessToken;

    console.log("➡️ Request URL:", config.url);
    // console.log("➡️ Headers:", config.headers);
    console.log("➡️ Body:", config?.data?.data?.data);

    if (!config.headers || !(config.headers instanceof axios.AxiosHeaders)) {
      config.headers = new axios.AxiosHeaders(config.headers);
    }

    if (token) config.headers.set("Authorization", `Bearer ${token}`);
    else config.headers.delete?.("Authorization");

    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor
api.interceptors.response.use(
  (response) => {
    // console.log(response?.data, 'this is the data');

    return response;
  },
  async (error) => {
    const err = error as AxiosError<any>;
    const originalRequest = err.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    console.log("⛔ RESPONSE ERROR:", err?.response);
    console.log("  URL:", originalRequest?.url);
    console.log("  STATUS:", err.response?.status);
    console.log("  DATA:", err.response?.data);
    // console.log("  HEADERS:", err.response?.headers);

    const detail = err.response?.data?.detail;
    if (detail) useToastStore.getState().showToast(detail, "error");

    // Only handle 401 once
    if (err.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      // If already refreshing → wait
      if (isRefreshing) {
        console.log("⏳ Waiting for ongoing token refresh...");
        return new Promise((resolve, reject) => {
          refreshQueue.push((newToken) => {
            if (newToken) {
              console.log("✅ Token refreshed, queued request released.");
              originalRequest.headers = originalRequest.headers || {};
              (originalRequest.headers as any)["Authorization"] = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshTok = await getRefreshToken();
        console.log("🔄 Attempting to refresh token:", refreshTok);

        if (!refreshTok) throw new Error("No refresh token found");

        console.log("📤 Sending refresh request to:", `${import.meta.env.VITE_BASE_URL}/Auth/Refresh`);
        console.log("📦 Payload:", { refreshToken: refreshTok });

        // Use raw axios to avoid recursion
        const refreshResp: AxiosResponse<any> = await axios.request({
          method: "POST",
          url: `${import.meta.env.VITE_BASE_URL}/Auth/Refresh`,
          data: { refreshToken: refreshTok },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          validateStatus: () => true, // so we can log even 400/500
        });

        console.log("✅ Refresh Response:", refreshResp.status, refreshResp.data);

        if (refreshResp.status !== 200) {
          console.error("❌ Refresh failed with non-200 status:", refreshResp.status);
          throw new Error("Refresh failed");
        }

        const tokenData = refreshResp?.data?.data?.token;
        const newAccess = tokenData?.accessToken;
        const newRefresh = tokenData?.refreshToken;

        if (!newAccess || !newRefresh) {
          console.error("❌ Invalid refresh structure:", refreshResp.data);
          throw new Error("Token refresh failed: invalid response format");
        }

        console.log("🎯 New Tokens:", {
          accessToken: newAccess.slice(0, 20) + "...",
          refreshToken: newRefresh.slice(0, 20) + "...",
        });

        // Save new tokens
        await setRefreshToken(newRefresh);
        useAuthStore.getState().setAccessToken(newAccess);

        // Update axios defaults for future requests
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;

        // Release any queued requests
        processQueue(newAccess);

        // ✅ Retry the failed request using the new token
        originalRequest.headers = originalRequest.headers || {};
        (originalRequest.headers as any)["Authorization"] = `Bearer ${useAuthStore.getState().accessToken}`;

        console.log("🔁 Retrying original request after successful token refresh:", originalRequest.url);
        return api(originalRequest);
      } catch (refreshErr: any) {
        console.error("🔥 Refresh token request failed:", refreshErr);
        processQueue(null);
        useToastStore.getState().showToast("Session expired. Please log in again.", "error");
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


// GET request
export const getData = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await api.get(url, config);
  return response.data;
};

// POST request
export const postData = async <T, U>(url: string, data: T, config?: AxiosRequestConfig): Promise<U> => {
  const response: AxiosResponse<U> = await api.post(url, data, config);
  return response.data;
};

// PUT request
export const putData = async <T, U>(url: string, data: T, config?: AxiosRequestConfig): Promise<U> => {
  const response: AxiosResponse<U> = await api.put(url, data, config);
  return response.data;
};

// DELETE request
export const deleteData = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await api.delete(url, config);
  return response.data;
};

export default api;
