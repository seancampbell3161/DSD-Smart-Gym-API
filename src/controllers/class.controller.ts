// src/controllers/class.controller.ts
import { Response } from "express";
import { IAuthenticatedRequest } from "../types/interface";
import { Class, ClassBooking, Waitlist } from "../models/class.model";
import { User } from "../models/user.model";
import nodemailer from "nodemailer";

const mailUser = process.env.NODE_USER;
const mailPass = process.env.NODE_PASS;

const transporter =
  mailUser && mailPass
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: mailUser, pass: mailPass },
      })
    : null;

const ymd = (s: string) => String(s ?? "").slice(0, 10);
const endOfClass = (dateYMD: string, endHHmm: string) => {
  const [y, m, d] = ymd(dateYMD).split("-").map(Number);
  const [hh, mm] = String(endHHmm).split(":").map(Number);
  return new Date(y, (m - 1), d, hh || 0, mm || 0, 0, 0);
};

/** --- helpers (minimal) --- */
const isTrainer = (req: IAuthenticatedRequest) => req.user?.role === "trainer";
const isAdmin = (req: IAuthenticatedRequest) => req.user?.role === "admin";

/**
 * Trainers can only manage their own classes.
 * Admins can manage any class.
 */
const assertCanManageClass = async (req: IAuthenticatedRequest, classId: string) => {
  const cls = await Class.findById(classId);
  if (!cls) return { ok: false as const, status: 404 as const, error: "Class not found." };

  if (isAdmin(req)) return { ok: true as const, cls };

  if (isTrainer(req)) {
    if (String((cls as any).trainer_id) === String(req.user!.id)) {
      return { ok: true as const, cls };
    }
    return { ok: false as const, status: 403 as const, error: "Forbidden: not your class." };
  }

  return { ok: false as const, status: 403 as const, error: "Forbidden." };
};

/** --- controllers --- */

export const createClass = async (req: IAuthenticatedRequest, res: Response) => {
  try {
    const body = { ...req.body };
    if (typeof body.date === "string") body.date = ymd(body.date);

    // If a trainer is creating the class, force ownership
    if (isTrainer(req)) {
      body.trainer_id = req.user!.id;
    }

    const doc = new Class(body);
    await doc.save();
    return res.status(200).json({ ok: true, id: doc._id });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create class" });
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
export const fetchClasses = async (req: IAuthenticatedRequest, res: Response) => {
  try {
    const gymId =
      (req.params as any).gymId ||
      (req.query.gym_id as string) ||
      (req.params as any).id ||
      (req.user as any)?.gym_id;

    if (!gymId) return res.status(400).json({ error: "gym_id is required" });

    const classes = await Class.find({ gym_id: gymId })
      .sort({ date: 1, start_time: 1 })
      .lean();

    return res.status(200).json({ data: classes, allClasses: classes });
  } catch {
    return res.status(500).json({ error: "Failed to fetch classes" });
  }
};

export const fetchUserClasses = async (req: IAuthenticatedRequest,
  res: Response) => {
export const fetchUserClasses = async (req: IAuthenticatedRequest, res: Response) => {
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
    const { id } = req.user!;
    const userBookedClasses = await ClassBooking.find({ user_id: id }).lean();
    const userWaitlistClasses = await Waitlist.find({ user_id: id }).lean();
    return res.status(200).json({ userBookedClasses, userWaitlistClasses });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user classes" });
  }
};

export const joinClass = async (req: IAuthenticatedRequest, res: Response) => {
  try {
    const { id: userId } = req.user!;
    const { id } = req.params;

    const gymClass = await Class.findById(id);
    if (!gymClass) return res.status(404).json({ error: "Class not found." });
    if ((gymClass as any).canceled)
      return res.status(400).json({ error: "This class has been canceled." });

    if (!gymClass.end_time)
      return res.status(400).json({ error: "Class end_time is missing." });

    const ended = endOfClass(String(gymClass.date), String(gymClass.end_time)).getTime() < Date.now();
    if (ended) return res.status(400).json({ error: "This class has already ended." });

    const alreadyBooked = await ClassBooking.findOne({ class_id: id, user_id: userId });
    if (alreadyBooked)
      return res.status(400).json({ error: "You are already booked for this class." });

    const alreadyWaitlisted = await Waitlist.findOne({ class_id: id, user_id: userId });
    if (alreadyWaitlisted)
      return res.status(400).json({ error: "You are already waitlisted for this class." });

    const cap = Number((gymClass as any).capacity ?? 0);
    const attendees = Number((gymClass as any).attendees ?? 0);

    if (attendees >= cap) {
      await Waitlist.create({ class_id: id, user_id: userId });
      return res.status(200).json({ message: "Class is full. You have been waitlisted." });
    }

    // Class has space → add to bookings
    await ClassBooking.create({
      class_id: id,
      user_id: userId,
    });

    await ClassBooking.create({ class_id: id, user_id: userId });
    await Class.findByIdAndUpdate(id, { $inc: { attendees: 1 } });

    return res.status(200).json({
      message: "Successfully booked class.",
      waitlistCount: 0, // still 0 for this class since added to attendees
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to join class" });
  }
};

export const leaveClass = async (req: IAuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { id: userId } = req.user!;

  if (!id) return res.status(400).json({ error: "Missing class ID" });

  try {
    const booking = await ClassBooking.findOneAndDelete({ class_id: id, user_id: userId });

    if (booking) {
      await Class.findByIdAndUpdate(id, { $inc: { attendees: -1 } });

      const gymClass = await Class.findById(id);
      if (!gymClass) return res.sendStatus(200);

      const cap = Number((gymClass as any).capacity ?? 0);
      const attendees = Number((gymClass as any).attendees ?? 0);

      if (attendees < cap) {
        const nextInLine = await Waitlist.findOne({ class_id: id }).sort({ joined_at: 1 });

        if (nextInLine) {
          await nextInLine.deleteOne();
          await ClassBooking.create({ class_id: id, user_id: nextInLine.user_id });
          await Class.findByIdAndUpdate(id, { $inc: { attendees: 1 } });

          if (transporter) {
            try {
              const profile = await User.findById(nextInLine.user_id);
              const recipient = (profile as any)?.email || nextInLine.user_id;
              await transporter.sendMail({
                from: "'Smart Gym' <noreplysmartgym@gmail.com>",
                to: recipient,
                subject: "You’re in! A spot opened up",
                html: `<p>Good news — you’ve been moved from waitlist to booked for <b>${(gymClass as any)?.title || "your class"}</b>.</p>`,
              });
            } catch {}
          }
        }
      }

      return res.status(200).json({ message: "Booking canceled." });
    }

    const isWaitlisted = await Waitlist.findOneAndDelete({ class_id: id, user_id: userId });
    if (isWaitlisted) return res.status(200).json({ message: "Removed from waitlist." });

    return res.status(404).json({ error: "You are not booked or waitlisted for this class." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to leave class" });
  }
};

export const cancelClass = async (req: IAuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Ownership/admin check (minimal addition)
    const guard = await assertCanManageClass(req, id);
    if (!guard.ok) return res.status(guard.status).json({ error: guard.error });
    const cls = guard.cls!;

    if ((cls as any).canceled) return res.status(200).json({ message: "Class already canceled." });

    const { reason = "" } = req.body || {};
    (cls as any).canceled = true;
    (cls as any).cancel_reason = reason;
    (cls as any).canceled_at = new Date();
    await cls.save();

    const [bookings, waitlisted] = await Promise.all([
      ClassBooking.find({ class_id: id }),
      Waitlist.find({ class_id: id }),
    ]);

    if (transporter) {
      const safeSend = async (to: string, subject: string, html: string) => {
        try {
          await transporter.sendMail({ from: "'Smart Gym' <noreplysmartgym@gmail.com>", to, subject, html });
        } catch {}
      };

      const notifyUser = async (userId: string) => {
        const profile = await User.findById(userId);
        const recipient = (profile as any)?.email || userId;
        const html = `
          <p>We're sorry — your class <b>${(cls as any).title}</b> on
          <b>${new Date((cls as any).date).toLocaleDateString()}</b> at
          <b>${(cls as any).start_time}</b> has been <b>canceled</b>.</p>
          ${reason ? `<p>Reason: ${reason}</p>` : ""}
          <p>Please check the schedule for alternatives.</p>`;
        await safeSend(recipient, `Class canceled: ${(cls as any).title}`, html);
      };

      await Promise.all([
        ...bookings.map((b) => notifyUser(b.user_id)),
        ...waitlisted.map((w) => notifyUser(w.user_id)),
      ]);
    }

    await Waitlist.deleteMany({ class_id: id });

    return res.status(200).json({ message: "Class canceled and users notified." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to cancel class" });
  }
};

export const uncancelClass = async (req: IAuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Ownership/admin check (minimal addition)
    const guard = await assertCanManageClass(req, id);
    if (!guard.ok) return res.status(guard.status).json({ error: guard.error });
    const cls = guard.cls!;

    (cls as any).canceled = false;
    (cls as any).cancel_reason = "";
    (cls as any).canceled_at = undefined;
    await cls.save();

    return res.status(200).json({ message: "Class restored." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to restore class" });
  }
};

export const deleteClass = async (req: IAuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing class ID" });

    // Ownership/admin check (minimal addition)
    const guard = await assertCanManageClass(req, id);
    if (!guard.ok) return res.status(guard.status).json({ error: guard.error });
    const cls = guard.cls!;

    await Promise.all([
      ClassBooking.deleteMany({ class_id: id }),
      Waitlist.deleteMany({ class_id: id }),
    ]);

    await cls.deleteOne();

    return res.status(200).json({ ok: true, id, message: "Class deleted." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete class" });
  }
};

/**
 * NEW: List the authenticated trainer’s own classes (admins can filter by ?trainer_id)
 * Used by /api/users/trainer/mine/list and/or /api/classes/trainer/mine
 */
export const getTrainerClasses = async (req: IAuthenticatedRequest, res: Response) => {
  try {
    if (isTrainer(req)) {
      const mine = await Class.find({ trainer_id: req.user!.id }).sort({ date: 1, start_time: 1 });
      return res.status(200).json({ success: true, data: mine });
    }

    // Admin path: allow optional filter ?trainer_id=email
    if (isAdmin(req)) {
      const trainerId = (req.query.trainer_id as string) || undefined;
      const q = trainerId ? { trainer_id: trainerId } : {};
      const list = await Class.find(q).sort({ date: 1, start_time: 1 });
      return res.status(200).json({ success: true, data: list });
    }

    return res.status(403).json({ error: "Forbidden." });
  } catch {
    return res.status(500).json({ error: "Failed to fetch trainer classes" });
  }
};

export {
  // explicit re-exports (helps TS resolution in some setups)
  createClass as _createClass,
  fetchClasses as _fetchClasses,
  fetchUserClasses as _fetchUserClasses,
  joinClass as _joinClass,
  leaveClass as _leaveClass,
  cancelClass as _cancelClass,
  uncancelClass as _uncancelClass,
  deleteClass as _deleteClass,
  getTrainerClasses as _getTrainerClasses,
};
