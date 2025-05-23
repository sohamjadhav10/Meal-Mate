const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public


exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { employeeId, password, email, name, phone, rfidCardId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ employeeId }, { email }, { rfidCardId }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with provided employee ID, email, or RFID card'
      });
    }

    // Create new user with initial wallet balance
    const user = await User.create({
      employeeId,
      password,
      email,
      name,
      phone,
      rfidCardId,
      walletBalance: 0
    });

    // Generate token for immediate login
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          employeeId: user.employeeId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          rfidCardId: user.rfidCardId,
          role: user.role,
          walletBalance: user.walletBalance
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { employeeId, password, rfidCardId } = req.body;

    // Find user by employee ID or RFID card ID
    let user = null;
    if (employeeId) {
      user = await User.findOne({ employeeId });
    } else if (rfidCardId) {
      user = await User.findOne({ rfidCardId });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User Not Found'
      });
    }

    // Check password
    // console.log(`Stored Password: ${user.password}`);
    // console.log(`Provided Password: ${password}`);
    if (!password || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // If both employeeId and rfidCardId are provided, validate match
    if (employeeId && rfidCardId) {
      if (user.rfidCardId && user.rfidCardId !== rfidCardId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid RFID card'
        });
      }
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        rfidCardId: user.rfidCardId,
        walletBalance: user.walletBalance
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Link RFID card to user account
// @route   POST /api/auth/rfid/link
// @access  Private
exports.linkRFIDCard = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { rfidCardId } = req.body;

    // Check if RFID card is already linked to another user
    const existingUser = await User.findOne({ rfidCardId });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'RFID card is already linked to another user'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { rfidCardId },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlink RFID card from user account
// @route   DELETE /api/auth/rfid/unlink
// @access  Private
exports.unlinkRFIDCard = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { rfidCardId: 1 } },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};