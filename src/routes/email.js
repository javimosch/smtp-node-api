import express from 'express';
import { sendEmail } from '../utils/smtp.js';
import dotenv from 'dotenv';

const router = express.Router();

// Load environment variables
dotenv.config();

/**
 * Process template string with dynamic parameters
 * 
 * @param {string} template - Template string with {param} placeholders
 * @param {Object} params - Parameters to inject
 * @returns {string} - Processed template
 */
function processTemplate(template, params) {
  let result = template;
  
  // Replace {body} with formatted JSON of the entire params object
  if (result.includes('{body}')) {
    const formattedBody = JSON.stringify(params, null, 2);
    result = result.replace('{body}', formattedBody);
  }
  
  // Replace any other {paramName} with corresponding values from params
  const paramRegex = /{([^}]+)}/g;
  let match;
  
  while ((match = paramRegex.exec(result)) !== null) {
    const paramName = match[1];
    if (paramName !== 'body' && params[paramName] !== undefined) {
      const value = params[paramName];
      result = result.replace(`{${paramName}}`, typeof value === 'object' ? JSON.stringify(value) : value);
    }
  }
  
  return result;
}

/**
 * Validate email format
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * POST /send-email
 * 
 * Endpoint to send emails via configured SMTP server with template support
 * 
 * Required payload:
 * - from: string (email address) or uses DEFAULT_FROM env var
 * - to: string or array of strings (email addresses) or uses DEFAULT_TO env var
 * - subject: string
 * - body: string (can be raw text or HTML)
 * 
 * Template support:
 * - {paramName} - Replaced with the value of req.body.paramName
 * - {body} - Replaced with the entire request body as formatted JSON
 */
router.post('/send-email', async (req, res) => {
  try {
    // Get email data from request or environment variables
    const from = req.body.from || process.env.DEFAULT_FROM || 'no-reply@intrane.fr';
    const to = req.body.to || process.env.DEFAULT_TO || 'arancibiajav@gmail.com';
    const subject = req.body.subject || 'Test POST endpoint (smtp-node-api)';
    let body = req.body.body || 'Hi this is a test {body}';
    
    // Validate email format
    if (!isValidEmail(from)) {
      console.debug(`Invalid email format for 'from': ${from}`);
      return res.status(400).json({
        success: false,
        error: `Invalid email format for 'from': ${from}`
      });
    }
    
    // Validate 'to' field (can be string or array)
    if (Array.isArray(to)) {
      for (const email of to) {
        if (!isValidEmail(email)) {
          console.debug(`Invalid email format in 'to' array: ${email}`);
          return res.status(400).json({
            success: false,
            error: `Invalid email format in 'to' array: ${email}`
          });
        }
      }
    } else if (!isValidEmail(to)) {
      console.debug(`Invalid email format for 'to': ${to}`);
      return res.status(400).json({
        success: false,
        error: `Invalid email format for 'to': ${to}`
      });
    }
    
    console.debug('Processing email send request', {
      from,
      to: Array.isArray(to) ? `${to.length} recipients` : '1 recipient',
      subject
    });
    
    // Process template with dynamic parameters
    body = processTemplate(body, req.body);
    
    console.debug('Sending email with processed template', {
      bodyPreview: body.substring(0, 100) + (body.length > 100 ? '...' : '')
    });
    
    const result = await sendEmail({
      from,
      to,
      subject,
      body
    });
    
    if (result.success) {
      console.debug('Email sent successfully', { messageId: result.messageId });
      return res.status(200).json({
        success: true,
        messageId: result.messageId
      });
    } else {
      console.debug('Email sending failed', { error: result.error });
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Unexpected error in email route:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});



export default router;
