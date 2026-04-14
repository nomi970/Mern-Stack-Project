import { createContext, useContext, useMemo } from "react";
import useItems from "../hooks/useItems";

const ItemsContext = createContext(null);

export const ItemsProvider = ({ children }) => {
  const itemsState = useItems();
  const contextValue = useMemo(() => itemsState, [itemsState]);

  return <ItemsContext.Provider value={contextValue}>{children}</ItemsContext.Provider>;
};

export const useItemsContext = () => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error("useItemsContext must be used within ItemsProvider");
  }
  return context;
};
