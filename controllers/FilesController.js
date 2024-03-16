import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {

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
        userId: new ObjectId(userId)
      });
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.json({
        id: file._id.toString(), // Ensure ID is stringified
        userId: file.userId.toString(), // Ensure userId is stringified
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId.toString(), // Ensure parentId is stringified or handled appropriately if "0"
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

    const { parentId = '0', page = '0' } = req.query;
    const perPage = 20;
    const skip = parseInt(page, 10) * perPage;

    try {
      const query = {
        userId: new ObjectId(userId),
        // Adjust the query to handle '0' as a special case for parentId
        parentId: parentId !== '0' ? new ObjectId(parentId) : '0',
      };

      const files = await dbClient.db.collection('files')
        .find(query)
        .limit(perPage)
        .skip(skip)
        .toArray();

      return res.json(files.map(file => ({
        id: file._id.toString(), // Ensure ID is stringified
        userId: file.userId.toString(), // Ensure userId is stringified
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        // Ensure parentId is '0' or stringified ObjectId, handling nulls or undefined correctly
        parentId: file.parentId ? file.parentId.toString() : '0',
      })));
    } catch (error) {
      console.error('Error retrieving files:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
