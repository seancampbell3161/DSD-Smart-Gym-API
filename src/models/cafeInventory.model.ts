import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

const cafeInventorySchema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    item_name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export const CafeInventory = mongoose.model(
  "CafeInventory",
  cafeInventorySchema
);
