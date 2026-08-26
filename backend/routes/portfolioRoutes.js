const express = require('express');
const { getPortfolio, getPortfolioGrowth } = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getPortfolio);
router.get('/growth', protect, getPortfolioGrowth);

module.exports = router;