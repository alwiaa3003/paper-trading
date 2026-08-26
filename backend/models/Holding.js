const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stockSymbol: { type: String, required: true, uppercase: true },
    companyName: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    averageBuyPrice: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

holdingSchema.index({ userId: 1, stockSymbol: 1 }, { unique: true });

module.exports = mongoose.model('Holding', holdingSchema);
