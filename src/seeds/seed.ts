import { Class } from "../models/class.model";
import { Gym } from "../models/gym.model";
import { User } from "../models/user.model";
import { IClass, IGym, IUser } from "../types/interface";
import { CheckInOut } from "../models/access.model";

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

const DEMO23_COUNT = 3;
// how many check-ins per new member
const DEMO23_CHECKINS_EACH = 2;
// date helper
const makeDate = (y: number, m: number, d: number, h = 10) =>
  new Date(y, m /*0-11*/, d, h, 0, 0);

// ---------- 2023 members -----------
const demo2023Members: IUser[] = Array.from(
  { length: DEMO23_COUNT },
  (_, i) => ({
    _id: `demo23_${i}@mail.com`,
    name: `Demo 23-${i}`,
    password: "changeme",
    salt: "na",
    role: "member",
    gym_id: "123",
    createdAt: makeDate(2023, i * 3, 10), // Jan, Apr, Jul
  })
);

// ---------- 2023 yoga class --------
const yoga2023: IClass = {
  _id: "yoga-2023-07-20",
  title: "Yoga",
  description: "Summer yoga demo class",
  trainer_id: "trainer1@email.com",
  gym_id: "123",
  date: makeDate(2023, 6, 20), // 20 Jul 2023
  start_time: "10:00",
  end_time: "11:00",
  attendees: 8,
  capacity: 15,
};

// ---------- 2023 check-ins ----------
type Check = {
  user_id: string;
  gym_id: string;
  checked_in: Date;
  checked_out: Date;
};
const demo23Checkins: Check[] = [];

demo2023Members.forEach((member) => {
  for (let n = 0; n < DEMO23_CHECKINS_EACH; n++) {
    const inTime = makeDate(2023, 6, 15 + n, 8 + n); // 15 & 16 Jul
    const outTime = new Date(inTime);
    outTime.setHours(outTime.getHours() + 1);
    demo23Checkins.push({
      user_id: member._id,
      gym_id: "123",
      checked_in: inTime,
      checked_out: outTime,
    });
  }
});

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

  for (const mem of demo2023Members) {
    const found = await User.findById(mem._id);
    if (!found) {
      mem.salt = `${Date.now()}`;
      mem.password = crypto
        .createHash("sha256")
        .update(mem.password + mem.salt)
        .digest("hex");
      await new User(mem).save();
    }
  }

  // add the yoga class
  const exists2023 = await Class.findById(yoga2023._id);
  if (!exists2023) await new Class(yoga2023).save();

  // if (demo23Checkins.length) {
  //   const withIds = demo23Checkins.map((c, idx) => ({
  //     ...c,
  //     _id: `${c.user_id}-ci${idx}`, // ensure unique _id
  //   }));
  //   await CheckInOut.insertMany(withIds, { ordered: false });
  // }

  if (demo23Checkins.length) {
    const ops = demo23Checkins.map((c, idx) => ({
      updateOne: {
        filter: { _id: `${c.user_id}-ci${idx}` }, // look for existing row
        update: {
          $setOnInsert: {
            _id: `${c.user_id}-ci${idx}`,
            user_id: c.user_id,
            gym_id: c.gym_id,
            checked_in: c.checked_in,
            checked_out: c.checked_out,
          },
        },
        upsert: true,
      },
    }));

    await CheckInOut.bulkWrite(ops); // <-- this replaces insertMany
  }
};
