const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: '' },
    walletBalance: { type: Number, default: Number(process.env.STARTING_BALANCE) || 100000 },
    totalPortfolioValue: { type: Number, default: 0 },
    totalProfitLoss: { type: Number, default: 0 },
    totalReturnPercent: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    walletBalance: this.walletBalance,
    totalPortfolioValue: this.totalPortfolioValue,
    totalProfitLoss: this.totalProfitLoss,
    totalReturnPercent: this.totalReturnPercent,
    rank: this.rank,
    createdAt: this.createdAt,
  };
};

userSchema.index({ totalPortfolioValue: -1 });
userSchema.index({ totalProfitLoss: -1 });
userSchema.index({ totalReturnPercent: -1 });

module.exports = mongoose.model('User', userSchema);
