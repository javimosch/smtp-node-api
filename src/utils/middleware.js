import { addReferrer, isReferrerAllowed } from './config.js';

/**
 * Middleware to validate and track referrers
 * 
 * This middleware:
 * 1. Extracts the referrer from the request header
 * 2. Adds it to the config if it's new
 * 3. Checks if it's allowed when whitelist is enabled
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function referrerMiddleware(req, res, next) {
  // Extract referrer from headers
  const referrer = req.get('Referer') || 'unknown';
  
  console.debug(`Request from referrer: ${referrer}`);
  
  // Add referrer to config (doesn't modify if already exists)
  addReferrer(referrer);
  
  // Check if referrer is allowed
  if (!isReferrerAllowed(referrer)) {
    console.debug(`Blocked request from non-whitelisted referrer: ${referrer}`);
    return res.status(403).json({
      success: false,
      error: 'Access denied: Referrer not whitelisted'
    });
  }
  
  next();
}

/**
 * Middleware to validate request body
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function validateEmailPayload(req, res, next) {
  const { from, to, subject, body } = req.body;
  
  // Check for required fields
  if (!from || !to || !subject || !body) {
    const missingFields = [];
    if (!from) missingFields.push('from');
    if (!to) missingFields.push('to');
    if (!subject) missingFields.push('subject');
    if (!body) missingFields.push('body');
    
    console.debug(`Invalid email payload: Missing fields: ${missingFields.join(', ')}`);
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    });
  }
  
  // Validate email format for 'from'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(from)) {
    console.debug(`Invalid email format for 'from': ${from}`);
    return res.status(400).json({
      success: false,
      error: `Invalid email format for 'from': ${from}`
    });
  }
  
  // Validate 'to' field (can be string or array)
  if (Array.isArray(to)) {
    for (const email of to) {
      if (!emailRegex.test(email)) {
        console.debug(`Invalid email format in 'to' array: ${email}`);
        return res.status(400).json({
          success: false,
          error: `Invalid email format in 'to' array: ${email}`
        });
      }
    }
  } else if (!emailRegex.test(to)) {
    console.debug(`Invalid email format for 'to': ${to}`);
    return res.status(400).json({
      success: false,
      error: `Invalid email format for 'to': ${to}`
    });
  }
  
  next();
}
