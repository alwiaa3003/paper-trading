import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuLogOut, LuMenu, LuWallet } from 'react-icons/lu';
import { useAuth } from '../../hooks/useAuth';
import { usePortfolio } from '../../hooks/usePortfolio';
import MobileNav from '../Sidebar/MobileNav';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { data } = usePortfolio();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const walletBalance = data?.walletBalance ?? user?.walletBalance ?? 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 md:px-8 py-4 border-b border-line bg-ink/90 backdrop-blur">
      <button
        className="md:hidden text-mist"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <LuMenu size={22} />
      </button>

      <div className="flex-1 md:flex-none">
        <p className="label-eyebrow md:hidden">Ledger</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="card flex items-center gap-2 px-3 py-1.5">
          <LuWallet size={16} className="text-gain" />
          <span className="stat-tick text-sm">{formatCurrency(walletBalance)}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-line">
          <div className="h-8 w-8 rounded-full bg-panel2 border border-line flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium">{user?.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-mist hover:text-loss transition-colors"
          aria-label="Log out"
          title="Log out"
        >
          <LuLogOut size={20} />
        </button>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
};

export default Navbar;
