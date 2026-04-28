import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import alumniRoutes from './routes/alumniRoutes.js';
import { ErrorHandler } from './middleware/errorHandler.js';

const app: Express = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploaded images
app.use('/uploads', express.static('uploads'));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: false,
  },
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alumni', alumniRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to MVC API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      alumni: '/api/alumni',
      users: '/api/users',
      docs: '/api-docs',
    },
  });
});

// 404 handler
app.use(ErrorHandler.notFound);

// Error handler middleware
app.use(ErrorHandler.handle);

export default app;
