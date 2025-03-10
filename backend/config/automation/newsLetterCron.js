import cron from "node-cron";
import { Job } from "../models/jobSchema.js";
import { User } from "../models/userSchema.js";
import { sendEmail } from "../utils/sendEmail.js";

export const newsLetterCron = () => {
    cron.schedule("*/1 * * * *", async () => {
        console.log("Cron job started at:", new Date().toISOString());

        try {
            const jobs = await Job.find({ newsLetterSent: false });
            console.log(`Found ${jobs.length} jobs to process.`);

            if (jobs.length === 0) {
                console.log("No jobs to process. Exiting cron job.");
                return;
            }

            for (const job of jobs) {
                try {
                    const filteredUsers = await User.find({
                        $or: [
                            { "niches.firstNiche": job.jobNiche },
                            { "niches.secondNiche": job.jobNiche },
                            { "niches.thirdNiche": job.jobNiche },
                        ],
                    });
                    console.log(`Found ${filteredUsers.length} users for job: ${job.title}`);

                    if (filteredUsers.length === 0) {
                        console.log(`No users found for job: ${job.title}. Skipping.`);
                        continue;
                    }

                    for (const user of filteredUsers) {
                        const subject = `Job Seeker’s Dream: ${job.title} in ${job.jobNiche} Grab it Now`;
                        const message = `Hello ${user.name},

We hope this message finds you well! We are excited to share an amazing job opportunity that could be your next big career move:

**Job Title:** ${job.title}  
**Company:** ${job.companyName}  
**Location:** ${job.location}  
**Salary:** ${job.salary}

This is a fantastic chance to take your career to the next level with a leading company in the industry. Don't miss out on this amazing opportunity!

To apply, click on the link below and start your application today!

Best regards,  
The Job Seeker's Dream Team
`;

                        try {
                            await sendEmail({
                                email: user.email,
                                subject,
                                message,
                            });
                            console.log(`Email sent successfully to: ${user.email}`);
                        } catch (error) {
                            console.error(`Failed to send email to ${user.email}:`, error);
                        }
                    }

                    job.newsLetterSent = true;
                    await job.save();
                    console.log(`Marked job "${job.title}" as sent.`);
                } catch (error) {
                    console.error(`Error processing job "${job.title}":`, error);
                }
            }
        } catch (error) {
            console.error("Error in cron job:", error);
        }
    });
};