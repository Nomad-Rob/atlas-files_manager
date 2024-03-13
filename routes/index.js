// Setting up routes

import { Router } from 'express';
import AppController from '../controllers/AppController.js';

const router = Router();

// Routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

module.exports = router;
