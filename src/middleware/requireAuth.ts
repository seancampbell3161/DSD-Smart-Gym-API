import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IAuthenticatedRequest, IJwtPayload } from "../types/interface";

const JWT_SECRET = process.env.JWT_SECRET!;

export const requireAuth = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const authHeader = request.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return response.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as IJwtPayload;
    (request as IAuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    return response.status(403).json({ error: "Invalid token" });
  }
};
