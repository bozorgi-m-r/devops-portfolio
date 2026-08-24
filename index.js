// Task API — a small REST API backed by PostgreSQL and Redis
// Demonstrates a production-style multi-service Docker setup:
// multi-stage build, non-root user, healthchecks, and env-based config.

const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- PostgreSQL connection ---
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'tasks_db',
});

// --- Redis connection ---
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'redis'}:6379`,
});
redisClient.on('error', (err) => console.error('Redis error:', err));

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

// Health check endpoint - used by the Dockerfile HEALTHCHECK and Compose healthcheck
app.get('/health', (req, res) => res.status(200).send('OK'));

// Visit counter, backed by Redis (demonstrates Redis as a fast cache)
app.get('/', async (req, res) => {
  const visits = await redisClient.incr('total_visits');
  res.json({ message: 'Task API is running', total_visits: visits });
});

app.get('/tasks', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks ORDER BY id');
  res.json(result.rows);
});

app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const result = await pool.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title]
  );
  res.status(201).json(result.rows[0]);
});

app.patch('/tasks/:id/done', async (req, res) => {
  const result = await pool.query(
    'UPDATE tasks SET done = true WHERE id = $1 RETURNING *',
    [req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'not found' });
  res.json(result.rows[0]);
});

app.delete('/tasks/:id', async (req, res) => {
  const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'not found' });
  res.status(204).send();
});

let server;

async function start() {
  await redisClient.connect();
  await initDb();
  server = app.listen(PORT, () => console.log(`Task API listening on port ${PORT}`));
}

// Graceful shutdown: on SIGTERM (sent by `docker stop`), stop accepting new
// requests, close the DB/Redis connections cleanly, then exit. Without this,
// Docker falls back to SIGKILL after its grace period, which can cut off
// in-flight requests and leave connections in a bad state.
async function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully...`);
  if (server) {
    server.close(() => console.log('HTTP server closed'));
  }
  try {
    await redisClient.quit();
  } catch (err) {
    console.error('Error closing Redis connection:', err);
  }
  try {
    await pool.end();
  } catch (err) {
    console.error('Error closing PostgreSQL pool:', err);
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Only start listening when this file is run directly (`node index.js`),
// not when it's imported by the test suite.
if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start app:', err);
    process.exit(1);
  });
}

module.exports = app;
