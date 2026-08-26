import { NavLink } from 'react-router-dom';
import { LuX } from 'react-icons/lu';
import {
  LuLayoutDashboard,
  LuChartCandlestick,
  LuBriefcase,
  LuStar,
  LuTrophy,
  LuReceipt,
  LuChartBar,
  LuCircleUserRound,
} from 'react-icons/lu';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
  { to: '/market', label: 'Market', icon: LuChartCandlestick },
  { to: '/portfolio', label: 'Portfolio', icon: LuBriefcase },
  { to: '/watchlist', label: 'Watchlist', icon: LuStar },
  { to: '/leaderboard', label: 'Leaderboard', icon: LuTrophy },
  { to: '/transactions', label: 'Transactions', icon: LuReceipt },
  { to: '/analytics', label: 'Analytics', icon: LuChartBar },
  { to: '/profile', label: 'Profile', icon: LuCircleUserRound },
];

const MobileNav = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 md:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-64 bg-panel border-r border-line p-5">
        <div className="flex items-center justify-between mb-6">
          <span className="font-display font-semibold text-lg">Ledger</span>
          <button onClick={onClose} aria-label="Close navigation" className="text-mist">
            <LuX size={22} />
          </button>
        </div>
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-panel2 text-paper' : 'text-mist'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileNav;