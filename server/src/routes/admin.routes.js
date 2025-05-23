const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllBookings,
  exportBookings,
  manageWallet
} = require('../controllers/admin.controller');

const router = express.Router();

// Validation middleware
const walletValidation = [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('type').isIn(['credit', 'debit']).withMessage('Invalid transaction type')
];

// Protected admin routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/bookings/getAll', getAllBookings);
router.get('/bookings/export', exportBookings);

// Wallet management
router.post('/wallet/manage', walletValidation, manageWallet);

module.exports = router;