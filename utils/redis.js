// Task 0 - Creating Redis Client
import { createClient } from 'redis';

// Define the RedisClient class to encapsulate all Redis-related functionalities.
class RedisClient {
  constructor() {
    // Initialize the Redis client and attempt to connect to the Redis server.
    this.client = createClient();
    this.client.on('error', (err) => console.log('Redis Client Error', err));
    this.client.connect();
  }

  // Method to check if the Redis client is successfully connected to the Redis server.
  isAlive() {
    return this.client.isOpen;
  }

  // Asynchronously retrieves the value associated with the given key from Redis.
  async get(key) {
    try {
      // Attempt to get the value from Redis using the provided key and return it.
      const value = await this.client.get(key);
      return value;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // Asynchronously stores a key-value pair in Redis with an expiration time.
  async set(key, value, duration) {
    try {
      // Use 'setEx' to set the value with an expiration time in seconds.
      await this.client.setEx(key, duration, value);
    } catch (err) {
      console.error(err);
    }
  }

  // Asynchronously deletes the specified key (and its associated value) from Redis.
  async del(key) {
    try {
      // Attempt to delete the specified key from Redis.
      await this.client.del(key);
    } catch (err) {
      console.error(err);
    }
  }
}

// Create an instance of the RedisClient class to be used throughout the application.
const redisClient = new RedisClient();

// Export the redisClient instance so it can be imported and used in other files.
export default redisClient;
