import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, LogOut, AlertCircle, Crown, ArrowUpRight } from 'lucide-react';
import { updateProfile, deleteAccount, getSubscription, cancelSubscription, getMe } from '@creatorai/api-client';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/auth.store';
import { apiErrorMessage } from '../lib/apiError';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export function Settings() {
  const { user, signOut } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { data: subscription } = useQuery({ queryKey: ['subscription'], queryFn: getSubscription });
  const dirty = name.trim() !== (user?.name ?? '');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSavedMsg('');
    try {
      setUser(await updateProfile({ name: name.trim() }));
      setSavedMsg('Saved');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save profile.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    setError('');
    try {
      await cancelSubscription();
      await queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setUser(await getMe());
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not cancel subscription.'));
    } finally {
      setCancelling(false);
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

  const inputClass =
    'w-full max-w-sm px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted/70 focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/15 transition-all duration-200';
  const fieldLabel = 'block text-xs font-medium text-muted uppercase tracking-wider mb-1.5';

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Profile */}
      <Card className="p-6">
        <h2 className="font-semibold mb-5">Profile</h2>
        <div className="space-y-5">
          <div>
            <label className={fieldLabel}>Email</label>
            <p className="text-sm">{user?.email}</p>
          </div>
          {user?.username && (
            <div>
              <label className={fieldLabel}>Username</label>
              <p className="text-sm">@{user.username}</p>
            </div>
          )}
          <div>
            <label className={fieldLabel}>Display name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSavedMsg('');
              }}
              placeholder="Your name"
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} loading={saving} disabled={!dirty || saving}>
              Save changes
            </Button>
            {savedMsg && (
              <span className="text-success text-sm flex items-center gap-1">
                <Check className="h-4 w-4" /> {savedMsg}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Subscription */}
      <Card className="p-6">
        <h2 className="font-semibold mb-5 flex items-center gap-2">
          <Crown className="h-4 w-4 text-primary" /> Subscription
        </h2>
        {subscription ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span><span className="text-muted">Plan: </span><span className="font-medium">{subscription.plan}</span></span>
              <span><span className="text-muted">Renews: </span>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
            </div>
            <Button variant="secondary" onClick={handleCancelSubscription} loading={cancelling}>
              Cancel subscription
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted">
            You're on the Free plan.{' '}
            <Link to="/credits" className="text-primary hover:text-primary-hover font-medium inline-flex items-center gap-0.5">
              Upgrade <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        )}
      </Card>

      {/* Account */}
      <Card className="p-6">
        <h2 className="font-semibold mb-5">Account</h2>
        <Button variant="secondary" onClick={signOut} leftIcon={<LogOut className="h-4 w-4" />}>
          Sign out
        </Button>
      </Card>

      {/* Danger zone */}
      <Card className="p-6 border-danger/30">
        <h2 className="font-semibold mb-2 text-danger">Danger zone</h2>
        <p className="text-sm text-muted mb-4">
          Permanently delete your account and all data. This cannot be undone.
        </p>
        {!confirmingDelete ? (
          <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
            Delete account
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm">Are you sure?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2.5 rounded-xl bg-danger text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {deleting ? 'Deleting…' : 'Yes, delete everything'}
            </button>
            <Button variant="ghost" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
              Cancel
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
