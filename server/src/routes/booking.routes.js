const express = require('express');
const { body } = require('express-validator');
const { protect, authorize, validateRFID } = require('../middleware/auth');
const {
  createBooking,
  getBookings,
  getAvailableDates,
  getMealCategories,
  validateBooking,
  getAllBookings
} = require('../controllers/booking.controller');

const router = express.Router();

// Validation middleware
const bookingValidation = [
  body('date').notEmpty().withMessage('Booking date is required'),
  body('mealCategory').isObject().withMessage('Meal category details are required'),
  body('mealCategory.id').notEmpty().withMessage('Meal category ID is required'),
  body('mealCategory.name').notEmpty().withMessage('Meal category name is required'),
  body('mealCategory.price').isNumeric().withMessage('Meal price must be a number'),
  body('mealCategory.availableTime').notEmpty().withMessage('Meal available time is required'),
  body('paymentMethod').isIn(['wallet', 'upi', 'payroll']).withMessage('Invalid payment method'),
  body('amount').isNumeric().withMessage('Amount must be a number')
];

// Protected routes - require authentication
router.use(protect);

// Admin routes - must be before the generic routes
router.get('/all', authorize('admin'), getAllBookings);

// Regular user routes
router.get('/available-dates', getAvailableDates);
router.get('/meal-categories', getMealCategories);
router.post('/', bookingValidation, createBooking);
router.get('/', getBookings);

// RFID validation route
router.post('/validate', validateRFID, validateBooking);

module.exports = router;