const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            book: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Book',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    discountUsed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discount'
    },
    pointUsed: {
        type: Number,
        default: 0,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Online'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    },
    orderStatus: {
        type: String,
        enum: ['Pending','Processing', 'Cancelled'],
        default: 'Pending'
    },
    shippingInfo: {
        name: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        provineName: {
            type: String,
            required: true
        },
        districtName: {
            type: String,
            required: true
        },
        wardName: {
            type: String,
            required: true
        },
        note: {
            type: String,
            default: ''
        },
        fee: {
            type: Number,
            required: true,
            default: 0
        }
    },
    trackingNumber: {
        type: String,
        default: null
    },
    boxInfo: {
        type: {
            weight: { type: Number, required: true, min: 0 },
            length: { type: Number, required: true, min: 0 },
            height: { type: Number, required: true, min: 0 },
            width: { type: Number, required: true, min: 0 }
        },
        default: null
    }

}, {timestamps: true});

orderSchema.pre('save', function(next) {
    if (this.boxInfo !== null) {
        if (!this.boxInfo.length || !this.boxInfo.weight || !this.boxInfo.height || !this.boxInfo.width) {
            return next(new Error('All boxInfo fields (weight, length, width, height) must be provided'));
        }
    }
    next();
});

orderSchema.index(
    { trackingNumber: 1 },
    { unique: true, partialFilterExpression: { trackingNumber: { $ne: null } } }
);

module.exports = mongoose.model('Order', orderSchema);