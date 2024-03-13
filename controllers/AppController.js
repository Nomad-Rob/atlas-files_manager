// Controller for app
const redisClient = require('../utils/redis').default;
const dbClient = require('../utils/db').default;

// AppController class
class AppController {
  static async getStatus(req, res) {
    const redis = redisClient.isAlive();
    const db = dbClient.isAlive();
    return res.status(200).json({ redis, db });
  }

  // Getting stats
  static async getStats(req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    return res.status(200).json({ users, files });
  }
}

module.exports = AppController;

