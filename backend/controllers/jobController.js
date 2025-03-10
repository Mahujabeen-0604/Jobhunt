import { catchAsyncErrors} from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import {User} from "../models/userSchema.js";
import {Job} from "../models/jobSchema.js";

export const postJob = catchAsyncErrors(async(req,res,next)=>{
    const {
           title,
           jobType,
           location,
           companyName, 
           introduction,
           responsibilities,
           qualifications,
           offers,
           salary,
           hiringMultipleCandidates,
           personalWebsiteTitle,
           personalWebsiteUrl,
           jobNiche,
           
           
        }=req.body;
    if(
        !title ||
        !jobType ||
        !location  ||
        !companyName ||        
        !introduction ||
        !responsibilities ||
        !qualifications ||
        !salary ||
        !jobNiche 
){
    return next(new ErrorHandler("Please provide full job details",400));
}
if ((personalWebsiteTitle && !personalWebsiteUrl) || (!personalWebsiteTitle && personalWebsiteUrl)){
    return next(new ErrorHandler("Provide bothe the website url and title",400));
}

const postedBy= req.user._id;
const job = await Job.create({
           title,
           jobType,
           location,
           companyName, 
           introduction,
           responsibilities,
           qualifications,
           offers,
           salary,
           hiringMultipleCandidates,
           personalWebsite:{
            title:personalWebsiteTitle,
            url:personalWebsiteUrl
           },
           jobNiche,
           postedBy,
           jobPostedOn: new Date() // Set the posted date to the current date

});

res.status(201).json({
    success:true,
    message:"job Posted Successfully",
    job,
});

});

export const getAllJobs = catchAsyncErrors(async(req, res, next) => {
    const { city, name, searchKeyword, niche, salary } = req.query; // Add salary here

    const query = {};

    if (city) {
        query.location = city;
    }

    if (niche) {
        query.jobNiche = niche; // Use niche from query params
    }

    if (searchKeyword) {
        query.$or = [
            { title: { $regex: searchKeyword, $options: "i" } },
            { companyName: { $regex: searchKeyword, $options: "i" } },
            { introduction: { $regex: searchKeyword, $options: "i" } },
        ];
    }

    if (salary) {
        query.salary = salary; // Add salary filter
    }
    const jobs = await Job.find(query);


    res.status(200).json({
        success: true,
        jobs,
        count: jobs.length,
    });
});


export const getMyJobs = catchAsyncErrors(async(req,res,next)=>{
    const myJobs= await Job.find({postedBy:req.user._id});
    res.status(200).json({
        success: true,
        myJobs,
    });
});
export const deleteJob = catchAsyncErrors(async(req,res,next)=>{
    const {id} =req.params;
    const job = await Job.findById(id);
    if(!job){
        return next(new ErrorHandler("Oops! Job not found",404));
    }
    if (job.postedBy.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("You are not authorized to delete this job", 403));  // 403 Forbidden
    }
    await job.deleteOne();
    res.status(200).json({
        success: true,
        message:"Job deleted Successfully"
    });
});
export const getASingleJob = catchAsyncErrors(async(req,res,next)=>{
    const {id} = req.params;
    const job = await Job.findById(id);
    if(!job){
        return next(new ErrorHandler("Job not found",404));

    }
    res.status(200).json({
        success: true,
        job,
    });
});
