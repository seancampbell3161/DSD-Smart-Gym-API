import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { Profile } from "../models/schemas";

export const requireRole = (role: string) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    const { userId } = getAuth(request);

    try {
      const profile = await Profile.findById(userId);

      if (!profile) {
        return response.status(404).json({ message: "User not found" });
      }

      if (profile.role !== role) {
        return response.status(403).json({ message: "Access denied!" });
      }

      next();
    } catch (error) {
      response.status(500).json({ message: error });
    }
  };
};
