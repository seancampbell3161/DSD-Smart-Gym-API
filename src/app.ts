import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";

dotenv.config();

const app = express();

app.use(express.json());
app.use(clerkMiddleware());

export default app;
