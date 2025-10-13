const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Get user statistics (admin only) - MUST be before /:id route
router.get('/stats/summary', auth, isAdmin, async (req, res) => {
  try {
    // Total users by role
    const [roleStats] = await pool.execute(`
      SELECT 
        role,
        COUNT(*) as count
      FROM users
      WHERE active = true
      GROUP BY role
    `);

    // Active vs inactive users
    const [activeStats] = await pool.execute(`
      SELECT 
        active,
        COUNT(*) as count
      FROM users
      GROUP BY active
    `);

    // Recent users (last 30 days)
    const [recentUsers] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    res.json({
      success: true,
      data: {
        byRole: roleStats,
        byStatus: activeStats,
        recentUsers: recentUsers[0].count
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

// Get all users (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const offset = (page - 1) * limit;

    let query = 'SELECT id, username, email, role, active, last_login, created_at FROM users WHERE 1=1';
    const params = [];

    // Search filter
    if (search) {
      query += ' AND (username LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Role filter
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    // Get total count
    const [countResult] = await pool.execute(
      query.replace('SELECT id, username, email, role, active, last_login, created_at', 'SELECT COUNT(*) as total'),
      params
    );
    const totalUsers = countResult[0].total;

    // Get paginated users - LIMIT and OFFSET cannot be parameterized in MySQL prepared statements
    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [users] = await pool.execute(query, params);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          limit: limit,
          hasNextPage: offset + users.length < totalUsers,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get single user (admin only)
router.get('/:id', auth, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, role, active, last_login, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Create new user (admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate role
    if (!['admin', 'security'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be admin or security'
      });
    }

    // Check if username already exists
    const [existingUser] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, role, active) VALUES (?, ?, ?, ?, true)',
      [username, email, hashedPassword, role]
    );

    // Fetch created user
    const [newUser] = await pool.execute(
      'SELECT id, username, email, role, active, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// Update user (admin only)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { username, email, role, active, password } = req.body;
    const userId = req.params.id;

    // Prevent admin from deactivating themselves
    if (userId == req.user.id && active === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Check if user exists
    const [existingUser] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for duplicate username/email
    const [duplicate] = await pool.execute(
      'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, userId]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Build update query
    let updateQuery = 'UPDATE users SET username = ?, email = ?, role = ?, active = ?';
    let params = [username, email, role, active];

    // If password is provided, hash and include it
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    params.push(userId);

    await pool.execute(updateQuery, params);

    // Fetch updated user
    const [updatedUser] = await pool.execute(
      'SELECT id, username, email, role, active, last_login, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId == req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Check if user exists
    const [existingUser] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

module.exports = router;
