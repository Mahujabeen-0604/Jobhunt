import express from "express";
import userRouter from "./userRouter.js";


const router = express.Router();

router.use("/api/v1/user", userRouter);


export default router;
