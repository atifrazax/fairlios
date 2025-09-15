const dotenv = require('dotenv');
dotenv.config();
const axios = require("axios");

const sendMail = async (options) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.BREVO_VERIFIED_SENDER, name: "FAIRLIOS" },
        to: [{ email: options.email, name: options.name || "YOU" }],
        subject: options.subject,
        htmlContent: options.html,
        textContent: options.message || "",
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent to:", options.email, "MessageId:", response.data.messageId);
    return response.data;
  } catch (error) {
    console.error("❌ Email send failed:", error.response?.data || error.message);
    return null;
  }
};

module.exports = sendMail;
