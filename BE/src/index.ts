import "dotenv/config";
import app from './app.js';
import { startFeatureDayScheduler } from "./jobs/featureDayScheduler.js";
import { ensureSchema } from "./db/ensureSchema.js";

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    const result = await ensureSchema();
    if (process.env.NODE_ENV === "development") {
      const summary = result.changed ? "applied schema updates" : "schema up-to-date";
      console.log(`✓ DB check: ${summary}`);
      for (const msg of result.messages) console.log(`  - ${msg}`);
    }
  } catch (err) {
    console.error("DB schema ensure failed:", err);
  }

  const server = app.listen(PORT, () => {
    console.log(`✓ Server is running on http://localhost:${PORT}`);
    console.log(`✓ Swagger API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`✓ API Endpoints:`);
    console.log(`  - GET    /api/users           - Get all users`);
    console.log(`  - GET    /api/users/:id       - Get user by ID`);
    console.log(`  - POST   /api/users           - Create new user`);
    console.log(`  - PUT    /api/users/:id       - Update user`);
    console.log(`  - DELETE /api/users/:id       - Delete user`);

    startFeatureDayScheduler();
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
})();

