const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12;  // 96 bits (recommended for GCM)
const SALT_LENGTH = 32;
const PBKDF2_ITERATIONS = 310_000;
const PBKDF2_DIGEST = 'sha256';

/**
 * Derive an AES-256 key from a password using PBKDF2.
 * @param {string} password
 * @param {Buffer} salt
 * @returns {Buffer}
 */
const deriveKey = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, PBKDF2_DIGEST);
};

/**
 * Generate a cryptographically random salt.
 * @returns {Buffer}
 */
const generateSalt = () => crypto.randomBytes(SALT_LENGTH);

/**
 * Generate a random IV for AES-GCM.
 * @returns {Buffer}
 */
const generateIV = () => crypto.randomBytes(IV_LENGTH);

/**
 * Encrypt data with AES-256-GCM.
 * @param {string|Buffer} plaintext
 * @param {Buffer} key - 32-byte key
 * @returns {{ ciphertext: string, iv: string, authTag: string }}
 */
const encrypt = (plaintext, key) => {
    const iv = generateIV();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const plaintextBuffer = Buffer.isBuffer(plaintext) ? plaintext : Buffer.from(plaintext, 'utf8');
    const encrypted = Buffer.concat([cipher.update(plaintextBuffer), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
        ciphertext: encrypted.toString('base64'),
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
    };
};

/**
 * Decrypt data with AES-256-GCM.
 * @param {string} ciphertext - base64 encoded
 * @param {Buffer} key - 32-byte key
 * @param {string} iv - hex encoded
 * @param {string} authTag - hex encoded
 * @returns {string}
 */
const decrypt = (ciphertext, key, iv, authTag) => {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(ciphertext, 'base64')),
        decipher.final(),
    ]);

    return decrypted.toString('utf8');
};

module.exports = {
    ALGORITHM,
    KEY_LENGTH,
    IV_LENGTH,
    deriveKey,
    generateSalt,
    generateIV,
    encrypt,
    decrypt,
};
