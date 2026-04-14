import mongoose from "mongoose";
import Item from "../models/item.model.js";
import ApiError from "../utils/ApiError.js";

export const getAllItems = async () => {
  return Item.find().sort({ createdAt: -1 });
};

export const createItem = async (payload) => {
  return Item.create(payload);
};

export const updateItemById = async (itemId, payload) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(400, "Invalid item id.");
  }

  const item = await Item.findByIdAndUpdate(itemId, payload, {
    new: true,
    runValidators: true
  });

  if (!item) {
    throw new ApiError(404, "Item not found.");
  }

  return item;
};

export const deleteItemById = async (itemId) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new ApiError(400, "Invalid item id.");
  }

  const item = await Item.findByIdAndDelete(itemId);
  if (!item) {
    throw new ApiError(404, "Item not found.");
  }
};
