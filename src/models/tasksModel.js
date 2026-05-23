import { query } from '../config/db.js';

/**
 * Create a new task.
 * @param {{title:string, description:string, status:string, priority:string, due_date:Date, user_id:string}} task
 * @returns {Promise<Object>} inserted task row
 */
export async function createTask(task) {
  const sql = `
    INSERT INTO tasks (title, description, status, priority, due_date, user_id)
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *`;
  
  const values = [
    task.title,
    task.description,
    task.status || 'TODO',
    task.priority || 'MEDIUM',
    task.due_date,
    task.user_id
  ];

  const res = await query(sql, values);
  return res.rows[0];
}

/**
 * Read a task by id.
 * @param {string} task_id
 * @returns {Promise<object|null>}
 */
export async function getTaskById(task_id) {
  const sql = `SELECT * FROM tasks WHERE id = $1`;
  const res = await query(sql, [task_id]);
  return res.rows[0] || null;
}

/**
 * Get all tasks for a specific user.
 * @param {string} userId - UUID string
 * @returns {Promise<Array>} array of task rows
 */
export async function getTasksByUserId(userId) {
  // Good design: Your index (idx_tasks_user_id) makes this lookup lightning fast!
  const sql = `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`;
  const res = await query(sql, [userId]);
  return res.rows;
}


/**
 * Get all tasks (simple list).
 * @returns {Promise<Array>} array of task rows
 */
export async function getAllTasks() {
  const sql = `SELECT * FROM tasks ORDER BY created_at DESC`;
  const res = await query(sql);
  return res.rows;
}


/**
 * Update a task by id. Only allowed fields present in `updates` are changed.
 * @param {string} task_id - UUID of the task
 * @param {object} updates - Object containing the fields to change
 * @returns {Promise<object|null>} updated row or null
 */
export async function updateTaskById(task_id, updates) {
  const set = [];
  const values = [];
  let idx = 1;

  // 1. Define which columns are actually allowed to be updated by the user
  const allowed = [
    'title',
    'description',
    'status',
    'priority',
    'due_date'
  ];

  // 2. Loop through the allowed list and see if they exist in the 'updates' object
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      set.push(`${key} = $${idx++}`);
      values.push(updates[key]);
    }
  }

  // 3. If no valid fields were passed, just return the current task without updating
  if (set.length === 0) {
    // Note: Ensure you have a 'getTaskById' function defined elsewhere
    return getTaskById(task_id); 
  }

  // 4. Build the SQL. The last index ($idx) is reserved for the task_id in the WHERE clause
  const text = `
    UPDATE tasks 
    SET ${set.join(', ')}, updated_at = NOW() 
    WHERE id = $${idx} 
    RETURNING *`;

  // 5. Add the task_id to the values array so it matches the last $ index
  values.push(task_id);

  const res = await query(text, values);
  return res.rows[0] || null;
}

/**
 * Delete a task.
 * @param {string} id - The task UUID
 * @returns {Promise<Object>} deleted task row
 */
export async function deleteTaskById(id) {
  const sql = `DELETE FROM tasks WHERE id = $1 RETURNING *`;
  const res = await query(sql, [id]);
  return res.rows[0];
}

export default {
  createTask,
  getTaskById,
  getTasksByUserId,
  getAllTasks,
  updateTaskById,
 deleteTaskById
};