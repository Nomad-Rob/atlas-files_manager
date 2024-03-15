// User Controllers for the application
import redisClient from '../utils/redis';
import crypto from 'crypto';
import dbClient from '../utils/db';
// import crypto for password hashing

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Validate email and password presence
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if the email already exists
    const existingUser = await dbClient.db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password with SHA1
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    // Create the new user
    const newUser = await dbClient.db.collection('users').insertOne({
      email,
      password: hashedPassword,
    });

    // Return the new user's email and id
    return res.status(201).json({
      id: newUser.insertedId,
      email,
    });
  }
}

export default UsersController;
