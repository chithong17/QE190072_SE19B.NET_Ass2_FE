"use client";

import Link from 'next/link';
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  CheckSquare,
  Tags,
  Users,
  Search,
  X,
  LogOut,
  LogIn,
  UserPlus,
  Shield,
  ShieldAlert,
  User,
  Settings,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully.');
    if (onClose) onClose();
  };

  const publicMenu = [
    { name: 'Public Explorer', href: '/', icon: LayoutDashboard },
    { name: 'Departments', href: '/departments', icon: Building2 },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Search', href: '/search', icon: Search },
  ];

  const adminMenu = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Departments', href: '/admin/departments', icon: Building2 },
    { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
    { name: 'Tasks', href: '/admin/tasks', icon: CheckSquare },
    { name: 'Tags', href: '/admin/tags', icon: Tags },
  ];

  return (
    <div className="flex flex-col w-[260px] bg-white border-r border-gray-100 h-full text-gray-600 font-sans flex-shrink-0">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-50">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 w-full hover:bg-gray-50 p-1.5 rounded-xl transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <span className="text-lg">T</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-gray-900 text-base">TaskTrack</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                v2
              </span>
            </div>
            <p className="text-[11px] text-gray-400 truncate">PRN232 Assignment 2</p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        {/* Authenticated Management Section */}
        {isAuthenticated && (
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <p className="text-[11px] font-bold text-blue-600 tracking-wider uppercase flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Management
              </p>
              <span className="text-[10px] font-medium text-gray-400">Authenticated</span>
            </div>
            <nav className="space-y-0.5">
              {adminMenu.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                        : 'hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      />
                      <span className="text-xs">{item.name}</span>
                    </div>
                  </Link>
                );
              })}

              {/* Accounts Management (Admin only) */}
              {isAdmin && (
                <Link
                  href="/admin/accounts"
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${
                    pathname === '/admin/accounts'
                      ? 'bg-amber-50 text-amber-700 font-semibold shadow-xs'
                      : 'hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users
                      className={`w-4 h-4 ${
                        pathname === '/admin/accounts' ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'
                      }`}
                    />
                    <span className="text-xs">Accounts</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
                    Admin
                  </span>
                </Link>
              )}
            </nav>
          </div>
        )}

        {/* Public Browsing Section */}
        <div>
          <p className="px-3 text-[11px] font-bold text-gray-400 tracking-wider mb-2 uppercase">
            Public Views
          </p>
          <nav className="space-y-0.5">
            {publicMenu.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-semibold'
                      : 'hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'
                      }`}
                    />
                    <span className="text-xs">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Footer Section */}
      <div className="p-3.5 border-t border-gray-100 bg-gray-50/50">
        {isAuthenticated && user ? (
          <div className="space-y-2">
            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-blue-600">
                  {user.fullName}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      isAdmin
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.roleName}
                  </span>
                  <span className="text-[10px] text-gray-400 truncate">{user.email}</span>
                </div>
              </div>
              <Settings className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700" />
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-xs font-medium text-gray-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/login"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-gray-500" />
              <span>Create Account</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
