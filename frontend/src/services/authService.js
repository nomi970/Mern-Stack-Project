import apiClient from "./apiClient";

export const authService = {
  signup: async (payload) => {
    const response = await apiClient.post("/auth/signup", payload);
    return response.data.data;
  },
  login: async (payload) => {
    const response = await apiClient.post("/auth/login", payload);
    return response.data.data;
  },
  me: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data.data;
  },
  forgotPassword: async (email) => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data.data;
  },
  resetPassword: async (payload) => {
    await apiClient.post("/auth/reset-password", payload);
  }
};
