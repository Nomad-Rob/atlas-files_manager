// FilesController.js

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      console.log('No userId or invalid');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, type, parentId = '0', isPublic = false, data } = req.body;
    if (!name) {
      console.log('No name');
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      console.log('No type');
      return res.status(400).json({ error: 'Missing or invalid type' });
    }
    if (type !== 'folder' && !data) {
      console.log('No data');
      return res.status(400).json({ error: 'Missing data' });
    }

    let parentFileDocument = null;
    if (parentId !== '0') {
      try {
        parentFileDocument = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
      } catch (error) {
        console.log('Invalid parentId format');
        return res.status(400).json({ error: 'Invalid parentId format' });
      }
      if (!parentFileDocument) {
        console.log('Parent not found');
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFileDocument.type !== 'folder') {
        console.log('Parent is not a folder');
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileData = {
      userId: new ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId !== '0' ? new ObjectId(parentId) : 0,
    };

    if (type !== 'folder') {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      const fileName = uuidv4();
      const filePath = path.join(folderPath, fileName);
      try {
        const fileBuffer = Buffer.from(data, 'base64');
        fs.writeFileSync(filePath, fileBuffer);
        fileData.localPath = filePath;
      } catch (error) {
        console.log('Error saving file to disk');
        return res.status(500).json({ error: 'Error saving file to disk' });
      }
    }

    let newFile;
    try {
      newFile = await dbClient.db.collection('files').insertOne(fileData);
    } catch (error) {
      console.log('Error saving file to database');
      return res.status(500).json({ error: 'Error saving file to database' });
    }

    return res.status(201).json({
      id: newFile.insertedId,
      userId: fileData.userId.toString(),
      name: fileData.name,
      type: fileData.type,
      isPublic: fileData.isPublic,
      parentId: fileData.parentId.toString(),
      ...(type !== 'folder' && { localPath: fileData.localPath })
    });
  }
}

export default FilesController;
