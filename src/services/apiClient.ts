// // src/api/api.ts
// import { ErrorResponse } from "@/interfaces/ErrorResponse.interface";
// import { useAuthStore } from "@/stores/authStore";
// import { useToastStore } from "@/stores/toastStore";
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// Create a configured Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 60000,
});

// Request interceptor to add token
// api.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
//   // Get token from Auth store
//   const token = useAuthStore.getState().accessToken;

//     console.log("➡️ Request URL:", config.url);
//     console.log("➡️ Method:", config.method);
//     console.log("➡️ Headers:", config.headers);
//     console.log("➡️ Query Params:", config.params);
//     console.log("➡️ Payload (Body):", config.data);

//   // Make sure headers is always an instance of AxiosHeaders
//   if (!config.headers || !(config.headers instanceof axios.AxiosHeaders)) {
//     config.headers = new axios.AxiosHeaders(config.headers);
//   }

//   if (token) {
//     config.headers.set("Authorization", `Bearer ${token}`);
//   } else {
//     // Remove Authorization header if no token (for login/register, etc.)
//     config.headers.delete && config.headers.delete("Authorization");
//   }

//   return config;
// },
//   (error) => Promise.reject(error)
// );

// // Response interceptor for refresh token logic
// api.interceptors.response.use((response) => response, async (error)  => {
//       const axiosError = error as AxiosError<ErrorResponse>;

//       console.log(axiosError.response?.data, 'this is the response error');

//       if(axiosError?.response?.data?.detail) {
//         const errorMessage = axiosError.response.data.detail;
//         useToastStore.getState().showToast(errorMessage, 'error');
//       }
//     return Promise.reject(error);
//   }
// );

// GET request
export const getData = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response: AxiosResponse<T> = await api.get(url, config);
  return response.data;
};

// POST request
export const postData = async <T, U>(
  url: string,
  data: T,
  config?: AxiosRequestConfig
): Promise<U> => {
  const response: AxiosResponse<U> = await api.post(url, data, config);
  return response.data;
};

// PUT request
export const putData = async <T, U>(
  url: string,
  data: T,
  config?: AxiosRequestConfig
): Promise<U> => {
  const response: AxiosResponse<U> = await api.put(url, data, config);
  return response.data;
};

// DELETE request
export const deleteData = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response: AxiosResponse<T> = await api.delete(url, config);
  return response.data;
};

export default api;
