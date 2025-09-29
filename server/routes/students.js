const express = require('express');
const QRCode = require('qrcode');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');
const { generateStudentQRData } = require('../utils/encryption');

const router = express.Router();

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'student-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all students (with pagination and search)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || '';
    const offset = (page - 1) * limit;

    // Ensure parameters are valid integers
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters'
      });
    }

    // Base query
    let query = `SELECT id, student_id, name, email, course, year_level, enrollment_status, photo_url, created_at, updated_at FROM students WHERE active = true`;
    
    let countQuery = `SELECT COUNT(*) as total FROM students WHERE active = true`;
    let queryParams = [];
    let countParams = [];

    if (search && search.length > 0) {
      query += ` AND (name LIKE ? OR student_id LIKE ? OR email LIKE ? OR course LIKE ?)`;
      countQuery += ` AND (name LIKE ? OR student_id LIKE ? OR email LIKE ? OR course LIKE ?)`;
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam, searchParam);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    console.log('Query:', query);
    console.log('Query Params:', queryParams);
    console.log('Count Query:', countQuery);
    console.log('Count Params:', countParams);

    const [students] = await pool.query(query, queryParams);
    const [countResult] = await pool.query(countQuery, countParams);
    
    // Convert relative photo URLs to full URLs
    const studentsWithFullUrls = students.map(student => ({
      ...student,
      photo_url: student.photo_url ? `${req.protocol}://${req.get('host')}${student.photo_url}` : null
    }));
    
    const totalStudents = countResult[0].total;
    const totalPages = Math.ceil(totalStudents / limit);

    res.json({
      success: true,
      message: 'Students retrieved successfully',
      data: {
        students: studentsWithFullUrls,
        pagination: {
          currentPage: page,
          totalPages,
          totalStudents,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve students'
    });
  }
});

// Get student by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [students] = await pool.query(
      `SELECT id, student_id, name, email, course, year_level, 
              enrollment_status, photo_url, created_at, updated_at
       FROM students 
       WHERE id = ? AND active = true`,
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const student = students[0];
    const studentWithFullUrl = {
      ...student,
      photo_url: student.photo_url ? `${req.protocol}://${req.get('host')}${student.photo_url}` : null
    };

    res.json({
      success: true,
      message: 'Student retrieved successfully',
      data: studentWithFullUrl
    });

  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve student'
    });
  }
});

// Create new student
router.post('/', adminAuth, upload.single('photo'), async (req, res) => {
  try {
    const { student_id, name, email, course, year_level, enrollment_status } = req.body;

    if (!student_id || !name || !email || !course) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, name, email, and course are required'
      });
    }

    // Check if student ID or email already exists
    const [existing] = await pool.query(
      'SELECT id FROM students WHERE (student_id = ? OR email = ?) AND active = true',
      [student_id, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Student ID or email already exists'
      });
    }

    const photo_url = req.file ? `/uploads/photos/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO students (student_id, name, email, course, year_level, 
       enrollment_status, photo_url, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [student_id, name, email, course, year_level || 1, enrollment_status || 'active', photo_url]
    );

    const newStudentId = result.insertId;

    // Get the created student
    const [newStudent] = await pool.query(
      `SELECT id, student_id, name, email, course, year_level, 
              enrollment_status, photo_url, created_at, updated_at
       FROM students WHERE id = ?`,
      [newStudentId]
    );

    const studentWithFullUrl = {
      ...newStudent[0],
      photo_url: newStudent[0].photo_url ? `${req.protocol}://${req.get('host')}${newStudent[0].photo_url}` : null
    };

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: studentWithFullUrl
    });

  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create student'
    });
  }
});

// Update student
router.put('/:id', adminAuth, upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, name, email, course, year_level, enrollment_status } = req.body;

    // Check if student exists
    const [existing] = await pool.query(
      'SELECT * FROM students WHERE id = ? AND active = true',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check for duplicate student_id or email (excluding current student)
    const [duplicates] = await pool.query(
      'SELECT id FROM students WHERE (student_id = ? OR email = ?) AND id != ? AND active = true',
      [student_id, email, id]
    );

    if (duplicates.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Student ID or email already exists'
      });
    }

    let photo_url = existing[0].photo_url;
    if (req.file) {
      // Delete old photo if exists
      if (existing[0].photo_url) {
        const oldPhotoPath = path.join(__dirname, '..', existing[0].photo_url);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      photo_url = `/uploads/photos/${req.file.filename}`;
    }

    await pool.query(
      `UPDATE students 
       SET student_id = ?, name = ?, email = ?, course = ?, 
           year_level = ?, enrollment_status = ?, photo_url = ?, updated_at = NOW()
       WHERE id = ?`,
      [student_id, name, email, course, year_level, enrollment_status, photo_url, id]
    );

    // Get updated student
    const [updatedStudent] = await pool.query(
      `SELECT id, student_id, name, email, course, year_level, 
              enrollment_status, photo_url, created_at, updated_at
       FROM students WHERE id = ?`,
      [id]
    );

    const studentWithFullUrl = {
      ...updatedStudent[0],
      photo_url: updatedStudent[0].photo_url ? `${req.protocol}://${req.get('host')}${updatedStudent[0].photo_url}` : null
    };

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: studentWithFullUrl
    });

  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student'
    });
  }
});

// Delete student (soft delete)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT * FROM students WHERE id = ? AND active = true',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await pool.query(
      'UPDATE students SET active = false, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student'
    });
  }
});

// Generate QR code for student
router.get('/:id/qr', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [students] = await pool.query(
      'SELECT * FROM students WHERE id = ? AND active = true',
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const student = students[0];
    
    // Generate encrypted QR data
    const qrData = generateStudentQRData(student);
    
    // Generate QR code image
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });

    res.json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        qrCode: qrCodeDataURL,
        student: {
          id: student.id,
          student_id: student.student_id,
          name: student.name,
          course: student.course
        }
      }
    });

  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code'
    });
  }
});

module.exports = router;
