import mongoose from "mongoose";
import { Class, ClassBooking, Waitlist } from "../models/schemas";

export const handleWaitlist = async ({
  classObjectId,
}: {
  classObjectId: mongoose.Types.ObjectId;
}) => {
  const gymClass = await Class.findById(classObjectId);

  if (!gymClass) return;
  if (gymClass.attendees >= gymClass.capacity) return;

  const nextInLine = await Waitlist.findOne({ class_id: classObjectId }).sort({
    createdAt: 1,
  });
  if (!nextInLine) return;

  await nextInLine.deleteOne();

  await ClassBooking.create({
    class_id: classObjectId,
    profile_id: nextInLine.profile_id,
  });

  await Class.findByIdAndUpdate(classObjectId, { $inc: { attendees: 1 } });
};
