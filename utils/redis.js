// Task 0 - Creating Redis Client
const redis = require('redis');
const { promisify } = require('util');

class redisClient
{
    constructor()
    {
        // Create a new Redis client
        this.client = redis.createClient();
        this.client.on('error', (error) => {
            console.log(`Redis client not connected to the server: ${error.message}`);
        });
        // Log when the client is connected to the server
        this.client.on('connect', () => {
            console.log('Redis client connected to the server');
        });
    }
    
    // Check if the client is connected to the server
    isAlive()
    {
        return this.client.connected;
    }
    
    // Get the value of a key
    async get(key)
    {
        const getAsync = promisify(this.client.get).bind(this.client);
        return getAsync(key);
    }
    
    // Set the value of a key
    async set(key, value, duration)
    {
        this.client.set(key, value);
        this.client.expire(key, duration);
    }

    // Delete a key
    async del(key)
    {
        this.client.del(key);
    }
}

const redisClient = new redisClient();
module.exports = redisClient;
