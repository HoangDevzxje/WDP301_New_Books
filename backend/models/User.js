const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  phone: String,
  address: [
    {
      address: { type: String, required: true },
      provineName: { type: String, required: true },
      districtName: { type: String, required: true },
      wardName: { type: String, required: true },
    }
  ],
  point: { type: Number, default: 0 },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isActivated: {
    type: Boolean,
    default: true
  },
  accessToken: { type: String, default: null },
  refreshToken: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);