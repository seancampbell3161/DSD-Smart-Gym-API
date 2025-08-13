import { Response } from "express";
import { IAuthenticatedRequest } from "../types/interface";
import { Class, ClassBooking, Waitlist } from "../models/class.model";
import nodemailer from "nodemailer";
import mjml2html from "mjml";
import fs from "fs";
import { User } from "../models/user.model";

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
  request: IAuthenticatedRequest,
  response: Response
) => {
  const { id } = request.params; // gym_id
  try {
    const allClasses = await Class.find({ gym_id: id });
    return response.status(200).json({ allClasses });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

export const fetchUserClasses = async (
  request: IAuthenticatedRequest,
  response: Response
) => {
  try {
    const { id } = request.user!; // canonical user id

    const userBookedClasses = await ClassBooking.find({ user_id: id });
    const userWaitlistClasses = await Waitlist.find({ user_id: id });

    return response
      .status(200)
      .json({ userBookedClasses, userWaitlistClasses });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

export const joinClass = async (
  request: IAuthenticatedRequest,
  response: Response
) => {
  try {
    const { id: userId } = request.user!;
    const { id } = request.params; // class id

    const gymClass = await Class.findById(id);
    if (!gymClass) {
      return response.status(404).json({ error: "Class not found." });
    }

    const alreadyBooked = await ClassBooking.findOne({
      class_id: id,
      user_id: userId,
    });
    if (alreadyBooked) {
      return response
        .status(400)
        .json({ error: "You are already booked for this class." });
    }

    const alreadyWaitlisted = await Waitlist.findOne({
      class_id: id,
      user_id: userId,
    });
    if (alreadyWaitlisted) {
      return response
        .status(400)
        .json({ error: "You are already waitlisted for this class." });
    }

    if (gymClass.attendees >= gymClass.capacity) {
      await Waitlist.create({
        class_id: id,
        user_id: userId,
      });

      return response
        .status(200)
        .json({ message: "Class is full. You have been waitlisted." });
    }

    await ClassBooking.create({
      class_id: id,
      user_id: userId,
    });

    await Class.findByIdAndUpdate(id, { $inc: { attendees: 1 } });

    return response.status(200).json({ message: "Successfully booked class." });
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