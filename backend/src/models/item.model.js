import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active"
    }
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;
