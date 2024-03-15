// Controller for authentication
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import sha1 from 'sha1';
import crypto from 'crypto'; // cryptographic functionality that includes a set of wrappers
import { v4 as uuidv4 } from 'uuid'; // generate unique id

// AuthController class
const AuthController = {
  getConnect: async (req, res) => {
    const authHeader = req.header('Authorization');
    console.log(authHeader);

    // Making sure the header is there
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Getting the email and password from the header and making sure it's in the right format
    const encodedCredentials = authHeader.slice('Basic '.length);
    const credentials = Buffer.from(encodedCredentials, 'base64').toString();
    const [email, password] = credentials.split(':');

    // Hashing the password
    const hashedPassword = sha1(password);
    try {
      // console.log('about to get the user');
      const user = await dbClient.findUser({ email: email, password: hashedPassword });
      // console.log('the user is:', user);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Generating a token
      const token = uuidv4();
      await redisClient.set(`auth_${token}`, user._id.toString(), 24 * 60 * 60); // set token valid for 24 hours

      return res.status(200).json({ token });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  
  // Getting disconnect
  getDisconnect: async (req, res) => {
    // Getting the token from the header
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Deleting the token from the redis database
      const reply = await redisClient.del(`auth_${token}`);
      if (reply === 0) { // token not found
        return res.status(401).json({ error: "Unauthorized" });
      }
      res.status(204).send(); // Successfully deleted
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

module.exports = AuthController;


