import mongoose, { Schema } from "mongoose";

const classSchema = new Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  trainer_id: { type: String, required: true },
  gym_id: { type: String, required: true },
  date: { type: Date, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  attendees: { type: Number, default: 0 },
  capacity: { type: Number, required: true },
});

export const Class = mongoose.model("Class", classSchema);
