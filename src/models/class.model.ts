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

const classBookingSchema = new Schema(
  {
    class_id: { type: String, required: true },
    user_id: { type: String, required: true },
  },
  { timestamps: true }
);

const waitlistSchema = new Schema({
  class_id: { type: String, required: true },
  user_id: { type: String, required: true },
  joined_at: { type: Date, default: Date.now },
});

export const Class = mongoose.model("Class", classSchema);
export const ClassBooking = mongoose.model("ClassBooking", classBookingSchema);
export const Waitlist = mongoose.model("Waitlist", waitlistSchema);
