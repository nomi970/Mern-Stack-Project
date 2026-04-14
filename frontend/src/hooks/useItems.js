import { useCallback, useState } from "react";
import { itemService } from "../services/itemService";

const useItems = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const withRequestState = async (requestFn, successText) => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const result = await requestFn();
      if (successText) setSuccessMessage(successText);
      return result;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItems = useCallback(async () => {
    const data = await withRequestState(() => itemService.getItems());
    setItems(data);
  }, []);

  const createItem = async (payload) => {
    const createdItem = await withRequestState(
      () => itemService.createItem(payload),
      "Item created successfully."
    );
    setItems((prevItems) => [createdItem, ...prevItems]);
  };

  const updateItem = async (itemId, payload) => {
    const updatedItem = await withRequestState(
      () => itemService.updateItem(itemId, payload),
      "Item updated successfully."
    );
    setItems((prevItems) =>
      prevItems.map((item) => (item._id === itemId ? updatedItem : item))
    );
  };

  const deleteItem = async (itemId) => {
    await withRequestState(() => itemService.deleteItem(itemId), "Item deleted successfully.");
    setItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
  };

  return {
    items,
    isLoading,
    error,
    successMessage,
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  };
};

export default useItems;
