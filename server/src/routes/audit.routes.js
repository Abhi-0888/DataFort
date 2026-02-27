const express = require('express');
const router = express.Router();
const { authGuard } = require('../middleware/authGuard');
const { getAuditLogs } = require('../controllers/audit.controller');

router.use(authGuard);
router.get('/', getAuditLogs);

module.exports = router;
