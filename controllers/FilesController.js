import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    // Your existing postUpload method seems correct and is not mentioned in the failing tests.
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    try {
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { parentId = '0', page = 0 } = req.query;
    const perPage = 20;
    const skip = parseInt(page, 10) * perPage;

    if (parentId !== '0' && !ObjectId.isValid(parentId)) {
      return res.status(400).json({ error: 'Invalid parentId' });
    }

    try {
      const query = { 
        userId: new ObjectId(userId), 
        parentId: parentId !== '0' ? new ObjectId(parentId) : 0 
      };

      const files = await dbClient.db.collection('files')
        .find(query)
        .limit(perPage)
        .skip(skip)
        .toArray();

      return res.json(files.map(file => ({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      })));
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
