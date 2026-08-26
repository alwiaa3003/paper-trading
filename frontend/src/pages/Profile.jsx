import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { LuLogOut, LuRefreshCw, LuX } from 'react-icons/lu';
import { useAuth } from '../hooks/useAuth';
import { resetPortfolio } from '../services/authService';
import { usePortfolio } from '../hooks/usePortfolio';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

const Profile = () => {
  const { user, logout, refreshUser } = useAuth();
  const { data } = usePortfolio();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetPortfolio();
      await refreshUser();
      queryClient.invalidateQueries();
      toast.success('Portfolio reset — back to $100,000 in virtual cash');
      setConfirming(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not reset portfolio');
    } finally {
      setResetting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Profile</h1>
        <p className="text-mist text-sm mt-1">Manage your account and simulation settings.</p>
      </div>

      <div className="card p-6 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-panel2 border border-line flex items-center justify-center text-2xl font-semibold">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <p className="font-display text-lg font-semibold">{user?.name}</p>
          <p className="text-mist text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <span className="label-eyebrow">Wallet balance</span>
          <p className="stat-tick text-xl font-semibold mt-1">{formatCurrency(data?.walletBalance)}</p>
        </div>
        <div className="card p-5">
          <span className="label-eyebrow">Rank</span>
          <p className="stat-tick text-xl font-semibold mt-1">#{user?.rank || '—'}</p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <h2 className="font-display font-semibold">Reset portfolio</h2>
          <p className="text-mist text-sm mt-1">
            Clears all holdings and transactions and restores your wallet to $100,000. This can't be undone.
          </p>
        </div>
        <button onClick={() => setConfirming(true)} className="btn-ghost flex items-center gap-2 text-sm">
          <LuRefreshCw size={16} /> Reset portfolio
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm text-loss hover:underline"
      >
        <LuLogOut size={16} /> Log out
      </button>

      {confirming && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => !resetting && setConfirming(false)}
          />
          <div className="relative card w-full max-w-sm p-6">
            <button
              onClick={() => setConfirming(false)}
              disabled={resetting}
              className="absolute top-4 right-4 text-mist hover:text-paper disabled:opacity-40"
              aria-label="Close"
            >
              <LuX size={20} />
            </button>

            <h2 className="font-display text-lg font-semibold text-loss mb-2">Reset portfolio?</h2>
            <p className="text-mist text-sm mb-6">
              This will permanently delete all your holdings and transaction history, and reset your
              wallet balance back to $100,000. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex-1 bg-loss hover:bg-loss/90 text-white font-medium py-2.5 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetting ? 'Resetting…' : 'Confirm reset'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={resetting}
                className="flex-1 bg-panel2 text-mist hover:text-paper font-medium py-2.5 rounded-xl text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;