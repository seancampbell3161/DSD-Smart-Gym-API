import mongoose, { MongooseError } from "mongoose";
import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Gym } from "../models/schemas";

const crypto = require("crypto");

export const createUser = async (request: Request, response: Response) => {
  try {
    const user = new User(request.body);
    user.salt = `${Date.now()}`;
    user.password = crypto
      .createHash("sha256")
      .update(user.password + user.salt)
      .digest("hex");

    const gym = await Gym.findById(user.gym_id);

    if (!gym) {
      return response.status(404).json({ error: "Gym doesn't exist" });
    }

    await user.save();

    return response.status(201).json({ success: true });
  } catch (error) {
    console.log(error);
    if (error instanceof MongooseError) {
      return response.status(400).json({ error: error.message });
    }
    return response.status(500).json("Internal server error");
  }
};

// export const fetchProfile = async (request: Request, response: Response) => {
//   try {
//     const user = await User.findById(userId);
//     return response.status(201).json({ success: true, profile });
//   } catch (error) {
//     return response.status(500).json({ error });
//   }
// };

//fetchUserById
//fetchUsers
//updateUser
//updatePassword
//deleteUser
//login
