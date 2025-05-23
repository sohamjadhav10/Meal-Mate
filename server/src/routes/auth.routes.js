const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  register,
  login,
  linkRFIDCard,
  unlinkRFIDCard,
  getProfile,
  updateProfile
} = require('../controllers/auth.controller');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('password').notEmpty().withMessage('Password must be at least 6 characters').isLength({ min: 6 }),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('rfidCardId').notEmpty().withMessage('RFID card ID is required')
];

const loginValidation = [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('rfidCardId').optional().trim()
];

const rfidValidation = [
  body('rfidCardId').notEmpty().withMessage('RFID card ID is required')
];

const profileValidation = [
  body('name').optional().trim(),
  body('email').optional().isEmail().withMessage('Please enter a valid email')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes - require authentication
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', profileValidation, updateProfile);
router.post('/rfid/link', rfidValidation, linkRFIDCard);
router.delete('/rfid/unlink', unlinkRFIDCard);

module.exports = router;