import { getAuth } from "@clerk/express";
import { Request, Response } from "express";
import { CheckInOut } from "../models/schemas";
import mongoose from "mongoose";

export const handleCheckInOut = async (
  request: Request,
  response: Response
) => {
  const { userId } = getAuth(request);
  const { gym_id } = request.body;

  try {
    const gymObjectId = new mongoose.Types.ObjectId(gym_id);
    const activeCheckIn = await CheckInOut.findOne({
      profile_id: userId,
      checked_out: null,
    });

    if (activeCheckIn) {
      activeCheckIn.checked_out = new Date();
      await activeCheckIn.save();
      return response.status(201).json({
        success: true,
        message: "Successfully checked out.",
      });
    }

    const newCheckIn = new CheckInOut({
      profile_id: userId,
      gym_id: gymObjectId,
      checked_in: new Date(),
      checked_out: null,
    });

    await newCheckIn.save();
    return response
      .status(201)
      .json({ success: true, message: "Successfully checked in." });
  } catch (error) {
    return response
      .status(500)
      .json({ success: false, message: "There was an error." });
  }
};
