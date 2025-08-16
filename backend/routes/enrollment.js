// routes/enrollment.js - UPDATED VERSION
import express from 'express';
import db from '../config/database.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file upload (payment receipts)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/receipts/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images (JPEG, JPG, PNG) and PDF files are allowed'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// routes/enrollment.js - MOVE THIS ROUTE TO THE TOP (after imports, before any other routes)
// GET individual enrollment request details - MOVE THIS TO THE VERY TOP
router.get('/request/:enrollmentId', async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        
        console.log('📋 Fetching enrollment request details:', enrollmentId);
        
        // FIXED: Updated query with proper LEFT JOIN syntax
        const query = `
            SELECT 
                er.id,
                er.student_id,
                er.student_type,
                er.program,
                er.year_level,
                er.semester,
                er.subjects,
                er.total_fees,
                er.payment_receipt,
                er.status,
                er.remarks,
                er.created_at,
                er.updated_at,
                COALESCE(si.display_name, CONCAT(COALESCE(si.first_name, ''), ' ', COALESCE(si.last_name, '')), 'Unknown Student') as student_name,
                si.first_name,
                si.last_name,
                si.email as student_email,
                si.phone,
                si.home_address as address
            FROM enrollment_requests er
            LEFT JOIN student_info si ON er.student_id = si.id OR er.student_id = si.student_id
            WHERE er.id = ?
        `;
        
        const [results] = await db.execute(query, [enrollmentId]);
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment request not found'
            });
        }
        
        const request = results[0];
        
        // Format the response with proper defaults
        const formattedRequest = {
            ...request,
            student_name: request.student_name || 'Unknown Student',
            student_type: request.student_type || 'regular',
            student_email: request.student_email || 'N/A',
            phone: request.phone || 'N/A',
            address: request.address || 'N/A'
        };
        
        console.log('✅ Enrollment request details fetched successfully');
        
        res.json({
            success: true,
            data: formattedRequest
        });
        
    } catch (error) {
        console.error('❌ Error fetching enrollment request details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enrollment request details',
            error: error.message
        });
    }
});

// REPLACE the existing receipt route in routes/enrollment.js
router.get('/receipt/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(process.cwd(), 'uploads', 'receipts', filename);
        
        console.log('📁 Serving receipt file:', filePath);
        
        // FIXED: Use the imported fs module instead of require
        if (!fs.existsSync(filePath)) {
            console.error('❌ Receipt file not found:', filePath);
            return res.status(404).json({
                success: false,
                message: 'Receipt file not found'
            });
        }
        
        // Set appropriate headers based on file extension
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png'
        };
        
        const mimeType = mimeTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', mimeType);
        
        if (req.query.download === '1') {
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        }
        
        // Send file
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('❌ Error sending file:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error serving file'
                    });
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error serving receipt:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Error serving receipt file'
            });
        }
    }
});



// REPLACE the existing route in routes/enrollment.js
// FIND this route: router.get('/student-info/:studentId', async (req, res) => {

router.get('/student-info/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        
        console.log('📋 Fetching student info for ID:', studentId);
        
        // FIXED: Query that matches your actual database structure
        // The profile table uses 'id' as primary key, not 'student_id'
        let query = `
            SELECT 
                id,
                first_name,
                last_name,
                display_name,
                email,
                major,
                year_level,
                phone,
                home_address,
                city,
                province,
                date_of_birth,
                postal_code,
                country,
                student_id
            FROM student_info 
            WHERE id = ?
            LIMIT 1
        `;
        
        console.log('🔍 Executing query with user ID:', studentId);
        
        let [results] = await db.execute(query, [studentId]);
        
        // If no profile found, check if user exists in users table
        if (results.length === 0) {
            console.log('🔄 No student_info found, checking users table...');
            try {
                const [userResults] = await db.execute(
                    'SELECT id, username, email FROM users WHERE id = ?', 
                    [studentId]
                );
                
                if (userResults.length > 0) {
                    console.log('⚠️ User exists but has no profile data');
                    return res.status(400).json({
                        success: false,
                        message: 'Your profile is incomplete. Please complete your profile first.',
                        requiresProfile: true,
                        userExists: true
                    });
                } else {
                    console.log('❌ User not found');
                    return res.status(404).json({ 
                        success: false, 
                        message: 'User not found. Please check your account.',
                        requiresProfile: true,
                        userExists: false
                    });
                }
            } catch (userCheckError) {
                console.error('❌ Error checking users table:', userCheckError);
                return res.status(500).json({
                    success: false,
                    message: 'Database error occurred while checking user account.',
                    error: userCheckError.message
                });
            }
        }
        
        const student = results[0];
        console.log('👤 Found student data:', student);
        
        // Check essential fields are present
        const essentialFields = ['first_name', 'last_name', 'email', 'student_id', 'major', 'year_level'];
        const missingEssentialFields = [];
        
        essentialFields.forEach(field => {
            const value = student[field];
            if (!value || value.toString().trim() === '' || value === 'null' || value === null) {
                missingEssentialFields.push(field);
            }
        });
        
        // Only require profile completion if truly essential fields are missing
        if (missingEssentialFields.length > 0) {
            console.log('⚠️ Missing essential profile fields:', missingEssentialFields);
            return res.status(400).json({
                success: false,
                message: `Please complete these required fields in your profile: ${missingEssentialFields.join(', ')}`,
                requiresProfile: true,
                missingFields: missingEssentialFields,
                student: student
            });
        }
        
        // Map data to expected format using your actual database structure
        const programMap = {
            'information_technology': 'BSIT',
            'information_system': 'BSIS',
            'computer_science': 'BSCS',
            'business_administration': 'BSBA',
        };

        const yearLevelMap = {
            '1st_year': '1st Year',
            '2nd_year': '2nd Year', 
            '3rd_year': '3rd Year',
            '4th_year': '4th Year'
        };
        
        const responseData = {
            success: true,
            student: {
                // Use the actual student_id field from the database
                id: student.student_id || student.id,
                studentId: student.student_id || student.id,
                name: student.display_name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
                email: student.email,
                program: programMap[student.major] || student.major || 'BSIT',
                yearLevel: yearLevelMap[student.year_level] || student.year_level || '1st Year'
            }
        };
        
        console.log('✅ Profile is complete, sending student data:', responseData);
        res.json(responseData);
        
    } catch (error) {
        console.error('❌ Error fetching student info:', error);
        console.error('❌ Error stack:', error.stack);
        
        res.status(500).json({ 
            success: false, 
            message: 'Database error occurred. Please try refreshing the page.',
            error: error.message,
            requiresProfile: false
        });
    }
});

// ADD this route to handle student ID synchronization
router.post('/sync-student-id', async (req, res) => {
    try {
        const { userId, studentId } = req.body;
        
        console.log('🔗 Syncing student ID:', { userId, studentId });
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        
        // Update student_info to ensure student_id matches user_id
        const updateQuery = `
            UPDATE student_info 
            SET student_id = COALESCE(student_id, ?) 
            WHERE user_id = ?
        `;
        
        await db.execute(updateQuery, [userId, userId]);
        
        console.log('✅ Student ID synchronized in database');
        
        res.json({
            success: true,
            message: 'Student ID synchronized successfully'
        });
        
    } catch (error) {
        console.error('❌ Error syncing student ID:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});



// REPLACE the existing tuition-fees route in routes/enrollment.js
router.get('/tuition-fees', async (req, res) => {
    try {
        const { program, yearLevel, term, studentType, customUnits } = req.query;
        console.log('💰 Calculating fees for:', { program, yearLevel, term, studentType, customUnits });
        
        // ENHANCED FEE STRUCTURE - Different rates for regular vs irregular
        const REGULAR_RATE = 328.21;     // Regular students: ₱328.21 per unit
        const IRREGULAR_RATE = 450.00;   // Irregular students: ₱450.00 per unit (higher rate)
        
        const isIrregular = studentType === 'irregular';
        const perUnitRate = isIrregular ? IRREGULAR_RATE : REGULAR_RATE;
        
        console.log(`💰 Using ${isIrregular ? 'IRREGULAR' : 'REGULAR'} rate: ₱${perUnitRate} per unit`);
        
        // Fixed fees structure (irregular students pay higher miscellaneous fees)
        const fixedFees = {
            labFee: 500,                                    // Same for both
            miscFee: isIrregular ? 500 : 300,              // Higher for irregular students
            enrollmentFee: isIrregular ? 350 : 200,        // Higher processing fee for irregular
            irregularityFee: isIrregular ? 300 : 0         // Additional fee for irregular students
        };
        
        // FIXED: Use custom units for irregular students if provided, otherwise get from database
        let totalUnits = 15; // Default fallback
        
        if (isIrregular && customUnits) {
            // For irregular students, use the custom units count from frontend
            totalUnits = parseInt(customUnits);
            console.log('💰 Using custom units for irregular student:', totalUnits);
        } else {
            // Get curriculum to calculate total units from database for regular students
            try {
                // Find program ID from programs table
                const [programData] = await db.execute('SELECT id FROM programs WHERE program_name = ?', [program]);
                
                if (programData.length > 0) {
                    const programId = programData[0].id;
                    
                    const curriculumQuery = `
                        SELECT SUM(units) as total_units 
                        FROM curriculum 
                        WHERE program_id = ? AND year_level = ? AND semester = ?
                    `;
                    
                    const [curriculumResults] = await db.execute(curriculumQuery, [programId, yearLevel, term]);
                    if (curriculumResults.length > 0 && curriculumResults[0].total_units) {
                        totalUnits = curriculumResults[0].total_units;
                    }
                }
            } catch (dbError) {
                console.warn('⚠️ Could not fetch curriculum data, using default units');
            }
        }
        
        // Calculate tuition based on student type and per-unit rate
        const tuitionFee = Math.round(perUnitRate * totalUnits * 100) / 100;
        const totalFixedFees = fixedFees.labFee + fixedFees.miscFee + fixedFees.enrollmentFee + fixedFees.irregularityFee;
        const totalFees = tuitionFee + totalFixedFees;
        
        console.log('💰 Fee calculation:', { 
            tuitionFee, 
            totalFixedFees,
            totalFees, 
            totalUnits,
            perUnitRate,
            studentType: isIrregular ? 'irregular' : 'regular'
        });
        
        // Build breakdown array dynamically
        const breakdown = [
            { 
                item: 'Tuition Fee', 
                amount: tuitionFee, 
                details: `${totalUnits} units × ₱${perUnitRate.toFixed(2)} ${isIrregular ? '(Irregular Rate)' : '(Regular Rate)'}` 
            },
            { 
                item: 'Laboratory Fee', 
                amount: fixedFees.labFee, 
                details: 'Lab equipment and materials' 
            },
            { 
                item: 'Miscellaneous Fee', 
                amount: fixedFees.miscFee, 
                details: `ID, library, ${isIrregular ? 'and additional services' : 'and other fees'}` 
            },
            { 
                item: 'Enrollment Fee', 
                amount: fixedFees.enrollmentFee, 
                details: `Registration processing fee ${isIrregular ? '(Higher for irregular)' : ''}` 
            }
        ];
        
        // Add irregularity fee for irregular students
        if (isIrregular) {
            breakdown.push({
                item: 'Irregularity Fee',
                amount: fixedFees.irregularityFee,
                details: 'Additional fee for non-standard enrollment'
            });
        }
        
        res.json({
            success: true,
            fees: {
                tuition: tuitionFee,
                laboratory: fixedFees.labFee,
                miscellaneous: fixedFees.miscFee,
                enrollment: fixedFees.enrollmentFee,
                irregularity: fixedFees.irregularityFee,
                total: totalFees,
                totalUnits: totalUnits,
                perUnitRate: perUnitRate,
                studentType: isIrregular ? 'irregular' : 'regular',
                breakdown: breakdown
            }
        });
        
    } catch (error) {
        console.error('❌ Error calculating tuition fees:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// POST enrollment submission - UPDATED TO USE ENROLLMENT_REQUESTS TABLE
router.post('/submit', upload.single('paymentReceipt'), async (req, res) => {
    try {
        const { studentId, program, yearLevel, term, totalFees, subjects, studentType } = req.body;
        // Debug log to verify studentType is received
        console.log('📝 Received studentType:', studentType);
        console.log('📝 Processing enrollment submission:', {
            studentId, program, yearLevel, term, totalFees, studentType
        });
        
        // Validate required fields
        if (!studentId || !program || !yearLevel || !term) {
            return res.status(400).json({
                success: false,
                message: 'Missing required enrollment information'
            });
        }
        
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Payment receipt is required'
            });
        }
        
        console.log('📁 File uploaded:', req.file.filename);
        
        // Parse subjects if provided
        let subjectsData = [];
        if (subjects) {
            try {
                subjectsData = JSON.parse(subjects);
            } catch (e) {
                console.warn('⚠️ Could not parse subjects data');
            }
        }
        
        // Insert enrollment record into enrollment_requests table
        const enrollmentQuery = `
    INSERT INTO enrollment_requests 
    (student_id, student_type, program, year_level, semester, subjects, total_fees, payment_receipt, status, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
`;
        
        const finalStudentType = studentType || 'regular';
console.log('💾 Saving student type as:', finalStudentType);

const [result] = await db.execute(enrollmentQuery, [
    studentId,
    finalStudentType,
    program,
    yearLevel,
    term,
    JSON.stringify(subjectsData),
    parseFloat(totalFees) || 0,
    req.file.filename
]);
        
        console.log('✅ Enrollment submitted successfully with ID:', result.insertId);
        
        res.json({
            success: true,
            message: 'Enrollment submitted successfully!',
            enrollmentId: result.insertId,
            receiptFile: req.file.filename
        });
        
    } catch (error) {
        console.error('❌ Error submitting enrollment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit enrollment',
            error: error.message
        });
    }
});

// GET enrollment history for a student - UPDATED TO USE ENROLLMENT_REQUESTS TABLE
router.get('/history/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        console.log('📋 Fetching enrollment history for student:', studentId);
        
        const query = `
            SELECT 
                id,
                program,
                year_level,
                semester,
                total_fees,
                status,
                created_at,
                updated_at
            FROM enrollment_requests 
            WHERE student_id = ? 
            ORDER BY created_at DESC
        `;
        
        const [results] = await db.execute(query, [studentId]);
        console.log('📊 Found enrollment records:', results.length);
        
        res.json({
            success: true,
            enrollments: results
        });
        
    } catch (error) {
        console.error('❌ Error fetching enrollment history:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// ADD this route BEFORE the curriculum route 
router.get('/programs', async (req, res) => {
    try {
        console.log('🎓 Fetching all programs from database...');
        
        const query = 'SELECT * FROM programs ORDER BY program_name ASC';
        const [results] = await db.execute(query);
        
        console.log('📊 Programs found:', results.length);
        if (results.length > 0) {
            console.log('🎓 Available programs:');
            results.forEach((program, index) => {
                console.log(`  ${index + 1}. ID: ${program.id}, Name: "${program.program_name}"`);
            });
        }
        
        res.json({
            success: true,
            data: results
        });
        
    } catch (error) {
        console.error('❌ Error fetching programs:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// ADD this new route to enrollment.js (before the export statement):

// GET curriculum data for specific program, year, and semester - FIXED TO USE PROGRAM NAME
router.get('/curriculum', async (req, res) => {
    try {
        const { program_id, year_level, semester } = req.query;
        
        console.log('📚 Fetching curriculum from database:', { program_id, year_level, semester });
        
        if (!program_id || !year_level || !semester) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: program_id, year_level, semester'
            });
        }

        // First, get the program name from the programs table using the ID
        const [programCheck] = await db.execute('SELECT program_name FROM programs WHERE id = ?', [program_id]);
        if (programCheck.length === 0) {
            console.log('❌ Program not found for ID:', program_id);
            return res.status(404).json({
                success: false,
                message: 'Program not found'
            });
        }

        const programName = programCheck[0].program_name; // This will be "BSIT", "BSCS", etc.
        console.log('📚 Program found:', programName);

        // DEBUG: Check what's in curriculum table for this program name
        const [debugQuery] = await db.execute(`
            SELECT DISTINCT program_id, year_level, semester 
            FROM curriculum 
            WHERE program_id = ? 
            ORDER BY year_level, semester
        `, [programName]); // Use program name, not numeric ID
        console.log('🔍 Available curriculum combinations for program name:', programName, ':', debugQuery);

        // Try multiple year level format variations
        const yearLevelVariations = [
            year_level,                    // "1st Year"
            year_level.replace(' Year', ''), // "1st"
            year_level.replace('st', '').replace('nd', '').replace('rd', '').replace('th', '') + ' Year', // "1 Year"
            year_level.toLowerCase(),      // "1st year"
            year_level.replace(' ', ''),   // "1stYear"
        ];

        console.log('🔍 Trying year level variations:', yearLevelVariations);

        let curriculumResults = [];
        let usedYearLevel = year_level;

        // Try each variation until we find a match
        for (const yearVariation of yearLevelVariations) {
            const curriculumQuery = `
                SELECT 
                    subject_code,
                    subject_name,
                    units,
                    prerequisite,
                    schedule,
                    section
                FROM curriculum 
                WHERE program_id = ? AND year_level = ? AND semester = ?
                ORDER BY subject_code
            `;
            
            console.log('🔍 Trying query with program_id:', programName, 'year_level:', yearVariation, 'semester:', semester);
            const [results] = await db.execute(curriculumQuery, [programName, yearVariation, semester]);
            
            if (results.length > 0) {
                curriculumResults = results;
                usedYearLevel = yearVariation;
                console.log('✅ Found', results.length, 'subjects with year_level format:', yearVariation);
                break;
            }
        }

        if (curriculumResults.length === 0) {
            console.log('⚠️ No curriculum found for any year level variation');
            // Show what's actually available
            const [allAvailable] = await db.execute(`
                SELECT program_id, year_level, semester, COUNT(*) as count 
                FROM curriculum 
                WHERE program_id = ? 
                GROUP BY year_level, semester
            `, [programName]);
            
            return res.json({
                success: true,
                data: [],
                program_id,
                program_name: programName,
                year_level,
                semester,
                total_subjects: 0,
                total_units: 0,
                message: 'No curriculum found for this selection',
                debug: { 
                    availableCurriculum: allAvailable,
                    triedYearLevels: yearLevelVariations,
                    requestedYearLevel: year_level,
                    usedProgramName: programName
                }
            });
        }

        const curriculumData = curriculumResults.map(subject => ({
            subject_code: subject.subject_code,
            subject_name: subject.subject_name,
            units: parseInt(subject.units) || 3,
            prerequisite: subject.prerequisite || null,
            schedule: subject.schedule || 'TBA',
            section: subject.section || 'A'
        }));

        const totalUnits = curriculumData.reduce((sum, subject) => sum + subject.units, 0);

        console.log('✅ Sending curriculum data:', curriculumData.length, 'subjects');

        res.json({
            success: true,
            data: curriculumData,
            program_id,
            program_name: programName,
            year_level: usedYearLevel,
            semester,
            total_subjects: curriculumData.length,
            total_units: totalUnits
        });

    } catch (error) {
        console.error('❌ Error fetching curriculum from database:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});



// ADD THESE ROUTES TO YOUR EXISTING routes/enrollment.js FILE

// GET all enrollment requests with student names - FIXED JOIN LOGIC
router.get('/all-requests', async (req, res) => {
    try {
        console.log('📋 Fetching all enrollment requests with enhanced data...');
        
        // FIXED: Updated JOIN to match student_id properly
        const query = `
            SELECT 
                er.id,
                er.student_id,
                COALESCE(er.student_type, 'regular') as student_type,
                er.program,
                er.year_level,
                er.semester,
                er.subjects,
                er.total_fees,
                er.payment_receipt,
                er.status,
                er.remarks,
                er.created_at,
                er.updated_at,
                COALESCE(si.display_name, CONCAT(COALESCE(si.first_name, ''), ' ', COALESCE(si.last_name, '')), 'Unknown Student') as student_name,
                si.first_name,
                si.last_name,
                si.email as student_email,
                si.phone,
                CASE 
                    WHEN er.payment_receipt IS NOT NULL AND er.payment_receipt != '' THEN 1 
                    ELSE 0 
                END as has_receipt,
                CASE 
                    WHEN er.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 
                    ELSE 0 
                END as is_recent
            FROM enrollment_requests er
            LEFT JOIN student_info si ON er.student_id = si.id OR er.student_id = si.student_id
            ORDER BY er.created_at DESC
        `;
        
        const [results] = await db.execute(query);
        console.log('📊 Found enrollment requests:', results.length);
        
        // Format the data with enhanced information
        const formattedResults = results.map(request => ({
            ...request,
            student_name: request.student_name || 'Unknown Student',
            has_receipt: Boolean(request.has_receipt),
            is_recent: Boolean(request.is_recent),
            // Parse subjects for frontend use
            subjects_parsed: (() => {
                try {
                    return JSON.parse(request.subjects || '[]');
                } catch (e) {
                    return [];
                }
            })()
        }));
        
        res.json({
            success: true,
            data: formattedResults,
            total: results.length,
            metadata: {
                pending: formattedResults.filter(r => r.status === 'pending').length,
                approved: formattedResults.filter(r => r.status === 'approved').length,
                rejected: formattedResults.filter(r => r.status === 'rejected').length,
                regular: formattedResults.filter(r => r.student_type === 'regular').length,
                irregular: formattedResults.filter(r => r.student_type === 'irregular').length,
                withReceipt: formattedResults.filter(r => r.has_receipt).length,
                recent: formattedResults.filter(r => r.is_recent).length
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching enrollment requests:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});


// PUT update enrollment status - ADD THIS ROUTE
router.put('/update-status/:enrollmentId', async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const { status, remarks } = req.body;
        
        console.log('📝 Updating enrollment status:', { enrollmentId, status, remarks });
        
        // Validate status
        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: pending, approved, or rejected'
            });
        }
        
        // Update the enrollment request
        const updateQuery = `
            UPDATE enrollment_requests 
            SET status = ?, remarks = ?, updated_at = NOW() 
            WHERE id = ?
        `;
        
        const [result] = await db.execute(updateQuery, [status, remarks || null, enrollmentId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment request not found'
            });
        }
        
        console.log('✅ Enrollment status updated successfully');
        
        res.json({
            success: true,
            message: `Enrollment ${status} successfully`,
            enrollmentId: parseInt(enrollmentId),
            newStatus: status
        });
        
    } catch (error) {
        console.error('❌ Error updating enrollment status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});



// GET enrollment statistics - ADD THIS ROUTE (Optional)
router.get('/stats', async (req, res) => {
    try {
        console.log('📊 Fetching enhanced enrollment statistics...');
        
        const statsQuery = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN student_type = 'regular' OR student_type IS NULL THEN 1 ELSE 0 END) as regular,
                SUM(CASE WHEN student_type = 'irregular' THEN 1 ELSE 0 END) as irregular,
                SUM(CASE WHEN payment_receipt IS NOT NULL AND payment_receipt != '' THEN 1 ELSE 0 END) as with_receipt,
                SUM(CASE WHEN payment_receipt IS NULL OR payment_receipt = '' THEN 1 ELSE 0 END) as no_receipt,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as recent,
                SUM(total_fees) as total_fees
            FROM enrollment_requests
        `;
        
        const [results] = await db.execute(statsQuery);
        const stats = results[0];
        
        res.json({
            success: true,
            stats: {
                total: parseInt(stats.total) || 0,
                pending: parseInt(stats.pending) || 0,
                approved: parseInt(stats.approved) || 0,
                rejected: parseInt(stats.rejected) || 0,
                regular: parseInt(stats.regular) || 0,
                irregular: parseInt(stats.irregular) || 0,
                withReceipt: parseInt(stats.with_receipt) || 0,
                noReceipt: parseInt(stats.no_receipt) || 0,
                recent: parseInt(stats.recent) || 0,
                totalFees: parseFloat(stats.total_fees) || 0
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching enrollment statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


// DELETE individual enrollment request - ADD THIS ROUTE to enrollment.js
router.delete('/delete/:enrollmentId', async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        
        console.log('🗑️ Deleting enrollment request:', enrollmentId);
        
        // First, get the request details for logging
        const getQuery = `
            SELECT er.student_id, si.display_name as student_name, er.payment_receipt
            FROM enrollment_requests er
            LEFT JOIN student_info si ON er.student_id = si.student_id
            WHERE er.id = ?
        `;
        
        const [requestData] = await db.execute(getQuery, [enrollmentId]);
        
        if (requestData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment request not found'
            });
        }
        
        const request = requestData[0];
        
        // Delete the enrollment request
        const deleteQuery = `DELETE FROM enrollment_requests WHERE id = ?`;
        const [result] = await db.execute(deleteQuery, [enrollmentId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment request not found'
            });
        }
        
        // TODO: Optionally delete associated files
        // if (request.payment_receipt) {
        //     // Delete receipt file from storage
        // }
        
        console.log('✅ Enrollment request deleted successfully:', {
            id: enrollmentId,
            student: request.student_name,
            studentId: request.student_id
        });
        
        res.json({
            success: true,
            message: `Enrollment request deleted successfully`,
            deletedId: parseInt(enrollmentId),
            studentName: request.student_name
        });
        
    } catch (error) {
        console.error('❌ Error deleting enrollment request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete enrollment request',
            error: error.message
        });
    }
});

// POST bulk operations - ADD THIS ROUTE to enrollment.js
router.post('/bulk-action', async (req, res) => {
    try {
        const { action, enrollmentIds, remarks } = req.body;
        
        console.log('📦 Performing bulk action:', { action, count: enrollmentIds?.length });
        
        // Validate input
        if (!action || !enrollmentIds || !Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request. Action and enrollment IDs are required.'
            });
        }
        
        const validActions = ['approve', 'reject', 'delete'];
        if (!validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be: approve, reject, or delete'
            });
        }
        
        let query;
        let params;
        let successCount = 0;
        const results = [];
        
        if (action === 'delete') {
            // Bulk delete
            const placeholders = enrollmentIds.map(() => '?').join(',');
            query = `DELETE FROM enrollment_requests WHERE id IN (${placeholders})`;
            params = enrollmentIds;
            
            const [result] = await db.execute(query, params);
            successCount = result.affectedRows;
            
        } else {
            // Bulk status update (approve/reject)
            const status = action === 'approve' ? 'approved' : 'rejected';
            
            for (const enrollmentId of enrollmentIds) {
                try {
                    const updateQuery = `
                        UPDATE enrollment_requests 
                        SET status = ?, remarks = ?, updated_at = NOW() 
                        WHERE id = ?
                    `;
                    
                    const [result] = await db.execute(updateQuery, [status, remarks || null, enrollmentId]);
                    
                    if (result.affectedRows > 0) {
                        successCount++;
                        results.push({ id: enrollmentId, success: true });
                    } else {
                        results.push({ id: enrollmentId, success: false, reason: 'Not found' });
                    }
                } catch (error) {
                    results.push({ id: enrollmentId, success: false, reason: error.message });
                }
            }
        }
        
        console.log(`✅ Bulk ${action} completed: ${successCount}/${enrollmentIds.length} successful`);
        
        res.json({
            success: true,
            message: `Bulk ${action} completed`,
            totalRequested: enrollmentIds.length,
            successCount: successCount,
            failedCount: enrollmentIds.length - successCount,
            results: action !== 'delete' ? results : undefined
        });
        
    } catch (error) {
        console.error('❌ Error performing bulk action:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to perform bulk action',
            error: error.message
        });
    }
});

export default router;