import mongoose from "mongoose";
const { Schema } = mongoose;

const checkInSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  gym: { type: Schema.Types.ObjectId, ref: "Gym", required: true },
  checked_in: { type: Date, required: true },
  checked_out: { type: Date, default: null },
});

checkInSchema.index({ user: 1, checked_out: 1 });

export default mongoose.model("CheckIn", checkInSchema);
