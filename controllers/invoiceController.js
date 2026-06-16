// controllers/invoiceController.js
const { Invoice, Project, User } = require('../models');

// ============================
// ایجاد فاکتور جدید
// ============================
exports.createInvoice = async (req, res) => {
    try {
        const {
            project,
            client,
            freelancer,
            amount,
            description,
            dueDate,
            items,
            tax,
            discount,
            notes,
            terms
        } = req.body;

        // بررسی وجود پروژه
        const projectExists = await Project.findById(project);
        if (!projectExists) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // بررسی وجود کلاینت و فریلنسر
        const [clientExists, freelancerExists] = await Promise.all([
            User.findById(client),
            User.findById(freelancer)
        ]);

        if (!clientExists || !freelancerExists) {
            return res.status(404).json({
                success: false,
                message: 'Client or freelancer not found'
            });
        }

        const invoice = new Invoice({
            project,
            client,
            freelancer,
            amount,
            description,
            dueDate,
            items,
            tax,
            discount,
            notes,
            terms
        });

        await invoice.save();

        // Populate references
        await invoice.populate('project', 'title');
        await invoice.populate('client', 'fullName email');
        await invoice.populate('freelancer', 'fullName email');

        res.status(201).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ============================
// دریافت فاکتورهای یک کاربر
// ============================
exports.getMyInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({
            $or: [
                { client: req.user.id },
                { freelancer: req.user.id }
            ]
        })
            .populate('project', 'title')
            .populate('client', 'fullName email')
            .populate('freelancer', 'fullName email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: invoices.length,
            data: invoices
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================
// پرداخت فاکتور
// ============================
exports.payInvoice = async (req, res) => {
    try {
        const { paymentMethod, paymentReference } = req.body;
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        if (invoice.status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Invoice already paid'
            });
        }

        invoice.status = 'paid';
        invoice.paidAt = new Date();
        invoice.paymentMethod = paymentMethod;
        invoice.paymentReference = paymentReference;

        await invoice.save();

        res.json({
            success: true,
            data: invoice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};