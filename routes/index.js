// Setting up routes

import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const router = Router();

// Get Routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Post Routes
router.post('/users', UsersController.postNew);


module.exports = router;
