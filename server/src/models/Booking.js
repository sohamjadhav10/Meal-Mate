const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    ref: 'User'
  },
  employeeName: {
    type: String,
    required: true
  },
  rfidCardId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  mealCategory: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    availableTime: {
      type: String,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'upi', 'payroll'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  isAvailed: {
    type: Boolean,
    default: false
  },
  availedAt: {
    type: Date
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
bookingSchema.index({ date: 1, employeeId: 1 });
bookingSchema.index({ rfidCardId: 1, date: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;