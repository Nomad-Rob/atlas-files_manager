// Task 0 - Creating Redis Client
import { resolve } from 'path';
import redis from 'redis';
import { promisify } from 'util';
// RedisClient class
class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.connected = true;
    this.client.on('error', (error) => {console.error(`Redis client not connected: ${error}`)});
    this.client.on('connect', () => {
      resolve();
      // return this.isAlive();
    })
  }
  // Check if the connection is alive
  isAlive() {
    // console.log("The client is connected, true or false?:", this.client.connected);
    return this.connected;
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
