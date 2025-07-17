import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    gym_id: { type: String, ref: "Gym" },
  },
  { timestamps: true }
);

const checkInSchema = new Schema({
  user_id: { type: String, ref: "User", required: true },
  gym_id: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
  checked_in: { type: Date, required: true },
  checked_out: { type: Date, default: null },
});

checkInSchema.index({ user_id: 1, checked_out: 1 });

const qrTokenSchema = new Schema({
  user_id: { tpye: String, ref: "User", required: true },
  gym_id: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
  token: { type: String, required: true, unique: true },
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);
export const CheckIn = mongoose.model("CheckIn", checkInSchema);
export const QRToken = mongoose.model("QRToken", qrTokenSchema);
