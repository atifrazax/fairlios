const dotenv = require('dotenv');
dotenv.config();
const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY; // <-- API key in .env

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendMail = async (options) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      email: process.env.BREVO_VERIFIED_SENDER, // must be verified sender in Brevo.com
      name: "FAIRLIOS",
    };

    sendSmtpEmail.to = [
      {
        email: options.email,
        name: options.name || "FAIRLIOS",
      },
    ];

    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.html;
    sendSmtpEmail.textContent = options.message || "";

    // Optional custom headers
    sendSmtpEmail.headers = {
      "X-Custom-Header": "fairlios-app",
    };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent to:", data.to[0].email);
    return data;
  } catch (error) {
    console.error("❌ Email send failed:", error);

    throw error;
  }
};

module.exports = sendMail;
