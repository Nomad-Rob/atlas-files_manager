import { imageThumbnail } from 'image-thumbnail';
import Queue from 'bull';
import dbClient from './utils/db';

// Create a Bull queue fileQueue
const fileQueue = new Queue('file processing');

// Process this queue
fileQueue.process(async (job) => {
  // If fileId is not present in the job, raise an error Missing fileId
  if (!job.data.fileId) {
    throw new Error('Missing fileId');
  }
  
  // If userId is not present in the job, raise an error Missing userId
  if (!job.data.userId) {
    throw new Error('Missing userId');
  }

  // If no document is found in DB based on the fileId and userId, raise an error File not found
  const file = await dbClient.db.collection('files').findOne({
    _id: new ObjectId(job.data.fileId),
    userId: new ObjectId(job.data.userId),
  });
  if (!file) {
    throw new Error('File not found');
  }

  // Generate thumbnails with width = 500, 250 and 100
  const thumbnail500 = await imageThumbnail(file.localPath, { width: 500 });
  const thumbnail250 = await imageThumbnail(file.localPath, { width: 250 });
  const thumbnail100 = await imageThumbnail(file.localPath, { width: 100 });

  // Store each result on the same location of the original file by appending _<width size>
  const path500 = file.localPath.replace(/\.[^/.]+$/, '_500$&');
  const path250 = file.localPath.replace(/\.[^/.]+$/, '_250$&');
  const path100 = file.localPath.replace(/\.[^/.]+$/, '_100$&');

  await Promise.all([
    fs.promises.writeFile(path500, thumbnail500),
    fs.promises.writeFile(path250, thumbnail250),
    fs.promises.writeFile(path100, thumbnail100),
  ]);
});