import { findAllUsers, deleteUserById } from "../models/usersModel.js";

/**
 * Admin-only controller to fetch all users. In a real application, this would be protected by authentication and authorization middleware.
 */
export async function readAllUsersController(req, res){
    try {
        const users = await findAllUsers();
        // Omit sensitive fields like password_hash and verification_token before sending response
        const usersSafe = users.map(user => {
            const { password_hash, ...userSafe } = user || {};
            return userSafe;
        });
        return res.status(200).json({
            success: true,
            users: usersSafe
        })
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    } 
}

/**
 * Admin-only controller to delete a user by ID. In a real application, this would be protected by authentication and authorization middleware.
 */
export async function deleteUserByIdController(req, res){
    try {
        const userId = req.params.userId;
        	// Optional: Simple UUID v4 validation regex
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(userId)) {
			return res.status(400).json({ success: false, message: 'Invalid user UUID' });
		}
        const deletedUser = await deleteUserById(userId);
        if(!deletedUser){
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

      return res.status(200).json({
        success:true,
        message: 'User deleted successfully.'
      })

      } catch (error) {
        console.error('Error deleting user:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error'
      });
     }   

}

export default { readAllUsersController, deleteUserByIdController}