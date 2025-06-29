const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  phone: String,
  address: [
    {
      address: { type: String, required: true },
      provinceName: { type: String, required: true },
      districtName: { type: String, required: true },
      wardName: { type: String, required: true },
      isDefault: { type: Boolean, default: false }
    }
  ],
  point: { type: Number, default: 0 },
  googleId: String,
  facebookId: String,
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

// Đảm bảo chỉ một địa chỉ được đặt làm mặc định
userSchema.pre('save', async function (next) {
  if (this.isModified('address')) {
    const defaultAddress = this.address.find(addr => addr.isDefault === true);
    if (defaultAddress) {
      // Nếu có địa chỉ mặc định mới, đặt tất cả các địa chỉ khác thành không mặc định
      this.address.forEach(addr => {
        if (addr._id !== defaultAddress._id) {
          addr.isDefault = false;
        }
      });
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);