import mongoose from "mongoose";
const { Schema } = mongoose;

const gymSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  zipcode: { type: String, required: true },
  phone: { type: String, required: true },
});

const profileSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    gym_id: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
  },
  { timestamps: true }
);

const checkInOutSchema = new Schema({
  profile_id: { type: String, ref: "Profile", required: true },
  gym_id: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
  checked_in: { type: Date, required: true },
  checked_out: { type: Date, default: null },
});

checkInOutSchema.index({ profile_id: 1, checked_out: 1 });

const qrTokenSchema = new Schema(
  {
    profile_id: { type: String, ref: "Profile", required: true },
    gym_id: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
    token: { type: String, required: true, unique: true },
    expires_at: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Gym = mongoose.model("Gym", gymSchema);
export const Profile = mongoose.model("Profile", profileSchema);
export const CheckInOut = mongoose.model("CheckInOut", checkInOutSchema);
export const QRToken = mongoose.model("QRToken", qrTokenSchema);
