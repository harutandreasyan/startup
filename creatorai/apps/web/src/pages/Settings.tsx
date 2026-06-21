import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, Crown, ArrowUpRight, Camera, Loader2, Trash2 } from 'lucide-react';
import { updateProfile, deleteAccount, getSubscription, cancelSubscription, getMe, changeEmail } from '@creatorai/api-client';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/auth.store';
import { apiErrorMessage } from '../lib/apiError';
import { toast } from '../stores/toast.store';
import { fileToAvatarDataUrl } from '../lib/image';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { ConfirmModal } from '../components/common/ConfirmModal';

export function Settings() {
  const { user, signOut } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // modals
  const [showSignOut, setShowSignOut] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCancelSub, setShowCancelSub] = useState(false);

  const { data: subscription } = useQuery({ queryKey: ['subscription'], queryFn: getSubscription });
  const dirty = name.trim() !== (user?.name ?? '');
  const emailDirty = email.trim().toLowerCase() !== (user?.email ?? '').toLowerCase();

  const handleSave = async () => {
    setSaving(true);
    try {
      setUser(await updateProfile({ name: name.trim() }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not save profile.'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async () => {
    setSavingEmail(true);
    try {
      await changeEmail(email.trim());
      setUser(await getMe());
      toast.success('Email updated');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not change email.'));
      setEmail(user?.email ?? '');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setUser(await updateProfile({ avatarUrl: dataUrl }));
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not update photo.'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    try {
      setUser(await updateProfile({ avatarUrl: '' }));
      toast.success('Profile photo removed');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not remove photo.'));
    } finally {
      setUploading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      await cancelSubscription();
      await queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setUser(await getMe());
      setShowCancelSub(false);
      toast.success('Subscription cancelled');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not cancel subscription.'));
    } finally {
      setCancelling(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      await signOut();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not delete account.'));
      setDeleting(false);
    }
  };

  const inputClass =
    'w-full max-w-sm px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted/70 focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/15 transition-all duration-200';
  const fieldLabel = 'block text-xs font-medium text-muted uppercase tracking-wider mb-1.5';

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in-up">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>

      {/* Profile */}
      <Card glow className="p-6">
        <h2 className="font-semibold mb-5">Profile</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <Avatar name={user?.name} username={user?.username} email={user?.email} src={user?.avatarUrl} size={72} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="Change photo"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors ring-2 ring-[var(--background)]"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>
          </div>
          <div>
            <p className="text-sm font-medium">Profile photo</p>
            <p className="text-xs text-muted mb-2">JPG or PNG, square looks best.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
                Upload
              </Button>
              {user?.avatarUrl && (
                <Button size="sm" variant="ghost" onClick={handleRemoveAvatar} disabled={uploading}>
                  Remove
                </Button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
        </div>

        <div className="space-y-5">
          {user?.username && (
            <div>
              <label className={fieldLabel}>Username</label>
              <p className="text-sm">@{user.username}</p>
            </div>
          )}
          <div>
            <label className={fieldLabel}>Display name</label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={inputClass}
              />
              <Button onClick={handleSave} loading={saving} disabled={!dirty || saving} size="sm">
                Save
              </Button>
            </div>
          </div>
          <div>
            <label className={fieldLabel}>Email</label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoCapitalize="none"
                placeholder="you@example.com"
                className={inputClass}
              />
              <Button onClick={handleChangeEmail} loading={savingEmail} disabled={!emailDirty || savingEmail} size="sm">
                Update
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Subscription */}
      <Card glow className="p-6">
        <h2 className="font-semibold mb-5 flex items-center gap-2">
          <Crown className="h-4 w-4 text-primary" /> Subscription
        </h2>
        {subscription ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span><span className="text-muted">Plan: </span><span className="font-medium">{subscription.plan}</span></span>
              <span><span className="text-muted">Renews: </span>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
            </div>
            <Button variant="secondary" onClick={() => setShowCancelSub(true)}>
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
      <Card glow className="p-6">
        <h2 className="font-semibold mb-1">Account</h2>
        <p className="text-sm text-muted mb-4">Sign out of CreatorAI on this device.</p>
        <Button variant="secondary" onClick={() => setShowSignOut(true)} leftIcon={<LogOut className="h-4 w-4" />}>
          Sign out
        </Button>
      </Card>

      {/* Danger zone */}
      <Card className="p-6 border-danger/30">
        <h2 className="font-semibold mb-1 text-danger">Danger zone</h2>
        <p className="text-sm text-muted mb-4">
          Permanently delete your account and all data. This cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setShowDelete(true)} leftIcon={<Trash2 className="h-4 w-4" />}>
          Delete account
        </Button>
      </Card>

      {/* Modals */}
      <ConfirmModal
        open={showSignOut}
        title="Sign out?"
        description="You'll need to sign in again to access your creations."
        confirmLabel="Sign out"
        onConfirm={signOut}
        onCancel={() => setShowSignOut(false)}
      />
      <ConfirmModal
        open={showCancelSub}
        title="Cancel subscription?"
        description="You'll keep access until the end of your current billing period, then move to the Free plan."
        confirmLabel="Cancel subscription"
        cancelLabel="Keep it"
        variant="danger"
        loading={cancelling}
        onConfirm={handleCancelSubscription}
        onCancel={() => setShowCancelSub(false)}
      />
      <ConfirmModal
        open={showDelete}
        title="Delete account?"
        description="This permanently deletes your account, credits, and all generated images. This action cannot be undone."
        confirmLabel="Delete everything"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
