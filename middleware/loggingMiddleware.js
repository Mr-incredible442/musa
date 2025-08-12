import { Log } from '../model/Log.schema.js';

const EXCLUDED_ROUTES = ['/api/users/', '/login', '/users', '/api/logs'];
const SENSITIVE_HEADERS = ['authorization', 'cookie', 'x-name'];

export const loggingMiddleware = async (req, res, next) => {
  // Skip logging for GET requests
  if (req.method === 'GET') {
    return next(); // Skip logging for GET requests
  }
  // Exclude logging for static assets (e.g., images, CSS, JS)
  if (req.originalUrl.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)) {
    return next();
  }

  // Exclude specific routes from logging
  if (EXCLUDED_ROUTES.some((route) => req.originalUrl.startsWith(route))) {
    return next();
  }

  // Clone headers and remove sensitive information
  const sanitizedHeaders = { ...req.headers };
  SENSITIVE_HEADERS.forEach((header) => delete sanitizedHeaders[header]);

  const logData = {
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    userName: req.headers['x-name'],
    headers: sanitizedHeaders,
    body: req.method !== 'GET' ? req.body : null,
    query: req.query,
  };

  // Save log to database
  try {
    await Log.create(logData);
  } catch (error) {
    console.error('Error logging request:', error);
  }

  next();
};
