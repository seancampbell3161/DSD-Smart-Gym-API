import mongoose, { Schema } from "mongoose";

const qrCodeSchema = new Schema({
  _id: { type: String, required: true },
  user_id: { type: String, required: true },
  gym_id: { type: String, required: true },
  qr_code: { type: String, required: true },
  expires_at: { type: Date, required: true },
});

const checkInOutSchema = new Schema({
  _id: { type: String, required: true },
  user_id: { type: String, required: true },
  gym_id: { type: String, required: true },
  checked_in: { type: Date, required: true },
  checked_out: { type: Date, default: null },
});

export const QRCode = mongoose.model("QRCode", qrCodeSchema);
export const CheckInOut = mongoose.model("CheckInOut", checkInOutSchema);
