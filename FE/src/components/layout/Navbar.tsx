import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-surface-900/80 backdrop-blur-xl border-b border-surface-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
        {/* Left: hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-surface-800 rounded-xl lg:hidden transition-colors cursor-pointer"
          >
            <Menu size={20} className="text-surface-400" />
          </button>
        </div>

        {/* Right: user info + logout  */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-800/60 border border-surface-700">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
              <UserIcon size={14} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-surface-200">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-surface-500">{user?.role || 'user'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl text-surface-400 transition-all duration-200 cursor-pointer"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
