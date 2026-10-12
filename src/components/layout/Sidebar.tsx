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
  Plus,
  X,
  LogOut,
  LogIn,
  UserPlus,
  Shield,
  Settings,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { toast } from 'sonner';

const colors = [
  'bg-blue-600',
  'bg-violet-600',
  'bg-orange-500',
  'bg-indigo-500',
  'bg-fuchsia-600',
  'bg-cyan-600',
];

interface SidebarProject {
  projectId: number;
  projectName: string;
}

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [projects, setProjects] = useState<SidebarProject[]>([]);

  useEffect(() => {
    api
      .get('/projects')
      .then((res) => {
        setProjects(res.data.slice(0, 5));
      })
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully.');
    if (onClose) onClose();
  };

  // Main navigation items
  const menuItems = [
    {
      name: 'Dashboard',
      href: isAuthenticated ? '/admin' : '/',
      icon: LayoutDashboard,
      active: pathname === '/' || pathname === '/admin',
    },
    {
      name: 'Departments',
      href: isAuthenticated ? '/admin/departments' : '/departments',
      icon: Building2,
      active: pathname.startsWith('/departments') || pathname.startsWith('/admin/departments'),
    },
    {
      name: 'Projects',
      href: isAuthenticated ? '/admin/projects' : '/projects',
      icon: FolderKanban,
      active: (pathname.startsWith('/projects') && !pathname.includes('manage')) || pathname.startsWith('/admin/projects'),
    },
    {
      name: 'Tasks',
      href: '/admin/tasks',
      icon: CheckSquare,
      active: pathname.startsWith('/tasks') || pathname.startsWith('/admin/tasks'),
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
      active: pathname === '/search',
    },
    {
      name: 'Tags',
      href: '/admin/tags',
      icon: Tags,
      active: pathname.startsWith('/tags') || pathname.startsWith('/admin/tags'),
    },
  ];

  return (
    <div className="flex flex-col w-[260px] bg-white border-r border-gray-100 h-full text-gray-600 font-sans flex-shrink-0">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 w-full hover:bg-gray-50 p-2 rounded-xl border border-transparent hover:border-gray-100 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
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

      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Main Menu */}
        <div className="mb-6">
          <p className="px-3 text-[11px] font-bold text-gray-400 tracking-wider mb-2 uppercase">
            Main Menu
          </p>
          <nav className="space-y-0.5">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${
                  item.active
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 ${
                      item.active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
              </Link>
            ))}

            {/* Admin Only Accounts Navigation */}
            {isAuthenticated && isAdmin && (
              <Link
                href="/admin/accounts"
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${
                  pathname === '/admin/accounts'
                    ? 'bg-amber-50 text-amber-700 font-semibold'
                    : 'hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users
                    className={`w-4 h-4 ${
                      pathname === '/admin/accounts'
                        ? 'text-amber-600'
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  <span className="text-sm">Accounts</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
                  Admin
                </span>
              </Link>
            )}
          </nav>
        </div>

        {/* Recent Projects (Original feature restored) */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
              Recent Projects
            </p>
          </div>
          <nav className="space-y-0.5">
            {projects.map((p, idx) => {
              const isActive = pathname.includes(`/projects/${p.projectId}`);
              const colorClass = colors[idx % colors.length];
              return (
                <Link
                  key={p.projectId}
                  href={`/projects/${p.projectId}`}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-blue-50/50 text-gray-900 font-semibold'
                      : 'hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold ${colorClass} shadow-xs shrink-0`}
                    >
                      {p.projectName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm truncate">{p.projectName}</span>
                  </div>
                </Link>
              );
            })}

            <Link
              href="/projects"
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors mt-2 text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>All Projects</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-3.5 border-t border-gray-100 bg-gray-50/60 shrink-0">
        {isAuthenticated && user ? (
          <div className="space-y-2">
            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
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
              <Settings className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 shrink-0" />
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-xs font-medium text-gray-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-gray-500" />
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
