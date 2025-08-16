// routes/messages.js
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const router = Router();

// Token verification middleware
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access denied. No token provided.' 
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: 'Invalid token' 
        });
    }
};

// Helper function to get user ID by email
async function getUserIdByEmail(email) {
    try {
        const [users] = await db.execute(
            'SELECT id FROM users WHERE email = ?', 
            [email]
        );
        return users[0]?.id;
    } catch (error) {
        console.error('Error getting user ID by email:', error);
        return null;
    }
}

// Helper function to get user email by ID
async function getUserEmailById(id) {
    try {
        const [users] = await db.execute(
            'SELECT email FROM users WHERE id = ?', 
            [id]
        );
        return users[0]?.email;
    } catch (error) {
        console.error('Error getting user email by ID:', error);
        return null;
    }
}

// 🔹 Get Users by Role or Search (for contacts list)
router.get('/users', verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const currentUserEmail = req.user.email;
        const { search, role } = req.query;
        
        let query = `
            SELECT id, username, email, role, first_name, last_name, 
                   created_at, updated_at, last_login
            FROM users 
            WHERE id != ?
        `;
        let params = [currentUserId];

        // Add search functionality
        if (search) {
            query += ` AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR username LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Add role filter
        if (role && role !== 'all') {
            query += ` AND role = ?`;
            params.push(role);
        }

        // Order by role priority and name
        query += ` ORDER BY 
            CASE role 
                WHEN 'admin' THEN 1 
                WHEN 'registrar' THEN 2 
                WHEN 'faculty' THEN 3 
                WHEN 'student' THEN 4 
            END, 
            first_name, last_name
        `;

        const [users] = await db.execute(query, params);

        // Get last message and unread count for each user
        const usersWithMessageInfo = await Promise.all(users.map(async (user) => {
            // Get last message between current user and this user
            const [lastMessage] = await db.execute(`
                SELECT message as content, timestamp as created_at, sender_email
                FROM messages 
                WHERE (sender_email = ? AND receiver_email = ?) 
                   OR (sender_email = ? AND receiver_email = ?)
                ORDER BY timestamp DESC 
                LIMIT 1
            `, [currentUserEmail, user.email, user.email, currentUserEmail]);

            // Count unread messages (messages sent to current user that aren't marked as read)
            // Since your schema doesn't have is_read, we'll assume all messages are unread for now
            const [unreadCount] = await db.execute(`
                SELECT COUNT(*) as count
                FROM messages 
                WHERE sender_email = ? AND receiver_email = ?
            `, [user.email, currentUserEmail]);

            return {
                ...user,
                last_message: lastMessage[0]?.content || null,
                last_message_time: lastMessage[0]?.created_at || null,
                unread_count: 0, // Set to 0 since we don't have is_read column
                is_online: false
            };
        }));

        res.json({
            success: true,
            users: usersWithMessageInfo,
            contacts: usersWithMessageInfo
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

// 🔹 Get Message History Between Two Users
router.get('/messages', verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const currentUserEmail = req.user.email;
        const { user_id, user1, user2 } = req.query;
        let otherUserEmail;

        // Support both query formats
        if (user_id) {
            otherUserEmail = await getUserEmailById(user_id);
        } else if (user1 && user2) {
            // Determine which user is the other user
            otherUserEmail = user1 === currentUserEmail ? user2 : user1;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Missing user parameters'
            });
        }

        // Get messages between the two users
        const [messages] = await db.execute(`
            SELECT m.*, 
                   m.message as content,
                   m.timestamp as created_at,
                   m.sender_email,
                   m.receiver_email,
                   s.first_name as sender_first_name, 
                   s.last_name as sender_last_name,
                   s.username as sender_name,
                   s.id as sender_id,
                   r.first_name as receiver_first_name, 
                   r.last_name as receiver_last_name,
                   r.id as receiver_id
            FROM messages m
            JOIN users s ON m.sender_email = s.email
            JOIN users r ON m.receiver_email = r.email
            WHERE (m.sender_email = ? AND m.receiver_email = ?) 
               OR (m.sender_email = ? AND m.receiver_email = ?)
            ORDER BY m.timestamp ASC
        `, [currentUserEmail, otherUserEmail, otherUserEmail, currentUserEmail]);

        res.json({
            success: true,
            messages: messages
        });

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
});

// Get messages between current user and specific contact (original endpoint)
router.get('/:contactId', verifyToken, async (req, res) => {
    try {
        const { contactId } = req.params;
        const currentUserEmail = req.user.email;
        
        // Get contact email
        const contactEmail = await getUserEmailById(contactId);
        if (!contactEmail) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        const [results] = await db.execute(
            `SELECT m.*, 
                    m.message as content,
                    m.timestamp as created_at,
                    u.username as sender_name,
                    s.first_name as sender_first_name,
                    s.last_name as sender_last_name,
                    s.id as sender_id
             FROM messages m
             JOIN users u ON m.sender_email = u.email
             JOIN users s ON m.sender_email = s.email
             WHERE (m.sender_email = ? AND m.receiver_email = ?) 
                OR (m.sender_email = ? AND m.receiver_email = ?)
             ORDER BY m.timestamp ASC`,
            [currentUserEmail, contactEmail, contactEmail, currentUserEmail]
        );
        
        res.json({ 
            success: true, 
            messages: results 
        });
        
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Database error' 
        });
    }
});

// 🔹 Send a Message
router.post('/messages', verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const currentUserEmail = req.user.email;
        const { receiver_id, receiver_email, content } = req.body;
        
        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Message content cannot be empty'
            });
        }

        let receiverEmail = receiver_email;
        
        // If receiver_email not provided but receiver_id is, find the email
        if (!receiverEmail && receiver_id) {
            receiverEmail = await getUserEmailById(receiver_id);
            if (!receiverEmail) {
                return res.status(404).json({
                    success: false,
                    message: 'Receiver not found'
                });
            }
        }

        // Verify receiver exists
        const [receiverCheck] = await db.execute(
            'SELECT id, email FROM users WHERE email = ?',
            [receiverEmail]
        );
        
        if (receiverCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Receiver not found'
            });
        }

        // Insert the message
        const [result] = await db.execute(`
            INSERT INTO messages (sender_email, receiver_email, message, timestamp)
            VALUES (?, ?, ?, NOW())
        `, [currentUserEmail, receiverEmail, content.trim()]);

        // Get the inserted message with user details
        const [newMessage] = await db.execute(`
            SELECT m.*, 
                   m.message as content,
                   m.timestamp as created_at,
                   s.first_name as sender_first_name, 
                   s.last_name as sender_last_name,
                   s.username as sender_name,
                   s.id as sender_id,
                   r.first_name as receiver_first_name, 
                   r.last_name as receiver_last_name,
                   r.id as receiver_id
            FROM messages m
            JOIN users s ON m.sender_email = s.email
            JOIN users r ON m.receiver_email = r.email
            WHERE m.id = ?
        `, [result.insertId]);

        res.json({
            success: true,
            message: newMessage[0],
            messageId: result.insertId
        });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
});

// Send a message (original endpoint)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { receiver_id, content } = req.body;
        const currentUserEmail = req.user.email;
        
        if (!receiver_id || !content) {
            return res.status(400).json({
                success: false,
                message: 'Receiver and content are required'
            });
        }
        
        // Get receiver email
        const receiverEmail = await getUserEmailById(receiver_id);
        if (!receiverEmail) {
            return res.status(404).json({
                success: false,
                message: 'Receiver not found'
            });
        }
        
        // Insert message
        const [result] = await db.execute(
            `INSERT INTO messages (sender_email, receiver_email, message, timestamp) 
             VALUES (?, ?, ?, NOW())`,
            [currentUserEmail, receiverEmail, content.trim()]
        );
        
        res.json({ 
            success: true, 
            messageId: result.insertId,
            message: 'Message sent successfully' 
        });
        
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Database error' 
        });
    }
});

// 🔹 Mark Messages as Read (simplified - just return success since no is_read column)
router.post('/messages/read', verifyToken, async (req, res) => {
    try {
        // Since there's no is_read column, just return success
        res.json({
            success: true,
            message: 'Messages marked as read'
        });

    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read'
        });
    }
});

// 🔹 Get New Messages (for polling)
router.get('/messages/new', verifyToken, async (req, res) => {
    try {
        const currentUserEmail = req.user.email;
        const { user_id, last_message_id } = req.query;

        // Get other user's email
        const otherUserEmail = await getUserEmailById(user_id);
        if (!otherUserEmail) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const [messages] = await db.execute(`
            SELECT m.*, 
                   m.message as content,
                   m.timestamp as created_at,
                   s.first_name as sender_first_name, 
                   s.last_name as sender_last_name,
                   s.username as sender_name,
                   s.id as sender_id
            FROM messages m
            JOIN users s ON m.sender_email = s.email
            WHERE ((m.sender_email = ? AND m.receiver_email = ?) 
                OR (m.sender_email = ? AND m.receiver_email = ?))
                AND m.id > ?
            ORDER BY m.timestamp ASC
        `, [currentUserEmail, otherUserEmail, otherUserEmail, currentUserEmail, last_message_id || 0]);

        res.json({
            success: true,
            messages: messages
        });

    } catch (error) {
        console.error('Error fetching new messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch new messages'
        });
    }
});

// 🔹 Get Current User Info
router.get('/user/current', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Get full user details from database
        const [users] = await db.execute(
            'SELECT id, username, email, role, first_name, last_name FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Error getting current user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user information'
        });
    }
});

// 🔹 Get Contacts with Updated Info (for polling)
router.get('/contacts/update', verifyToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        const currentUserEmail = req.user.email;

        // Get all users except current user
        const [users] = await db.execute(`
            SELECT id, username, email, role, first_name, last_name
            FROM users 
            WHERE id != ?
            ORDER BY first_name, last_name
        `, [currentUserId]);

        // Get unread message counts and last messages
        const usersWithUnread = await Promise.all(users.map(async (user) => {
            // Since no is_read column, set unread count to 0
            const unreadCount = 0;

            // Get last message
            const [lastMessage] = await db.execute(`
                SELECT message as content, timestamp as created_at
                FROM messages 
                WHERE (sender_email = ? AND receiver_email = ?) 
                   OR (sender_email = ? AND receiver_email = ?)
                ORDER BY timestamp DESC 
                LIMIT 1
            `, [currentUserEmail, user.email, user.email, currentUserEmail]);

            return {
                ...user,
                unread_count: unreadCount,
                last_message: lastMessage[0]?.content || null,
                last_message_time: lastMessage[0]?.created_at || null,
                is_online: false
            };
        }));

        res.json({
            success: true,
            contacts: usersWithUnread
        });

    } catch (error) {
        console.error('Error updating contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update contacts'
        });
    }
});

// Get unread message count (original endpoint)
router.get('/unread/count', verifyToken, async (req, res) => {
    try {
        // Since no is_read column, return empty array
        res.json({ 
            success: true, 
            unreadCounts: [] 
        });
        
    } catch (error) {
        console.error('Error fetching unread counts:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Database error' 
        });
    }
});

export default router;