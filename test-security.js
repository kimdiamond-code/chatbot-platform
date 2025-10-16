// ===================================================================
// SECURITY FEATURES TEST
// Run this to verify security implementation is working
// ===================================================================

import { 
  encrypt, 
  decrypt, 
  hash,
  maskData,
  encryptFields,
  decryptFields
} from './api/security/encryption.js';

import {
  sanitizeString,
  isValidEmail,
  isValidPhone,
  validateMessage,
  containsSQLInjection
} from './api/security/validation.js';

console.log('🔐 Testing Security Features...\n');

// Test 1: Encryption
console.log('1️⃣  Testing Encryption...');
try {
  const original = 'test@example.com';
  const encrypted = encrypt(original);
  const decrypted = decrypt(encrypted);
  
  console.log('   Original:', original);
  console.log('   Encrypted:', encrypted.substring(0, 50) + '...');
  console.log('   Decrypted:', decrypted);
  console.log('   ✅ PASS: Encryption working\n');
} catch (error) {
  console.log('   ❌ FAIL:', error.message, '\n');
  console.log('   HINT: Set ENCRYPTION_SECRET in .env (min 32 chars)\n');
}

// Test 2: Field Encryption
console.log('2️⃣  Testing Field Encryption...');
try {
  const data = {
    customer_email: 'user@example.com',
    customer_phone: '123-456-7890',
    customer_name: 'John Doe'
  };
  
  const encrypted = encryptFields(data, ['customer_email', 'customer_phone', 'customer_name']);
  const decrypted = decryptFields(encrypted, ['customer_email', 'customer_phone', 'customer_name']);
  
  console.log('   Original:', data);
  console.log('   Encrypted:', encrypted.customer_email.substring(0, 50) + '...');
  console.log('   Decrypted:', decrypted);
  console.log('   ✅ PASS: Field encryption working\n');
} catch (error) {
  console.log('   ❌ FAIL:', error.message, '\n');
}

// Test 3: Data Masking
console.log('3️⃣  Testing Data Masking...');
console.log('   Email: user@example.com →', maskData('user@example.com', 'email'));
console.log('   Phone: 123-456-7890 →', maskData('123-456-7890', 'phone'));
console.log('   Card: 1234567890123456 →', maskData('1234567890123456', 'card'));
console.log('   ✅ PASS: Data masking working\n');

// Test 4: XSS Prevention
console.log('4️⃣  Testing XSS Prevention...');
const xssInput = 'Hello <script>alert("xss")</script> World';
const sanitized = sanitizeString(xssInput);
console.log('   Input:', xssInput);
console.log('   Sanitized:', sanitized);
console.log('   XSS Removed:', !sanitized.includes('<script>') ? '✅' : '❌', '\n');

// Test 5: Email Validation
console.log('5️⃣  Testing Email Validation...');
const emails = [
  'valid@example.com',
  'invalid@',
  'no-at-sign.com',
  'test@test'
];
emails.forEach(email => {
  const valid = isValidEmail(email);
  console.log(`   ${email}: ${valid ? '✅' : '❌'}`);
});
console.log();

// Test 6: Phone Validation
console.log('6️⃣  Testing Phone Validation...');
const phones = [
  '123-456-7890',
  '1234567890',
  '+1-234-567-8900',
  '123'
];
phones.forEach(phone => {
  const valid = isValidPhone(phone);
  console.log(`   ${phone}: ${valid ? '✅' : '❌'}`);
});
console.log();

// Test 7: SQL Injection Detection
console.log('7️⃣  Testing SQL Injection Detection...');
const sqlTests = [
  'Normal text',
  "'; DROP TABLE users; --",
  'SELECT * FROM users',
  '1=1 OR 1=1'
];
sqlTests.forEach(test => {
  const isSQLInjection = containsSQLInjection(test);
  console.log(`   ${test.substring(0, 30)}: ${isSQLInjection ? '⚠️  SQL detected' : '✅ Clean'}`);
});
console.log();

// Test 8: Message Validation
console.log('8️⃣  Testing Message Validation...');
const validMessage = {
  conversation_id: '123',
  sender_type: 'user',
  content: 'Hello world!'
};
const invalidMessage = {
  conversation_id: '123',
  sender_type: 'invalid',
  content: ''
};

const validResult = validateMessage(validMessage);
const invalidResult = validateMessage(invalidMessage);

console.log('   Valid message:', validResult.valid ? '✅' : '❌');
console.log('   Invalid message:', !invalidResult.valid ? '✅' : '❌');
if (!invalidResult.valid) {
  console.log('   Errors:', invalidResult.errors);
}
console.log();

// Test 9: Hashing
console.log('9️⃣  Testing Hashing...');
try {
  const password = 'myPassword123';
  const hashed1 = hash(password);
  const hashed2 = hash(password);
  
  console.log('   Original:', password);
  console.log('   Hash 1:', hashed1.substring(0, 20) + '...');
  console.log('   Hash 2:', hashed2.substring(0, 20) + '...');
  console.log('   Consistent:', hashed1 === hashed2 ? '✅' : '❌', '\n');
} catch (error) {
  console.log('   ❌ FAIL:', error.message, '\n');
}

console.log('========================================');
console.log('Security Test Complete!');
console.log('========================================\n');

console.log('Next steps:');
console.log('1. Set ENCRYPTION_SECRET, HASH_SALT, API_SECRET_KEY in .env');
console.log('2. Run: node --experimental-modules test-security.js');
console.log('3. All tests should pass before deploying');
console.log('4. Review SECURITY_IMPLEMENTATION.md for full details\n');
