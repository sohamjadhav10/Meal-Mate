const { validationResult } = require('express-validator');
const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's bookings
    const todayBookings = await Booking.find({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Calculate statistics
    const stats = {
      todayTotal: todayBookings.length,
      todayAvailed: todayBookings.filter(b => b.isAvailed).length,
      todayPending: todayBookings.filter(b => !b.isAvailed).length,
      todayRevenue: todayBookings.reduce((sum, booking) => sum + booking.amount, 0),
      mealTypeDistribution: {
        breakfast: todayBookings.filter(b => b.mealCategory.id === 'breakfast').length,
        lunch: todayBookings.filter(b => b.mealCategory.id === 'lunch').length,
        dinner: todayBookings.filter(b => b.mealCategory.id === 'dinner').length
      },
      paymentMethodDistribution: {
        wallet: todayBookings.filter(b => b.paymentMethod === 'wallet').length,
        upi: todayBookings.filter(b => b.paymentMethod === 'upi').length,
        payroll: todayBookings.filter(b => b.paymentMethod === 'payroll').length
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings with filters
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res, next) => {
  try {
    const { date, mealType, employeeId, page = 1, limit = 10 } = req.query;
    const query = {};

    // Apply filters
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    if (mealType) {
      query['mealCategory.id'] = mealType;
    }

    if (employeeId) {
      query.employeeId = employeeId;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query)
    ]);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Export bookings data
// @route   GET /api/admin/bookings/export
// @access  Private/Admin
exports.exportBookings = async (req, res, next) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(query).sort({ date: -1 });

    // Transform bookings data
    const exportData = bookings.map(booking => ({
      'Booking ID': booking._id,
      'Employee ID': booking.employeeId,
      'Employee Name': booking.employeeName,
      'Date': booking.date.toLocaleDateString(),
      'Meal Type': booking.mealCategory.name,
      'Amount': booking.amount,
      'Payment Method': booking.paymentMethod,
      'Payment Status': booking.paymentStatus,
      'Availed': booking.isAvailed ? 'Yes' : 'No',
      'Availed At': booking.availedAt ? booking.availedAt.toLocaleString() : '-',
      'Transaction ID': booking.transactionId
    }));

    if (format === 'json') {
      res.json({
        success: true,
        data: exportData
      });
    } else {
      // Convert to CSV
      const fields = Object.keys(exportData[0]);
      const csv = [
        fields.join(','),
        ...exportData.map(row =>
          fields.map(field => `"${row[field]}"`).join(',')
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=bookings-${Date.now()}.csv`);
      res.send(csv);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Manage user wallet balance
// @route   POST /api/admin/wallet/manage
// @access  Private/Admin
exports.manageWallet = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { employeeId, amount, type } = req.body;

    const user = await User.findOne({ employeeId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update wallet balance
    const updateAmount = type === 'credit' ? amount : -amount;
    
    if (type === 'debit' && user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    user.walletBalance += updateAmount;
    await user.save();

    res.json({
      success: true,
      user: {
        employeeId: user.employeeId,
        name: user.name,
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    next(error);
  }
};