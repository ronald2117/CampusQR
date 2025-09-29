const express = require('express');
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');
const { validateQRData } = require('../utils/encryption');

const router = express.Router();

// Verify QR code
router.post('/verify', auth, async (req, res) => {
  try {
    const { qrData, location } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    // Validate and decrypt QR data
    let studentData;
    try {
      studentData = validateQRData(qrData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Get full student details from database
    const [students] = await pool.execute(
      `SELECT id, student_id, name, email, course, year_level, 
              enrollment_status, photo_url, created_at
       FROM students 
       WHERE id = ? AND student_id = ? AND active = true`,
      [studentData.id, studentData.studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or inactive'
      });
    }

    const student = students[0];

    // Check enrollment status
    if (student.enrollment_status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Access denied. Student status: ${student.enrollment_status}`,
        data: {
          student,
          accessGranted: false,
          reason: 'Inactive enrollment status'
        }
      });
    }

    // Log the access attempt
    await pool.execute(
      `INSERT INTO access_logs (student_id, scanned_by, location, 
       access_granted, qr_data, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [student.id, req.user.id, location || 'Unknown', true, qrData]
    );

    res.json({
      success: true,
      message: 'Access granted',
      data: {
        student: {
          id: student.id,
          student_id: student.student_id,
          name: student.name,
          email: student.email,
          course: student.course,
          year_level: student.year_level,
          enrollment_status: student.enrollment_status,
          photo_url: student.photo_url
        },
        accessGranted: true,
        timestamp: new Date().toISOString(),
        location: location || 'Unknown'
      }
    });

  } catch (error) {
    console.error('QR verification error:', error);
    
    // Log failed attempt
    try {
      await pool.execute(
        `INSERT INTO access_logs (scanned_by, location, access_granted, 
         qr_data, error_message, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [req.user.id, req.body.location || 'Unknown', false, req.body.qrData, error.message]
      );
    } catch (logError) {
      console.error('Failed to log access attempt:', logError);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to verify QR code'
    });
  }
});

// Manual verification (backup method)
router.post('/manual-verify', auth, async (req, res) => {
  try {
    const { student_id, location, reason } = req.body;

    if (!student_id || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and reason are required'
      });
    }

    // Get student details
    const [students] = await pool.execute(
      `SELECT id, student_id, name, email, course, year_level, 
              enrollment_status, photo_url
       FROM students 
       WHERE student_id = ? AND active = true`,
      [student_id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const student = students[0];

    // Log manual verification
    await pool.execute(
      `INSERT INTO access_logs (student_id, scanned_by, location, 
       access_granted, verification_type, manual_reason, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [student.id, req.user.id, location || 'Unknown', true, 'manual', reason]
    );

    res.json({
      success: true,
      message: 'Manual verification completed',
      data: {
        student,
        accessGranted: true,
        verificationType: 'manual',
        reason,
        timestamp: new Date().toISOString(),
        location: location || 'Unknown'
      }
    });

  } catch (error) {
    console.error('Manual verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete manual verification'
    });
  }
});

// Get access logs
router.get('/logs', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const student_id = req.query.student_id;
    const date_from = req.query.date_from;
    const date_to = req.query.date_to;
    const access_granted = req.query.access_granted;
    const offset = (page - 1) * limit;

    let query = `
      SELECT al.id, al.student_id, al.location, al.access_granted, 
             al.verification_type, al.manual_reason, al.error_message, 
             al.created_at,
             s.student_id as student_number, s.name as student_name, 
             s.course, s.photo_url,
             u.username as scanned_by_username
      FROM access_logs al
      LEFT JOIN students s ON al.student_id = s.id
      LEFT JOIN users u ON al.scanned_by = u.id
      WHERE 1=1
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM access_logs al
      LEFT JOIN students s ON al.student_id = s.id
      WHERE 1=1
    `;
    
    let params = [];

    if (student_id) {
      query += ` AND s.student_id LIKE ?`;
      countQuery += ` AND s.student_id LIKE ?`;
      params.push(`%${student_id}%`);
    }

    if (date_from) {
      query += ` AND DATE(al.created_at) >= ?`;
      countQuery += ` AND DATE(al.created_at) >= ?`;
      params.push(date_from);
    }

    if (date_to) {
      query += ` AND DATE(al.created_at) <= ?`;
      countQuery += ` AND DATE(al.created_at) <= ?`;
      params.push(date_to);
    }

    if (access_granted !== undefined) {
      query += ` AND al.access_granted = ?`;
      countQuery += ` AND al.access_granted = ?`;
      params.push(access_granted === 'true');
    }

    query += ` ORDER BY al.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [logs] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, params.slice(0, -2));
    
    const totalLogs = countResult[0].total;
    const totalPages = Math.ceil(totalLogs / limit);

    res.json({
      success: true,
      message: 'Access logs retrieved successfully',
      data: {
        logs,
        pagination: {
          currentPage: page,
          totalPages,
          totalLogs,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get access logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve access logs'
    });
  }
});

module.exports = router;
