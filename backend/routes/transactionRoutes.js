const express = require('express');
const { buyStock, sellStock, getTransactions } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/buy', protect, buyStock);
router.post('/sell', protect, sellStock);
router.get('/', protect, getTransactions);

module.exports = router;
