import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import logoImg from '../assets/logo.png';

export const PublicNavBar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  return (
    <nav className="border-b border-white/5 bg-[#060e20]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-90">
          <img src={logoImg} alt="EcoSphere Logo" className="h-8 w-8 object-contain" />
          <span className="text-lg font-black tracking-tight text-white font-mono">
            EcoSphere
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Link to="/" className={`hover:text-white transition-colors ${location.pathname === '/' ? 'text-white' : ''}`}>Home</Link>
          <a href="/#features" className="hover:text-white transition-colors">Features</a>
          <Link to="/about" className={`hover:text-white transition-colors ${location.pathname === '/about' ? 'text-white' : ''}`}>About Us</Link>
        </div>

        {/* Desktop Auth / Action */}
        <div className="hidden md:flex items-center space-x-4 relative">
          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/dashboard"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#10b981] to-[#6741d9] flex items-center justify-center text-white font-black text-sm shadow-md overflow-hidden hover:scale-105 transition-transform"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="User" className="h-full w-full object-cover" />
                  ) : (
                    profile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'
                  )}
                </button>
                
                {/* Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0f172a] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-sm font-bold text-white truncate">{profile?.name || user.email}</p>
                      <p className="text-xs text-slate-400 capitalize">{profile?.role?.replace('_', ' ') || 'User'}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setUserDropdownOpen(false)} className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Open App</span>
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#057a55] text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:shadow-lg hover:shadow-[#10b981]/20 active:scale-95 transition-all"
              >
                Request Demo
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="text-slate-300 hover:text-white focus:outline-none p-1"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0b1326] border-b border-white/10 px-6 py-4 space-y-4">
          <Link to="/" onClick={toggleMobileMenu} className="block text-sm font-bold text-white hover:text-[#10b981] transition-colors">Home</Link>
          <a href="/#features" onClick={toggleMobileMenu} className="block text-sm font-bold text-white hover:text-[#10b981] transition-colors">Features</a>
          <Link to="/about" onClick={toggleMobileMenu} className="block text-sm font-bold text-white hover:text-[#10b981] transition-colors">About Us</Link>
          
          <div className="border-t border-white/10 pt-4 space-y-4">
            {user ? (
              <>
                <div className="flex items-center space-x-3 mb-4">
                   <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#10b981] to-[#6741d9] flex items-center justify-center text-white font-black text-sm overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      profile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{profile?.name || user.email}</p>
                    <p className="text-xs text-slate-400 capitalize">{profile?.role?.replace('_', ' ') || 'User'}</p>
                  </div>
                </div>
                <Link 
                  to="/dashboard" 
                  onClick={toggleMobileMenu}
                  className="w-full flex items-center justify-center px-4 py-2 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-lg hover:bg-white/10 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    toggleMobileMenu();
                    signOut();
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link 
                  to="/login" 
                  onClick={toggleMobileMenu}
                  className="w-full text-center px-4 py-2 border border-white/10 bg-white/5 text-white font-bold text-sm rounded-lg hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/login" 
                  onClick={toggleMobileMenu}
                  className="w-full text-center px-4 py-2 bg-gradient-to-r from-[#10b981] to-[#057a55] text-white font-bold text-sm rounded-lg hover:shadow-lg transition-colors"
                >
                  Request Demo
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
