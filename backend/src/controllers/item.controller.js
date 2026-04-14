import asyncHandler from "../utils/asyncHandler.js";
import * as itemService from "../services/item.service.js";

export const getItemsController = asyncHandler(async (_req, res) => {
  const items = await itemService.getAllItems();
  res.status(200).json({
    success: true,
    message: "Items fetched successfully.",
    data: items
  });
});

export const createItemController = asyncHandler(async (req, res) => {
  const item = await itemService.createItem(req.body);
  res.status(201).json({
    success: true,
    message: "Item created successfully.",
    data: item
  });
});

export const updateItemController = asyncHandler(async (req, res) => {
  const item = await itemService.updateItemById(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Item updated successfully.",
    data: item
  });
});

export const deleteItemController = asyncHandler(async (req, res) => {
  await itemService.deleteItemById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Item deleted successfully."
  });
});
