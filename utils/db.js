import { MongoClient } from 'mongodb';

// Environment variables for MongoDB connection
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '27017';
const database = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    // MongoDB connection string
    this.dbUrl = `mongodb://${host}:${port}`;
    this.dbName = database;
    this.client = new MongoClient(this.dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // Connecting to MongoDB
    this.client.connect((err) => {
      if (err) {
        console.error('Failed to connect to MongoDB', err);
        return;
      }
      console.log('Connected to MongoDB');
      this.db = this.client.db(this.dbName);
    });
  }

  // Check if the connection is alive
  isAlive() {
    return !!this.client && !!this.client.topology && this.client.topology.isConnected();
  }

  // Getting number of users
  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  // Get the number of files
  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }
}

// Export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;