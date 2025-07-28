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

export const Gym = mongoose.model("Gym", gymSchema);
export const Profile = mongoose.model("Profile", profileSchema);
