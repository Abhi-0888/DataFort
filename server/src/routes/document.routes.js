const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authGuard } = require('../middleware/authGuard');
const { auditLogger } = require('../middleware/auditLogger');
const {
    uploadDocument,
    downloadDocument,
    listDocuments,
    deleteDocument,
} = require('../controllers/document.controller');

// Multer config — store encrypted blobs to disk
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_DIR || './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        cb(null, uniqueName); // Don't expose original filename on disk
    },
});

const upload = multer({
    storage,
    limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 50) * 1024 * 1024 },
});

router.use(authGuard);

router.get(
    '/vault/:vaultId',
    auditLogger('DOCUMENT_LIST', (req) => `vault:${req.params.vaultId}`),
    listDocuments,
);
router.post(
    '/upload',
    auditLogger('DOCUMENT_UPLOAD', () => 'document:new'),
    upload.single('file'),
    uploadDocument,
);
router.get(
    '/:id/download',
    auditLogger('DOCUMENT_DOWNLOAD', (req) => `document:${req.params.id}`),
    downloadDocument,
);
router.delete(
    '/:id',
    auditLogger('DOCUMENT_DELETE', (req) => `document:${req.params.id}`),
    deleteDocument,
);

module.exports = router;
