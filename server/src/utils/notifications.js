const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send booking notification to admin
exports.sendBookingNotification = async (booking) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Meal Booking',
      html: `
        <h2>New Meal Booking Notification</h2>
        <p>A new meal has been booked with the following details:</p>
        <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Booking ID:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${booking._id}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Employee:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${booking.employeeName} (${booking.employeeId})</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Meal Type:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${booking.mealCategory.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Date:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(booking.date).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">₹${booking.amount}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment Method:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${booking.paymentMethod}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; color: #666;">
          This is an automated notification. Please do not reply to this email.
        </p>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email notification error:', error);
    // Don't throw error to prevent booking process from failing
  }
};