import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    category: { type: String, trim: true, maxlength: 80, default: "" },
    businessType: { type: String, trim: true, maxlength: 80, default: "" },
    city: { type: String, trim: true, maxlength: 80, default: "" },
    location: { type: String, trim: true, maxlength: 200, default: "" },
    coverImage: { type: String, default: "" },
    images: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    rejectionReason: { type: String, default: "" }
  },
  { timestamps: true }
);

const Business = mongoose.model("Business", businessSchema);
export default Business;
