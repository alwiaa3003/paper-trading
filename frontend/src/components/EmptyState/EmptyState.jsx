import { Link } from 'react-router-dom';

// Consolidates the "card p-8/p-10 text-center text-mist" empty-state
// pattern already duplicated across Portfolio.jsx, Watchlist.jsx,
// Market.jsx, and TransactionTable.jsx.
const EmptyState = ({ message, actionLabel, actionTo, onAction, size = 'lg' }) => {
  const padding = size === 'lg' ? 'p-10' : 'p-8';

  return (
    <div className={`card ${padding} text-center text-mist`}>
      {message}
      {actionLabel && actionTo && (
        <>
          {' '}
          <Link to={actionTo} className="text-accent hover:underline">
            {actionLabel}
          </Link>
        </>
      )}
      {actionLabel && onAction && !actionTo && (
        <>
          {' '}
          <button onClick={onAction} className="text-accent hover:underline">
            {actionLabel}
          </button>
        </>
      )}
    </div>
  );
};

export default EmptyState;