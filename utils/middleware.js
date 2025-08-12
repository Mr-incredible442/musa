import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'crypto';
import express from 'express';

export default function applyMiddlewares(app) {
  // Redirect middleware
  app.use((req, res, next) => {
    if (req.headers.host === 'yussman-62ryj.ondigitalocean.app') {
      return res.redirect(301, `https://yussman.net${req.url}`);
    }
    next();
  });

  // Enable compression for all routes
  app.use(compression());

  // CORS
  app.use(
    cors({
      origin: process.env.CORS_ORIGINS,
    }),
  );

  // Nonce for CSP
  app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    next();
  });

  // Helmet with CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': [
            "'self'",
            (req, res) => `'nonce-${res.locals.nonce}'`,
            'https://cloud.umami.is',
            'https://static.cloudflareinsights.com',
            'https://challenges.cloudflare.com',
          ],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'connect-src': [
            "'self'",
            'https://cloud.umami.is',
            'https://challenges.cloudflare.com',
            'https://api-gateway.umami.dev',
          ],
          'frame-src': ['https://challenges.cloudflare.com'],
        },
      },
    }),
  );

  // JSON body parser
  app.use(express.json());
}
