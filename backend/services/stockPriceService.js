const yahooFinance = require('yahoo-finance2').default;
const MOCK_SHARES_OUTSTANDING = 5_000_000_000;
const { SYMBOL_UNIVERSE } = require('../config/stockAPI');

try {
  yahooFinance.suppressNotices(['yahooSurvey']);
} catch (err) {
}


const quoteCache = new Map();
const CACHE_TTL_MS = 15 * 1000;

const searchCache = new Map();
const SEARCH_CACHE_TTL_MS = 60 * 1000;

const BASE_PRICES = {
  AAPL: 195, MSFT: 420, GOOGL: 175, AMZN: 185, TSLA: 250,
  NVDA: 130, META: 480, NFLX: 650, JPM: 210, V: 275,
  WMT: 68, DIS: 112, KO: 63, PFE: 28, XOM: 118,
};

const mockQuote = (symbol) => {
  const base = BASE_PRICES[symbol] || 100;
  const wobble = (Math.sin(Date.now() / 90000 + symbol.charCodeAt(0)) * 0.02) + (Math.random() - 0.5) * 0.01;
  const currentPrice = Number((base * (1 + wobble)).toFixed(2));
  const previousClose = base;
  const change = Number((currentPrice - previousClose).toFixed(2));
  const changePercent = Number(((change / previousClose) * 100).toFixed(2));
  return {
    symbol,
    currentPrice,
    previousClose,
    change,
    changePercent,
    high: Number((currentPrice * 1.01).toFixed(2)),
    low: Number((currentPrice * 0.99).toFixed(2)),
    open: previousClose,
    volume: Math.floor(1_000_000 + Math.random() * 5_000_000),
    marketCap: Math.round(currentPrice * MOCK_SHARES_OUTSTANDING),
    companyName: SYMBOL_UNIVERSE.find((s) => s.symbol === symbol)?.name || symbol,
    source: 'mock',
  };
};

const mapYahooQuote = (symbol, q) => {
  const currentPrice = q.regularMarketPrice;
  const previousClose = q.regularMarketPreviousClose;
  const change = Number(
    (q.regularMarketChange ?? currentPrice - previousClose).toFixed(2)
  );
  const changePercent = Number(
    (q.regularMarketChangePercent ?? (previousClose ? (change / previousClose) * 100 : 0)).toFixed(2)
  );

  return {
    symbol,
    currentPrice: Number(currentPrice.toFixed(2)),
    previousClose: Number((previousClose ?? 0).toFixed(2)),
    change,
    changePercent,
    high: q.regularMarketDayHigh ?? null,
    low: q.regularMarketDayLow ?? null,
    open: q.regularMarketOpen ?? null,
    volume: q.regularMarketVolume ?? null,
    marketCap: q.marketCap ?? null,
    companyName: q.longName || q.shortName || symbol,
    source: 'yahoo',
  };
};

const fetchFromYahoo = async (symbol) => {
  const q = await yahooFinance.quote(symbol);
  if (!q || typeof q.regularMarketPrice !== 'number') {
    throw new Error(`Yahoo Finance returned no tradable quote for ${symbol}`);
  }
  return mapYahooQuote(symbol, q);
};

const getQuote = async (symbol) => {
  const upperSymbol = symbol.toUpperCase();
  const cached = quoteCache.get(upperSymbol);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  let quote;
  try {
    quote = await fetchFromYahoo(upperSymbol);
  } catch (err) {
    console.warn(
      `[stockPriceService] Yahoo Finance quote failed for ${upperSymbol}: ${err.message}. Falling back to a simulated price.`
    );
    quote = mockQuote(upperSymbol);
  }

  quoteCache.set(upperSymbol, { ts: Date.now(), data: quote });
  return quote;
};

const getQuotes = async (symbols) => {
  const uniqueSymbols = [...new Set(symbols.map((s) => s.toUpperCase()))];
  const results = await Promise.all(uniqueSymbols.map((s) => getQuote(s)));
  return results.reduce((acc, quote) => {
    acc[quote.symbol] = quote;
    return acc;
  }, {});
};

const searchSymbols = async (query) => {
  const trimmed = (query || '').trim();
  if (!trimmed) return [];

  const cacheKey = trimmed.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < SEARCH_CACHE_TTL_MS) {
    return cached.data;
  }

  let matches;
  try {
    const result = await yahooFinance.search(trimmed, { quotesCount: 10, newsCount: 0 });
    matches = (result.quotes || [])
      .filter((q) => q.symbol && q.quoteType === 'EQUITY')
      .map((q) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchDisp || q.exchange || '',
        type: q.typeDisp || q.quoteType || '',
      }));
  } catch (err) {
    console.warn(
      `[stockPriceService] Yahoo Finance search failed for "${trimmed}": ${err.message}. Falling back to local symbol match.`
    );
    const q = trimmed.toLowerCase();
    matches = SYMBOL_UNIVERSE.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).map((s) => ({ symbol: s.symbol, name: s.name, exchange: '', type: 'EQUITY' }));
  }

  searchCache.set(cacheKey, { ts: Date.now(), data: matches });
  return matches;
};

const getHistory = async (symbol, range = '1M') => {
  const quote = await getQuote(symbol);
  const pointsByRange = { '1D': 24, '1W': 7, '1M': 30, '1Y': 12 };
  const points = pointsByRange[range] || 30;
  const volatility = range === '1D' ? 0.004 : range === '1W' ? 0.01 : range === '1Y' ? 0.08 : 0.03;

  let price = quote.currentPrice * (1 - volatility * (points / 4));
  const series = [];
  for (let i = 0; i < points; i += 1) {
    price = price * (1 + (Math.random() - 0.48) * volatility);
    series.push({ label: i, price: Number(price.toFixed(2)) });
  }
  series[series.length - 1].price = quote.currentPrice;
  return series;
};

module.exports = { getQuote, getQuotes, searchSymbols, getHistory, SYMBOL_UNIVERSE };