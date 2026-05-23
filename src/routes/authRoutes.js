import express from 'express';
import { 
  registerController,
  loginController,
  logoutController,
  resetPasswordController
} from '../controllers/authControllers.js';
import {authenticate} from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Create New User Account API.
router.post('/users/register', registerController);

//Public: User Login API. 
router.post('/users/login', loginController);

// User: User Logout API.
router.post('/users/logout', authenticate, logoutController);

// Public: Password Reset API.
router.post('/users/reset', resetPasswordController);

export default router;

