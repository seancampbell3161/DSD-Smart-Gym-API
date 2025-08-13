import { Response, NextFunction } from "express";
import { IAuthenticatedRequest } from "../types/interface";

export const requireRole = (roles: string[] | string) => {
  return (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole) return res.status(401).json({ error: "Unauthorized: No role found." });

    if (Array.isArray(roles) ? !roles.includes(userRole) : userRole !== roles) {
      return res.status(403).json({ error: "Access denied." });
    }
    return next();
  };
};
