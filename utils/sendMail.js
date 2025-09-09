const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();

const sendMail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });
        const message = {
        from: `FAIRLIOS <${process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(message);
        console.log("Email sent: to", info.accepted);
    } catch (err) {
        console.log(err);
    }
};

module.exports = sendMail;