import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { openapiSpec } from './docs/openapi';
import { errorHandler, notFoundHandler } from './middleware/error';
import authRoutes from './modules/auth/auth.routes';
import borrowerRoutes from './modules/borrower/borrower.routes';
import loanRoutes from './modules/loans/loan.routes';
import opsRoutes from './modules/ops/ops.routes';
import uploadRoutes from './modules/uploads/upload.routes';

export function createApp(): Application {
  const app = express();

  // Render (and most PaaS) terminate TLS at a proxy; trust it so secure cookies
  // and req.protocol behave correctly behind the load balancer.
  if (env.isProduction) {
    app.set('trust proxy', 1);
  }

  app.use(
    cors({
      // Reflect the request origin only when it is in the allow-list. Requests
      // without an Origin header (curl, health checks, server-to-server) pass.
      origin(origin, callback) {
        if (!origin || env.clientOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Interactive API docs (Swagger UI) + the raw OpenAPI document.
  app.get('/api/docs.json', (_req: Request, res: Response) => {
    res.json(openapiSpec);
  });
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec as unknown as swaggerUi.JsonObject, {
      customSiteTitle: 'LendFlow LMS API Docs',
    }),
  );

  app.use('/api/auth', authRoutes);
  app.use('/api/borrower', borrowerRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/loans', loanRoutes);
  app.use('/api/ops', opsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
