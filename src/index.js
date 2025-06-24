import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import emailRoutes from './routes/email.js';
import { referrerMiddleware } from './utils/middleware.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(referrerMiddleware);

// Routes
app.use(emailRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.debug(`SMTP API server running on port ${PORT}`);
  console.debug('SMTP Configuration:', {
    host: process.env.SMTP_HOST || 'not configured',
    port: process.env.SMTP_PORT || 'not configured',
    secure: process.env.SMTP_SECURE || 'not configured',
    auth: process.env.SMTP_USER ? 'configured' : 'not configured'
  });
});
