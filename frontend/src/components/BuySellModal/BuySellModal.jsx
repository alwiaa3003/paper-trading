import { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuX } from 'react-icons/lu';
import { buyStock, sellStock } from '../../services/portfolioService';
import { PortfolioContext } from '../../context/PortfolioContext';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const BuySellModal = ({ stock, mode = 'BUY', walletBalance = 0, ownedQuantity = 0, onClose }) => {
  const [side, setSide] = useState(mode);
  const { invalidatePortfolio } = useContext(PortfolioContext) || {};
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: { quantity: 1 },
    mode: 'onChange',
  });

  const quantity = Number(watch('quantity')) || 0;
  const price = stock?.currentPrice || 0;
  const estimatedTotal = quantity * price;
  const affordableShares = price > 0 ? Math.floor(walletBalance / price) : 0;

  const mutation = useMutation({
    mutationFn: (payload) => (side === 'BUY' ? buyStock(payload) : sellStock(payload)),
    onSuccess: (data) => {
      toast.success(data.message);
      invalidatePortfolio?.();
      onClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Order failed. Please try again.');
    },
  });

  useEffect(() => {
    setSide(mode);
  }, [mode, stock]);

  // Quantity limits depend on which side is selected, so re-validate the
  // field whenever the user flips between Buy and Sell.
  useEffect(() => {
    trigger('quantity');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side]);

  const onSubmit = (values) => {
    mutation.mutate({ symbol: stock.symbol, quantity: Number(values.quantity) });
  };

  if (!stock) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative card w-full max-w-sm p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-mist hover:text-paper"
          aria-label="Close"
        >
          <LuX size={20} />
        </button>

        <p className="label-eyebrow mb-1">{stock.symbol}</p>
        <h2 className="font-display text-xl font-semibold mb-4">{stock.name || stock.companyName}</h2>

        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              side === 'BUY' ? 'bg-gain text-white' : 'bg-panel2 text-mist'
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              side === 'SELL' ? 'bg-loss text-white' : 'bg-panel2 text-mist'
            }`}
          >
            Sell
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-eyebrow block mb-1.5">Quantity</label>
            <input
              type="number"
              min="1"
              step="1"
              className="input-field"
              {...register('quantity', {
                required: 'Quantity is required',
                min: { value: 1, message: 'Quantity must be at least 1' },
                validate: {
                  isWholeNumber: (v) =>
                    Number.isInteger(Number(v)) || 'Quantity must be a whole number',
                  withinLimit: (v) => {
                    const qty = Number(v);
                    if (side === 'SELL') {
                      return (
                        qty <= ownedQuantity ||
                        `You only own ${ownedQuantity} share${ownedQuantity === 1 ? '' : 's'}`
                      );
                    }
                    return (
                      qty <= affordableShares ||
                      `Insufficient balance — you can afford up to ${affordableShares} share${
                        affordableShares === 1 ? '' : 's'
                      }`
                    );
                  },
                },
              })}
            />
            {errors.quantity && (
              <p className="text-loss text-xs mt-1">{errors.quantity.message}</p>
            )}
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-mist">Market price</span>
            <span className="stat-tick">{formatCurrency(price)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-mist">Estimated total</span>
            <span className="stat-tick font-semibold">{formatCurrency(estimatedTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-mist">{side === 'BUY' ? 'Cash available' : 'Shares owned'}</span>
            <span className="stat-tick">
              {side === 'BUY' ? formatCurrency(walletBalance) : ownedQuantity}
            </span>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending || !!errors.quantity}
            className={`w-full py-2.5 rounded-xl font-medium transition-colors ${
              side === 'BUY'
                ? 'bg-gain hover:bg-gain/90 text-white'
                : 'bg-loss hover:bg-loss/90 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {mutation.isPending ? 'Placing order…' : `${side === 'BUY' ? 'Buy' : 'Sell'} ${stock.symbol}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BuySellModal;