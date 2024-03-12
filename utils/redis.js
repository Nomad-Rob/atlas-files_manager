// Task 0 - Creating Redis Client
const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  // Create a new instance of the Redis client
  constructor() {
    this.client = redis.createClient();

    // Log when the client is connected to the server
    this.client.on('error', (err) => {
      console.log(`Redis client not connected to server dude ${err}`);
    });

    // Convert callback-based Redis methods to promise-based methods
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  // Check if the client is connected to the server
  isAlive() {
    return this.client.connected;
  }

  // Get the value of a key from the Redis instance
  async get(key) {
    return this.getAsync(key);
  }

  // Set the value of a key in the Redis instance
  async set(key, value, duration) {
    return this.setAsync(key, value, 'EX', duration);
  }

  // Delete a key from the Redis instance
  async del(key) {
    return this.delAsync(key);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
