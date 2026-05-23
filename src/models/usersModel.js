import { query } from '../config/db.js';

/*
 * Create a new user.
 * @param{{email:string, password:string, role:string}} user
 * @returns {Promise<Object>} inserted user row
 */

export async function createUser(user) {
  const sql = `INSERT INTO "users" (email,    password_hash, role)
  VALUES ($1,$2,$3) RETURNING *`;
  const values = [
    user.email,
    user.password_hash,
    user.role
  ];
  const res = await query(sql, values);
  return res.rows[0]
}

/**
 *  Get a user by user id.
 * @param {number} user_id
 * @ returns {Promise<Object> || null}
 */

export async function findUserByUserId(user_id) {
  const sql =  `SELECT * FROM "users" WHERE id =$1`;
  const res = await query(sql, [user_id]);
  return res.rows[0] || null;
}

/**
 *  Get a user by email.
 * @param {string} email
 * @ returns {Promise<Object> || null}
 */

export async function findUserByEmail(email) {
  const sql =  `SELECT * FROM "users" WHERE email =$1`;
  const res = await query(sql, [email]);
  return res.rows[0] || null;
}

/**
 * Get all users(simple list).
 * @returns {Promise<Object>} array of users.
 * 
 */

export async function findAllUsers() {
  const sql =  `SELECT * FROM "users" ORDER BY id`;
  const res = await query(sql);
  return res.rows;
}

// Not robust 
/**
 * Update a user by id. Only fields present in `updates` are changed.
 * @param {number} user_id
 * @param {object} updates
 * @returns {Promise<object|null>} updated row or null
 */
export async function updateUserById(user_id, updates) {
	const sql = [];
	const values = [];
	let idx = 1;
	const allowed = [
		'email',
		'password_hash',
		'role',
	];
	for (const key of allowed) {
		if (Object.prototype.hasOwnProperty.call(updates, key)) {
			sql.push(`${key} = $${idx++}`);
			values.push(updates[key]);
		}
	}
	if (sql.length === 0) return findUserByUserId(user_id);

	const text = `UPDATE "users" SET ${sql.join(', ')} WHERE id = $${idx} RETURNING *`;
	values.push(user_id);
	const res = await query(text, values);
	return res.rows[0] || null;
}

/*
 * Delete a user by id.
 * @param {string} user_id
 * @returns {Promise<Object>} true if deleted
 */

export async function deleteUserById(user_id) {
  const sql = `DELETE FROM "users" WHERE id =$1`;
  const res = await query(sql, [user_id]);
  return res.rowCount > 0;
}