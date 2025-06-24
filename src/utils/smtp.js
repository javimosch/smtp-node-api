import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Create a nodemailer transport based on environment variables
 * 
 * Environment variables used:
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP server port
 * - SMTP_SECURE: Whether to use TLS (true/false)
 * - SMTP_USER: SMTP username (optional)
 * - SMTP_PASS: SMTP password (optional)
 * 
 * @returns {Object} Nodemailer transport
 */
export function createTransport() {
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true'
  };

  console.debug('Creating SMTP transport with config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: process.env.SMTP_USER ? 'configured' : 'not configured'
  });

  // Add authentication if credentials are provided
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    config.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    };
  }

  return nodemailer.createTransport(config);
}

/**
 * Send an email using the configured SMTP transport
 * 
 * @param {Object} emailData - Email data object
 * @param {string} emailData.from - Sender email address
 * @param {string|string[]} emailData.to - Recipient email address(es)
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.body - Email body content (text or HTML)
 * @returns {Promise<Object>} Send result
 */
export async function sendEmail(emailData) {
  try {
    const transport = createTransport();
    
    const mailOptions = {
      from: emailData.from,
      to: Array.isArray(emailData.to) ? emailData.to.join(',') : emailData.to,
      subject: emailData.subject,
      // Determine if body is HTML or plain text
      ...(emailData.body.includes('<') && emailData.body.includes('</') 
        ? { html: emailData.body } 
        : { text: emailData.body })
    };
    
    console.debug('Sending email:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      contentType: mailOptions.html ? 'html' : 'text'
    });
    
    const result = await transport.sendMail(mailOptions);
    console.debug('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}
