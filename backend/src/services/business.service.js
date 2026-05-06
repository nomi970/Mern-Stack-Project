import mongoose from "mongoose";
import Business from "../models/business.model.js";
import ApiError from "../utils/ApiError.js";

const makeSlug = (name) => {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${base}-${Date.now().toString(36)}`;
};

export const createBusiness = async (payload, ownerId) => {
  const slug = makeSlug(payload.name);
  return Business.create({ ...payload, owner: ownerId, slug });
};

export const getMyBusinesses = async (ownerId) => {
  return Business.find({ owner: ownerId }).sort({ createdAt: -1 });
};

export const getAllBusinesses = async () => {
  return Business.find().populate("owner", "name email").sort({ createdAt: -1 });
};

export const updateBusinessStatus = async (businessId, status, rejectionReason = "") => {
  if (!mongoose.Types.ObjectId.isValid(businessId)) throw new ApiError(400, "Invalid business id.");
  const business = await Business.findByIdAndUpdate(
    businessId,
    { status, rejectionReason: status === "rejected" ? rejectionReason : "" },
    { new: true, runValidators: true }
  ).populate("owner", "name email");
  if (!business) throw new ApiError(404, "Business not found.");
  return business;
};

export const editBusiness = async (businessId, payload) => {
  if (!mongoose.Types.ObjectId.isValid(businessId)) throw new ApiError(400, "Invalid business id.");
  const business = await Business.findByIdAndUpdate(businessId, payload, {
    new: true, runValidators: true
  }).populate("owner", "name email");
  if (!business) throw new ApiError(404, "Business not found.");
  return business;
};

export const deleteBusiness = async (businessId) => {
  if (!mongoose.Types.ObjectId.isValid(businessId)) throw new ApiError(400, "Invalid business id.");
  const business = await Business.findByIdAndDelete(businessId);
  if (!business) throw new ApiError(404, "Business not found.");
};

export const editMyBusiness = async (businessId, ownerId, payload) => {
  if (!mongoose.Types.ObjectId.isValid(businessId)) throw new ApiError(400, "Invalid business id.");
  const business = await Business.findOneAndUpdate(
    { _id: businessId, owner: ownerId },
    payload,
    { new: true, runValidators: true }
  );
  if (!business) throw new ApiError(404, "Business not found or access denied.");
  return business;
};

export const deleteMyBusiness = async (businessId, ownerId) => {
  if (!mongoose.Types.ObjectId.isValid(businessId)) throw new ApiError(400, "Invalid business id.");
  const business = await Business.findOneAndDelete({ _id: businessId, owner: ownerId });
  if (!business) throw new ApiError(404, "Business not found or access denied.");
};
