"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import {
  Building2,
  FolderKanban,
  CheckSquare,
  Tags,
  Users,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Activity,
  Layers,
} from 'lucide-react';

interface DashboardStats {
  departments: number;
  projects: number;
  tasks: number;
  tags: number;
  accounts?: number;
}

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    departments: 0,
    projects: 0,
    tasks: 0,
    tags: 0,
    accounts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [depRes, projRes, taskRes, tagRes] = await Promise.all([
          api.get('/departments').catch(() => ({ data: [] })),
          api.get('/projects').catch(() => ({ data: [] })),
          api.get('/tasks').catch(() => ({ data: [] })),
          api.get('/tags').catch(() => ({ data: [] })),
        ]);

        let accCount = 0;
        if (isAdmin) {
          try {
            const accRes = await api.get('/accounts');
            accCount = accRes.data.length;
          } catch {
            // Not admin or error
          }
        }

        setStats({
          departments: depRes.data.length,
          projects: projRes.data.length,
          tasks: taskRes.data.length,
          tags: tagRes.data.length,
          accounts: accCount,
        });
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [isAdmin]);

  const cards = [
    {
      title: 'Departments',
      count: stats.departments,
      href: '/admin/departments',
      icon: Building2,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      description: 'Manage organisational units & divisions',
    },
    {
      title: 'Projects',
      count: stats.projects,
      href: '/admin/projects',
      icon: FolderKanban,
      color: 'bg-violet-500',
      textColor: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-100',
      description: 'Track ongoing milestones & dates',
    },
    {
      title: 'Tasks',
      count: stats.tasks,
      href: '/admin/tasks',
      icon: CheckSquare,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      description: 'Assign priorities, statuses & tags',
    },
    {
      title: 'Tags',
      count: stats.tags,
      href: '/admin/tags',
      icon: Tags,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      description: 'Color-coded labels for workflow filtering',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-blue-950/10">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 mb-4 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
            Authenticated Management Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-sm sm:text-base text-blue-100/80 mt-2">
            Logged in as{' '}
            <span className="font-semibold text-white underline decoration-blue-400">
              {user?.roleName}
            </span>
            . You have full access to perform authenticated create, update, and delete actions.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/tasks"
              className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Manage Tasks
            </Link>
            <Link
              href="/admin/projects"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-2 backdrop-blur-md"
            >
              <Layers className="w-4 h-4" />
              Manage Projects
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            System Metrics Overview
          </h2>
          <span className="text-xs text-gray-400">Live Database Counters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group hover:border-gray-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {card.title}
                    </span>
                    <div className={`w-9 h-9 rounded-xl ${card.bgColor} ${card.textColor} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {loading ? (
                      <span className="text-gray-300 animate-pulse">--</span>
                    ) : (
                      card.count
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                  <span>Enter section</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Admin Specific Account Management Banner */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base">Account Management</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white uppercase">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 max-w-xl">
                You have administrative privileges to manage user roles (Staff / Admin), view system credentials, and remove accounts with safety task integrity checks.
              </p>
            </div>
          </div>
          <Link
            href="/admin/accounts"
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm shrink-0"
          >
            <span>Manage Accounts ({stats.accounts ?? 0})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
