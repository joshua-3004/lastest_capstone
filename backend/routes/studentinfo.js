import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// GET all students with pagination and filtering
router.get('/students', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            program = '', 
            year = '' 
        } = req.query;

        const offset = (page - 1) * limit;
        
        // Build WHERE clause for filtering
        let whereConditions = [];
        let queryParams = [];

        if (search) {
            whereConditions.push(`(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR student_id LIKE ?)`);
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (program) {
            whereConditions.push('major = ?');
            queryParams.push(program);
        }

        if (year) {
            whereConditions.push('year_level = ?');
            queryParams.push(year);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get total count for pagination
        const countQuery = `SELECT COUNT(*) as total FROM student_info ${whereClause}`;
        const [countResult] = await db.execute(countQuery, queryParams);
        const totalStudents = countResult[0].total;

        // Get students with pagination
        const studentsQuery = `
            SELECT 
                id,
                student_id,
                first_name,
                last_name,
                COALESCE(display_name, CONCAT(first_name, ' ', last_name)) as display_name,
                email,
                phone,
                major,
                year_level,
                student_type,
                date_of_birth,
                home_address,
                city,
                postal_code,
                province,
                country,
                avatar_url,
                created_at,
                updated_at
            FROM student_info 
            ${whereClause}
            ORDER BY first_name, last_name
            LIMIT ? OFFSET ?
        `;
        const [students] = await db.execute(studentsQuery, [...queryParams, parseInt(limit), parseInt(offset)]);

        // Get program statistics
        const statsQuery = `
            SELECT 
                major,
                COUNT(*) as count
            FROM student_info 
            GROUP BY major
        `;
        const [stats] = await db.execute(statsQuery);

        res.json({
            students,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalStudents / limit),
                totalStudents,
                limit: parseInt(limit)
            },
            stats
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ 
            error: 'Failed to fetch students',
            details: error.message 
        });
    }
});

// GET single student by ID
router.get('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const studentQuery = `
            SELECT 
                id,
                student_id,
                first_name,
                last_name,
                COALESCE(display_name, CONCAT(first_name, ' ', last_name)) as display_name,
                email,
                phone,
                major,
                year_level,
                student_type,
                date_of_birth,
                home_address,
                city,
                postal_code,
                province,
                country,
                avatar_url,
                created_at,
                updated_at
            FROM student_info 
            WHERE id = ?
        `;
        const [students] = await db.execute(studentQuery, [id]);

        if (students.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(students[0]);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Failed to fetch student' });
    }
});

// POST new student
router.post('/students', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            program,
            yearLevel,
            dateOfBirth,
            address
        } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !program || !yearLevel) {
            return res.status(400).json({ 
                error: 'First name, last name, email, program, and year level are required' 
            });
        }

        // Check if email already exists
        const [emailCheck] = await db.execute('SELECT id FROM student_info WHERE email = ?', [email]);
        if (emailCheck.length > 0) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Generate student ID (format: YYYY-XXXX)
        const year = new Date().getFullYear();
        const countQuery = 'SELECT COUNT(*) as count FROM student_info WHERE student_id LIKE ?';
        const [countResult] = await db.execute(countQuery, [`${year}-%`]);
        const studentNumber = String(countResult[0].count + 1).padStart(4, '0');
        const studentId = `${year}-${studentNumber}`;

        const insertQuery = `
            INSERT INTO student_info 
            (student_id, first_name, last_name, email, phone, major, year_level, date_of_birth, home_address, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const [result] = await db.execute(insertQuery, [
            studentId,
            firstName,
            lastName,
            email,
            phone || null,
            program,
            yearLevel,
            dateOfBirth || null,
            address || null
        ]);

        res.status(201).json({
            message: 'Student created successfully',
            studentId: result.insertId,
            generatedStudentId: studentId
        });

    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ error: 'Failed to create student' });
    }
});

// PUT update student
router.put('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            firstName,
            lastName,
            email,
            phone,
            program,
            yearLevel,
            dateOfBirth,
            address
        } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !program || !yearLevel) {
            return res.status(400).json({ 
                error: 'First name, last name, email, program, and year level are required' 
            });
        }

        // Check if student exists
        const [existingStudent] = await db.execute('SELECT * FROM student_info WHERE id = ?', [id]);
        if (existingStudent.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Check if email already exists for other students
        const [emailCheck] = await db.execute('SELECT id FROM student_info WHERE email = ? AND id != ?', [email, id]);
        if (emailCheck.length > 0) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const updateQuery = `
            UPDATE student_info 
            SET first_name = ?, last_name = ?, email = ?, phone = ?, 
                major = ?, year_level = ?, date_of_birth = ?, home_address = ?,
                updated_at = NOW()
            WHERE id = ?
        `;

        await db.execute(updateQuery, [
            firstName,
            lastName,
            email,
            phone || null,
            program,
            yearLevel,
            dateOfBirth || null,
            address || null,
            id
        ]);

        res.json({ message: 'Student updated successfully' });

    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Failed to update student' });
    }
});

// DELETE student
router.delete('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if student exists
        const [existingStudent] = await db.execute('SELECT * FROM student_info WHERE id = ?', [id]);
        if (existingStudent.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        await db.execute('DELETE FROM student_info WHERE id = ?', [id]);

        res.json({ message: 'Student deleted successfully' });

    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

export default router;