const express = require('express');
const { body } = require('express-validator');
const { protect, validateRFID } = require('../middleware/auth');
const {
  scanRFID,
  validateMeal
} = require('../controllers/rfid.controller');

const router = express.Router();

// Validation middleware
const rfidScanValidation = [
  body('rfidCardId').notEmpty().withMessage('RFID card ID is required'),
  body('mealCategoryId').notEmpty().withMessage('Meal category ID is required')
];

// Protected routes
router.use(protect);

// RFID routes
router.post('/scan', rfidScanValidation, scanRFID);
router.post('/validate', validateRFID, validateMeal);

module.exports = router;