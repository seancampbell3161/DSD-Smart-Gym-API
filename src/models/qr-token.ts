import mongoose from "mongoose";
const { Schema } = mongoose;

const qrTokenSchema = new Schema({
  user: { tpye: Schema.Types.ObjectId, ref: "User", required: true },
  gym: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
  token: { tpye: String, required: true, unique: true },
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("QRToken", qrTokenSchema);
