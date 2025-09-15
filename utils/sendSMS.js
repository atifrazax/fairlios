const Twilio = require("twilio");
require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

const sendSMS = async (options) => {
    try {
        const message = await client.messages.create({
            body: options.message,
            to: options.to,
            from: process.env.TWILIO_PHONE_NUMBER, // Twilio virtual phone number for free plan, else use your phone number
        });
        console.log("✅ SMS sent: ",message.sid);
        return message
    } catch (error) {
        console.log("❌ SMS send failed", error);
        return null
    }
};

module.exports = sendSMS;