import express from "express";
import {config} from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import {connection} from "./database/connection.js"
import { errorMiddleware } from "./middlewares/error.js";
import multer from "multer";
import userRouter from "./routes/userRouter.js"
import jobRouter from "./routes/jobRouter.js";
import applicationRouter from "./routes/applicationRouter.js"; 
import { newsLetterCron } from "./automation/newsLetterCron.js";

const app = express();

config({path: "./config/config.env"})

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url} from ${req.headers.origin}`);
    next();
});

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







app.use((err, req, res, next) => {
    if (err) {
        console.error('CORS Error:', err);
        res.status(403).json({ error: 'CORS Error', message: err.message });
    } else {
        next();
    }
});







app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));


// ✅ Configure Multer Storage (Use Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Add Middleware for Parsing FormData
app.use(upload.single("resume"));  // Only apply for single-file uploads
app.use("/api/v1/user", userRouter);


app.use("/api/v1/job",jobRouter);
app.use("/api/v1/application",applicationRouter);

newsLetterCron()
connection();
app.use(errorMiddleware);
export default app;
