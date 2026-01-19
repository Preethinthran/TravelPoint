import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config(); // Load the .env file

// Create the client using the URL from your .env file
const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('❌ Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Connected to Redis Cloud'));

// Connect immediately
(async () => {
    await redisClient.connect();
})();

export default redisClient;