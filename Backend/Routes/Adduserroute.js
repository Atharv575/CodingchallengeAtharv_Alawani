import express from 'express';
import bcrypt from "bcrypt";


const validRoles = ['user', 'admin', 'store_owner', 'System Administrator', 'Normal User'];

// We keep this function wrapper to allow the database client (db) and 
// hashing constant (SALT_ROUNDS) to be passed from app.js.
export default function adminRoutes(db, SALT_ROUNDS) {
    const router = express.Router();

    
    router.get("/users", async (req, res) => {
        try {
            
            const result = await db.query(
                "SELECT userid, name, email, address, role, created_at FROM users ORDER BY userid ASC"
            );

            res.status(200).json(result.rows);

        } catch (error) {
            console.error("Database error fetching users:", error.message);
            res.status(500).json({ message: 'Server error while fetching users' });
        }
    });


   
    router.post("/users", async (req, res) => {
        const { name, email, password, address, role } = req.body;

        
        if (!name || !email || !password || !address || !role) {
            return res.status(400).json({ message: "All fields are required." });
        }
        
        
        if (name.length < 20 || name.length > 60 || address.length > 400) {
            return res.status(400).json({ message: "Name/Address validation failed." });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }
        
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role specified." });
        }

        try {
            // 1. Check if user already exists
            const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
            if (checkResult.rows.length > 0) {
                return res.status(409).json({ message: "Email already exists." });
            }

         
            const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

            
            const result = await db.query(
                "INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING userid, name, email, role, created_at",
                [name, email, passwordHash, address, role]
            );

            const newUser = result.rows[0];

            
            res.status(201).json({ 
                message: "User created successfully!", 
                user: { userid: newUser.userid, name: newUser.name, email: newUser.email, role: newUser.role }
            });

        } catch (error) {
            console.error("Database error during user creation:", error.message);
            res.status(500).json({ message: "Internal server error during user creation." });
        }
    });

    return router;
}