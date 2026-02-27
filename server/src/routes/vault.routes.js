const express = require('express');
const router = express.Router();
const { authGuard } = require('../middleware/authGuard');
const {
    getVaults,
    createVault,
    getVaultById,
    updateVault,
    deleteVault,
} = require('../controllers/vault.controller');

// All vault routes require authentication
router.use(authGuard);

router.get('/', getVaults);
router.post('/', createVault);
router.get('/:id', getVaultById);
router.put('/:id', updateVault);
router.delete('/:id', deleteVault);

module.exports = router;
