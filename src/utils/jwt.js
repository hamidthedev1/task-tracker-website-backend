import 'dotenv/config'
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

/*
 * Generate a signed JWT for the given payload
 * @param {object} payload. The payload to embed in the token. (e.g{id, role}),
 * @param (string || number) expiresIn = '1h' Expiration for the token (e.g., '1h', '7d' 3600).
 * @returns {string} signed JWT token
 */

export function generateToken(payload, expiresIn = '1h'){
  return jwt.sign(payload, JWT_SECRET, {expiresIn})
}
/*
 *  verify a JWT and return the decoded payload.
Throws an invalid/expired token.
* @param {string} token - JWT  string to verify
* @returns {object} decode payload token.
 */

export function verifyToken(token){

  return jwt.verify(token, JWT_SECRET)
}


export default {generateToken, verifyToken }