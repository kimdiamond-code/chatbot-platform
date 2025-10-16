// ===================================================================
// ENCRYPTION UTILITIES - For securing sensitive data
// ===================================================================

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Generate encryption key from secret
 */
function getEncryptionKey() {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('ENCRYPTION_SECRET must be at least 32 characters');
  }
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt sensitive data
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text with IV and auth tag
 */
export function encrypt(text) {
  if (!text) return text;
  
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt encrypted data
 * @param {string} encryptedText - Encrypted text with IV and auth tag
 * @returns {string} - Decrypted plain text
 */
export function decrypt(encryptedText) {
  if (!encryptedText || typeof encryptedText !== 'string') return encryptedText;
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const key = getEncryptionKey();
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash sensitive data (one-way, for comparison)
 * @param {string} text - Text to hash
 * @returns {string} - Hashed text
 */
export function hash(text) {
  if (!text) return text;
  
  const salt = process.env.HASH_SALT || 'default-salt-change-me';
  return crypto
    .createHmac('sha256', salt)
    .update(text)
    .digest('hex');
}

/**
 * Generate secure random token
 * @param {number} length - Token length (default 32)
 * @returns {string} - Random token
 */
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Mask sensitive data for display (e.g., email, phone)
 * @param {string} text - Text to mask
 * @param {string} type - Type of masking (email, phone, card)
 * @returns {string} - Masked text
 */
export function maskData(text, type = 'default') {
  if (!text) return text;
  
  switch (type) {
    case 'email':
      const [local, domain] = text.split('@');
      if (!domain) return text;
      return `${local[0]}***${local[local.length - 1]}@${domain}`;
    
    case 'phone':
      const cleaned = text.replace(/\D/g, '');
      if (cleaned.length < 4) return '***';
      return `***-***-${cleaned.slice(-4)}`;
    
    case 'card':
      const cardCleaned = text.replace(/\s/g, '');
      if (cardCleaned.length < 4) return '****';
      return `**** **** **** ${cardCleaned.slice(-4)}`;
    
    default:
      if (text.length <= 4) return '***';
      return `${text[0]}***${text[text.length - 1]}`;
  }
}

/**
 * Encrypt multiple fields in an object
 * @param {object} data - Object with data
 * @param {array} fields - Fields to encrypt
 * @returns {object} - Object with encrypted fields
 */
export function encryptFields(data, fields = []) {
  if (!data || typeof data !== 'object') return data;
  
  const encrypted = { ...data };
  fields.forEach(field => {
    if (encrypted[field]) {
      encrypted[field] = encrypt(String(encrypted[field]));
    }
  });
  
  return encrypted;
}

/**
 * Decrypt multiple fields in an object
 * @param {object} data - Object with encrypted data
 * @param {array} fields - Fields to decrypt
 * @returns {object} - Object with decrypted fields
 */
export function decryptFields(data, fields = []) {
  if (!data || typeof data !== 'object') return data;
  
  const decrypted = { ...data };
  fields.forEach(field => {
    if (decrypted[field]) {
      try {
        decrypted[field] = decrypt(decrypted[field]);
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error);
        // Keep original value if decryption fails
      }
    }
  });
  
  return decrypted;
}

export default {
  encrypt,
  decrypt,
  hash,
  generateToken,
  maskData,
  encryptFields,
  decryptFields
};
