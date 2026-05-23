import bcrypt from 'bcrypt';
import {generateToken, verifyToken} from '../utils/jwt.js';
import {createUser, findUserByEmail, updateUserById} from '../models/usersModel.js';


/*
    * Register a new user
    * Flow:
    *  - Validate input 
    *  - Check if email exists
    *  - Hash password (bcrypt);
    *  - Insert user into DB
    *  - Return success response
 */

export async function registerController(req, res){
  try {
    const{email, password} = req.body || {};
    // Basic Input validation
    if(!email || !password){
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'});
         }
     
    // Check if email already exists
const existing  = await findUserByEmail(email);
if(existing){
  return res.status(409).json({
    success:false,
    message:'Email already in use'
})
} 

//Hash password

const saltRounds = 10;
const password_hash = await bcrypt.hash(password, saltRounds)


// Insert user into database

const newUser = await createUser({
  email,
  password_hash,
  role: 'USER'
})
// Return success (omit password_hash and verification token)

const{password_hash: _ph, ...userSafe} = newUser;

return res.status(201).json({
  success:true,
  message:'Registration Successful. Login with your credentials.', 
  user:userSafe
})

}
  catch (error) {
    console.error('Error occurred while registering user:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}
/*
 *Login a user and return JWT token.
 Flow:
    - Check login credentials against DB record
    - Validate input
    - Find user by email
    - Compare password with bcrypt
    - If valid, generate JWT token

 */
export async function loginController(req, res){
  try {
    const {email, password} = req.body || {};
    if(!email || !password){
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await findUserByEmail(email);
    if(!user) return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if(!passwordMatch) return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });

      const payload = {
        user_id: user.id,
        role: user.role
      };
      const token = await generateToken(payload, '1h');
      const {password_hash, ...userSafe} = user  || {};
      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: userSafe
        
      });

  } catch (error) {
    console.error('Error occured while Login',error)
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    }); 
  }
}

/*
 * Logout endpoint.
 * Since JWT is stateless, true logout happens on the client by deleting the token.
 * This endpoint verifies the token if provided and returns a success response.
 */

 export async function logoutController(req, res){
    try {
      const auth = req.headers.authorization || '';
      const token = auth && auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;
      if(token){
        try {
          verifyToken(token);
        } catch (error) {
          console.error('Verify token error during logout:', error);
           return res.status(401).json({
            success: false,
            message: 'Logout failed.'
          });
        }
      }
      return res.status(200).json({
        success: true,
        message: 'Logout successful.'
      });
    } catch (error) {
      console.error('Error occurred during logout:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error'
      }); 
    }
  }
   

  /**
   * Reset password using a valid token and new password provided by the user.
   
   */
export async function resetPasswordController(req, res){
   try {
    const {email, newPassword} = req.body || {};
    if(!newPassword) return res.status(400).json({
        success: false,
        message: 'New password is required.'
      });
    if(typeof newPassword !== 'string' || newPassword.length < 8 ) return res.status(400).json({
      success: false,
      message:'Password must be at least 8 characters.'
    })

const user = await findUserByEmail(email);
if(!user) return res.status(404).json({
  success: false,
  message: 'User not found.'
})  
    
const saltRounds = 10;
const password_hash = await bcrypt.hash(newPassword, saltRounds);

await updateUserById(user.id, {password_hash});
return res.status(200).json({
  success: true,
  message: 'Password reset successful.'
})  

} catch (error) {
    console.error('Error occurred during password reset:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    }); 
   }
}

export default {registerController, loginController, logoutController, resetPasswordController}