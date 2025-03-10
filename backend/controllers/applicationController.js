import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import {Application} from "../models/applicationSchema.js";
import {Job} from "../models/jobSchema.js";
import {v2 as cloudinary} from "cloudinary";
import fs from "fs";


export const postApplication = catchAsyncErrors(async (req, res, next) => {
    console.log("Incoming request body:", req.body);
    console.log("Incoming request file:", req.file);

    const { id } = req.params;
    const { name, email, phone, address, coverLetter } = req.body;

    if (!name || !email || !phone || !address || !coverLetter) {
        return next(new ErrorHandler("All fields are required", 400));
    }

    const jobSeekerInfo = {
        id: req.user._id,
        name,
        email,
        phone,
        address,
        coverLetter,
        role: "Job Seeker",
    };

    const jobDetails = await Job.findById(id);
    if (!jobDetails) {
        return next(new ErrorHandler("Job not found", 404));
    }

    const isAlreadyApplied = await Application.findOne({
        "jobInfo.jobId": id,
        "jobSeekerInfo.id": req.user._id,
    });

    if (isAlreadyApplied) {
        return next(new ErrorHandler("You have already applied for this job", 400));
    }

    if (!req.body || Object.keys(req.body).length === 0) {
        console.error("❌ Request body is empty!");
        return next(new ErrorHandler("Request body is missing. Please check your form data.", 400));
    }

    // ✅ Fix resume file handling
    if (req.file) {
        console.log("Resume file received:", req.file);
        const { originalname, buffer, mimetype, size } = req.file;

        if (!buffer) {
            return next(new ErrorHandler("Invalid resume file. Please try again.", 400));
        }

        if (size > 5 * 1024 * 1024) {
            return next(new ErrorHandler("Resume file must be less than 5MB", 400));
        }

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!allowedTypes.includes(mimetype)) {
            return next(new ErrorHandler("Only PDF and Word documents are allowed", 400));
        }

        try {
            const tempFilePath = `/tmp/${Date.now()}_${originalname}`;
            fs.writeFileSync(tempFilePath, buffer);

            if (!fs.existsSync(tempFilePath)) {
                throw new Error("Temporary file not found before upload.");
            }

            console.log("Uploading resume to Cloudinary...");
            const cloudinaryResponse = await cloudinary.uploader.upload(tempFilePath, {
                folder: "Job_Seeker_Resume",
                resource_type: "auto",
                access_mode: "public", 
                format: "pdf", 
                use_filename: true,
                unique_filename: false,
                overwrite: true,
                timeout: 30000,
            });

            fs.unlinkSync(tempFilePath); // ✅ Delete temp file after upload

            if (!cloudinaryResponse || cloudinaryResponse.error) {
                return next(new ErrorHandler("Failed to upload resume to Cloudinary", 500));
            }

            jobSeekerInfo.resume = {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            };
            console.log("Resume uploaded successfully:", jobSeekerInfo.resume.url);
        } catch (error) {
            return next(new ErrorHandler(`Failed to upload resume: ${error.message}`, 500));
        }
    }

    // ✅ Save application
    try {
        const application = await Application.create({
            jobSeekerInfo,
            employerInfo: {
                id: jobDetails.postedBy,
                role: "Employer",
            },
            jobInfo: {
                jobId: id,
                jobTitle: jobDetails.title,
            },
        });

        res.status(201).json({
            success: true,
            message: jobSeekerInfo.resume
                ? "Application submitted with resume"
                : "Application submitted without resume (recommended to add one)",
            application,
        });
    } catch (error) {
        return next(new ErrorHandler("Failed to create application", 500));
    }
});

export const employerGetAllApplication =catchAsyncErrors(async(req,res,next)=>{
    const {_id} = req.user;
    const applications=await Application.find({
        "employerInfo.id" : _id,
        "deletedBy.employer" : false,
    });
    res.status(200).json({
        success: true,
        applications,
    });

});
export const jobSeekerGetAllApplication =catchAsyncErrors(async(req,res,next)=>{
    const {_id} = req.user;
    const applications=await Application.find({
        "jobSeekerInfo.id" : _id,
        "deletedBy.jobSeeker" : false,
    });
    res.status(200).json({
        success: true,
        applications,
    });

});
export const deleteApplication =catchAsyncErrors(async(req,res,next)=>{
    const {id} =req.params;
    const application= await Application.findById(id);
    if(!application){
        return next(new ErrorHandler("Application  not found",400));
    }
    const {role} = req.user;
    switch (role){
        case "Job Seeker" :
            application.deletedBy.jobSeeker=true;
            await application.save()
            break;
        case "Employer":
            application.deletedBy.employer=true;
            await application.save()
            break;
        default:
            console.log("Default case for application deleted")
            break;
    }
    if(application.deletedBy.employer === true && application.deletedBy.jobSeeker === true ){
        await application.deleteOne();
    }
    res.status(200).json({
        success:true,
        message:"Application Deleted."
    });
});
