import express from "express";
import cors from "cors";
import multer from "multer";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import jobRouter from "./routes/jobRouter.js";
import userRouter from "./routes/userRouter.js";
import applicationRouter from "./routes/applicationRouter.js";
import { newsLetterCron } from "./automation/newsLetterCron.js";

import { config } from "dotenv";
import { connection } from "./database/connection.js";

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Stores files in buffer before uploading
const upload = multer({ storage });

// Load environment variables
config({ path: "./config/config.env" });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());


// CORS configuration
app.use(
    cors({
        origin: (origin, callback) => {
            // Normalize both URLs by removing trailing slashes and converting to lowercase
            const normalizeUrl = (url) => url ? url.replace(/\/+$/, '').toLowerCase() : null;
            const allowedOrigin = normalizeUrl(process.env.FRONTEND_URL);
            const requestOrigin = normalizeUrl(origin);
            
            // Allow requests with no origin (e.g., non-browser requests) or matching origin
            if (!requestOrigin || requestOrigin === allowedOrigin) {
                callback(null, true);
            } else {
                callback(new Error(`Not allowed by CORS. Request origin: ${requestOrigin}, Allowed origin: ${allowedOrigin}`));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        exposedHeaders: ["Content-Length", "X-Request-ID"]
    })
);


// Database connection
newsLetterCron();
connection();






// Routes
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/application", applicationRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
