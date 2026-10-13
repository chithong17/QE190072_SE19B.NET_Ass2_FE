"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Shield, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { User, useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { extractErrorMessage } from '@/lib/api-error';

function ProfileForms({ user, updateUser }: { user: User; updateUser: (data: Partial<User>) => void }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function updateName(event: FormEvent) {
    event.preventDefault();
    const normalizedName = fullName.trim();
    if (normalizedName.length < 2) return toast.error('Full name must contain at least 2 characters.');
    setSavingName(true);
    try {
      await api.put('/auth/profile', { fullName: normalizedName });
      updateUser({ fullName: normalizedName });
      toast.success('Display name updated successfully.');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to update name.'));
    } finally {
      setSavingName(false);
    }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    if (newPassword.length < 6) return toast.error('New password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match.');
    setSavingPassword(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully.');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to change password.'));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <aside className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white">
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-lg font-bold text-gray-900">{user.fullName}</h2>
        <p className="mb-3 text-sm text-gray-500">{user.email}</p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <Shield className="h-3.5 w-3.5" /> {user.roleName}
        </span>
        <p className="mt-6 w-full border-t pt-4 text-xs text-gray-400">Account ID: #{user.accountId}</p>
      </aside>

      <div className="space-y-6 md:col-span-2">
        <form onSubmit={updateName} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-semibold"><UserIcon className="h-4 w-4 text-blue-600" /> Personal Information</h3>
          <label className="mb-2 block text-xs font-semibold uppercase text-gray-600">Full Name</label>
          <input required minLength={2} maxLength={100} value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-600" />
          <label className="mb-2 mt-4 block text-xs font-semibold uppercase text-gray-600">Email (Read-only)</label>
          <input disabled value={user.email} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-500" />
          <div className="mt-5 flex justify-end"><button disabled={savingName} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-medium text-white disabled:opacity-60">{savingName && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Save Name</button></div>
        </form>

        <form onSubmit={changePassword} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-semibold"><Lock className="h-4 w-4 text-amber-600" /> Change Password</h3>
          <div className="space-y-4">
            <input type="password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Current password" className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm" />
            <div className="grid gap-4 sm:grid-cols-2">
              <input type="password" required minLength={6} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password" className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm" />
              <input type="password" required minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm" />
            </div>
          </div>
          <div className="mt-5 flex justify-end"><button disabled={savingPassword} className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-medium text-white disabled:opacity-60">{savingPassword && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Update Password</button></div>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isAuthenticated, loading, updateUser } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, loading, router]);

  if (loading || !user) return <div className="grid min-h-[50vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header><h1 className="text-2xl font-bold text-gray-900">Account Settings &amp; Profile</h1><p className="mt-1 text-sm text-gray-500">Manage your account information and password.</p></header>
      <ProfileForms key={user.accountId} user={user} updateUser={updateUser} />
    </div>
  );
}
