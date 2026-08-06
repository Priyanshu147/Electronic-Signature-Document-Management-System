import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";

import { BASE_ROUTE } from "./utils/constants.js";

import adminRouter from "./routes/admin.routes.js";
import userRouter from "./routes/user.routes.js";
// import documentRouter from "./routes/document.routes.js";
import signerRoleRouter from "./routes/signerRole.routes.js";

import { catchError } from "./middlewares/catchError.js";

const app = express();

/* ===========================================================
   Security
=========================================================== */

app.use(helmet());

/* ===========================================================
   Logger
=========================================================== */

app.use(morgan("dev"));

/* ===========================================================
   Body Parser
=========================================================== */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* ===========================================================
   Cookie Parser
=========================================================== */

app.use(cookieParser());

/* ===========================================================
   CORS
=========================================================== */

app.use(
  cors({
    origin: true, // Allow every origin during development
    credentials: true, // Allow cookies
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/* ===========================================================
   Static Files
=========================================================== */

app.use(
  BASE_ROUTE.UPLOADS,
  express.static(
    path.join(process.cwd(), "uploads")
  )
);

/* ===========================================================
   API Routes
=========================================================== */

app.use(BASE_ROUTE.ADMIN, adminRouter);

app.use(BASE_ROUTE.USER, userRouter);

app.use(BASE_ROUTE.SIGNER_ROLE, signerRoleRouter);

// app.use(BASE_ROUTE.DOCUMENT, documentRouter);

/* ===========================================================
   Health Check
=========================================================== */

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Electronic Signature Document Management System API is running.",
  });
});

/* ===========================================================
   404 Handler
=========================================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

/* ===========================================================
   Global Error Handler
=========================================================== */

app.use(catchError);

export default app;