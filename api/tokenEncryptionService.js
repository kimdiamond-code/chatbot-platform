// ===================================================================
// TOKEN ENCRYPTION SERVICE
// Encrypts and decrypts OAuth tokens for secure storage
// ===================================================================

import crypto from 'crypto';

class TokenEncryptionService {
  constructor() {
    // Use environment variable for encryption key
    // In production, use AWS KMS, Azure Key Vault, or similar
    this.encryptionKey = process.env.TOKEN_ENCRYPTION_KEY || this.generateDefaultKey();
    this.algorithm = 'aes-256-gcm';
  }

  generateDefaultKey() {
    // Generate a random key if not provided (development only!)
    console.warn('⚠️ Using auto-generated encryption key. Set TOKEN_ENCRYPTION_KEY in production!');
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypt a token for storage
   * @param {string} token - Plain text token
   * @returns {string} - Encrypted token with IV and auth tag
   */
  encrypt(token) {
    if (!token) return null;

    try {
      // Generate random initialization vector
      const iv = crypto.randomBytes(16);
      
      // Create cipher
      const key = Buffer.from(this.encryptionKey.slice(0, 64), 'hex');
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      // Encrypt
      let encrypted = cipher.update(token, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get auth tag
      const authTag = cipher.getAuthTag();
      
      // Combine IV + authTag + encrypted data
      const combined = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
      
      return combined;
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      throw new Error('Token encryption failed');
    }
  }

  /**
   * Decrypt a token from storage
   * @param {string} encryptedToken - Encrypted token string
   * @returns {string} - Plain text token
   */
  decrypt(encryptedToken) {
    if (!encryptedToken) return null;

    try {
      // Split components
      const parts = encryptedToken.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted token format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      
      // Create decipher
      const key = Buffer.from(this.encryptionKey.slice(0, 64), 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      throw new Error('Token decryption failed');
    }
  }

  /**
   * Check if token is expired
   * @param {Date|string} expiresAt - Token expiration date
   * @returns {boolean}
   */
  isTokenExpired(expiresAt) {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    return now >= expiry;
  }

  /**
   * Calculate expiration date from expires_in seconds
   * @param {number} expiresIn - Seconds until expiration
   * @returns {Date}
   */
  calculateExpiresAt(expiresIn) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (expiresIn * 1000));
    return expiresAt;
  }
}

// Singleton instance
const tokenEncryptionService = new TokenEncryptionService();

export default tokenEncryptionService;
