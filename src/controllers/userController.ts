import mongoose from "mongoose";
import { User } from "../models/schemas";

export const createUser = async () => {
  try {
    const user = new User({
      _id: "user_300dSZXWa8GeHx6Ww75IRDTRjjv",
      name: "Spongebob Squarepants",
      email: "testadmin@email.com",
      role: "admin",
      gym_id: new mongoose.Types.ObjectId("687a58fbc5b2fdc81be8b581"),
    });

    await user.save();
  } catch (error) {
    console.error(error);
  }
};
