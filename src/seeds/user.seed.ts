// - Check if data exists
// - Define the data
// - Insert the data

import { User } from "../models/user.model";

const crypto = require("crypto");

interface IUser {
  _id: string;
  name: string;
  password: string;
  salt: string;
  role: string;
  gym_id: string;
}

let adminUser: IUser = {
  _id: "admin@email.com",
  name: "Smitty WerbenJagerManJensen",
  password: "123123123",
  salt: "1234125",
  role: "admin",
  gym_id: "1234",
};

export const seed = async () => {
  const user = await User.findById(adminUser._id);

  if (user) return;

  adminUser.salt = `${Date.now()}`;
  adminUser.password = crypto
    .createHash("sha256")
    .update(adminUser.password + adminUser.salt)
    .digest("hex");

  const newUser = new User(adminUser);

  await newUser.save();
};
