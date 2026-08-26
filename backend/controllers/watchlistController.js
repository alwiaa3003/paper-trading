const Watchlist = require('../models/Watchlist');
const { SYMBOL_UNIVERSE } = require('../config/stockAPI');
const { getQuotes } = require('../services/stockPriceService');

const getWatchlist = async (req, res, next) => {
  try {
    let watchlist = await Watchlist.findOne({ userId: req.user._id });
    if (!watchlist) {
      watchlist = await Watchlist.create({ userId: req.user._id, stocks: [] });
    }

    const quotes = await getQuotes(watchlist.stocks.length ? watchlist.stocks : ['__NONE__']);
    const stocks = watchlist.stocks.map((symbol) => {
      const meta = SYMBOL_UNIVERSE.find((s) => s.symbol === symbol);
      return { ...meta, ...quotes[symbol] };
    });

    res.json({ stocks });
  } catch (err) {
    next(err);
  }
};

const addToWatchlist = async (req, res, next) => {
  try {
    const { symbol } = req.body;
    if (!symbol) return res.status(400).json({ message: 'Symbol is required' });

    const upperSymbol = symbol.toUpperCase();
    const meta = SYMBOL_UNIVERSE.find((s) => s.symbol === upperSymbol);
    if (!meta) return res.status(404).json({ message: `Unknown symbol ${symbol}` });

    const watchlist = await Watchlist.findOneAndUpdate(
      { userId: req.user._id },
      { $addToSet: { stocks: upperSymbol } },
      { upsert: true, new: true }
    );

    res.json({ stocks: watchlist.stocks });
  } catch (err) {
    next(err);
  }
};

const removeFromWatchlist = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const watchlist = await Watchlist.findOneAndUpdate(
      { userId: req.user._id },
      { $pull: { stocks: symbol.toUpperCase() } },
      { new: true }
    );
    res.json({ stocks: watchlist ? watchlist.stocks : [] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
