const express = require('express');
const router = express.Router();
const { authGuard } = require('../middleware/authGuard');
const { auditLogger } = require('../middleware/auditLogger');
const {
    getCredentials,
    createCredential,
    updateCredential,
    deleteCredential,
} = require('../controllers/credential.controller');

router.use(authGuard);

// Audit log every read of credentials
router.get(
    '/vault/:vaultId',
    auditLogger('CREDENTIAL_LIST', (req) => `vault:${req.params.vaultId}`),
    getCredentials,
);
router.post(
    '/',
    auditLogger('CREDENTIAL_CREATE', () => 'credential:new'),
    createCredential,
);
router.put(
    '/:id',
    auditLogger('CREDENTIAL_UPDATE', (req) => `credential:${req.params.id}`),
    updateCredential,
);
router.delete(
    '/:id',
    auditLogger('CREDENTIAL_DELETE', (req) => `credential:${req.params.id}`),
    deleteCredential,
);

module.exports = router;
