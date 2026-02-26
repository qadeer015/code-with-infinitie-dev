// utils/emailService.js
const brevo = require('@getbrevo/brevo');
require('dotenv').config();

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey, 
  process.env.BREVO_SMTP_KEY
);

/**
 * Send an email using Brevo
 * @param {Object} options
 * @param {string} options.subject - Email subject
 * @param {string} options.htmlContent - HTML body content
 * @param {string} options.to - Recipient email address
 * @param {string} [options.name] - Recipient name (optional)
 * @returns Promise
 */
const sendEmail = async ({ subject, htmlContent, to, name = "User" }) => {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SMTP_SENDER_NAME,
      email: process.env.BREVO_SMTP_SENDER
    };

    sendSmtpEmail.to = [{ email: to, name }];

    sendSmtpEmail.replyTo = {
      email: "codewithinfinitidev@gmail.com",
      name: "Support"
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return response;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};

module.exports = sendEmail;
