
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config()
export const redis = new Redis({
  host: process.env.REDIS_HOST, // Host
  port:Number(process.env.REDIS_PORT), // Port
  password: process.env.REDIS_PASSWORD, // Password
  tls: {}, // SSL enabled (tls is the equivalent option in ioredis)
  retryStrategy: (times) => {
    // Retry connection logic (optional)
    if (times > 3) {
      return null; // Don't retry after 3 failed attempts
    }
    return Math.min(times * 50, 2000); // Retry with increasing delay
  }
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});