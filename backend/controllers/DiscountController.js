const Discount = require("../models/Discount");

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

module.exports = {
    getDiscountSuitable,
};