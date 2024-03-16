import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import mime from 'mime-types'; // Added to handle MIME types
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

    // Convert page query param to integer with a default of 0 if undefined
    const page = parseInt(req.query.page || '0', 10);
    const parentId = req.query.parentId || '0'; // Changed to 'const' as it is not reassigned

    const perPage = 20;
    const skipAmount = page * perPage;

    try {
      // Adjust query to correctly handle '0' parentId and apply correct ObjectId casting
      const query = { userId: new ObjectId(userId), parentId: parentId === '0' ? 0 : new ObjectId(parentId) };

      const files = await dbClient.db.collection('files')
        .find(query)
        .limit(perPage)
        .skip(skipAmount)
        .toArray();

      // Prepare files for the response
      const response = files.map((file) => ({
        id: file._id.toString(),
        userId: file.userId.toString(),
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId.toString(),
      }));

      return res.json(response);
    } catch (error) {
      console.error('Error in getIndex:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putPublish(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      console.log('No userId or invalid');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    // Check if the file exists and belongs to the user before updating
    const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
    if (!file) {
      console.log('File not found');
      return res.status(404).json({ error: 'Not found' });
    }

    // Perform the update if the file is found
    const result = await dbClient.db.collection('files').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { isPublic: true } },
      { returnDocument: 'after' },
    );

    if (result.ok) {
      console.log('File updated');
      return res.status(200).json({
        id: result.value._id.toString(),
        userId: result.value.userId.toString(),
        name: result.value.name,
        type: result.value.type,
        isPublic: result.value.isPublic,
        parentId: result.value.parentId.toString(),
      });
    }
    console.log('Could not update the file');
    return res.status(500).json({ error: 'Could not update the file' });
  }

  static async putUnpublish(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      console.log('No userId or invalid');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { id } = req.params;
      const result = await dbClient.db.collection('files').findOneAndUpdate(
        { _id: new ObjectId(id), userId: new ObjectId(userId) },
        { $set: { isPublic: false } },
        { returnDocument: 'after' },
      );

      if (!result.value) {
        console.log('File not found');
        return res.status(404).json({ error: 'Not found' });
      }

      return res.status(200).json({
        id: result.value._id.toString(),
        userId: result.value.userId.toString(),
        name: result.value.name,
        type: result.value.type,
        isPublic: result.value.isPublic,
        parentId: result.value.parentId.toString(),
      });
    } catch (error) {
      console.error('Error unpublishing file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getFile(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);

    try {
      const { id } = req.params;
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(id) });

      if (!file) {
        console.log('File not found');
        return res.status(404).json({ error: 'Not found' });
      }

      // Check if the file is public or if the requester is the owner
      if (!file.isPublic && (!userId || file.userId.toString() !== userId)) {
        console.log('Unauthorized or not the owner');
        return res.status(404).json({ error: 'Not found' });
      }

      // Check if the file is a folder
      if (file.type === 'folder') {
        return res.status(400).json({ error: "A folder doesn't have content" });
      }

      // Check if the file is locally present
      if (!fs.existsSync(file.localPath)) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Get MIME type and serve file content
      const mimeType = mime.lookup(file.name) || 'application/octet-stream';
      res.type(mimeType);
      fs.createReadStream(file.localPath).pipe(res);
    } catch (error) {
      console.error('Error serving file content:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
export default FilesController;
