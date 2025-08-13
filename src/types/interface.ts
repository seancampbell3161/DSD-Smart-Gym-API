// src/types/interface.ts
import { Request } from "express";

export type UserRole = "admin" | "member" | "trainer";

export interface IUser {
  _id: string;           
  name: string;
  password: string;
  salt: string;
  role: UserRole;
  gym_id: string;
}

export interface IGym {
  _id: string;
  name: string;
  address: string;
  city: string;
  zipcode: string;
  phone: string;
}

export interface IClass {
  _id: string;
  title: string;
  description: string;
  trainer_id: string;
  gym_id: string;
  date: Date;
  start_time: string;
  end_time: string;
  attendees: number;
  capacity: number;
}

export interface IJwtPayload {
  id: string;
  role: UserRole;
  gym_id?: string;
  iat?: number;
  exp?: number;
}

export interface IAuthenticatedRequest extends Request {
  user?: IJwtPayload;
}

export interface CafeInventory {
  _id?: string;
  item_name: string;
  quantity: number;
  price: number;
}

export interface CafeCartItem extends CafeInventory {
  quantityOrdered: number;
}
