import { NextFunction, Response } from "express";
import { IAuthenticatedRequest } from "../types/interface";

export const requireRole = (roles: string[]) => () => {
  return (
    request: IAuthenticatedRequest,
    response: Response,
    next: NextFunction
  ) => {
    const { role } = request.user!;

    if (!roles.includes(role)) {
      return response.status(401).json({ error: "Access denied." });
    }

    next();
  };
};
