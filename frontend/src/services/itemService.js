import apiClient from "./apiClient";

export const itemService = {
  getItems: async () => {
    const response = await apiClient.get("/items");
    return response.data.data;
  },
  createItem: async (payload) => {
    const response = await apiClient.post("/items", payload);
    return response.data.data;
  },
  updateItem: async (itemId, payload) => {
    const response = await apiClient.put(`/items/${itemId}`, payload);
    return response.data.data;
  },
  deleteItem: async (itemId) => {
    await apiClient.delete(`/items/${itemId}`);
  }
};
