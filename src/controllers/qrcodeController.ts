import { getAuth } from "@clerk/express";
import { Request, Response } from "express";
import { QRToken } from "../models/schemas";
import crypto from "crypto";
import mongoose from "mongoose";

export const createQRCode = async (request: Request, response: Response) => {
  const { userId } = getAuth(request);
  const { gym_id } = request.body;

  try {
    const gymObjectId = new mongoose.Types.ObjectId(gym_id);
    const existingToken = await QRToken.findOne({
      user_id: userId,
      expires_at: { $gt: new Date() },
    });

    if (existingToken) {
      return response.status(201).json({
        success: true,
        token: existingToken.token,
      });
    }

    const token = crypto.randomBytes(12).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const qrToken = new QRToken({
      user_id: userId,
      gym_id: gymObjectId,
      token: token,
      expires_at: expiresAt,
    });

    await qrToken.save();

    return response.status(201).json({ success: true, token: token });
  } catch (error) {
    return response.status(500).json({ error });
  }
};
