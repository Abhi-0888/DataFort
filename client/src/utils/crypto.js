/**
 * DataFort — Client-Side Crypto Utilities
 * Uses the Web Crypto API for AES-256-GCM encryption/decryption.
 *
 * ZERO-KNOWLEDGE: Plaintext never leaves the browser.
 * The master password is used to derive the encryption key via PBKDF2.
 * The derived key is held in memory only — never stored or sent to the server.
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 310_000;

/**
 * Encode a string to Uint8Array.
 */
const encode = (str) => new TextEncoder().encode(str);

/**
 * Decode a Uint8Array to string.
 */
const decode = (buf) => new TextDecoder().decode(buf);

/**
 * Convert an ArrayBuffer to a base64 string.
 */
const bufToBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));

/**
 * Convert a base64 string back to Uint8Array.
 */
const base64ToBuf = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

/**
 * Convert hex string to Uint8Array.
 */
const hexToBuf = (hex) => new Uint8Array(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));

/**
 * Convert Uint8Array to hex string.
 */
const bufToHex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');

/**
 * Derive an AES-256-GCM CryptoKey from a master password.
 * @param {string} password
 * @param {Uint8Array} salt
 * @returns {Promise<CryptoKey>}
 */
export const deriveKey = async (password, salt) => {
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        keyMaterial,
        { name: ALGORITHM, length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
};

/**
 * Generate a random salt for key derivation.
 * @returns {Uint8Array}
 */
export const generateSalt = () => crypto.getRandomValues(new Uint8Array(32));

/**
 * Encrypt a string with AES-256-GCM.
 * @param {string} plaintext
 * @param {CryptoKey} key
 * @returns {Promise<{ ciphertext: string, iv: string }>}
 */
export const encrypt = async (plaintext, key) => {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv },
        key,
        encode(plaintext)
    );

    return {
        ciphertext: bufToBase64(encrypted), // includes auth tag (last 16 bytes in WebCrypto)
        iv: bufToHex(iv),
    };
};

/**
 * Decrypt a ciphertext with AES-256-GCM.
 * @param {string} ciphertext - base64 encoded
 * @param {string} iv - hex encoded
 * @param {CryptoKey} key
 * @returns {Promise<string>}
 */
export const decrypt = async (ciphertext, iv, key) => {
    const decrypted = await crypto.subtle.decrypt(
        { name: ALGORITHM, iv: hexToBuf(iv) },
        key,
        base64ToBuf(ciphertext)
    );
    return decode(decrypted);
};

/**
 * Encrypt a file blob with AES-256-GCM.
 * @param {File} file
 * @param {CryptoKey} key
 * @returns {Promise<{ encryptedBlob: Blob, iv: string }>}
 */
export const encryptFile = async (file, key) => {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const fileData = await file.arrayBuffer();
    const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, fileData);
    return {
        encryptedBlob: new Blob([encrypted], { type: 'application/octet-stream' }),
        iv: bufToHex(iv),
    };
};

/**
 * Decrypt an encrypted file ArrayBuffer.
 * @param {ArrayBuffer} encryptedData
 * @param {string} iv - hex encoded
 * @param {CryptoKey} key
 * @returns {Promise<ArrayBuffer>}
 */
export const decryptFile = async (encryptedData, iv, key) => {
    return crypto.subtle.decrypt({ name: ALGORITHM, iv: hexToBuf(iv) }, key, encryptedData);
};
