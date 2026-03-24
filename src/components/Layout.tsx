import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { auth } from '../firebase';
import { LogOut, Home, Search, MessageSquare, User as UserIcon } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-100 font-sans text-neutral-900">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline">StudentAccomm</span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="text-neutral-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              <Home size={18} />
              <span className="hidden md:inline">Home</span>
            </Link>
            {user ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">{profile?.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">{profile?.role}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/login" 
                className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-neutral-400 text-sm">
          <p>© 2026 Student Accommodation Finder - Gaborone</p>
          <p className="mt-1 italic">Helping students find their home away from home.</p>
        </div>
      </footer>
    </div>
  );
};
