const mongoose = require('mongoose');

const portfolioSnapshotSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    walletBalance: { type: Number, required: true },
    holdingsValue: { type: Number, required: true },
    totalPortfolioValue: { type: Number, required: true },
    totalProfitLoss: { type: Number, required: true },
    totalReturnPercent: { type: Number, required: true },
  },
  { timestamps: true }
);

portfolioSnapshotSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('PortfolioSnapshot', portfolioSnapshotSchema);