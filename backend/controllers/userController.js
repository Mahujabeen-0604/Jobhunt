import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { sendToken } from "../utils/jwtToken.js"

export const register = catchAsyncErrors(async (req, res, next) => {
    try {
        // Log incoming request data
        console.log('Request Body:', req.body);
        console.log('Request Files:', req.files);

        // Parse form data
        const formData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            password: req.body.password,
            role: req.body.role,
            firstNiche: req.body.firstNiche,
            secondNiche: req.body.secondNiche,
            thirdNiche: req.body.thirdNiche,
            coverLetter: req.body.coverLetter
        };

        // Validate required fields
        const requiredFields = ['name', 'email', 'phone', 'address', 'password', 'role'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            return next(new ErrorHandler(`Missing required fields: ${missingFields.join(', ')}`, 400));
        }

        if (formData.role === "Job Seeker" && (!formData.firstNiche || !formData.secondNiche || !formData.thirdNiche)) {
            return next(new ErrorHandler("Please provide your preferred job niches", 400));
        }

        const existingUser = await User.findOne({ email: formData.email });
        if (existingUser) {
            return next(new ErrorHandler("Email is already registered", 400));
        }

        const userData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            password: formData.password,
            role: formData.role,
            niches: {
                firstNiche: formData.firstNiche,
                secondNiche: formData.secondNiche,
                thirdNiche: formData.thirdNiche,
            },
            coverLetter: formData.coverLetter,
        };

        if (req.files && req.files.resume) {
            const { resume } = req.files;
            try {
                const cloudinaryResponse = await cloudinary.uploader.upload(resume.tempFilePath,
                    { folder: "Job_Seeker_Resume" }
                );
                if (!cloudinaryResponse || cloudinaryResponse.error) {
                    return next(
                        new ErrorHandler("Failed to upload resume to cloud", 500)
                    );
                }
                userData.resume = {
                    public_id: cloudinaryResponse.public_id,
                    url: cloudinaryResponse.secure_url
                }
            } catch (error) {
                return next(new ErrorHandler("Failed to upload resume", 500));
            }
        } else {
            userData.resume = null;
        }

        const user = await User.create(userData);
        sendToken(user, 201, res, "User Registered");

    } catch (error) {
        console.error('Registration Error:', error);
        console.error('Error Stack:', error.stack);
        console.error('Request Body:', req.body);
        console.error('Request Files:', req.files);
        next(error);
    }
});

export const login = catchAsyncErrors(async (req, res, next) => {
    const { role, email, password } = req.body;
    if (!role || !email || !password) {
        return next(new ErrorHandler("Email, password and role are required", 400));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 400));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 400));
    }
    if (user.role !== role) {
        return next(new ErrorHandler("Invalid user role", 400));
    }
    sendToken(user, 200, res, "User logged in successfully");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
    res.status(200).cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
    }).json({
        success: true,
        message: "Logged out Successfully"
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log('Request User:', req.user);
        if (!req.user) {
            console.error('No user found in request');
            return next(new ErrorHandler('User not authenticated', 401));
        }
        
        const user = req.user;
        console.log('Fetched User:', user);
        
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error('Error in getUser controller:', error);
        console.error('Error stack:', error.stack);
        next(error);
    }
});


export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        coverLetter: req.body.coverLetter,
        niches: {
            firstNiche: req.body.firstNiche,
            secondNiche: req.body.secondNiche,
            thirdNiche: req.body.thirdNiche,
        }
    };

    const { firstNiche, secondNiche, thirdNiche } = newUserData.niches;
    if (req.user.role === "Job Seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {
        return next(new ErrorHandler("Please provide all preferred job niches"));
    }

    if (req.files) {
        const resume = req.files.resume;
        if (resume) {
            const currentResumeId = req.user.resume.public_id;
            if (currentResumeId) {
                await cloudinary.uploader.destroy(currentResumeId);
            }
            const newResume = await cloudinary.uploader.upload(resume.tempFilePath, {
                folder: "Job_Seeker_Resume"
            });
            newUserData.resume = {
                public_id: newResume.public_id,
                url: newResume.secure_url,
            };
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        user,
        message: "Profile updated"
    });
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPassword = await user.comparePassword(req.body.oldPassword);
    if (!isPassword) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("New password and confirm password do not match", 400));
    }

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res, "Password updated Successfully");
});
