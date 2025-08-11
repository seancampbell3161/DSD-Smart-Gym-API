import mongoose, { MongooseError } from "mongoose";
import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Gym } from "../models/gym.model";
import jwt from "jsonwebtoken";
import { IAuthenticatedRequest } from "../types/interface";

const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET!;

export const createUser = async (
  request: IAuthenticatedRequest,
  response: Response
) => {
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

    return response.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    if (error instanceof MongooseError) {
      return response.status(400).json({ error: error.message });
    }
    return response.status(500).json("Internal server error");
  }
};

export const login = async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response
        .status(400)
        .json({ error: "Email and password required" });
    }

    const user = await User.findById(email);
    if (!user) {
      return response.status(401).json({ error: "Invalid credentials" });
    }

    const hash = crypto
      .createHash("sha256")
      .update(password + user.salt)
      .digest("hex");

    if (hash !== user.password) {
      return response.status(401).json({ error: "Invalid credentials" });
    }

  
    const payload = {
      id: user._id as string,                 
      role: user.role as "admin" | "member" | "trainer",
      gym_id: user.gym_id as string | undefined,
    };

    const authToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return response.status(200).json({
      authToken,
      user: {
        email: user._id,
        role: user.role,
        gym_id: user.gym_id,
      },
    });
  } catch (error) {
    if (error instanceof MongooseError) {
      return response.status(400).json({ error: error.message });
    }
    return response.status(500).json("Internal server error");
  }
};

export const fetchAllUsers = async (
  request: IAuthenticatedRequest,
  response: Response
) => {
  try {
    const allUsers = await User.find();

    return response.status(200).json({ allUsers });
  } catch (error) {
    if (error instanceof MongooseError) {
      return response.status(400).json({ error: error.message });
    }
    return response.status(500).json("Internal server error");
  }
};

export const fetchUserById = async (
  request: IAuthenticatedRequest,
  response: Response
) => {
  try {
    const { id } = request.params;

    const user = await User.findById(id);
    return response.status(200).json({ user });
  } catch (error) {
    if (error instanceof MongooseError) {
      return response.status(400).json({ error: error.message });
    }
    return response.status(500).json("Internal server error");
  }
};

export const updateUser = async (
  request: IAuthenticatedRequest,
  response: Response
) => {
  try {
    const { id } = request.params;

    const updatedUser = await User.findByIdAndUpdate(id, request.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return response.status(404).json({ error: "User not found" });
    }

    return response.status(200).json({ updatedUser });
  } catch (error) {
    if (error instanceof MongooseError) {
      return response.status(400).json({ error: error.message });
    }
    return response.status(500).json("Internal server error");
  }
};

export const updatePassword = async (
  request: IAuthenticatedRequest,
  response: Response
) => {
  try {
    const { id } = request.params;
    const { password } = request.body;

    const user = await User.findById(id);

    if (!user) {
      return response.status(404).json("User not found");
    }

    user.salt = `${Date.now()}`;
    user.password = crypto
      .createHash("sha256")
      .update(password + user?.salt)
      .digest("hex");

    await user.save();

    return response
      .status(200)
      .json({ success: true, message: "Password updated" });
  } catch (error) {
    if (error instanceof MongooseError) {
      return response.status(400).json({ error: error.message });
    }
    return response.status(500).json("Internal server error");
  }
};

export const deleteUser = async (
  request: IAuthenticatedRequest,
  response: Response
) => {
  try {
    const { id } = request.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return response.status(404).json({ error: "User not found" });
    }

    return response
      .status(200)
      .json({ success: true, message: "User successfully deleted" });
  } catch (error) {
    if (error instanceof MongooseError) {
      return response.status(400).json({ error: error.message });
    }
    return response.status(500).json("Internal server error");
  }
};
