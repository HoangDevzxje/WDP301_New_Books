const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  phone: String,
  address: String,
  point: {type: Number, default: 0},
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isActivated: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);