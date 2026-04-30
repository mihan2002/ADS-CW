import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MVC API Documentation',
      version: '1.0.0',
      description: 'A simple Express.js MVC API with CRUD operations for Users',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      }
    
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token (without Bearer prefix)',
        },
      },
    },
    tags: [
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'API Keys',
        description: 'API key management endpoints (Admin only)',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
