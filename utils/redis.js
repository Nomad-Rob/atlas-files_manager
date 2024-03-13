// Task 0 - Creating Redis Client
import redis from 'redis';
import { promisify } from 'util';

// RedisClient class
class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (error) => console.error(`Redis client not connected: ${error}`));
  }

  // Check if the connection is alive
  isAlive() {
    return this.client.connected;
  }

  // Get value from key
  async get(key) {
    const asyncGet = promisify(this.client.get).bind(this.client);
    return asyncGet(key);
  }

  // Set key with value and duration
  async set(key, value, duration) {
    const asyncSet = promisify(this.client.setex).bind(this.client);
    return asyncSet(key, duration, value);
  }

  // Delete key
  async del(key) {
    const asyncDel = promisify(this.client.del).bind(this.client);
    return asyncDel(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
