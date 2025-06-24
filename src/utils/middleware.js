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


