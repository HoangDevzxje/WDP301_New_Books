const mongoose = require("mongoose");
const User = require("../models/User");

// helper: validate ObjectId
const isId = (v) => mongoose.Types.ObjectId.isValid(v);


exports.getAll = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!isId(userId))
      return res.status(400).json({ message: "userId invalid" });

    const user = await User.findById(userId, "address"); // chỉ lấy address
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.address);
  } catch (err) {
    next(err);
  }
};


exports.create = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!isId(userId))
      return res.status(400).json({ message: "userId invalid" });

    const {
      address,
      provinceId,
      provinceName,
      districtId,
      districtName,
      wardCode,
      wardName,
      isDefault = false,
    } = req.body;

    // simple required check
    if (![address, provinceId, districtId, wardCode].every(Boolean))
      return res.status(400).json({ message: "Thiếu trường bắt buộc" });

    // push vào mảng
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.address.push({
      address,
      provinceId,
      provinceName,
      districtId,
      districtName,
      wardCode,
      wardName,
      isDefault,
    });

    // nếu đánh dấu mặc định, đảm bảo duy nhất
    if (isDefault) {
      const newAddrId = user.address[user.address.length - 1]._id;
      // lưu rồi setDefault để xài update pipeline
      await user.save();
      await User.setDefaultAddress(userId, newAddrId);
    } else {
      await user.save();
    }

    res.status(201).json(user.address);
  } catch (err) {
    next(err);
  }
};


exports.update = async (req, res, next) => {
  try {
    const { userId, addrId } = req.params;
    if (![isId(userId), isId(addrId)].every(Boolean))
      return res.status(400).json({ message: "invalid id" });

    const {
      address,
      provinceId,
      provinceName,
      districtId,
      districtName,
      wardCode,
      wardName,
      isDefault,
    } = req.body;

    // update bằng positional operator
    const user = await User.findOneAndUpdate(
      { _id: userId, "address._id": addrId },
      {
        $set: {
          "address.$.address": address,
          "address.$.provinceId": provinceId,
          "address.$.provinceName": provinceName,
          "address.$.districtId": districtId,
          "address.$.districtName": districtName,
          "address.$.wardCode": wardCode,
          "address.$.wardName": wardName,
          "address.$.isDefault": !!isDefault,
        },
      },
      { new: true, runValidators: true, projection: { address: 1 } }
    );
    if (!user) return res.status(404).json({ message: "Address not found" });

    // nếu đổi sang mặc định
    if (isDefault) await User.setDefaultAddress(userId, addrId);

    res.json(user.address);
  } catch (err) {
    next(err);
  }
};


exports.setDefault = async (req, res, next) => {
  try {
    const { userId, addrId } = req.params;
    if (![isId(userId), isId(addrId)].every(Boolean))
      return res.status(400).json({ message: "invalid id" });

    // bảo đảm addrId tồn tại
    const ok = await User.exists({ _id: userId, "address._id": addrId });
    if (!ok) return res.status(404).json({ message: "Address not found" });

    await User.setDefaultAddress(userId, addrId);
    res.json({ message: "Đã đặt địa chỉ mặc định" });
  } catch (err) {
    next(err);
  }
};


exports.remove = async (req, res, next) => {
  try {
    const { userId, addrId } = req.params;
    if (![isId(userId), isId(addrId)].every(Boolean))
      return res.status(400).json({ message: "invalid id" });

    // lấy user trước để biết có phải default không
    const user = await User.findById(userId, "address");
    if (!user) return res.status(404).json({ message: "User not found" });

    const addr = user.address.id(addrId);
    if (!addr) return res.status(404).json({ message: "Address not found" });

    const isDefault = addr.isDefault;
    addr.remove(); // subdoc method
    await user.save();

    // nếu vừa xoá default & còn địa chỉ khác, đặt cái đầu tiên làm default
    if (isDefault && user.address.length) {
      await User.setDefaultAddress(userId, user.address[0]._id);
    }

    res.json({ message: "Đã xoá địa chỉ" });
  } catch (err) {
    next(err);
  }
};
