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

    const {
      name, type, parentId = '0', isPublic = false, data,
    } = req.body;
    if (!name) {
      console.log('Missing name');
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      console.log('Missing type');
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      console.log('Missing data');
      return res.status(400).json({ error: 'Missing data' });
    }

    let parentFile = null;
    if (parentId !== '0') {
      parentFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
      if (!parentFile) {
        console.log('Parent not found');
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
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

      const fileBuffer = Buffer.from(data, 'base64');
      fs.writeFileSync(filePath, fileBuffer);

      fileData.localPath = filePath;
    }

    const newFile = await dbClient.db.collection('files').insertOne(fileData);

    console.log('newFile is:', newFile);
    return res.status(201).json({
      id: newFile.insertedId,
      userId: fileData.userId,
      name: fileData.name,
      type: fileData.type,
      isPublic: fileData.isPublic,
      parentId: fileData.parentId,
      ...(type !== 'folder' && { localPath: fileData.localPath }),
    });
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    try {
      const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(userId),
      });
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Simplified return statement
      return res.json({
        id: file._id.toString(),
        userId: file.userId.toString(),
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId.toString(), // Handle "0" gracefully
      });
    } catch (error) {
      console.error('Error retrieving file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Ensure string parameters are correctly handled
    let { parentId = '0', page = '0' } = req.query;
    parentId = String(parentId); // Convert parentId to string
    page = parseInt(page, 10); // Parse page as an integer

    const perPage = 20;
    const skip = page * perPage;

    try {
      // Construct the query with dynamic parentId
      const query = { userId: new ObjectId(userId) };
      // Adjust for parentId: when '0', treat as root, otherwise, ensure ObjectId
      query.parentId = parentId !== '0' ? new ObjectId(parentId) : 0;

      // Fetch files with pagination
      const files = await dbClient.db.collection('files')
        .find(query)
        .limit(perPage)
        .skip(skip)
        .toArray();

      // Map the files for the response
      const response = files.map((file) => ({
        id: file._id.toString(),
        userId: file.userId.toString(),
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId.toString(), // Handle parentId correctly
      }));

      return res.json(response);
    } catch (error) {
      console.error('Error in getIndex:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
export default FilesController;
