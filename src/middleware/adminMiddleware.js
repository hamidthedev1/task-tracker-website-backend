// Admin middleware: esnsures the the authenticated user has admin privilage.
// By default this checks for role.id === 1, but the admin role id
// can be overridden with the ADMIN_ROLE_ID env variable.

export function requiredAdmin(req,res,next){
  try {
    const user = req.user;
    if(!user)
      return res.status(401).json({
    success:false,
    message:'Authentication required'
      });

      const adminRole = process.env.ADMIN_ROLE ? process.env.ADMIN_ROLE:'ADMIN';
      if(typeof user.role === 'undefined' || user.role === 'null' || user.role !== adminRole){
        return res.status(403).json({
         success:false,
         message:'Admin access required'
        })
      }
      
      return next();
  } catch (error) {
    console.error('requiredAdmin middleware error', error)
    return res.status(500).json({
      success:false,
      message:'Internal Server Error'
    })
  }
}

export default (requiredAdmin);