import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api",
  timeout: 10000
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiErrorMessage =
      error.response?.data?.message ?? "Something went wrong. Please try again.";
    return Promise.reject(new Error(apiErrorMessage));
  }
);

export default apiClient;
