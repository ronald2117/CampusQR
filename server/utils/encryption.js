const crypto = require('crypto');

// Encryption utility for QR codes
const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_KEY ? 
  crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY).digest() : 
  crypto.randomBytes(32);

const encrypt = (text) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

const decrypt = (encryptedText) => {
  try {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encrypted = textParts.join(':');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

const generateStudentQRData = (student) => {
  const qrData = {
    id: student.id,
    studentId: student.student_id,
    name: student.name,
    timestamp: Date.now(),
    version: '1.0'
  };
  
  return encrypt(JSON.stringify(qrData));
};

const validateQRData = (encryptedData) => {
  try {
    console.log('=== QR Code Validation Debug ===');
    console.log('Received encrypted data:', encryptedData?.substring(0, 50) + '...');
    console.log('Encrypted data length:', encryptedData?.length);
    
    const decryptedData = decrypt(encryptedData);
    console.log('Decrypted data:', decryptedData);
    
    const qrData = JSON.parse(decryptedData);
    console.log('Parsed QR data:', qrData);
    
    // No expiration for student QR codes - they're permanent IDs for gate access
    // QR codes remain valid as long as the student is active in the system
    
    console.log('✅ QR code validation successful');
    return qrData;
  } catch (error) {
    console.error('❌ QR code validation failed:', error.message);
    console.error('Error stack:', error.stack);
    throw new Error('Invalid QR code');
  }
};

module.exports = {
  encrypt,
  decrypt,
  generateStudentQRData,
  validateQRData
};
