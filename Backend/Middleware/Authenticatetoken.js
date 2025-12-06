import jwt from "jsonwebtoken";
import env from "dotenv";


env.config(); 
const JWT_SECRET = process.env.JWT_SECRET;

/*
  I have created Middleware to authenticate the user using the JWT from the HTTP-only cookie.
 */
export const authenticateToken = (req, res, next) => {
    // Check for token in the HTTP-only cookie (Primary method)
    const token = req.cookies.jwt;
    
    if (token == null) {
        return res.status(401).json({ message: "Authentication required. No JWT cookie found." });
    }

    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
           
            return res.status(403).json({ message: "Invalid or expired token." });
        }
        
       
        req.user = user;
        console.log("Decoded JWT user:", user);
        next();
    });
};
/**
 * Middleware to authorize access only for specific Admin roles.
 */
export const authorizeAdmin = (req, res, next) => {
    const requiredRoles = ['admin']; 
    
    if (!req.user || !requiredRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: Administrator access required." });
    }
    next();
};

