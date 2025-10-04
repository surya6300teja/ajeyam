const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Hash a password using bcrypt
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} The hashed password
 */
exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hashed password
 * @param {string} candidatePassword - The plain text password to check
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
exports.comparePassword = async (candidatePassword, hashedPassword) => {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

/**
 * Create a JWT token for a user
 * @param {string} userId - The user ID to encode in the token
 * @returns {string} The JWT token
 */
exports.signToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Verify a JWT token
 * @param {string} token - The token to verify
 * @returns {Promise<Object>} The decoded token payload
 */
exports.verifyToken = async (token) => {
  return await jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Create a random token for password reset or email verification
 * @returns {string} The random token
 */
exports.createRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a token with SHA-256
 * @param {string} token - The token to hash
 * @returns {string} The hashed token
 */
exports.hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
}; 