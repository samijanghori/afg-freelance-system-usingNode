// models/Invoice.js
const mongoose = require('mongoose');
const BaseModel = require('./baseModel');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        enum: ['AFN', 'USD', 'EUR'],
        default: 'AFN'
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'paid', 'overdue', 'cancelled'],
        default: 'draft'
    },
    dueDate: {
        type: Date,
        required: true
    },
    paidAt: Date,
    paymentMethod: {
        type: String,
        enum: ['bank_transfer', 'credit_card', 'crypto', 'cash'],
        default: 'bank_transfer'
    },
    paymentReference: String,
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    items: [{
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number
    }],
    notes: String,
    terms: String
}, {
    timestamps: true
});

new BaseModel(invoiceSchema);

// Auto generate invoice number
invoiceSchema.pre('save', async function(next) {
    if (this.isNew) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const count = await this.constructor.countDocuments();
        this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Indexes
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ project: 1 });
invoiceSchema.index({ client: 1, freelancer: 1 });
invoiceSchema.index({ status: 1, dueDate: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;