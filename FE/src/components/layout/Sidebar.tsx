import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Gavel,
  GraduationCap,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Overview' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/alumni', icon: Users, label: 'Alumni Explorer' },
  { path: '/bidding', icon: Gavel, label: 'Bidding' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar — fixed w-64 (256px) to match the ml-64 offset in DashboardLayout */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-surface-900/95 backdrop-blur-xl border-r border-surface-800 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-surface-100">UniAnalytics</h1>
              <p className="text-[10px] text-surface-500 uppercase tracking-wider">
                Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surface-800 rounded-lg lg:hidden transition-colors cursor-pointer"
          >
            <X size={18} className="text-surface-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-surface-500">
            Main Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/15 text-primary-400 shadow-sm'
                    : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
                }`
              }
            >
              <item.icon size={20} strokeWidth={1.8} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-surface-800">
          <div className="glass-card p-3 text-center hover:transform-none">
            <p className="text-xs text-surface-500">CW2 Analytics</p>
            <p className="text-[10px] text-surface-600 mt-0.5">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
