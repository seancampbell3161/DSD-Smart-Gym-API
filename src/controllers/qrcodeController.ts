import { Request, Response } from "express";
import { QRToken } from "../models/schemas";
import crypto from "crypto";

export const createQRCode = async (request: Request, response: Response) => {
  const { gym_id, user_id } = request.body;

  try {
    const existingToken = await QRToken.findOne({
      user_id: user_id,
      expires_at: { $gt: new Date() },
    });

    if (existingToken) {
      return response.status(201).json({
        success: true,
        token: existingToken.qr_token,
      });
    }

    const token = crypto.randomBytes(12).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const qrToken = new QRToken({
      user_id: user_id,
      gym_id: gym_id,
      token: token,
      expires_at: expiresAt,
    });

    await qrToken.save();

    return response.status(201).json({ success: true, token: token });
  } catch (error) {
    return response.status(500).json({ error });
  }
};
