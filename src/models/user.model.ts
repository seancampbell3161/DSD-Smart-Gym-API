import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    password: {
      type: String,
      required: true,
    },
    salt: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "member", "trainer"],
      required: true,
    },
    gym_id: { type: String, ref: "Gym", required: true },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
