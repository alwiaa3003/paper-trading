const { SYMBOL_UNIVERSE } = require('../config/stockAPI');
const { getQuote, getQuotes, getHistory, searchSymbols } = require('../services/stockPriceService');

// GET /api/stocks?sector=&search=
const getMarket = async (req, res, next) => {
  try {
    const { sector, search } = req.query;
    let universe = SYMBOL_UNIVERSE;

    if (sector && sector !== 'All') {
      universe = universe.filter((s) => s.sector === sector);
    }
    if (search) {
      const q = search.toLowerCase();
      universe = universe.filter(
        (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }

    const quotes = await getQuotes(universe.map((s) => s.symbol));
    const market = universe.map((s) => ({ ...s, ...quotes[s.symbol] }));

    res.json({ stocks: market, sectors: [...new Set(SYMBOL_UNIVERSE.map((s) => s.sector))] });
  } catch (err) {
    next(err);
  }
};

// GET /api/stocks/search?q=
const searchStocks = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Query parameter "q" is required' });
    }

    const matches = await searchSymbols(q);
    const limited = matches.slice(0, 8);

    if (limited.length === 0) {
      return res.json({ query: q, results: [] });
    }

    const quotes = await getQuotes(limited.map((m) => m.symbol));
    const results = limited.map((m) => ({
      symbol: m.symbol,
      name: m.name,
      exchange: m.exchange,
      ...quotes[m.symbol],
    }));

    res.json({ query: q, results });
  } catch (err) {
    next(err);
  }
};

// GET /api/stocks/:symbol
const getStockDetails = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const upperSymbol = symbol.toUpperCase();
    const quote = await getQuote(upperSymbol);

    const curatedMeta = SYMBOL_UNIVERSE.find((s) => s.symbol === upperSymbol);
    const meta = curatedMeta || {
      symbol: upperSymbol,
      name: quote.companyName || upperSymbol,
      sector: 'N/A',
    };

    res.json({ stock: { ...meta, ...quote } });
  } catch (err) {
    next(err);
  }
};

const getStockHistory = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { range = '1M' } = req.query;
    const history = await getHistory(symbol, range);
    res.json({ symbol: symbol.toUpperCase(), range, history });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMarket, searchStocks, getStockDetails, getStockHistory };