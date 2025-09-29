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
    const decryptedData = decrypt(encryptedData);
    const qrData = JSON.parse(decryptedData);
    
    // Check if QR code is not too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (Date.now() - qrData.timestamp > maxAge) {
      throw new Error('QR code expired');
    }
    
    return qrData;
  } catch (error) {
    throw new Error('Invalid or expired QR code');
  }
};

module.exports = {
  encrypt,
  decrypt,
  generateStudentQRData,
  validateQRData
};
