import mongoose from "mongoose";
import { Class } from "../models/schemas";
import { Request, Response } from "express";

export const createClass = async (response: Response) => {
  try {
    const newClass = new Class({
      title: "Demo Class 4",
      description: "This is test class 4",
      trainer_id: "user_30NM6aieIviok2UlrdeNk2AG5az",
      gym_id: new mongoose.Types.ObjectId("687a58fbc5b2fdc81be8b581"),
      date: new Date("2025-08-25"),
      start_time: "3:00 PM",
      end_time: "4:00 PM",
    });

    await newClass.save();

    return response.status(201).json({ success: true });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

export const fetchClasses = async (request: Request, response: Response) => {
  const { gym_id } = request.body;

  try {
    const gymObjectId = new mongoose.Types.ObjectId(gym_id);
    const allClasses = await Class.findById({ gym_id: gymObjectId });
    return response.status(201).json({ success: true, allClasses });
  } catch (error) {
    return response.status(500).json({ error });
  }
};
