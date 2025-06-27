const Discount = require("../models/Discount");

const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find();
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }
    res.json(discount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDiscountSuitable = async (req, res) => {
  try {
    const { amount } = req.query;
    if (!amount || isNaN(amount) || amount < 0) {
      return res.status(400).json({ message: "Số tiền không hợp lệ" });
    }

    const today = new Date();

    // Lọc các discount hợp lệ
    const discounts = await Discount.find({
      isActive: true, // Chỉ lấy discount đang kích hoạt
      minPurchase: { $lte: amount }, // amount >= minPurchase
      startDate: { $lte: today }, // startDate <= hôm nay
      endDate: { $gte: today }, // endDate >= hôm nay
      $expr: { $lt: ["$usedCount", "$usageLimit"] }, // usedCount < usageLimit
    });

    res.json({ discounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDiscount = async (req, res) => {
  try {
    const body = req.body;

    /* check cặp ngày */
    if (new Date(body.endDate) <= new Date(body.startDate)) {
      return res
        .status(400)
        .json({ message: "Ngày kết thúc phải sau ngày bắt đầu" });
    }

    const discount = await Discount.create(body); // runValidators mặc định
    res.status(201).json({ message: "Tạo thành công", discount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const changeStatusDiscount = async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }
    discount.isActive = !discount.isActive;
    await discount.save();
    res.status(200).json({ message: "Discount status updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatedDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    /* chỉ cho update các field dưới */
    const ALLOWED = [
      "code",
      "type",
      "value",
      "minPurchase",
      "usageLimit",
      "startDate",
      "endDate",
      "isActive",
    ];

    const update = {};
    Object.keys(req.body).forEach((k) => {
      if (ALLOWED.includes(k)) update[k] = req.body[k];
    });

    /* nếu startDate hoặc endDate thay đổi → check logic */
    if (update.startDate || update.endDate) {
      const current = await Discount.findById(id);
      if (!current)
        return res.status(404).json({ message: "Discount không tồn tại" });

      const start = update.startDate
        ? new Date(update.startDate)
        : current.startDate;
      const end = update.endDate ? new Date(update.endDate) : current.endDate;

      if (end <= start)
        return res
          .status(400)
          .json({ message: "Ngày kết thúc phải sau ngày bắt đầu" });
    }

    const updated = await Discount.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Discount không tồn tại" });

    res.json({ message: "Cập nhật thành công", discount: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const discountController = {
  getAllDiscounts,
  getDiscountById,
  getDiscountSuitable,
  createDiscount,
  changeStatusDiscount,
  updatedDiscount,
};

module.exports = discountController;
