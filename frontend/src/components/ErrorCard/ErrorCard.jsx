import { LuTriangleAlert, LuRefreshCw } from 'react-icons/lu';
const ErrorCard = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
  retryLabel = 'Try again',
}) => (
  <div className="card p-8 text-center space-y-3">
    <LuTriangleAlert className="mx-auto text-loss" size={28} />
    <p className="text-paper font-medium">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-ghost inline-flex items-center gap-2 text-sm mx-auto">
        <LuRefreshCw size={16} /> {retryLabel}
      </button>
    )}
  </div>
);

export default ErrorCard;