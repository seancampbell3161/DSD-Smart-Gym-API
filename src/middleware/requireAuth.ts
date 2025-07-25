import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).auth?.user || (req as any).user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
}
