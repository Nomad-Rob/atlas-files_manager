// Imports
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

// Ensure the storage folder exists
if (!fs.existsSync(FOLDER_PATH)) {
  fs.mkdirSync(FOLDER_PATH, { recursive: true });
}

export const FilesController = {
  postUpload: async (req, res) => {
    const token = req.headers['x-token'];
    // Adapt the following line if your redisClient.get method does not use promises
    const userId = await redisClient.get(`auth_${token}`);
    
    if (!userId) {
      console.log('No userId or invalid');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { name, type, parentId = '0', isPublic = false, data } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      console.log('Missing or invalid type');
      return res.status(400).json({ error: 'Missing or invalid type' });
    }
    
    if (!data && type !== 'folder') {
      console.log('Missing data');
      return res.status(400).json({ error: 'Missing data' });
    }

    let filePath = null;
    if (type !== 'folder') {
      const fileUUID = uuidv4();
      filePath = path.join(FOLDER_PATH, fileUUID);
      fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
    }

    // Replace with actual logic to add file to database
    const fileRecord = {
      userId,
      name,
      type,
      parentId,
      isPublic,
      localPath: filePath
    };

    // Example: const savedFile = await dbClient.addFile(fileRecord);
    fileRecord.id = uuidv4(); // This is placeholder logic

    console.log('File uploaded:', fileRecord);
    return res.status(201).json(fileRecord);
  }
};
