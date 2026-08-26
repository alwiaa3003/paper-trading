# Ledger — Paper Trading / Virtual Portfolio

A full-stack paper trading simulator: risk-free trading with virtual cash and
live-simulated market prices. Built with the MERN stack.

## What's inside

- **Backend** (`/backend`) — Node.js, Express, MongoDB/Mongoose, JWT auth,
  a stock price service that uses Finnhub if you provide an API key, and
  otherwise falls back to a realistic simulated feed (so the app runs with
  zero external setup).
- **Frontend** (`/frontend`) — React 18 + Vite, Tailwind CSS, React Router,
  React Query, React Hook Form, Recharts, Framer Motion, React Hot Toast.

## Features

- Register / login with JWT auth, protected routes
- $100,000 virtual starting balance, resettable anytime
- Market page: browse, search, filter by sector, buy/sell
- Stock details page with 1D / 1W / 1M / 1Y charts
- Portfolio page: holdings, allocation pie chart, P/L
- Watchlist with quick buy/sell
- Transaction history with filters, pagination, CSV export
- Leaderboard ranked by portfolio value or returns
- Dashboard summarizing wallet, portfolio value, gainers/losers, recent activity

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env     # then edit MONGO_URI, JWT_SECRET, etc.
npm install
npm run dev               # nodemon, or `npm start` for plain node
```

Requires a MongoDB instance — either a local `mongod` or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster. Update `MONGO_URI` in
`.env` accordingly.

`FINNHUB_API_KEY` is optional. Leave it blank to use the built-in simulated
price feed (great for demos), or get a free key at
[finnhub.io](https://finnhub.io) for real quotes.

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # points VITE_API_URL at your backend
npm install
npm run dev                # http://localhost:5173
```

### 3. Try it out

1. Register a new account (starts with $100,000 virtual cash).
2. Head to **Market**, search or filter stocks, and place a buy order.
3. Check **Portfolio** to see your holdings and allocation.
4. Star stocks into your **Watchlist**, check **Leaderboard** rank, review
   **Transactions**, and reset your portfolio anytime from **Profile**.

## Notes on the price feed

The mock price generator produces a small, deterministic wobble around a
base price per symbol so charts and quotes look plausible without a paid
market-data subscription. Swap in Finnhub (or Alpha Vantage / Yahoo Finance)
in `backend/services/stockPriceService.js` for real intraday history if you
want production-grade data — the current `/history` endpoint synthesizes
chart series client-side rather than pulling real OHLC candles.

## Extending it

Good next steps if you want to take this further:
- Real historical OHLC candles (Finnhub `/stock/candle`, Alpha Vantage
  `TIME_SERIES_*`) for accurate charts
- Socket.io for push-based live pricing instead of polling
- Themed contests / leaderboard seasons (the stretch goal from the brief)
- Rate limiting and stricter input validation on the trade endpoints
