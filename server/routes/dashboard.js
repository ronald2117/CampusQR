const express = require('express');
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    // Get total students
    const [totalStudents] = await pool.execute(
      'SELECT COUNT(*) as count FROM students WHERE active = true'
    );

    // Get active students
    const [activeStudents] = await pool.execute(
      'SELECT COUNT(*) as count FROM students WHERE active = true AND enrollment_status = "active"'
    );

    // Get today's access logs
    const [todayAccess] = await pool.execute(
      'SELECT COUNT(*) as count FROM access_logs WHERE DATE(created_at) = CURDATE()'
    );

    // Get successful access today
    const [todaySuccessful] = await pool.execute(
      'SELECT COUNT(*) as count FROM access_logs WHERE DATE(created_at) = CURDATE() AND access_granted = true'
    );

    // Get recent access attempts (last 10)
    const [recentAccess] = await pool.execute(`
      SELECT al.id, al.access_granted, al.location, al.verification_type, 
             al.created_at, s.name as student_name, s.student_id, 
             s.course, s.photo_url, u.username as scanned_by
      FROM access_logs al
      LEFT JOIN students s ON al.student_id = s.id
      LEFT JOIN users u ON al.scanned_by = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    // Get access statistics by day (last 7 days)
    const [weeklyStats] = await pool.execute(`
      SELECT DATE(created_at) as date, 
             COUNT(*) as total_attempts,
             SUM(CASE WHEN access_granted = true THEN 1 ELSE 0 END) as successful_attempts
      FROM access_logs
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Get top courses by student count
    const [topCourses] = await pool.execute(`
      SELECT course, COUNT(*) as student_count
      FROM students 
      WHERE active = true AND enrollment_status = 'active'
      GROUP BY course
      ORDER BY student_count DESC
      LIMIT 5
    `);

    // Get enrollment status distribution
    const [enrollmentStats] = await pool.execute(`
      SELECT enrollment_status, COUNT(*) as count
      FROM students 
      WHERE active = true
      GROUP BY enrollment_status
    `);

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        overview: {
          totalStudents: totalStudents[0].count,
          activeStudents: activeStudents[0].count,
          todayAccess: todayAccess[0].count,
          todaySuccessful: todaySuccessful[0].count,
          successRate: todayAccess[0].count > 0 ? 
            ((todaySuccessful[0].count / todayAccess[0].count) * 100).toFixed(1) : 0
        },
        recentAccess,
        weeklyStats: weeklyStats.map(stat => ({
          date: stat.date,
          totalAttempts: stat.total_attempts,
          successfulAttempts: stat.successful_attempts,
          successRate: stat.total_attempts > 0 ? 
            ((stat.successful_attempts / stat.total_attempts) * 100).toFixed(1) : 0
        })),
        topCourses,
        enrollmentStats
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics'
    });
  }
});

// Get system health information
router.get('/health', auth, async (req, res) => {
  try {
    // Test database connection
    const [dbTest] = await pool.execute('SELECT 1 as test');
    
    // Get database size information
    const [dbInfo] = await pool.execute(`
      SELECT 
        table_name,
        table_rows,
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'size_mb'
      FROM information_schema.tables 
      WHERE table_schema = ? 
      ORDER BY (data_length + index_length) DESC
    `, [process.env.DB_NAME || 'campusqr']);

    res.json({
      success: true,
      message: 'System health information',
      data: {
        database: {
          status: dbTest.length > 0 ? 'connected' : 'disconnected',
          tables: dbInfo
        },
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.version,
          platform: process.platform
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

module.exports = router;
