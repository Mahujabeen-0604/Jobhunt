import nodeMailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
    // Log SMTP configuration for debugging
    console.log("SMTP Config:", {
        host: process.env.SMTP_HOST,
        service: process.env.SMTP_SERVICE,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_MAIL,
    });

    const transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        service: process.env.SMTP_SERVICE,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false, // Disable SSL/TLS certificate verification
        },
    });

    const options = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject: subject,
        text: message,
    };

    try {
        const info = await transporter.sendMail(options);
        console.log("Email sent successfully:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};