import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import path, { dirname } from "path";
import { fileURLToPath } from "url";

import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

import xss from "xss";
import cors from "cors";
import hpp from "hpp";
import compression from "compression";

import { router as userRouter } from "./routes/userRoutes.js";
import { router as postRouter } from "./routes/postRoutes.js";
import { router as activityRouter } from "./routes/activityRoutes.js";
import { router as chatRouter } from "./routes/chatRoutes.js";
import { globalErrorHandler } from "./controllers/errorController.js";
import AppError from "./utils/appError.js";

const app = express();

//Set security HTTP headers
const allowedOrigins = [
  "https://novus-frontend-rho.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.options(/.*/, cors());

app.use(helmet());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`App is on ${process.env.NODE_ENV} mode`);
}
// Limit requests from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP,please try again in an hour",
});

app.use("/api", limiter);

// Body parsing middleware
app.use(express.json({ limit: "150kb" }));

// Data sanitization againt NOSQL query injection
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  // Skip req.query to avoid the mutation error
  next();
});
// Data sanitization against xxs
const xssSanitization = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      req.body[key] = xss(req.body[key]);
    });
  }
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      req.query[key] = xss(req.query[key]);
    });
  }
  if (req.params) {
    Object.keys(req.params).forEach((key) => {
      req.params[key] = xss(req.params[key]);
    });
  }
  next();
};

app.use(compression());
app.use(xssSanitization);

//Prevent parameter polltion
// app.use(hpp({
//     whitelist:[
//         //...
//     ]
// }));

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/activity", activityRouter);
app.use("/api/v1/chats", chatRouter);

// Catch-all for undefined routes
app.all(/.*/, (req, res, next) => {
  console.log(`Cannot find ${req.originalUrl} on this server!`);
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

export default app;
