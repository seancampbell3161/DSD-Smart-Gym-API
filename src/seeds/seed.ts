import { Class } from "../models/class.model";
import { Gym } from "../models/gym.model";
import { User } from "../models/user.model";
import { IClass, IGym, IUser } from "../types/interface";

const crypto = require("crypto");

let gym: IGym = {
  _id: "123",
  name: "Planet Thickness",
  address: "123 Address Way",
  city: "Test City",
  zipcode: "12345",
  phone: "1234567890",
};

let users: IUser[] = [
  {
    _id: "admin@email.com",
    name: "Smitty WerbenJagerManJensen",
    password: "123123123",
    salt: "1234125",
    role: "admin",
    gym_id: "123",
  },
  {
    _id: "trainer1@email.com",
    name: "Trainer Bob",
    password: "12341234",
    salt: "123415",
    role: "trainer",
    gym_id: "123",
  },
  {
    _id: "member1@email.com",
    name: "John Smith",
    password: "123161",
    salt: "123415",
    role: "member",
    gym_id: "123",
  },
];

let gymClasses: IClass[] = [
  {
    _id: "1",
    title: "Yoga",
    description: "Put you into a pretzel and good luck getting out",
    trainer_id: "trainer1@email.com",
    gym_id: "123",
    date: new Date("2025-08-23"),
    start_time: "08:00",
    end_time: "09:00",
    attendees: 2,
    capacity: 5,
  },
  {
    _id: "2",
    title: "Running",
    description: "If you smile during this... something is wrong with you",
    trainer_id: "trainer1@email.com",
    gym_id: "123",
    date: new Date("2025-08-23"),
    start_time: "10:00",
    end_time: "11:00",
    attendees: 3,
    capacity: 5,
  },
  {
    _id: "3",
    title: "Netflix",
    description:
      "Take the remote and put your fingers to work trying to find a movie/tv-show to watch",
    trainer_id: "trainer1@email.com",
    gym_id: "123",
    date: new Date("2025-08-23"),
    start_time: "12:00",
    end_time: "14:00",
    attendees: 5,
    capacity: 5,
  },
];

export const seed = async () => {
  const existingGym = await Gym.findById(gym._id);
  if (!existingGym) {
    const newGym = new Gym(gym);
    await newGym.save();
  }

  for (let user of users) {
    const existingUser = await User.findById(user._id);
    if (existingUser) continue;

    user.salt = `${Date.now()}`;
    user.password = crypto
      .createHash("sha256")
      .update(user.password + user.salt)
      .digest("hex");

    const newUser = new User(user);
    await newUser.save();
  }

  for (let gymClass of gymClasses) {
    const existingClass = await Class.findById(gymClass._id);
    if (existingClass) continue;

    const newClass = new Class(gymClass);
    await newClass.save();
  }
};
