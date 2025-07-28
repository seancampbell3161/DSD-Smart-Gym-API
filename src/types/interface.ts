import { Request } from "express";

export interface IUser {
  _id: string;
  name: string;
  password: string;
  salt: string;
  role: "admin" | "member" | "trainer";
  gym_id: string;
}

export interface IJwtPayload {
  email: string;
  role: "admin" | "member" | "trainer";
}

export interface IAuthenticatedRequest extends Request {
  user?: IJwtPayload;
}
