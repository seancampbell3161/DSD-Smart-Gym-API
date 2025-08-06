// src/controllers/adminAnalytics.controller.ts
import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Class } from "../models/class.model";
import { CheckInOut } from "../models/access.model";

const MONTH_NAME = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

async function getMemberYearSpan() {
  const oldest = await User.find({ role: "member" })
    .sort({ createdAt: 1 })
    .limit(1)
    .select("createdAt");
  const newest = await User.find({ role: "member" })
    .sort({ createdAt: -1 })
    .limit(1)
    .select("createdAt");
  if (!oldest.length) throw new Error("No member data in database");
  return {
    min: new Date(oldest[0].createdAt).getFullYear(),
    max: new Date(newest[0].createdAt).getFullYear(),
  };
}

export async function getYearlyMembershipGrowth(req: Request, res: Response) {
  try {
    const { min, max } = await getMemberYearSpan();

    const start = parseInt((req.query.startYear as string) ?? `${min}`, 10);
    const end = parseInt((req.query.endYear as string) ?? `${max}`, 10);
    if (start < min || end > max)
      return res.status(400).json({ error: "No records" });

    const raw = await User.aggregate([
      { $match: { role: "member" } },
      {
        $group: { _id: { year: { $year: "$createdAt" } }, count: { $sum: 1 } },
      },
      { $project: { _id: 0, year: "$_id.year", count: 1 } },
      { $sort: { year: 1 } },
    ]);

    const data = raw.filter((r) => r.year >= start && r.year <= end);
    return data.length
      ? res.json(data)
      : res.status(400).json({ error: "No records" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMonthlyMembershipGrowth(req: Request, res: Response) {
  try {
    const { min, max } = await getMemberYearSpan();

    let s = parseInt((req.query.startYear as string) ?? `${max}`, 10);
    let e = parseInt((req.query.endYear as string) ?? `${s}`, 10);
    if (s < min || e > max)
      return res.status(400).json({ error: "No records" });
    if (s > e) [s, e] = [e, s];

    const raw = await User.aggregate([
      {
        $match: {
          role: "member",
          createdAt: { $gte: new Date(s, 0, 1), $lt: new Date(e + 1, 0, 1) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: { _id: 0, year: "$_id.year", month: "$_id.month", count: 1 },
      },
    ]);

    const result: { year: number; data: { month: string; count: number }[] }[] =
      [];

    for (let y = s; y <= e; y++) {
      const months = raw
        .filter((r) => r.year === y && r.count > 0)
        .map((r) => ({ month: MONTH_NAME[r.month], count: r.count }))
        .sort(
          (a, b) => MONTH_NAME.indexOf(a.month) - MONTH_NAME.indexOf(b.month)
        );
      if (months.length) result.push({ year: y, data: months });
    }

    return result.length
      ? res.json(result.length === 1 ? result[0] : result)
      : res.status(400).json({ error: "No records" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getYearlyClassAttendance(req: Request, res: Response) {
  try {
    const { min, max } = await getMemberYearSpan(); // reuse span

    let s = parseInt((req.query.startYear as string) ?? `${min}`, 10);
    let e = parseInt((req.query.endYear as string) ?? `${max}`, 10);
    if (s < min || e > max)
      return res.status(400).json({ error: "No records" });
    if (s > e) [s, e] = [e, s];

    const raw = await Class.aggregate([
      {
        $match: {
          date: { $gte: new Date(s, 0, 1), $lt: new Date(e + 1, 0, 1) },
        },
      },
      {
        $group: {
          _id: { y: { $year: "$date" }, t: "$title" },
          count: { $sum: "$attendees" },
        },
      },
      {
        $group: {
          _id: "$_id.y",
          items: { $push: { classType: "$_id.t", count: "$count" } },
        },
      },
      { $project: { _id: 0, year: "$_id", items: 1 } },
      { $sort: { year: 1 } },
    ]);

    return raw.length
      ? res.json(raw.length === 1 ? raw[0] : raw)
      : res.status(400).json({ error: "No records" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMonthlyClassAttendance(req: Request, res: Response) {
  try {
    const { min, max } = await getMemberYearSpan();

    let s = parseInt((req.query.startYear as string) ?? `${max}`, 10);
    let e = parseInt((req.query.endYear as string) ?? `${s}`, 10);
    if (s < min || e > max)
      return res.status(400).json({ error: "No records" });
    if (s > e) [s, e] = [e, s];

    const raw = await Class.aggregate([
      {
        $match: {
          date: { $gte: new Date(s, 0, 1), $lt: new Date(e + 1, 0, 1) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            title: "$title",
          },
          count: { $sum: "$attendees" },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          classType: "$_id.title",
          count: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    const result: {
      year: number;
      month: string;
      classes: { classType: string; count: number }[];
    }[] = [];

    for (let y = s; y <= e; y++) {
      for (let m = 1; m <= 12; m++) {
        const classes = raw
          .filter((r) => r.year === y && r.month === m)
          .map((r) => ({ classType: r.classType, count: r.count }));

        if (classes.length) {
          result.push({
            year: y,
            month: MONTH_NAME[m],
            classes,
          });
        }
      }
    }

    return result.length
      ? res.json(result)
      : res.status(400).json({ error: "No records" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function peakAgg(start: Date, end: Date) {
  return CheckInOut.aggregate([
    { $match: { checked_in: { $gte: start, $lte: end } } },
    {
      $project: {
        dow: { $dayOfWeek: "$checked_in" },
        hour: { $hour: "$checked_in" },
      },
    },
    { $group: { _id: { dow: "$dow", hour: "$hour" }, count: { $sum: 1 } } },
    { $project: { _id: 0, dow: "$_id.dow", hour: "$_id.hour", count: 1 } },
    { $sort: { dow: 1, hour: 1 } },
  ]);
}

export async function getYearlyPeakHours(_req: Request, res: Response) {
  const y = new Date().getUTCFullYear();
  const rows = await peakAgg(
    new Date(Date.UTC(y, 0, 1)),
    new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999))
  );
  res.json({
    peakHours: rows.map((r) => ({
      dayOfWeek: WEEKDAY[r.dow - 1],
      hour: r.hour,
      count: r.count,
    })),
  });
}

export async function getMonthlyPeakHours(_req: Request, res: Response) {
  const now = new Date();
  const y = now.getUTCFullYear(),
    m = now.getUTCMonth();
  const rows = await peakAgg(
    new Date(Date.UTC(y, m, 1)),
    new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999))
  );
  res.json({
    peakHours: rows.map((r) => ({
      dayOfWeek: WEEKDAY[r.dow - 1],
      hour: r.hour,
      count: r.count,
    })),
  });
}
