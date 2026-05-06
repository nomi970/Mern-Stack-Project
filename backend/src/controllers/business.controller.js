import asyncHandler from "../utils/asyncHandler.js";
import * as businessService from "../services/business.service.js";

export const createBusinessController = asyncHandler(async (req, res) => {
  const business = await businessService.createBusiness(req.body, req.userId);
  res.status(201).json({ success: true, message: "Business created.", data: business });
});

export const getMyBusinessesController = asyncHandler(async (req, res) => {
  const businesses = await businessService.getMyBusinesses(req.userId);
  res.status(200).json({ success: true, data: businesses });
});

export const getAllBusinessesController = asyncHandler(async (req, res) => {
  const businesses = await businessService.getAllBusinesses();
  res.status(200).json({ success: true, data: businesses });
});

export const approveBusinessController = asyncHandler(async (req, res) => {
  const business = await businessService.updateBusinessStatus(req.params.id, "approved");
  res.status(200).json({ success: true, message: "Business approved.", data: business });
});

export const rejectBusinessController = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const business = await businessService.updateBusinessStatus(req.params.id, "rejected", reason);
  res.status(200).json({ success: true, message: "Business rejected.", data: business });
});

export const editBusinessController = asyncHandler(async (req, res) => {
  const business = await businessService.editBusiness(req.params.id, req.body);
  res.status(200).json({ success: true, message: "Business updated.", data: business });
});

export const editMyBusinessController = asyncHandler(async (req, res) => {
  const business = await businessService.editMyBusiness(req.params.id, req.userId, req.body);
  res.status(200).json({ success: true, message: "Business updated.", data: business });
});

export const deleteMyBusinessController = asyncHandler(async (req, res) => {
  await businessService.deleteMyBusiness(req.params.id, req.userId);
  res.status(200).json({ success: true, message: "Business deleted." });
});

export const deleteBusinessController = asyncHandler(async (req, res) => {
  await businessService.deleteBusiness(req.params.id);
  res.status(200).json({ success: true, message: "Business deleted." });
});
