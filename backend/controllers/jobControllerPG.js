import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Job } from "../models/modelsFixed.js";
import { Op } from "sequelize";

export const postJob = catchAsyncErrors(async (req, res, next) => {
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
  } = req.body;
  
  if (
    !title ||
    !jobType ||
    !location ||
    !companyName ||
    !introduction ||
    !responsibilities ||
    !qualifications ||
    !salary ||
    !jobNiche
  ) {
    return next(new ErrorHandler("Please provide full job details.", 400));
  }
  
  if (
    (personalWebsiteTitle && !personalWebsiteUrl) ||
    (!personalWebsiteTitle && personalWebsiteUrl)
  ) {
    return next(
      new ErrorHandler(
        "Provide both the website url and title, or leave both blank.",
        400
      )
    );
  }
  
  const postedBy = req.user.id;
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
    personalWebsiteTitle,
    personalWebsiteUrl,
    jobNiche,
    postedBy,
  });
  
  res.status(201).json({
    success: true,
    message: "Job posted successfully.",
    job,
  });
});

export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  const { city, niche, searchKeyword } = req.query;
  const whereClause = {};
  
  if (city) {
    whereClause.location = city;
  }
  if (niche) {
    whereClause.jobNiche = niche;
  }
  if (searchKeyword) {
    whereClause[Op.or] = [
      { title: { [Op.iLike]: `%${searchKeyword}%` } },
      { companyName: { [Op.iLike]: `%${searchKeyword}%` } },
      { introduction: { [Op.iLike]: `%${searchKeyword}%` } },
    ];
  }
  
  const jobs = await Job.findAll({
    where: whereClause,
    order: [['createdAt', 'DESC']]
  });
  
  res.status(200).json({
    success: true,
    jobs,
    count: jobs.length,
  });
});

export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
  const myJobs = await Job.findAll({ 
    where: { postedBy: req.user.id },
    order: [['createdAt', 'DESC']]
  });
  
  res.status(200).json({
    success: true,
    myJobs,
  });
});

export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findByPk(id);
  
  if (!job) {
    return next(new ErrorHandler("Oops! Job not found.", 404));
  }
  
  await job.destroy();
  res.status(200).json({
    success: true,
    message: "Job deleted.",
  });
});

export const getASingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const job = await Job.findByPk(id);
  
  if (!job) {
    return next(new ErrorHandler("Job not found.", 404));
  }
  
  res.status(200).json({
    success: true,
    job,
  });
});