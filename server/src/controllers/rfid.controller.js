const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');

// @desc    Scan RFID card and check booking
// @route   POST /api/rfid/scan
// @access  Private
exports.scanRFID = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { rfidCardId, mealCategoryId } = req.body;

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

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate meal and mark as availed
// @route   POST /api/rfid/validate
// @access  Private
exports.validateMeal = async (req, res, next) => {
  try {
    const { rfidCardId } = req.rfidUser;
    const { mealCategoryId } = req.body;

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Find and validate booking
    const booking = await Booking.findOne({
      rfidCardId,
      date: { $gte: startOfDay, $lte: endOfDay },
      'mealCategory.id': mealCategoryId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'No booking found for today'
      });
    }

    if (booking.isAvailed) {
      return res.status(400).json({
        success: false,
        message: 'Meal has already been availed',
        booking
      });
    }

    // Check meal timing
    const currentHour = now.getHours();
    const mealTimings = {
      breakfast: { start: 8, end: 10 },
      lunch: { start: 12, end: 14 },
      dinner: { start: 19, end: 21 }
    };

    const mealTiming = mealTimings[booking.mealCategory.id];
    if (currentHour < mealTiming.start || currentHour >= mealTiming.end) {
      return res.status(400).json({
        success: false,
        message: 'Meal is not available at this time'
      });
    }

    // Mark meal as availed
    booking.isAvailed = true;
    booking.availedAt = now;
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