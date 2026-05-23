import express from 'express';

import {
  createTaskController,
  getAllTasksController, 
  getTasksByUserIdController,
  getTaskByTaskIdController, 
  updateTaskByTaskIdController,
  deleteTaskByTaskIdController
} from '../controllers/tasksControllers.js';
import { authenticate } from '../middleware/authMiddleware.js';
import{ requiredAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Admin: Get all tasks (Admin only)
router.get('/', authenticate, requiredAdmin, getAllTasksController);

// User: Create a new task
router.post('/', authenticate, createTaskController);


// User -> Get all tasks belonging to a specific user ID
// ⚠️ Remember: 'userId' here matches the camelCase extraction in your controller!
router.get('/user/:userId', authenticate, getTasksByUserIdController);

// User -> Fetch one specific task row by its database ID
router.get('/:task_id', authenticate, getTaskByTaskIdController);

// User: Update a specific task by its ID for the authenticated user
router.patch('/:task_id', authenticate, updateTaskByTaskIdController);

// User: Delete a specific task by its ID for the authenticated user
router.delete('/:task_id', authenticate, deleteTaskByTaskIdController);

export default router;