const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        match: [/^[A-Z0-9]{6}$/, 'Mã giảm giá phải có đúng 6 ký tự, chỉ bao gồm chữ in hoa và số']
    },
    type: {
        type: String,
        required: true,
        enum: ['fixed', 'percentage']
    },
    value: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                if (this.type === 'percentage') {
                    return Number.isInteger(v) && v > 0 && v <= 100;
                }
                return v > 0;
            },
            message: props => `Giá trị giảm giá không hợp lệ: ${props.value}`
        }
    },
    minPurchase: {
        type: Number,
        required: true,
        min: [0, 'Giá trị đơn hàng tối thiểu không thể nhỏ hơn 0']
    },
    usageLimit: {
        type: Number,
        required: true,
        min: [1, 'Số lần sử dụng tối đa phải lớn hơn hoặc bằng 1'],
        validate: {
            validator: Number.isInteger,
            message: props => `${props.value} phải là số nguyên`
        }
    },
    usedCount: {
        type: Number,
        default: 0,
        validate: [
            {
                validator: Number.isInteger,
                message: props => `${props.value} phải là số nguyên`
            },
            {
                validator: function (v) {
                    return v <= this.usageLimit;
                },
                message: props => `Số lần sử dụng (${props.value}) không thể vượt quá giới hạn (${props.instance.usageLimit})`
            }
        ]
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (v) {
                return v > this.startDate;
            },
            message: 'Ngày kết thúc phải sau ngày bắt đầu'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Discount', discountSchema);
