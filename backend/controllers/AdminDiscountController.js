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

const createDiscount = async (req, res) => {
  try {
    const discount = await Discount.create(req.body);
    res.status(201).json(discount);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    const { minPurchase, startDate, endDate } = req.body;

    // Chỉ cho phép cập nhật các trường được phép
    const updateData = {};
    if (minPurchase !== undefined) updateData.minPurchase = minPurchase;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;

    // Tìm và cập nhật discount
    const updatedDiscount = await Discount.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedDiscount) {
      return res.status(404).json({ message: "Discount không tồn tại" });
    }

    res.json({ message: "Cập nhật thành công", discount: updatedDiscount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const discountController = {
  getAllDiscounts,
  getDiscountById,
  createDiscount,
  changeStatusDiscount,
  updatedDiscount,
};

module.exports = discountController;
