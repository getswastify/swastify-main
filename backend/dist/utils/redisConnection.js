"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
exports.redis = new ioredis_1.default({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    tls: {},
    retryStrategy: (times) => {
        // Retry connection logic (optional)
        if (times > 3) {
            return null; // Don't retry after 3 failed attempts
        }
        return Math.min(times * 50, 2000); // Retry with increasing delay
    }
});
exports.redis.on('connect', () => {
    console.log('Successfully connected to Redis');
});
exports.redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});
