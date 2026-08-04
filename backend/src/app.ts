import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
const cookieParser = require("cookie-parser") as any;
import path from "path";

import { BASE_ROUTE } from "./utils/constants.js";

import adminRouter from "./routes/admin.routes.js";

import { auth } from "./middlewares/auth.middleware.js";
import { catchError } from "./middlewares/catchError.js";

const app = express();

// Security
app.use(helmet());

// Logging
app.use(morgan("dev"));

// Parse Request Body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Static Files
app.use(
  BASE_ROUTE.UPLOADS,
  express.static(path.join(process.cwd(), "uploads"))
);

// Public Routes
// Public Routes
app.use(BASE_ROUTE.ADMIN, adminRouter);
app.use(BASE_ROUTE.USER, userRouter);

// Protected Routes
app.use(auth);

app.use(BASE_ROUTE.USER, userRouter);
app.use(BASE_ROUTE.DOCUMENT, documentRouter);

// Global Error Handler
app.use(catchError);

export default app;