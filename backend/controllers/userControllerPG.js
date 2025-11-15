import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/modelsFixed.js";
import { v2 as cloudinary } from "cloudinary";
import { sendToken } from "../utils/jwtToken.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      password,
      role,
      firstNiche,
      secondNiche,
      thirdNiche,
      coverLetter,
    } = req.body;

    if (!name || !email || !phone || !address || !password || !role) {
      return next(new ErrorHandler("All fields are required.", 400));
    }
    if (role === "Job Seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {
      return next(
        new ErrorHandler("Please provide your preferred job niches.", 400)
      );
    }
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new ErrorHandler("Email is already registered.", 400));
    }
    
    const userData = {
      name,
      email,
      phone,
      address,
      password,
      role,
      firstNiche,
      secondNiche,
      thirdNiche,
      coverLetter,
    };
    
    if (req.files && req.files.resume) {
      const { resume } = req.files;
      if (resume) {
        try {
          const cloudinaryResponse = await cloudinary.uploader.upload(
            resume.tempFilePath,
            { folder: "Job_Seekers_Resume" }
          );
          if (!cloudinaryResponse || cloudinaryResponse.error) {
            return next(
              new ErrorHandler("Failed to upload resume to cloud.", 500)
            );
          }
          userData.resumePublicId = cloudinaryResponse.public_id;
          userData.resumeUrl = cloudinaryResponse.secure_url;
        } catch (error) {
          return next(new ErrorHandler("Failed to upload resume", 500));
        }
      }
    }
    
    const user = await User.create(userData);
    sendToken(user, 201, res, "User Registered.");
  } catch (error) {
    next(error);
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  try {
    const { role, email, password } = req.body;
    console.log("Login attempt for:", { role, email });
    
    if (!role || !email || !password) {
      return next(
        new ErrorHandler("Email, password and role are required.", 400)
      );
    }
    
    console.log("Finding user in database...");
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log("User not found with email:", email);
      return next(new ErrorHandler("Invalid email or password.", 400));
    }
    
    console.log("Comparing password...");
    const isPasswordMatched = await user.comparePassword(password);
    
    if (!isPasswordMatched) {
      console.log("Password mismatch for user:", email);
      return next(new ErrorHandler("Invalid email or password.", 400));
    }
    
    if (user.role !== role) {
      console.log("Role mismatch. Expected:", role, "Actual:", user.role);
      return next(new ErrorHandler("Invalid user role.", 400));
    }
    
    console.log("Login successful for user:", email);
    sendToken(user, 200, res, "User logged in successfully.");
    
  } catch (error) {
    console.error("Login error:", error);
    return next(new ErrorHandler("Error during login process", 500));
  }
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "User logged out.",
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    coverLetter: req.body.coverLetter,
    firstNiche: req.body.firstNiche,
    secondNiche: req.body.secondNiche,
    thirdNiche: req.body.thirdNiche,
  };
  
  if (req.files && req.files.resume) {
    const resume = req.files.resume;
    if (req.user.resumePublicId) {
      await cloudinary.uploader.destroy(req.user.resumePublicId);
    }
    const newResume = await cloudinary.uploader.upload(resume.tempFilePath, {
      folder: "Job_Seekers_Resume",
    });
    newUserData.resumePublicId = newResume.public_id;
    newUserData.resumeUrl = newResume.secure_url;
  }
  
  const user = await User.findByPk(req.user.id);
  await user.update(newUserData);
  
  res.status(200).json({
    success: true,
    user,
    message: "Profile updated.",
  });
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  
  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler("Please fill all fields.", 400));
  }
  
  if (newPassword !== confirmPassword) {
    return next(
      new ErrorHandler("New password & confirm password do not match.", 400)
    );
  }
  
  const user = await User.findByPk(req.user.id);
  const isPasswordMatched = await user.comparePassword(oldPassword);
  
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect.", 400));
  }
  
  user.password = newPassword;
  await user.save();
  
  res.status(200).json({
    success: true,
    message: "Password updated successfully.",
  });
});