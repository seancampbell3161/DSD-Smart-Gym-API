import { Response } from "express";
import { IAuthenticatedRequest } from "../types/interface";
import { Class, ClassBooking, Waitlist } from "../models/class.model";
import nodemailer from "nodemailer";
import mjml2html from "mjml";
import fs from "fs";
import { User } from "../models/user.model";

//fixed a bunch of controllers

const user = process.env.NODE_USER;
const password = process.env.NODE_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user,
    pass: password,
  },
});

export const createClass = async (
  request: IAuthenticatedRequest,
  response: Response
) => {
  try {
    const newClass = new Class(request.body);
    await newClass.save();
    return response.sendStatus(200);
  } catch (error) {
    return response.status(500).json({ error });
  }
};

export const fetchClasses = async (
  req: IAuthenticatedRequest,
  res: Response
) => {
   try {
    const { gymId } = req.query;

    const query = gymId ? { gym_id: gymId } : {};
    const classes = await Class.find(query);

    res.json({ allClasses: classes });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const fetchClassesByGym = async (
  req: IAuthenticatedRequest,
  res: Response) => {
 try {
    const gymId = req.params.gymId;

    // Fetch all classes for this gym
    const classes = await Class.find({ gym_id: gymId }).lean();

    // Get all class IDs
    const classIds = classes.map(c => c._id.toString());

    // Aggregate waitlist counts for those class IDs
    const waitlistCounts = await Waitlist.aggregate([
      { $match: { class_id: { $in: classIds } } },
      { $group: { _id: "$class_id", count: { $sum: 1 } } }
    ]);

    // Map counts for quick lookup
    const waitlistMap: Record<string, number> = {};
    waitlistCounts.forEach(w => {
      waitlistMap[w._id] = w.count;
    });

    // Attach waitlistCount to each class
    const withCounts = classes.map(cls => ({
      ...cls,
      waitlistCount: waitlistMap[cls._id.toString()] || 0
    }));

    res.json({ allClasses: withCounts });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const fetchUserClasses = async (req: IAuthenticatedRequest,
  res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const userEmail = req.user.id; // this is email

    const bookings = await ClassBooking.find({ user_id: userEmail });
    const classIds = bookings.map(b => b.class_id);
    const classes = await Class.find({ _id: { $in: classIds } });

    res.json({ userClasses: classes });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching user classes" });
  }
};

export const joinClass = async (
  request: IAuthenticatedRequest,
  response: Response
) => {
  try {
    const { id: userId } = request.user!; // user email
    const { id } = request.params; // class ID

    const gymClass = await Class.findById(id);
    if (!gymClass) {
      return response.status(404).json({ error: "Class not found." });
    }

    // Check if already booked
    const alreadyBooked = await ClassBooking.findOne({
      class_id: id,
      user_id: userId,
    });
    if (alreadyBooked) {
      return response
        .status(400)
        .json({ error: "You are already booked for this class." });
    }

    // Check if already waitlisted
    const alreadyWaitlisted = await Waitlist.findOne({
      class_id: id,
      user_id: userId,
    });
    if (alreadyWaitlisted) {
      const waitlistCount = await Waitlist.countDocuments({ class_id: id });
      return response.status(400).json({ 
        error: "You are already waitlisted for this class.",
        waitlistCount
      });
    }

    // Class full → add to waitlist
    if (gymClass.attendees >= gymClass.capacity) {
      await Waitlist.create({
        class_id: id,
        user_id: userId,
      });

      const waitlistCount = await Waitlist.countDocuments({ class_id: id });

      return response.status(200).json({
        message: "Class is full. You have been waitlisted.",
        waitlistCount
      });
    }

    // Class has space → add to bookings
    await ClassBooking.create({
      class_id: id,
      user_id: userId,
    });

    await Class.findByIdAndUpdate(id, { $inc: { attendees: 1 } });

    return response.status(200).json({
      message: "Successfully booked class.",
      waitlistCount: 0, // still 0 for this class since added to attendees
    });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

export const leaveClass = async (
  request: IAuthenticatedRequest,
  response: Response
) => {
  const { id } = request.params; // class id
  const { id: userId } = request.user!;

  if (!id) {
    return response.status(400).json({ error: "Missing class ID" });
  }

  try {
    // Remove booking if present
    const booking = await ClassBooking.findOneAndDelete({
      class_id: id,
      user_id: userId,
    });

    if (booking) {
      // Decrement attendees
      await Class.findByIdAndUpdate(id, { $inc: { attendees: -1 } });

      const gymClass = await Class.findById(id);
      if (!gymClass) return response.sendStatus(200);

      // If there's now room, promote next waitlisted user
      if (gymClass.attendees < gymClass.capacity) {
        const nextInLine = await Waitlist.findOne({ class_id: id }).sort({
          createdAt: 1,
        });

        if (nextInLine) {
          await nextInLine.deleteOne();

          await ClassBooking.create({
            class_id: id,
            user_id: nextInLine.user_id,
          });

          await Class.findByIdAndUpdate(id, { $inc: { attendees: 1 } });

          const nextInLineProfile = await User.findById(nextInLine.user_id);
          if (nextInLineProfile) {
            const rawTemplate = fs.readFileSync("waitlist.mjml", "utf-8");
            const personalizedMJML = rawTemplate
              .replace("{{name}}", nextInLineProfile.name)
              .replace("{{class}}", gymClass.title);
            const { html } = mjml2html(personalizedMJML);

            await transporter.sendMail({
              from: "'Smart Gym' <noreplysmartgym@gmail.com>",
              to: nextInLine.user_id, // email = id in your model
              subject: `You're in! A spot opened up for your SmartGym Class: ${gymClass.title}`,
              html,
            });
          }
        }
      }

      return response.status(200).json({ message: "Booking canceled." });
    }

    // If not booked, try removing from waitlist
    const isWaitlisted = await Waitlist.findOneAndDelete({
      class_id: id,
      user_id: userId,
    });

    if (isWaitlisted) {
      return response.status(200).json({ message: "Removed from waitlist." });
    }

    return response
      .status(404)
      .json({ error: "You are not booked or waitlisted for this class." });
  } catch (error) {
    return response.status(500).json({ error });
  }
};