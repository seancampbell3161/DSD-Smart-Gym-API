import { Response } from "express";
import { MongooseError } from "mongoose";
import { CheckInOut, QRCode } from "../models/access.model";
import crypto from "crypto";
import { IAuthenticatedRequest } from "../types/interface";

export const createQRCode = async (
  request: IAuthenticatedRequest,
  response: Response
) => {
  try {
    const { email } = request.user!;
    const { gym_id } = request.body;

    const existingQRCode = await QRCode.findOne({
      user_id: email,
      expires_at: { $gt: new Date() },
    });

    if (existingQRCode) {
      return response
        .status(201)
        .json({ success: true, qrCode: existingQRCode.qr_code });
    }

    const qrToken = crypto.randomBytes(12).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const qrCode = new QRCode({
      _id: `${Date.now()}`,
      user_id: email,
      gym_id: gym_id,
      qr_code: qrToken,
      expires_at: expiresAt,
    });

    await qrCode.save();

    return response.status(200).json({ success: true, qrCode: qrCode });
  } catch (error) {
    if (error instanceof MongooseError) {
      return response.status(400).json({ error: error.message });
    }
    return response.status(500).json("Internal server error");
  }
};

export const handleCheckInOut = async (
  request: IAuthenticatedRequest,
  response: Response
) => {
  try {
    const { email } = request.user!;
    const { gym_id } = request.body;

    const alreadyCheckedIn = await CheckInOut.findOne({
      user_id: email,
      checked_out: null,
    });

    if (alreadyCheckedIn) {
      alreadyCheckedIn.checked_out = new Date();
      await alreadyCheckedIn.save();
      return response
        .status(200)
        .json({ success: true, message: "Successfully checked out" });
    }

    const newCheckIn = new CheckInOut({
      _id: `${Date.now()}`,
      user_id: email,
      gym_id: gym_id,
      checked_in: new Date(),
      checked_out: null,
    });

    await newCheckIn.save();

    return response
      .status(200)
      .json({ success: true, message: "Successfully checked in." });
  } catch (error) {
    if (error instanceof MongooseError) {
      return response.status(400).json({ error: error.message });
    }
    return response.status(500).json("Internal server error");
  }
};
