import app from './app.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`✓ Server is running on http://localhost:${PORT}`);
  console.log(`✓ Swagger API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`✓ API Endpoints:`);
  console.log(`  - GET    /api/users           - Get all users`);
  console.log(`  - GET    /api/users/:id       - Get user by ID`);
  console.log(`  - POST   /api/users           - Create new user`);
  console.log(`  - PUT    /api/users/:id       - Update user`);
  console.log(`  - DELETE /api/users/:id       - Delete user`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
