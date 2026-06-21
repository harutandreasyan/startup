import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { updateProfile, deleteAccount, getSubscription, cancelSubscription, getMe } from '@creatorai/api-client';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/auth.store';
import { apiErrorMessage } from '../lib/apiError';

export function Settings() {
  const { user, signOut } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const queryClient = useQueryClient();
  const { data: subscription } = useQuery({ queryKey: ['subscription'], queryFn: getSubscription });

  const dirty = name.trim() !== (user?.name ?? '');

  const handleCancelSubscription = async () => {
    setCancelling(true);
    setError('');
    try {
      await cancelSubscription();
      await queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setUser(await getMe()); // refresh profile so the Plan field reflects FREE
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not cancel subscription.'));
    } finally {
      setCancelling(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSavedMsg('');
    try {
      const updated = await updateProfile({ name: name.trim() });
      setUser(updated);
      setSavedMsg('Saved');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save profile.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await deleteAccount();
      await signOut();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not delete account.'));
      setDeleting(false);
    }
  };

  return (
    <div className="text-white max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="font-semibold mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <p className="text-sm">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Display name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSavedMsg('');
              }}
              placeholder="Your name"
              className="w-full max-w-sm px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Plan</label>
            <p className="text-sm">{user?.plan || 'Free'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {savedMsg && <span className="text-green-400 text-sm">{savedMsg}</span>}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="font-semibold mb-4">Subscription</h2>
        {subscription ? (
          <div className="space-y-3">
            <p className="text-sm">
              <span className="text-gray-400">Plan: </span>
              <span className="font-medium">{subscription.plan}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Renews: </span>
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
            <button
              onClick={handleCancelSubscription}
              disabled={cancelling}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-sm transition-colors"
            >
              {cancelling ? 'Cancelling…' : 'Cancel subscription'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            You're on the Free plan.{' '}
            <Link to="/credits" className="text-indigo-400 hover:text-indigo-300">
              Upgrade
            </Link>{' '}
            for more monthly credits.
          </p>
        )}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="font-semibold mb-4">Account</h2>
        <button
          onClick={signOut}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
        >
          Sign Out
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-gray-900 rounded-xl border border-red-900/30 p-6">
        <h2 className="font-semibold mb-2 text-red-400">Danger Zone</h2>
        <p className="text-sm text-gray-400 mb-4">
          Permanently delete your account and all data. This cannot be undone.
        </p>
        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg text-sm transition-colors"
          >
            Delete Account
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">Are you sure?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {deleting ? 'Deleting…' : 'Yes, delete everything'}
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
