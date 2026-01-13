const express = require('express');
const os = require('os');

const router = express.Router();

router.get('/network-info', async (req, res) => {
  try {
    const networkInterfaces = os.networkInterfaces();
    const ips = [];

    Object.keys(networkInterfaces).forEach((interfaceName) => {
      const interfaces = networkInterfaces[interfaceName];
      
      interfaces.forEach((iface) => {
        if (iface.family === 'IPv4' && !iface.internal) {
          ips.push(iface.address);
        }
      });
    });

    res.json({
      success: true,
      data: {
        ips,
        hostname: os.hostname(),
        platform: os.platform(),
        type: os.type()
      }
    });
  } catch (error) {
    console.error('Failed to get network info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve network information'
    });
  }
});

router.get('/test-connection', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Backend connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Connection test failed'
    });
  }
});

module.exports = router;
