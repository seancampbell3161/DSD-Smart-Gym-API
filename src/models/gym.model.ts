import mongoose, { Schema } from "mongoose";

const gymSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  zipcode: { type: String, required: true },
  phone: { type: String, required: true },
});

export const Gym = mongoose.model("Gym", gymSchema);
