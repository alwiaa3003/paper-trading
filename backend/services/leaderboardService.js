const User = require('../models/User');

const SORT_FIELDS = {
  portfolioValue: 'totalPortfolioValue',
  profit: 'totalProfitLoss',
  returnPercent: 'totalReturnPercent',
};

const TOP_N = 20;
const PUBLIC_PROJECTION = 'name avatar totalPortfolioValue totalProfitLoss totalReturnPercent';

const isValidSortBy = (sortBy) => Object.prototype.hasOwnProperty.call(SORT_FIELDS, sortBy);

const toEntry = (user, rank) => ({
  rank,
  id: user._id,
  name: user.name,
  avatar: user.avatar,
  totalPortfolioValue: user.totalPortfolioValue,
  totalProfitLoss: user.totalProfitLoss,
  totalReturnPercent: user.totalReturnPercent,
});

const getLeaderboard = async (sortBy, currentUserId) => {
  const field = SORT_FIELDS[sortBy] || SORT_FIELDS.portfolioValue;
  const resolvedSortBy = Object.keys(SORT_FIELDS).find((k) => SORT_FIELDS[k] === field);

  const [topUsers, currentUserDoc] = await Promise.all([
    User.find({}, PUBLIC_PROJECTION).sort({ [field]: -1 }).limit(TOP_N).lean(),
    currentUserId ? User.findById(currentUserId, PUBLIC_PROJECTION).lean() : null,
  ]);

  const top = topUsers.map((user, idx) => ({
    ...toEntry(user, idx + 1),
    isCurrentUser: currentUserId ? String(user._id) === String(currentUserId) : false,
  }));

  let currentUser = null;
  if (currentUserDoc) {
    const alreadyInTop = top.find((entry) => entry.isCurrentUser);
    if (alreadyInTop) {
      currentUser = alreadyInTop;
    } else {
      const higherRankedCount = await User.countDocuments({
        [field]: { $gt: currentUserDoc[field] },
      });
      currentUser = { ...toEntry(currentUserDoc, higherRankedCount + 1), isCurrentUser: true };
    }
  }

  return { sortBy: resolvedSortBy, top, currentUser };
};

module.exports = { getLeaderboard, isValidSortBy, SORT_FIELDS };