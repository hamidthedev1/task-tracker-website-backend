import { 
  createTask, 
  getAllTasks,
getTasksByUserId,
getTaskById,
updateTaskById, 
deleteTaskById
 } from '../models/tasksModel.js';

/**
 * Create a new task for the authenticated user.
 * Flow:
 *  - Validate required fields (title)
 *  - Pull the user_id from the authenticated request (set by your auth middleware)
 *  - Insert into the database using the model
 *  - Return the newly created task
 */
export async function createTaskController(req, res) {
  try {
    const { title, description, status, priority, due_date } = req.body || {};

    // 1. Basic Input Validation
    // 'title' is marked as NOT NULL in your SQL schema, so it is strictly required.
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required.'
      });
    }

    // 2. Identify the Owner of the Task When a user is logged in via JWT, your auth middleware should decode the token and attach the user's details to 'req.user'. 
    const { user_id } = req.user || {}; 

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User identification missing.'
      });
    }

    // 3. Package the data for the model
    const newTaskData = {
      title,
      description,
      status,       // If undefined, the model will fall back to 'TODO'
      priority,     // If undefined, the model will fall back to 'MEDIUM'
      due_date,
      user_id
    };

    // 4. Call the model function to insert into PostgreSQL
    const createdTask = await createTask(newTaskData);

    // 5. Return success with the complete task row (including generated UUID and timestamps)
    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: createdTask
    });

  } catch (error) {
    console.error('Error occurred while creating task:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}

/**
 * Admin controller: to read all tasks.
 */
export async function getAllTasksController(req, res) {
  try {
    // This function should only be accessible to admin users.
    // You can enforce this in your route definition using an 'requiredAdmin' middleware.
    const tasks = await getAllTasks(); // You would need to implement this function in your model.
    return res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully.',
      data:tasks
    });
  } catch (error) {
    console.error('Error occurred while fetching tasks:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal Server Error' 
    });
  }
}

/**
 * User controller: to read tasks for a specific authenticated user.
 */
export async function getTasksByUserIdController(req, res) {
  try {
    // 1. Extract userId from the URL parameters (Match the exact variable casing)
    const { userId } = req.params || {};

    // 2. Ensure auth middleware ran successfully
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in first.'
      });
    }

    // 3. Authorization enforcement 
    if (userId !== req.user.user_id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access these tasks.'
      });
    }

    // 4. Fetch the data using the validated userId
    const tasks = await getTasksByUserId(userId);
    
    return res.status(200).json({
      success: true,
      message: 'All authorized Tasks retrieved successfully.',
      data: tasks
    });

  } catch (error) {
    console.error('Error occurred while fetching user tasks:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}

/**
 * User Controller: Read a specific task by its ID for an authenticated user.
 * Ensures users can only view their own tasks (Admins bypass this check).
 */
export async function getTaskByTaskIdController(req, res) {
  try {
    // 1. Extract task_id from URL parameters
    const { task_id } = req.params || {};

    // 2. Fetch the task from the database
    const task = await getTaskById(task_id);

    // 3. If the task doesn't exist, return 404 immediately
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.'
      });
    }

    // 4. 🔒 SECURITY GUARD: Verify Ownership or Admin Role
    // 'task.user_id' comes from the database row.
    // 'req.user.user_id' comes from your verified JWT token.
    if (task.user_id !== req.user.user_id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to view this task.'
      });
    }

    // 5. If they own it (or are an admin), return the data safely
    return res.status(200).json({
      success: true,
      message: 'Task retrieved successfully.',
      data: task
    });

  } catch (error) {
    console.error('Error occurred while fetching task:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}

/**
 * User Controller: Update a specific task by its ID for an authenticated user.
 * Ensures users can only update their own tasks (Admins bypass this check).
 * Flow:  
 * - Extract task_id from URL parameters
 * - Validate input fields (title, description, status, priority, due_date)
 * - Fetch the existing task to verify ownership
 * - If authorized, call the model function to update the task in the database
 * - Return the updated task data
 */
export async function updateTaskByTaskIdController(req, res) {
  try {
    // 1. Extract task_id from URL parameters
    const { task_id } = req.params || {}; 
    // 2. Extract fields to update from the request body
    const { title, description, status, priority, due_date } = req.body || {};
    // 3. Fetch the existing task to verify ownership and existence
    const taskToUpdate = await getTaskById(task_id);
    if (!taskToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.'
      });
    }
    // 4. 🔒 SECURITY GUARD: Verify Ownership or Admin Role
    if (taskToUpdate.user_id !== req.user.user_id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to update this task.'
      });
    }
    // 5. Package the data for the model (only include fields that are provided)
    const updatedTaskData = {
      title,
      description,
      status,
      priority,
      due_date
    };
    // 6. Call the model function to update the task in the database
    const updatedTask = await updateTaskById(task_id, updatedTaskData);
    // 7. Return the updated task data
    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: updatedTask
    });
  }
  catch (error) {
    console.error('Error occurred while updating task:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  } 
}

/**
 * User controller: Delete a specific task by its ID for an authenticated user.
 * 
 */

export async function deleteTaskByTaskIdController(req, res) {
  try {
    const { task_id } = req.params || {};
    const taskToDelete = await getTaskById(task_id);  
if(!taskToDelete) { 
  return res.status(404).json({
  success:false,
  message:'Task not found.'
})
}
// 🔒 SECURITY GUARD: Verify Ownership or Admin Role
if (taskToDelete.user_id !== req.user.user_id && req.user.role !== 'ADMIN') {
  return res.status(403).json({
    success: false,
    message: 'Forbidden. You do not have permission to delete this task.'
  });
}
const deletedTask = await deleteTaskById(task_id);
return res.status(200).json({
  success: true,
  message: 'Task deleted successfully.',
  data: deletedTask
}); 

  }
catch(error){
console.error('Error occurred while deleting task:', error);
return res.status(500).json({ 
  success:false,
  message:'Internal Server Error'
})
}
}

export default { 
  createTaskController, getAllTasksController, getTasksByUserIdController,getTaskByTaskIdController, updateTaskByTaskIdController,
  deleteTaskByTaskIdController
 }