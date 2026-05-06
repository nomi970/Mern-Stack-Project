import apiClient from "./apiClient";

export const businessService = {
  create: async (payload) => {
    const res = await apiClient.post("/businesses", payload);
    return res.data.data;
  },
  getMine: async () => {
    const res = await apiClient.get("/businesses/mine");
    return res.data.data;
  },
  getAll: async () => {
    const res = await apiClient.get("/businesses");
    return res.data.data;
  },
  approve: async (id) => {
    const res = await apiClient.patch(`/businesses/${id}/approve`);
    return res.data.data;
  },
  reject: async (id, reason = "") => {
    const res = await apiClient.patch(`/businesses/${id}/reject`, { reason });
    return res.data.data;
  },
  editMine: async (id, payload) => {
    const res = await apiClient.put(`/businesses/mine/${id}`, payload);
    return res.data.data;
  },
  deleteMine: async (id) => {
    await apiClient.delete(`/businesses/mine/${id}`);
  },
  edit: async (id, payload) => {
    const res = await apiClient.put(`/businesses/${id}`, payload);
    return res.data.data;
  },
  delete: async (id) => {
    await apiClient.delete(`/businesses/${id}`);
  }
};
