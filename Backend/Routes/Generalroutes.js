
import express from 'express';

import bcrypt from "bcrypt";

//In this function i have added all the routes except the authentication and and adduser via admin route.
export default function storeRoutes(db) {
    const router = express.Router();



    
    router.post('/stores', async (req, res) => {
       
        const authenticatedUser = req.user; 
        const { storeName, storeAddress, contactNo, storeOwnerId } = req.body;

        if (!storeName || !storeAddress || !contactNo) {
            return res.status(400).json({ message: "Missing required store fields." });
        }

        let targetUserId;

        try {
           
            if (authenticatedUser.role === 'admin') {
                if (!storeOwnerId) {
                    return res.status(400).json({ message: "Admin must specify storeOwnerId." });
                }
                
                targetUserId = storeOwnerId;
                
                
                const userCheckSql = "SELECT role FROM users WHERE userid = $1";
                const userCheckResult = await db.query(userCheckSql, [targetUserId]);

                if (userCheckResult.rows.length === 0) {
                    return res.status(404).json({ message: `User ID '${targetUserId}' not found.` });
                }
                
                const userRole = userCheckResult.rows[0].role;
                
                if (userRole !== 'store_owner') {
                    
                    return res.status(403).json({ 
                        message: `User ID '${targetUserId}' exists but is not a 'store_owner' (role found: ${userRole}).` 
                    });
                }
               

            } else if (authenticatedUser.role === 'store_owner') {
                targetUserId = authenticatedUser.id;
            } else {
               
                return res.status(403).json({ message: "Access denied. Only Admins and Store Owners can register stores." });
            }

            
            const sql = `
                INSERT INTO stores (storeName, storeAddress, contactNo, userId)
                VALUES ($1, $2, $3, $4)
                RETURNING storeId
            `;
            const values = [storeName, storeAddress, contactNo, targetUserId];

            const result = await db.query(sql, values);
            
            const newStoreId = result.rows[0].storeId;

            res.status(201).json({
                storeId: newStoreId,
                storeName,
                storeAddress,
                contactNo,
                userId: targetUserId
            });

        } catch (dbError) {
            console.error("Database error creating store:", dbError);
           
            if (dbError.code === '23503') {
                return res.status(400).json({ message: "Specified Store Owner ID is invalid or does not exist." });
            }
            res.status(500).json({ message: "Failed to create store due to a server error." });
        }
    });

   
    
    router.get('/stores/values', async (req, res) => {
        
        const authenticatedUser = req.user;

    

        let sql = `
            SELECT storeid, storename, storeaddress, contactno, userid, created_at
            FROM stores
        `;
        let values = [];

        if (authenticatedUser.role === 'store_owner') {
            sql += ` WHERE userId = $1`;
            values.push(authenticatedUser.id);
        } 
       
        

        try {
            const result = await db.query(sql, values);
            const stores = result.rows;

            res.status(200).json(stores);

        } catch (dbError) {
            console.error("Database error fetching stores:", dbError);
            res.status(500).json({ message: "Failed to retrieve stores." });
        }
    });

    //ratings

    router.post('/ratings', async (req, res) => {
       
        const userId = req.user.userid; 
        
       
        const { storeId, rating } = req.body; 
    
       
        if (!storeId || typeof storeId !== 'number' || !rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return res.status(400).send({ message: 'Invalid storeId or rating value (must be an integer 1-5).' });
        }
    
        try {
         
            const query = `
                INSERT INTO ratings (userid, storeid, rating)
                VALUES ($1, $2, $3)
                ON CONFLICT (userid, storeid) 
                DO UPDATE SET 
                    rating = EXCLUDED.rating,
                    rated_at = CURRENT_TIMESTAMP
                RETURNING *;
            `;
            
         
             const result = await db.query(query, [userId, storeId, rating]);
            
            res.status(200).send({ message: 'Rating saved/updated successfully.' });
            
        } catch (error) {
            console.error('Error saving rating:', error);
          
            res.status(500).send({ message: 'Failed to save rating. Database error.', error: error.message });
        }
    });



    router.get('/owned-stores',async (req, res) => {
       
        const ownerUserId = req.user.userid; 
    
        try {
           
            const query = `
                SELECT
                    r.ratingid,
                    r.rating,
                    r.rated_at,
                    s.storeid,
                    s.storename,
                    s.storeaddress,
                    u.userid AS rated_by_userid,
                    u.name AS rated_by_username, -- Assuming 'username' is a column in the users table
                    u.email AS rated_by_email,       -- Assuming 'email' is a column in the users table
                    -- Calculate average rating for the store (optional, but valuable for reporting)
                    AVG(r.rating) OVER (PARTITION BY s.storeid) AS average_store_rating
                FROM 
                    ratings r
                JOIN 
                    stores s ON r.storeid = s.storeid
                JOIN 
                    users u ON r.userid = u.userid
                WHERE 
                    s.userid = $1 -- CRITICAL: Filter stores only if they belong to the authenticated owner
                ORDER BY
                    s.storeid, r.rated_at DESC;
            `;
            
           
             const result = await db.query(query, [ownerUserId]);
             const ratingsData = result.rows;
    
            

            if (ratingsData.length === 0) {
                return res.status(200).send({ message: 'No ratings found for your stores.', ratings: [] });
            }
    
            res.status(200).send(ratingsData);
            
        } catch (error) {
            console.error('Error fetching owned store ratings:', error);
            res.status(500).send({ message: 'Failed to fetch ratings. Database error.' });
        }
    });


    router.post('/change-password', async (req, res) => {
        const userId = req.user.userid; 
        const { oldPassword, newPassword } = req.body;
    
        if (!oldPassword || !newPassword) {
            return res.status(400).send({ message: 'Missing oldPassword or newPassword.' });
        }
    
       
        try {
            const userQuery = 'SELECT password_hash FROM users WHERE userid = $1;';
             const result = await db.query(userQuery, [userId]); 
            
           
    
            if (result.rows.length === 0) {
                return res.status(404).send({ message: 'User not found.' });
            }
    
            const hashedPassword = result.rows[0].password_hash;
    
            
            const isMatch = await bcrypt.compare(oldPassword, hashedPassword);
    
            if (!isMatch) {
                return res.status(401).send({ message: 'Incorrect current password.' });
            }
    
            
            const salt = await bcrypt.genSalt(10); 
            const newHashedPassword = await bcrypt.hash(newPassword, salt);
    
            
            const updateQuery = 'UPDATE users SET password_hash = $1 WHERE userid = $2 RETURNING userid;';
             await db.query(updateQuery, [newHashedPassword, userId]); 
    
           
            res.status(200).send({ message: 'Password updated successfully.' });
    
        } catch (error) {
            console.error('Error changing password:', error);
            res.status(500).send({ message: 'Server error during password change.' });
        }
    });
    

    router.get('/values',async (req, res) => {
       
        const queryText = `
            SELECT
                s.storeid,
                s.storename,
                s.storeaddress,
                s.contactno,
                u.email AS "ownerEmail",
                COALESCE(AVG(r.rating), 0) AS "averageRating"
            FROM
                stores s
            LEFT JOIN
                users u ON s.userid = u.userid
            LEFT JOIN
                ratings r ON s.storeid = r.storeid
            GROUP BY
                s.storeid, s.storename, s.storeaddress, s.contactno, u.email
            ORDER BY
                s.storeid;
        `;
    
        try {
            const result = await db.query(queryText); 
    
            
            res.status(200).json(result.rows);
    
        } catch (error) {
            console.error('Database query error:', error);
            res.status(500).send({ message: 'Error fetching store details.' });
        }
    });


    router.get('/stats', async (req, res) => {
    
        
        const queries = {
            totalUsers: 'SELECT COUNT(*) FROM users;',
            totalStores: 'SELECT COUNT(*) FROM stores;',
            totalRatings: 'SELECT COUNT(*) FROM ratings;'
        };
    
        try {
          
            
            const [usersResult, storesResult, ratingsResult] = await Promise.all([
                db.query(queries.totalUsers),
                db.query(queries.totalStores),
                db.query(queries.totalRatings)
            ]);
            
            const stats = {
                totalUsers: parseInt(usersResult.rows[0].count, 10),
                totalStores: parseInt(storesResult.rows[0].count, 10),
                totalRatings: parseInt(ratingsResult.rows[0].count, 10)
            };
            
            
          
            
            res.status(200).json(stats);
    
        } catch (error) {
            console.error('Error fetching dashboard statistics:', error);
           
            res.status(500).send({ message: 'Server error while retrieving statistics.' });
        }
    });

    return router;
}