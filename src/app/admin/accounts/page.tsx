"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Edit2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface Account {
  accountId: number;
  fullName: string;
  email: string;
  role: number;
  roleName: string;
  createdDate: string;
}

export default function AccountsManagementPage() {
  const { user, isAdmin } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  // Delete Confirmation State
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error('Access Denied: Only Admin accounts can access account management.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to fetch accounts list.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAccounts();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  // Non-admin Access Denied View
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-red-100 p-8 text-center shadow-lg shadow-red-500/5">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">403 — Forbidden Access</h1>
          <p className="text-sm text-gray-500 mt-2">
            The account management section is restricted to Administrator privileges only. Your current role is{' '}
            <span className="font-semibold text-gray-900">{user?.roleName || 'Staff'}</span>.
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-colors"
            >
              Return to Previous Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setEditName(acc.fullName);
    setEditRole(acc.role);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    setSaving(true);
    try {
      await api.put(`/accounts/${editingAccount.accountId}`, {
        fullName: editName.trim(),
        role: editRole,
      });

      toast.success(`Updated account #${editingAccount.accountId} successfully.`);
      setEditingAccount(null);
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update account.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;

    setDeleting(true);
    try {
      await api.delete(`/accounts/${deletingAccount.accountId}`);
      toast.success(`Account ${deletingAccount.email} deleted successfully.`);
      setDeletingAccount(null);
      fetchAccounts();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete account.';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const filteredAccounts = accounts.filter(
    (a) =>
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Accounts</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage user accounts, toggle permissions (Staff ↔ Admin), and enforce task audit constraints.
          </p>
        </div>

        <button
          onClick={fetchAccounts}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts by name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Total: <span className="font-bold text-gray-900">{filteredAccounts.length}</span> accounts
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs text-gray-500">Loading accounts...</p>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            No accounts found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Account ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {filteredAccounts.map((acc) => {
                  const isCurrent = user?.accountId === acc.accountId;
                  return (
                    <tr key={acc.accountId} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-500">
                        #{acc.accountId}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {acc.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span>{acc.fullName}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-semibold">
                              (You)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-mono text-[11px]">
                        {acc.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            acc.role === 1
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {acc.roleName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">
                        {new Date(acc.createdDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(acc)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Edit Role or Name"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingAccount(acc)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Account Modal */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">
                Edit Account #{editingAccount.accountId}
              </h2>
              <button
                onClick={() => setEditingAccount(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                  Role Assignment
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value={0}>Staff (Role 0) — Standard Operations</option>
                  <option value={1}>Admin (Role 1) — Administrator Full Access</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Delete Account Confirmation</h2>
            <p className="text-xs text-gray-500 mt-2">
              Are you sure you want to delete account{' '}
              <strong className="text-gray-900">{deletingAccount.email}</strong>?
            </p>
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-3">
              Note: Assignment 2 enforces that account deletion will be rejected if this account has created any tasks.
            </p>

            <div className="pt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingAccount(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
