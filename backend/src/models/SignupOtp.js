const mongoose = require('mongoose');

const signupOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    otp: { type: String, default: null },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-remove OTP docs after expiration.
signupOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('SignupOtp', signupOtpSchema);
