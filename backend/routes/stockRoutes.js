const express = require('express');
const {
  getMarket,
  searchStocks,
  getStockDetails,
  getStockHistory,
} = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getMarket);
router.get('/search', protect, searchStocks);
router.get('/:symbol', protect, getStockDetails);
router.get('/:symbol/history', protect, getStockHistory);

module.exports = router;