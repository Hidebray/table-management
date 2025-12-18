// backend/routes/tableRoutes.js
const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { validateTableInput } = require('../middlewares/tableValidation');

// CRUD Cơ bản
router.get('/', tableController.getAllTables);
router.get('/locations', tableController.getLocations);
router.get('/:id', tableController.getTableById);
router.post('/', validateTableInput, tableController.createTable);
router.put('/:id', validateTableInput, tableController.updateTable);
router.patch('/:id/status', validateTableInput, tableController.toggleTableStatus);


router.post('/:id/qr/generate', tableController.generateQRCode); 
router.get('/:id/qr/download', tableController.downloadSingleQR);
router.get('/qr/download-all', tableController.downloadAllQRs); 
router.get('/qr/download-pdf', tableController.downloadAllQRsPDF); 
router.post('/qr/regenerate-all', tableController.regenerateAllQRs); 

module.exports = router;