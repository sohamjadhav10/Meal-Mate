const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendBookingNotification } = require('../utils/notifications');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { date, mealCategory, paymentMethod, amount } = req.body;

    // Check for existing booking
    const existingBooking = await Booking.findOne({
      employeeId: req.user.employeeId,
      date: new Date(date),
      'mealCategory.id': mealCategory.id
    }).session(session);

    if (existingBooking) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'You already have a booking for this meal'
      });
    }

    // Handle payment
    if (paymentMethod === 'wallet') {
      const user = await User.findById(req.user._id).session(session);
      if (user.walletBalance < amount) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance'
        });
      }

      // Deduct from wallet
      await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { walletBalance: -amount } },
        { session, new: true }
      );
    }

    // Create booking
    const booking = await Booking.create([{
      employeeId: req.user.employeeId,
      employeeName: req.user.name,
      rfidCardId: req.user.rfidCardId,
      date: new Date(date),
      mealCategory,
      paymentMethod,
      amount,
      paymentStatus: 'completed',
      transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`
    }], { session });

    await session.commitTransaction();

    // Send notification to admin
    await sendBookingNotification(booking[0]);

    res.status(201).json({
      success: true,
      booking: booking[0]
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
    const { date, status } = req.query;
    const query = { employeeId: req.user.employeeId };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    if (status === 'availed') {
      query.isAvailed = true;
    } else if (status === 'pending') {
      query.isAvailed = false;
    }

    const bookings = await Booking.find(query).sort({ date: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available dates for booking
// @route   GET /api/bookings/available-dates
// @access  Private
exports.getAvailableDates = async (req, res) => {
  const dates = [];
  const today = new Date();

  // Get next 3 days
  for (let i = 1; i <= 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      formatted: date.toISOString().split('T')[0],
      display: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })
    });
  }

  res.json({
    success: true,
    dates
  });
};

// @desc    Get meal categories
// @route   GET /api/bookings/meal-categories
// @access  Private
exports.getMealCategories = async (req, res) => {
  // Mock meal categories (in production, this would come from a database)
  const categories = [
    {
      id: 'breakfast',
      name: 'Breakfast',
      price: 50,
      availableTime: '8:00 AM - 10:00 AM',
      items: [
        { id: 'b1', name: 'Poha', description: 'Flattened rice with vegetables' },
        { id: 'b2', name: 'Sandwich', description: 'Vegetable sandwich' },
        { id: 'b3', name: 'Tea/Coffee', description: 'Hot beverage' }
      ]
    },
    {
      id: 'lunch',
      name: 'Lunch',
      price: 100,
      availableTime: '12:30 PM - 2:30 PM',
      items: [
        { id: 'l1', name: 'Rice', description: 'Steamed rice' },
        { id: 'l2', name: 'Dal', description: 'Lentil curry' },
        { id: 'l3', name: 'Vegetables', description: 'Mixed vegetables' },
        { id: 'l4', name: 'Roti', description: 'Whole wheat bread' }
      ]
    },
    {
      id: 'dinner',
      name: 'Dinner',
      price: 100,
      availableTime: '7:30 PM - 9:30 PM',
      items: [
        { id: 'd1', name: 'Rice', description: 'Steamed rice' },
        { id: 'd2', name: 'Dal', description: 'Lentil curry' },
        { id: 'd3', name: 'Vegetables', description: 'Mixed vegetables' },
        { id: 'd4', name: 'Roti', description: 'Whole wheat bread' }
      ]
    }
  ];

  res.json({
    success: true,
    categories
  });
};

// @desc    Validate booking with RFID
// @route   POST /api/bookings/validate
// @access  Private
exports.validateBooking = async (req, res, next) => {
  try {
    const { rfidCardId } = req.rfidUser;
    const { mealCategoryId } = req.body;

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Find booking for today
    const booking = await Booking.findOne({
      rfidCardId,
      date: { $gte: startOfDay, $lte: endOfDay },
      'mealCategory.id': mealCategoryId,
      isAvailed: false
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'No valid booking found for today'
      });
    }

    // Mark booking as availed
    booking.isAvailed = true;
    booking.availedAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Meal approved',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/all
// @access  Private/Admin
exports.getAllBookings = async (req, res, next) => {
  try {
    const { date, status, employeeId } = req.query;
    const query = {};

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    if (status === 'availed') {
      query.isAvailed = true;
    } else if (status === 'pending') {
      query.isAvailed = false;
    }

    if (employeeId) {
      query.employeeId = employeeId;
    }

    const bookings = await Booking.find(query).sort({ date: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    next(error);
  }
};