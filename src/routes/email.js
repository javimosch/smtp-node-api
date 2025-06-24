import express from 'express';
import { sendEmail } from '../utils/smtp.js';
import { validateEmailPayload } from '../utils/middleware.js';
import dotenv from 'dotenv';

const router = express.Router();

/**
 * POST /send-email
 * 
 * Endpoint to send emails via configured SMTP server
 * 
 * Required payload:
 * - from: string (email address)
 * - to: string or array of strings (email addresses)
 * - subject: string
 * - body: string (can be raw text or HTML)
 */
router.post('/send-email', validateEmailPayload, async (req, res) => {
  try {
    console.debug('Processing email send request', {
      from: req.body.from,
      to: Array.isArray(req.body.to) ? `${req.body.to.length} recipients` : '1 recipient',
      subject: req.body.subject
    });
    
    const result = await sendEmail({
      from: req.body.from,
      to: req.body.to,
      subject: req.body.subject,
      body: req.body.body
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
