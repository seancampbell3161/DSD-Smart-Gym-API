import { getAuth } from "@clerk/express";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { Class, ClassBooking, Waitlist } from "../models/schemas";
import { handleWaitlist } from "../functions/handleWaitlist";

export const joinClass = async (request: Request, response: Response) => {
  const { userId } = getAuth(request);
  const { class_id } = request.body;

  if (!class_id) {
    return response.status(400).json({ error: "Missing class ID" });
  }

  const classObjectId = new mongoose.Types.ObjectId(class_id);

  try {
    const gymClass = await Class.findById(classObjectId);

    if (!gymClass) {
      return response.status(404).json({ error: "Class not found." });
    }

    const alreadyBooked = await ClassBooking.findOne({
      class_id: classObjectId,
      profile_id: userId,
    });

    if (alreadyBooked) {
      return response
        .status(400)
        .json({ error: "You are already booked for this class." });
    }

    const alreadyWaitlisted = await Waitlist.findOne({
      class_id: classObjectId,
      profile_id: userId,
    });

    if (alreadyWaitlisted) {
      return response
        .status(400)
        .json({ error: "You are already waitlisted for this class." });
    }

    if (gymClass.attendees >= gymClass.capacity) {
      await Waitlist.create({
        class_id: classObjectId,
        profile_id: userId,
      });

      return response
        .json(200)
        .json({ message: "Class is full. You have been waitlisted." });
    }

    await ClassBooking.create({
      class_id: classObjectId,
      profile_id: userId,
    });

    await Class.findByIdAndUpdate(classObjectId, { $inc: { attendees: 1 } });

    return response.status(200).json({ message: "Successfully booked class." });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

export const leaveClass = async (request: Request, response: Response) => {
  const { userId } = getAuth(request);
  const { class_id } = request.body;

  if (!class_id) {
    return response.status(400).json({ error: "Missing class ID" });
  }

  const classObjectId = new mongoose.Types.ObjectId(class_id);

  try {
    const hasBooking = await ClassBooking.findByIdAndDelete({
      class_id: classObjectId,
      profile_id: userId,
    });

    if (hasBooking) {
      await Class.findByIdAndUpdate(classObjectId, { $inc: { attendees: -1 } });

      await handleWaitlist({ classObjectId });

      return response
        .status(200)
        .json({ message: "Successfully left the class." });
    }

    const isWaitlisted = await Waitlist.findByIdAndDelete({
      class_id: classObjectId,
      profile_id: userId,
    });

    if (isWaitlisted) {
      return response.status(200).json({ message: "Removed from waitlist." });
    }

    return response
      .status(404)
      .json({ error: "You are not booked or waitlisted for this class." });
  } catch (error) {
    return response.status(500).json({ error });
  }
};
