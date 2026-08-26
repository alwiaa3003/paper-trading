const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const WalletCard = ({ label, value, delta, deltaPercent, accent = 'accent' }) => {
  const isPositive = (delta ?? 0) >= 0;
  const accentClass =
    accent === 'gain' ? 'text-gain' : accent === 'loss' ? 'text-loss' : 'text-accent';

  return (
    <div className="card p-5 flex flex-col gap-2">
      <span className="label-eyebrow">{label}</span>
      <span className={`stat-tick text-2xl font-semibold ${accentClass}`}>
        {formatCurrency(value)}
      </span>
      {delta !== undefined && (
        <span className={`text-xs font-mono ${isPositive ? 'text-gain' : 'text-loss'}`}>
          {isPositive ? '+' : ''}
          {formatCurrency(delta)} ({isPositive ? '+' : ''}
          {deltaPercent?.toFixed(2)}%)
        </span>
      )}
    </div>
  );
};

export default WalletCard;
