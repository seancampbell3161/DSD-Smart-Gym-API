import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IAuthenticatedRequest, IJwtPayload } from "../types/interface";

const { JWT_SECRET } = process.env;

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET not set");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as IJwtPayload & JwtPayload; // should include `role`
    (req as IAuthenticatedRequest).user = decoded;
    return next();
  } catch (err: any) {
    const isExpired = err?.name === "TokenExpiredError";
    return res.status(401).json({ error: isExpired ? "Token expired" : "Invalid token" });
  }
};
