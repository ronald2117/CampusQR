const express = require('express');
const QRCode = require('qrcode');
const multer = require('multer');
const { pool } = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');
const { generateStudentQRData } = require('../utils/encryption');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// ─── Multer: memory storage (buffer passed straight to Cloudinary) ───
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|gif|webp)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WEBP)'));
    }
  },
});

// ─── Helper: select columns shared by all GET queries ───
const STUDENT_COLS = `
  id, student_id, name, email, course, year_level,
  enrollment_status, photo_url, photo_public_id, created_at, updated_at
`;

// ══════════════════════════════════════════════════════════
// GET /api/students  — paginated + search
// ══════════════════════════════════════════════════════════
router.get('/', auth, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || '';
    const offset = (page - 1) * limit;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ success: false, message: 'Invalid pagination parameters' });
    }

    let query      = `SELECT ${STUDENT_COLS} FROM students WHERE active = true`;
    let countQuery = `SELECT COUNT(*) AS total  FROM students WHERE active = true`;
    let queryParams = [], countParams = [];

    if (search.length > 0) {
      const like = `%${search}%`;
      const clause = ` AND (name LIKE ? OR student_id LIKE ? OR email LIKE ? OR course LIKE ?)`;
      query      += clause;
      countQuery += clause;
      queryParams.push(like, like, like, like);
      countParams.push(like, like, like, like);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [students]     = await pool.query(query, queryParams);
    const [countResult]  = await pool.query(countQuery, countParams);

    const totalStudents = countResult[0].total;
    const totalPages    = Math.ceil(totalStudents / limit);

    res.json({
      success: true,
      message: 'Students retrieved successfully',
      data: {
        students,                          // photo_url is already an absolute Cloudinary URL
        pagination: {
          currentPage: page,
          totalPages,
          totalStudents,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve students' });
  }
});

// ══════════════════════════════════════════════════════════
// GET /api/students/:id
// ══════════════════════════════════════════════════════════
router.get('/:id', auth, async (req, res) => {
  try {
    const [students] = await pool.query(
      `SELECT ${STUDENT_COLS} FROM students WHERE id = ? AND active = true`,
      [req.params.id]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, message: 'Student retrieved successfully', data: students[0] });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve student' });
  }
});

// ══════════════════════════════════════════════════════════
// POST /api/students  — create
// ══════════════════════════════════════════════════════════
router.post('/', adminAuth, upload.single('photo'), async (req, res) => {
  try {
    const { student_id, name, email, course, year_level, enrollment_status } = req.body;

    if (!student_id || !name || !email || !course) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, name, email, and course are required',
      });
    }

    // Duplicate check
    const [existing] = await pool.query(
      'SELECT id FROM students WHERE (student_id = ? OR email = ?) AND active = true',
      [student_id, email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Student ID or email already exists' });
    }

    // Upload photo to Cloudinary (if provided)
    let photo_url        = null;
    let photo_public_id  = null;

    if (req.file) {
      const result     = await uploadToCloudinary(req.file.buffer, {
        public_id: `student_${student_id}_${Date.now()}`,
      });
      photo_url        = result.secure_url;
      photo_public_id  = result.public_id;
    }

    const [insertResult] = await pool.query(
      `INSERT INTO students
         (student_id, name, email, course, year_level, enrollment_status,
          photo_url, photo_public_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [student_id, name, email, course, year_level || 1,
       enrollment_status || 'active', photo_url, photo_public_id]
    );

    const [newStudent] = await pool.query(
      `SELECT ${STUDENT_COLS} FROM students WHERE id = ?`,
      [insertResult.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: newStudent[0],
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ success: false, message: 'Failed to create student' });
  }
});

// ══════════════════════════════════════════════════════════
// PUT /api/students/:id  — update
// ══════════════════════════════════════════════════════════
router.put('/:id', adminAuth, upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, name, email, course, year_level, enrollment_status } = req.body;

    // Existence check
    const [existing] = await pool.query(
      'SELECT * FROM students WHERE id = ? AND active = true',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Duplicate check (excluding current student)
    const [duplicates] = await pool.query(
      'SELECT id FROM students WHERE (student_id = ? OR email = ?) AND id != ? AND active = true',
      [student_id, email, id]
    );
    if (duplicates.length > 0) {
      return res.status(400).json({ success: false, message: 'Student ID or email already exists' });
    }

    let photo_url       = existing[0].photo_url;
    let photo_public_id = existing[0].photo_public_id;

    if (req.file) {
      // Delete old Cloudinary asset (safe — handles null/missing gracefully)
      await deleteFromCloudinary(existing[0].photo_public_id);

      // Upload new photo
      const result  = await uploadToCloudinary(req.file.buffer, {
        public_id: `student_${student_id}_${Date.now()}`,
      });
      photo_url       = result.secure_url;
      photo_public_id = result.public_id;
    }

    await pool.query(
      `UPDATE students
       SET student_id = ?, name = ?, email = ?, course = ?,
           year_level = ?, enrollment_status = ?,
           photo_url = ?, photo_public_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [student_id, name, email, course, year_level, enrollment_status,
       photo_url, photo_public_id, id]
    );

    const [updatedStudent] = await pool.query(
      `SELECT ${STUDENT_COLS} FROM students WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent[0],
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: 'Failed to update student' });
  }
});

// ══════════════════════════════════════════════════════════
// DELETE /api/students/:id  — soft delete + Cloudinary cleanup
// ══════════════════════════════════════════════════════════
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT * FROM students WHERE id = ? AND active = true',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Remove Cloudinary asset before soft-deleting the record
    await deleteFromCloudinary(existing[0].photo_public_id);

    await pool.query(
      'UPDATE students SET active = false, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete student' });
  }
});

// ══════════════════════════════════════════════════════════
// GET /api/students/:id/qr  — generate QR code
// ══════════════════════════════════════════════════════════
router.get('/:id/qr', auth, async (req, res) => {
  try {
    const [students] = await pool.query(
      'SELECT * FROM students WHERE id = ? AND active = true',
      [req.params.id]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = students[0];
    const qrData  = generateStudentQRData(student);

    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' },
      width: 256,
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
          course: student.course,
        },
      },
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate QR code' });
  }
});

module.exports = router;
