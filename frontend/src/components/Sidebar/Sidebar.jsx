import { NavLink } from 'react-router-dom';
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

const Sidebar = () => {
  return (
    <aside className="hidden md:flex md:w-60 flex-col shrink-0 border-r border-line bg-panel min-h-screen sticky top-0">
      <div className="px-6 py-6 flex items-center gap-2">
        <div className="h-8 w-8 rounded-xl bg-accent flex items-center justify-center font-display font-bold text-white">
          L
        </div>
        <span className="font-display font-semibold text-lg tracking-tight">Ledger</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-panel2 text-paper border border-line'
                  : 'text-mist hover:text-paper hover:bg-panel2/60'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-5 text-xs text-mist/70 font-mono">
        Simulated markets · v1.0
      </div>
    </aside>
  );
};

export default Sidebar;