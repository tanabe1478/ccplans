import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { plansRoutes } from './routes/plans.js';
import { searchRoutes } from './routes/search.js';

const fastify = Fastify({
  logger: true,
});

// Register CORS
await fastify.register(cors, {
  origin: config.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

// Register routes
await fastify.register(plansRoutes, { prefix: '/api/plans' });
await fastify.register(searchRoutes, { prefix: '/api/search' });

// Health check
fastify.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server
try {
  await fastify.listen({ port: config.port, host: config.host });
  console.log(`Server running at http://localhost:${config.port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
