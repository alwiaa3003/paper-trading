const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    investedAmount: { type: Number, default: 0 },
    currentValue: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    totalLoss: { type: Number, default: 0 },
    totalReturnPercent: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
