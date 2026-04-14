import { Router } from "express";
import {
  createItemController,
  deleteItemController,
  getItemsController,
  updateItemController
} from "../controllers/item.controller.js";
import { validateCreateItem, validateUpdateItem } from "../middlewares/validateItem.middleware.js";

const itemRouter = Router();

itemRouter.get("/", getItemsController);
itemRouter.post("/", validateCreateItem, createItemController);
itemRouter.put("/:id", validateUpdateItem, updateItemController);
itemRouter.delete("/:id", deleteItemController);

export default itemRouter;
