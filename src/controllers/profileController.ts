import mongoose from "mongoose";
import { Profile } from "../models/schemas";
import { getAuth } from "@clerk/express";
import { Request, Response } from "express";

export const createProfile = async (response: Response) => {
  try {
    const profile = new Profile({
      _id: "user_300dWPNTjjdxTw7cYxfR5OePca3",
      name: "Smitty WerbenJagerManJensen",
      email: "testmember@email.com",
      role: "member",
      gym_id: new mongoose.Types.ObjectId("687a58fbc5b2fdc81be8b581"),
    });

    await profile.save();

    return response.status(201).json({ success: true });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

export const fetchProfile = async (request: Request, response: Response) => {
  const { userId } = getAuth(request);

  try {
    const profile = await Profile.findById(userId);
    return response.status(201).json({ success: true, profile });
  } catch (error) {
    return response.status(500).json({ error });
  }
};
