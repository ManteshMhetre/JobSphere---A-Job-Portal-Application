import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Application, Job } from "../models/modelsFixed.js";
import { v2 as cloudinary } from "cloudinary";

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone, address, coverLetter } = req.body;
  
  if (!name || !email || !phone || !address || !coverLetter) {
    return next(new ErrorHandler("All fields are required.", 400));
  }
  
  const jobDetails = await Job.findByPk(id);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found.", 404));
  }
  
  const isAlreadyApplied = await Application.findOne({
    where: {
      jobId: id,
      jobSeekerUserId: req.user.id,
    },
  });
  
  if (isAlreadyApplied) {
    return next(
      new ErrorHandler("You have already applied for this job.", 400)
    );
  }
  
  let resumePublicId = null;
  let resumeUrl = null;
  
  if (req.files && req.files.resume) {
    const { resume } = req.files;
    try {
      const cloudinaryResponse = await cloudinary.uploader.upload(
        resume.tempFilePath,
        {
          folder: "Job_Seekers_Resume",
        }
      );
      if (!cloudinaryResponse || cloudinaryResponse.error) {
        return next(
          new ErrorHandler("Failed to upload resume to cloudinary.", 500)
        );
      }
      resumePublicId = cloudinaryResponse.public_id;
      resumeUrl = cloudinaryResponse.secure_url;
    } catch (error) {
      return next(new ErrorHandler("Failed to upload resume", 500));
    }
  } else {
    if (!req.user.resumeUrl) {
      return next(new ErrorHandler("Please upload your resume.", 400));
    }
    resumePublicId = req.user.resumePublicId;
    resumeUrl = req.user.resumeUrl;
  }
  
  const application = await Application.create({
    jobSeekerUserId: req.user.id,
    jobSeekerName: name,
    jobSeekerEmail: email,
    jobSeekerPhone: phone,
    jobSeekerAddress: address,
    resumePublicId,
    resumeUrl,
    coverLetter,
    jobSeekerRole: "Job Seeker",
    employerUserId: jobDetails.postedBy,
    employerRole: "Employer",
    jobId: id,
    jobTitle: jobDetails.title,
  });
  
  res.status(201).json({
    success: true,
    message: "Application submitted.",
    application,
  });
});

export const employerGetAllApplication = catchAsyncErrors(
  async (req, res, next) => {
    const applications = await Application.findAll({
      where: {
        employerUserId: req.user.id,
        deletedByEmployer: false,
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobSeekerGetAllApplication = catchAsyncErrors(
  async (req, res, next) => {
    const applications = await Application.findAll({
      where: {
        jobSeekerUserId: req.user.id,
        deletedByJobSeeker: false,
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const application = await Application.findByPk(id);
  
  if (!application) {
    return next(new ErrorHandler("Application not found.", 404));
  }
  
  const { role } = req.user;
  switch (role) {
    case "Job Seeker":
      application.deletedByJobSeeker = true;
      await application.save();
      break;
    case "Employer":
      application.deletedByEmployer = true;
      await application.save();
      break;
    default:
      console.log("Default case for application delete function.");
      break;
  }

  if (application.deletedByEmployer && application.deletedByJobSeeker) {
    await application.destroy();
  }
  
  res.status(200).json({
    success: true,
    message: "Application Deleted.",
  });
});