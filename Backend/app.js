import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import adminRoutes from "./Routes/Adduserroute.js";
import {authenticateToken} from "./Middleware/Authenticatetoken.js"
import storeRoutes from "./Routes/Generalroutes.js";

env.config();

const app = express();
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true, 
}));
app.use(express.json());
app.use(cookieParser()); 

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
db.connect()
   .then(() => console.log('Connected to PostgreSQL Database'))
.catch(err => console.error('Database connection error', err.stack));


/*  'users' table structure
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(400),
    role VARCHAR(50) NOT NULL DEFAULT "Normal User", 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
*/


const generateToken = (user) => {
 
    const payload = {
        userid: user.userid, 
        email: user.email,
        role: user.role 
    };

   
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
};


const setJwtCookie = (res, token) => {
    res.cookie('jwt', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'Strict', 
        maxAge: 24 * 60 * 60 * 1000 
    });
};





// inn this app.js I have written all the authentication related routes like signup/login/logout me route for fetchin the current user from cookie
app.post("/api/auth/signup", async (req, res) => {
    const { name, email, address, password } = req.body;

   
    if (!name || !email || !address || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }
    
    if (name.length < 20 || name.length > 60) {
        return res.status(400).json({ message: "Name must be 20-60 characters." });
    }
    if (address.length > 400) {
        return res.status(400).json({ message: "Address cannot exceed 400 characters." });
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "Password must be 8-16 characters with at least 1 uppercase and 1 special character." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format." });
    }
    
   
    try {
        
        const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (checkResult.rows.length > 0) {
            return res.status(409).json({ message: "Email already registered." });
        }

        
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

       
        const role = "Normal User"; 
        const result = await db.query(
            "INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING userid, name, email, role, created_at",
            [name, email, passwordHash, address, role]
        );

        const newUser = result.rows[0];

      
        const token = generateToken(newUser);
        setJwtCookie(res, token);

     
        res.status(201).json({ 
            message: "User registered successfully!", 
            user: {
                userid: newUser.userid, 
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            }
        });

    } catch (err) {
        console.error("Database error during signup:", err.message);
        res.status(500).json({ message: "Internal server error during registration." });
    }
});



app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // Find the user by email
        const result = await db.query(
            "SELECT userid, name, email, password_hash, role FROM users WHERE email = $1", 
            [email]
        );
        
        const user = result.rows[0];

        if (!user) {
           
            return res.status(401).json({ message: "Invalid email or password." });
        }

        
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
          
            return res.status(401).json({ message: "Invalid email or password." });
        }

       
        const token = generateToken(user);
        setJwtCookie(res, token);

     
        res.status(200).json({
            message: "Login successful!",
            user: {
                userid: user.userid, 
                name: user.name,
                email: user.email,
                role: user.role,
            }
        });
        console.log(user);

    } catch (err) {
        console.error("Database error during login:", err.message);
        console.log(err.message);
        res.status(500).json({ message: "Internal server error during login." });
    }
});




app.get("/api/me", authenticateToken, async (req, res) => {
   
    const userId = req.user.userid; 
     console.log(userId);
    try {
       
        const result = await db.query(
            "SELECT userid, name, email, address, role, created_at FROM users WHERE userid = $1",
            [userId]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: "User not found in database." });
        }
        
       
        res.status(200).json(user);

    } catch (error) {
        console.error("Error in /api/me route:", error);
        res.status(500).json({ message: "Internal server error while fetching user data." });
    }
});

//for adduserroute.js
const adminRouter = adminRoutes(db, SALT_ROUNDS);
app.use("/api/admin", authenticateToken,adminRouter);


//for generalroutes.js
const storerouter = storeRoutes(db);
app.use("/api",authenticateToken,storerouter);


app.post("/api/logout", (req, res) => {
    try {
     
        res.clearCookie("jwt", {
            httpOnly: true,
           
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'Strict', 
        });
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Logout failed" });
    }
});


export default app;
