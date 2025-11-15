import cron from "node-cron";
import { Job, User } from "../models/modelsFixed.js";
import { sendEmail } from "../utils/sendEmail.js";
import { Op } from "sequelize";

export const newsLetterCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log("Running Cron Automation");
    const jobs = await Job.findAll({ 
      where: { newsLettersSent: false }
    });
    
    for (const job of jobs) {
      try {
        const filteredUsers = await User.findAll({
          where: {
            [Op.or]: [
              { firstNiche: job.jobNiche },
              { secondNiche: job.jobNiche },
              { thirdNiche: job.jobNiche },
            ],
          },
        });
        
        for (const user of filteredUsers) {
          const subject = `Hot Job Alert: ${job.title} in ${job.jobNiche} Available Now`;
          const message = `Hi ${user.name},\n\nGreat news! A new job that fits your niche has just been posted. The position is for a ${job.title} with ${job.companyName}, and they are looking to hire immediately.\n\nJob Details:\n- **Position:** ${job.title}\n- **Company:** ${job.companyName}\n- **Location:** ${job.location}\n- **Salary:** ${job.salary}\n\nDon't wait too long! Job openings like these are filled quickly. \n\nWe're here to support you in your job search. Best of luck!\n\nBest Regards,\nNicheNest Team`;
          sendEmail({
            email: user.email,
            subject,
            message,
          });
        }
        
        job.newsLettersSent = true;
        await job.save();
      } catch (error) {
        console.log("ERROR IN NODE CRON CATCH BLOCK");
        console.error(error || "Some error in Cron.");
      }
    }
  });
};