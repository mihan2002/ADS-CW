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
      },
      {
        url: 'http://localhost:3001',
        description: 'Development server (alternate)',
      },
    ],
    tags: [
      {
        name: 'Users',
        description: 'User management endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
