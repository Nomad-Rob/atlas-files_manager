// Importing necessary modules
import redis from 'redis';
import { promisify } from 'util';

// RedisClient class definition
class RedisClient {
  constructor() {
    // Creating a Redis client
    this.client = redis.createClient();

    // Error handling for the Redis client
    this.client.on('error', (error) => console.error(`Redis client not connected: ${error}`));

    // Setting up a flag to check connection status
    this.connected = false;

    // Listening to the connect and end events to update the connection status
    this.client.on('connect', () => {
      console.log('Redis client connected');
      this.connected = true;
    });

    this.client.on('end', () => {
      console.log('Redis client disconnected');
      this.connected = false;
    });
  }

  // Method to check if the connection is alive
  isAlive() {
    return this.connected;
  }

  // Asynchronous method to get a value by key from Redis
  async get(key) {
    const asyncGet = promisify(this.client.get).bind(this.client);
    return asyncGet(key);
  }

  // Asynchronous method to set a key-value pair in Redis with an expiration
  async set(key, value, duration) {
    const asyncSet = promisify(this.client.setex).bind(this.client);
    return asyncSet(key, duration, value);
  }

  // Asynchronous method to delete a key from Redis
  async del(key) {
    const asyncDel = promisify(this.client.del).bind(this.client);
    return asyncDel(key);
  }
}

// Exporting an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
