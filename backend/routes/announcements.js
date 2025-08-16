import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../config/database.js';
import { authenticateToken, canPostAnnouncements } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// FIXED: Create uploads directory with correct path structure
const uploadsDir = path.join(__dirname, '../uploads/announcements');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory:', uploadsDir);
}

// FIXED: Configure multer for image uploads with better error handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('📂 Multer destination called');
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        console.log('📝 Multer filename called for:', file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'announcement-' + uniqueSuffix + path.extname(file.originalname);
        console.log('💾 Generated filename:', filename);
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    console.log('🔍 File filter check:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
    });
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        console.log('✅ File type accepted:', file.mimetype);
        cb(null, true);
    } else {
        console.log('❌ File type rejected:', file.mimetype);
        cb(new Error('Invalid file type. Only JPG, PNG, and GIF are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Sanitize input function
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// FIXED: CREATE ANNOUNCEMENT - Completely rewritten for better handling
router.post('/', authenticateToken, canPostAnnouncements, upload.single('image'), async (req, res) => {
    console.log('🚀 POST /api/announcements called');
    console.log('📋 Headers:', {
        'content-type': req.headers['content-type'],
        'authorization': req.headers['authorization'] ? 'Present' : 'Missing'
    });

    try {
        console.log('📝 Creating announcement...');
        console.log('🔐 User:', {
            id: req.user?.id,
            username: req.user?.username,
            role: req.user?.role
        });
        console.log('📋 Raw body received:', req.body);
        console.log('📸 File received:', req.file ? {
            originalname: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            path: req.file.path
        } : 'No file');

        // FIXED: Extract form data properly from multipart
        const {
            title: rawTitle,
            content: rawContent,
            target_audience = 'All Students',
            target_course = 'All',
            target_year = 'All',
            priority = 'general'
        } = req.body;

        console.log('📊 Raw form data:', {
            rawTitle: rawTitle ? `"${rawTitle}"` : 'UNDEFINED',
            rawTitleType: typeof rawTitle,
            rawContent: rawContent ? `"${rawContent.substring(0, 50)}..."` : 'UNDEFINED',
            rawContentType: typeof rawContent,
            target_audience,
            target_course,
            target_year,
            priority
        });

        // FIXED: Better validation with proper error handling
        if (!rawTitle || rawTitle === 'undefined' || rawTitle === 'null' || rawTitle.toString().trim() === '') {
            console.log('❌ Title validation failed:', rawTitle);
            
            // Clean up uploaded file
            if (req.file && fs.existsSync(req.file.path)) {
                try {
                    fs.unlinkSync(req.file.path);
                    console.log('🗑️ Cleaned up uploaded file due to validation error');
                } catch (cleanupError) {
                    console.error('Error cleaning up file:', cleanupError);
                }
            }
            
            return res.status(400).json({
                success: false,
                message: 'Title is required and cannot be empty',
                field: 'title'
            });
        }

        if (!rawContent || rawContent === 'undefined' || rawContent === 'null' || rawContent.toString().trim() === '') {
            console.log('❌ Content validation failed:', rawContent);
            
            // Clean up uploaded file
            if (req.file && fs.existsSync(req.file.path)) {
                try {
                    fs.unlinkSync(req.file.path);
                    console.log('🗑️ Cleaned up uploaded file due to validation error');
                } catch (cleanupError) {
                    console.error('Error cleaning up file:', cleanupError);
                }
            }
            
            return res.status(400).json({
                success: false,
                message: 'Content is required and cannot be empty',
                field: 'content'
            });
        }

        // Sanitize and validate length
        const title = sanitizeInput(rawTitle.toString().trim());
        const content = sanitizeInput(rawContent.toString().trim());

        if (title.length < 3) {
            if (req.file && fs.existsSync(req.file.path)) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanupError) {
                    console.error('Error cleaning up file:', cleanupError);
                }
            }
            return res.status(400).json({
                success: false,
                message: 'Title must be at least 3 characters long',
                field: 'title'
            });
        }

        if (content.length < 10) {
            if (req.file && fs.existsSync(req.file.path)) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanupError) {
                    console.error('Error cleaning up file:', cleanupError);
                }
            }
            return res.status(400).json({
                success: false,
                message: 'Content must be at least 10 characters long',
                field: 'content'
            });
        }

        // FIXED: Handle image upload with consistent path format
        let imageUrl = null;
        if (req.file) {
            // Store only the relative path from the uploads directory
            imageUrl = `/uploads/announcements/${req.file.filename}`;
            console.log('📸 Image uploaded successfully:', {
                originalName: req.file.originalname,
                savedAs: req.file.filename,
                url: imageUrl,
                size: req.file.size,
                fullPath: req.file.path
            });
            
            // Verify file was saved correctly
            if (!fs.existsSync(req.file.path)) {
                console.error('❌ File not found after upload:', req.file.path);
                throw new Error('File upload failed - file not saved');
            }
        }

        console.log('✅ Final validated data:', {
            title,
            content: content.substring(0, 100) + '...',
            target_audience,
            target_course,
            target_year,
            priority,
            posted_by_id: req.user.id,
            imageUrl
        });

        // FIXED: Insert into database with better error handling
        const query = `
            INSERT INTO announcements 
            (title, content, target_audience, target_course, target_year, priority, posted_by_id, image_url, view_count, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
        `;

        console.log('📀 Executing database query...');
        const [result] = await db.execute(query, [
            title,
            content,
            target_audience,
            target_course,
            target_year,
            priority,
            req.user.id,
            imageUrl
        ]);

        console.log('✅ Database insert successful, ID:', result.insertId);

        // In the CREATE route, replace the final fetch query:
const [newAnnouncement] = await db.execute(`
    SELECT a.*, u.username as posted_by_username, u.role as posted_by_role
    FROM announcements a 
    LEFT JOIN users u ON a.posted_by_id = u.id 
    WHERE a.id = ?
`, [result.insertId]);

        console.log('✅ Announcement created and fetched successfully:', {
            id: result.insertId,
            title: newAnnouncement[0].title,
            hasImage: !!newAnnouncement[0].image_url,
            imageUrl: newAnnouncement[0].image_url
        });

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully!',
            data: newAnnouncement[0]
        });

    } catch (error) {
        console.error('❌ Error creating announcement:', error);

        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
                console.log('🗑️ Cleaned up uploaded file due to database error');
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }

        // Handle specific database errors
        let errorMessage = 'Failed to create announcement';
        let statusCode = 500;

        if (error.code === 'ER_DATA_TOO_LONG') {
            errorMessage = 'Content is too long. Please shorten your announcement.';
            statusCode = 400;
        } else if (error.code === 'ER_DUP_ENTRY') {
            errorMessage = 'An announcement with this title already exists.';
            statusCode = 400;
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            errorMessage = 'Database table not found. Please contact administrator.';
            statusCode = 500;
        } else if (error.message && error.message.includes('Connection')) {
            errorMessage = 'Database connection error. Please try again.';
            statusCode = 500;
        }

        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            debug: process.env.NODE_ENV === 'development' ? {
                error: error.message,
                code: error.code,
                sqlState: error.sqlState
            } : undefined
        });
    }
});

// UPDATED FETCH ALL ANNOUNCEMENTS - Replace the filtering section in your GET route
router.get('/', async (req, res) => {
    try {
        const { 
            priority, 
            target_course, 
            target_year, 
            search, 
            limit = 50, 
            offset = 0 
        } = req.query;
        
        console.log('📋 Fetching announcements with filters:', {
            priority,
            target_course,
            target_year,
            search
        });
        
        // Replace the main query in the GET route:
let query = `
    SELECT a.*, u.username as posted_by_username, u.role as posted_by_role
    FROM announcements a 
    LEFT JOIN users u ON a.posted_by_id = u.id 
    WHERE 1=1
`;
        const queryParams = [];
        
        // Apply filters
        if (priority && priority !== 'all') {
            query += ' AND a.priority = ?';
            queryParams.push(priority);
        }
        
        // FIXED: Course filtering - show announcements for student's course OR "All" courses
        if (target_course && target_course !== 'all' && target_course !== 'All') {
            query += ' AND (a.target_course = ? OR a.target_course = "All")';
            queryParams.push(target_course);
            console.log(`🎯 Filtering for course: ${target_course} OR All`);
        }
        
        // FIXED: Year filtering - show announcements for student's year OR "All" years
        if (target_year && target_year !== 'all' && target_year !== 'All') {
            query += ' AND (a.target_year = ? OR a.target_year = "All")';
            queryParams.push(target_year);
            console.log(`🎯 Filtering for year: ${target_year} OR All`);
        }
        
        if (search) {
            query += ' AND (a.title LIKE ? OR a.content LIKE ?)';
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm);
        }
        
        // Order by priority and creation date
        query += ` 
            ORDER BY 
                CASE a.priority 
                    WHEN 'urgent' THEN 1 
                    WHEN 'important' THEN 2 
                    ELSE 3 
                END,
                a.created_at DESC
            LIMIT ? OFFSET ?
        `;
        queryParams.push(parseInt(limit), parseInt(offset));
        
        console.log('🔍 Executing query:', query);
        console.log('📝 With parameters:', queryParams);
        
        const [announcements] = await db.execute(query, queryParams);
        
        console.log(`✅ Found ${announcements.length} announcements`);
        
        // Get total count for pagination (with same filters)
        let countQuery = 'SELECT COUNT(*) as total FROM announcements WHERE 1=1';
        const countParams = [];
        
        if (priority && priority !== 'all') {
            countQuery += ' AND priority = ?';
            countParams.push(priority);
        }
        
        if (target_course && target_course !== 'all' && target_course !== 'All') {
            countQuery += ' AND (target_course = ? OR target_course = "All")';
            countParams.push(target_course);
        }
        
        if (target_year && target_year !== 'all' && target_year !== 'All') {
            countQuery += ' AND (target_year = ? OR target_year = "All")';
            countParams.push(target_year);
        }
        
        if (search) {
            countQuery += ' AND (title LIKE ? OR content LIKE ?)';
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm);
        }
        
        const [countResult] = await db.execute(countQuery, countParams);
        
        res.json({
            success: true,
            data: announcements,
            pagination: {
                total: countResult[0].total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: parseInt(offset) + announcements.length < countResult[0].total
            }
        });
        
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching announcements.'
        });
    }
});

// FETCH SINGLE ANNOUNCEMENT & TRACK VIEWS
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid announcement ID.'
            });
        }
        
        // Increment view count
        await db.execute('UPDATE announcements SET view_count = view_count + 1 WHERE id = ?', [id]);
        
        // Replace the fetch query in GET /:id route:
const [announcement] = await db.execute(`
    SELECT a.*, u.username as posted_by_username, u.role as posted_by_role
    FROM announcements a 
    LEFT JOIN users u ON a.posted_by_id = u.id 
    WHERE a.id = ?
`, [id]);
        
        if (announcement.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found.'
            });
        }
        
        res.json({
            success: true,
            data: announcement[0]
        });
        
    } catch (error) {
        console.error('Error fetching announcement:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching announcement.'
        });
    }
});

// TRACK ANNOUNCEMENT VIEW (separate from fetching)
router.post('/:id/view', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid announcement ID.'
            });
        }
        
        // Increment view count
        await db.execute('UPDATE announcements SET view_count = view_count + 1 WHERE id = ?', [id]);
        
        // Get updated view count
        const [result] = await db.execute('SELECT view_count FROM announcements WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'View tracked successfully',
            view_count: result[0]?.view_count || 0
        });
        
    } catch (error) {
        console.error('Error tracking view:', error);
        res.status(500).json({
            success: false,
            message: 'Error tracking view'
        });
    }
});

// Image validation endpoint
router.get('/validate-image/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const imagePath = path.join(uploadsDir, filename);
        
        console.log('🔍 Validating image:', {
            filename,
            fullPath: imagePath,
            exists: fs.existsSync(imagePath)
        });
        
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({
                success: false,
                message: 'Image file not found',
                filename,
                expectedPath: imagePath
            });
        }
        
        const stats = fs.statSync(imagePath);
        
        res.json({
            success: true,
            filename,
            size: stats.size,
            modified: stats.mtime,
            publicUrl: `/uploads/announcements/${filename}`,
            exists: true
        });
        
    } catch (error) {
        console.error('Error validating image:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating image',
            error: error.message
        });
    }
});

// Direct image serving endpoint as fallback
router.get('/image/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const imagePath = path.join(uploadsDir, filename);
        
        console.log('🖼️ Direct image request:', {
            filename,
            fullPath: imagePath,
            exists: fs.existsSync(imagePath)
        });
        
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({
                error: 'Image not found',
                filename,
                searchPath: imagePath
            });
        }
        
        // Set proper headers
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        
        const mimeType = mimeTypes[ext] || 'application/octet-stream';
        
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        
        // Stream the file
        const stream = fs.createReadStream(imagePath);
        stream.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error streaming image' });
            }
        });
        
        stream.pipe(res);
        
    } catch (error) {
        console.error('Error serving image:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});



// GET ANNOUNCEMENT STATISTICS
router.get('/stats/summary', async (req, res) => {
    try {
        const [stats] = await db.execute(`
            SELECT 
                COUNT(*) as total_announcements,
                SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_count,
                SUM(CASE WHEN priority = 'important' THEN 1 ELSE 0 END) as important_count,
                SUM(CASE WHEN priority = 'general' THEN 1 ELSE 0 END) as general_count,
                SUM(view_count) as total_views
            FROM announcements
        `);
        
        res.json({
            success: true,
            data: stats[0]
        });
        
    } catch (error) {
        console.error('Error fetching announcement stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching statistics.'
        });
    }
});

// ADDITIONAL DEBUG ENDPOINTS FOR TESTING

// Debug endpoint to list all uploaded images
router.get('/debug/list-images', (req, res) => {
    try {
        const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
        );
        
        const fileDetails = imageFiles.map(file => {
            const filePath = path.join(uploadsDir, file);
            const stats = fs.statSync(filePath);
            return {
                name: file,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                publicUrl: `/uploads/announcements/${file}`,
                directUrl: `/api/announcements/image/${file}`,
                exists: fs.existsSync(filePath)
            };
        });
        
        res.json({
            success: true,
            uploadsDirectory: uploadsDir,
            totalImages: imageFiles.length,
            images: fileDetails,
            message: `Found ${imageFiles.length} image files in uploads directory`
        });
    } catch (error) {
        console.error('Error listing images:', error);
        res.status(500).json({
            success: false,
            message: 'Error listing uploaded images',
            error: error.message
        });
    }
});

// Debug endpoint to test image accessibility
router.get('/debug/test-image-access/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const imagePath = path.join(uploadsDir, filename);
        
        console.log('🧪 Testing image accessibility:', {
            filename,
            fullPath: imagePath,
            uploadsDir,
            exists: fs.existsSync(imagePath)
        });
        
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({
                success: false,
                message: 'Image file not found',
                filename,
                searchPath: imagePath,
                uploadsDirectory: uploadsDir,
                availableFiles: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : []
            });
        }
        
        const stats = fs.statSync(imagePath);
        const isReadable = fs.constants.R_OK;
        
        try {
            fs.accessSync(imagePath, isReadable);
            console.log('✅ Image file is readable');
        } catch (accessError) {
            console.log('❌ Image file is not readable:', accessError);
            return res.status(403).json({
                success: false,
                message: 'Image file exists but is not readable',
                error: accessError.message
            });
        }
        
        res.json({
            success: true,
            filename,
            path: imagePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            isReadable: true,
            publicUrl: `/uploads/announcements/${filename}`,
            directApiUrl: `/api/announcements/image/${filename}`,
            exists: true
        });
        
    } catch (error) {
        console.error('Error testing image access:', error);
        res.status(500).json({
            success: false,
            message: 'Error testing image accessibility',
            error: error.message
        });
    }
});

// Debug endpoint to get upload directory info
router.get('/debug/upload-info', (req, res) => {
    try {
        const dirExists = fs.existsSync(uploadsDir);
        let dirStats = null;
        let files = [];
        
        if (dirExists) {
            dirStats = fs.statSync(uploadsDir);
            files = fs.readdirSync(uploadsDir);
        }
        
        res.json({
            success: true,
            uploadsDirectory: uploadsDir,
            exists: dirExists,
            stats: dirStats ? {
                created: dirStats.birthtime,
                modified: dirStats.mtime,
                isDirectory: dirStats.isDirectory()
            } : null,
            totalFiles: files.length,
            files: files,
            serverInfo: {
                platform: process.platform,
                nodeVersion: process.version,
                cwd: process.cwd(),
                __dirname: __dirname
            }
        });
    } catch (error) {
        console.error('Error getting upload directory info:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting upload directory information',
            error: error.message,
            uploadsDir: uploadsDir
        });
    }
});

// UPDATE ANNOUNCEMENT - FIXED VERSION
router.put('/:id', authenticateToken, canPostAnnouncements, upload.single('image'), async (req, res) => {
    console.log('🔄 PUT /api/announcements/:id called for update');
    
    try {
        const { id } = req.params;
        let { title, content, target_audience, target_course, target_year, priority, remove_image } = req.body;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid announcement ID.'
            });
        }
        
        // Check if announcement exists
        const [existing] = await db.execute('SELECT * FROM announcements WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found.'
            });
        }
        
        // Check permissions - Allow admin and owner to edit
        if (req.user.role !== 'admin' && req.user.role !== 'Admin' && existing[0].posted_by_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own announcements.'
            });
        }
        
        // Validate and sanitize inputs - use existing values as fallbacks
        const updatedTitle = title ? sanitizeInput(title.toString().trim()) : existing[0].title;
        const updatedContent = content ? sanitizeInput(content.toString().trim()) : existing[0].content;
        const updatedTargetAudience = target_audience || existing[0].target_audience;
        const updatedTargetCourse = target_course || existing[0].target_course;
        const updatedTargetYear = target_year || existing[0].target_year;
        const updatedPriority = priority || existing[0].priority;
        
        // Validate required fields
        if (!updatedTitle || updatedTitle.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Title must be at least 3 characters long.'
            });
        }
        
        if (!updatedContent || updatedContent.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Content must be at least 10 characters long.'
            });
        }
        
        let imageUrl = existing[0].image_url;
        
        // Handle image removal
        if (remove_image === 'true' && imageUrl) {
            const imagePath = path.join(uploadsDir, path.basename(imageUrl));
            if (fs.existsSync(imagePath)) {
                try {
                    fs.unlinkSync(imagePath);
                    console.log('🗑️ Removed old image:', imageUrl);
                } catch (error) {
                    console.error('Error removing old image:', error);
                }
            }
            imageUrl = null;
        }
        
        // Handle new image upload
        if (req.file) {
            // Remove old image if exists
            if (imageUrl) {
                const oldImagePath = path.join(uploadsDir, path.basename(imageUrl));
                if (fs.existsSync(oldImagePath)) {
                    try {
                        fs.unlinkSync(oldImagePath);
                        console.log('🗑️ Replaced old image:', imageUrl);
                    } catch (error) {
                        console.error('Error removing old image:', error);
                    }
                }
            }
            imageUrl = `/uploads/announcements/${req.file.filename}`;
            console.log('📸 New image uploaded:', imageUrl);
        }
        
        // UPDATE database (not DELETE!)
        const updateQuery = `
            UPDATE announcements 
            SET title = ?, content = ?, target_audience = ?, target_course = ?, 
                target_year = ?, priority = ?, image_url = ?, updated_at = NOW() 
            WHERE id = ?
        `;
        
        await db.execute(updateQuery, [
            updatedTitle, 
            updatedContent, 
            updatedTargetAudience, 
            updatedTargetCourse, 
            updatedTargetYear, 
            updatedPriority, 
            imageUrl, 
            id
        ]);
        
        console.log('✅ Announcement updated successfully, ID:', id);
        
        // Fetch updated announcement with user details
        const [updated] = await db.execute(`
            SELECT a.*, u.username as posted_by_username, u.role as posted_by_role
            FROM announcements a 
            LEFT JOIN users u ON a.posted_by_id = u.id 
            WHERE a.id = ?
        `, [id]);
        
        res.json({
            success: true,
            message: 'Announcement updated successfully!',
            data: updated[0]
        });
        
    } catch (error) {
        console.error('❌ Error updating announcement:', error);
        
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
                console.log('🗑️ Cleaned up uploaded file due to error');
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating announcement.'
        });
    }
});

// DELETE ANNOUNCEMENT
router.delete('/:id', authenticateToken, canPostAnnouncements, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid announcement ID.'
            });
        }
        
        // Check if announcement exists
        const [existing] = await db.execute('SELECT * FROM announcements WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found.'
            });
        }
        
        // Check permissions
        if (req.user.role !== 'admin' && req.user.role !== 'Admin' && existing[0].posted_by_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own announcements.'
            });
        }
        
        // Delete associated image
        if (existing[0].image_url) {
            const imagePath = path.join(__dirname, '..', existing[0].image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        // Delete from database
        await db.execute('DELETE FROM announcements WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Announcement deleted successfully.'
        });
        
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting announcement.'
        });
    }
});



export default router;