import express from 'express';
import {
  readAllUsersController,
  deleteUserByIdController
} from '../controllers/usersControllers.js';

import { authenticate } from '../middleware/authMiddleware.js';
import {requiredAdmin} from '../middleware/adminMiddleware.js';

const router = express.Router();

// Admin: Get All Users API.
router.get('/admin/users', authenticate, requiredAdmin, readAllUsersController);

// Admin: Delete User by ID API.
router.delete('/admin/users/:userId', authenticate, requiredAdmin, deleteUserByIdController);



export default router;

