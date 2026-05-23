import { verifyToken } from "../utils/jwt.js";
import { requiredAdmin } from "./adminMiddleware.js";

export function authenticate(req,res,next){
  try {
    const auth = req.headers.authorization || '';
    if(!auth || !auth.startsWith('Bearer ')){
      return res.status(401).json({
        success:false,
        message:"Authentication token missing!"
      })
    }
const token = auth.split(' ')[1];
let payload;
try {
  payload = verifyToken(token);
} catch (error) {
  console.error("🔴 JWT Verification Core Failure:", error.message);
  return res.status(401).json({
    success:false,
    message:'Invalid or Expired token'
  });
} 

req.user = payload;
return next();

  } catch (error) {
    return res.status(500).json({
      success:false,
      message:'Internal Server Error'
    })
  }
};

export default {authenticate};