import express from 'express';
import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import userRoutes from './routes/userRoutes.js';
import { ErrorHandler } from './middleware/errorHandler.js';

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: false,
  },
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Routes
app.use('/api/users', userRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to MVC API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
    },
  });
});

// 404 handler
app.use(ErrorHandler.notFound);

// Error handler middleware
app.use(ErrorHandler.handle);

export default app;
