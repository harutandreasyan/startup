import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, Crown, ArrowUpRight, Camera, Trash2 } from 'lucide-react';
import { updateProfile, deleteAccount, getSubscription, cancelSubscription, getMe, changeEmail } from '@creatorai/api-client';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/auth.store';
import { apiErrorMessage } from '../lib/apiError';
import { toast } from '../stores/toast.store';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { DeleteAccountModal } from '../components/common/DeleteAccountModal';
import { AvatarCropper } from '../components/common/AvatarCropper';

export function Settings() {
  const { user, signOut } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [applyingAvatar, setApplyingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  // modals
  const [showSignOut, setShowSignOut] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showRemoveAvatar, setShowRemoveAvatar] = useState(false);
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

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) setCropFile(file); // open cropper for preview/adjust
  };

  const handleApplyAvatar = async (dataUrl: string) => {
    setApplyingAvatar(true);
    try {
      setUser(await updateProfile({ avatarUrl: dataUrl }));
      setCropFile(null);
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not update photo.'));
    } finally {
      setApplyingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setRemovingAvatar(true);
    try {
      setUser(await updateProfile({ avatarUrl: '' }));
      setShowRemoveAvatar(false);
      toast.success('Profile photo removed');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not remove photo.'));
    } finally {
      setRemovingAvatar(false);
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
    <div className="max-w-2xl space-y-6">
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
              aria-label="Change photo"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors ring-2 ring-[var(--background)]"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium">Profile photo</p>
            <p className="text-xs text-muted mb-2">JPG or PNG, square looks best.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
                Upload
              </Button>
              {user?.avatarUrl && (
                <Button size="sm" variant="ghost" onClick={() => setShowRemoveAvatar(true)}>
                  Remove
                </Button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFilePick} className="hidden" />
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
        <h2 className="font-semibold mb-4">Account</h2>
        <Button variant="secondary" onClick={() => setShowSignOut(true)} leftIcon={<LogOut className="h-4 w-4" />}>
          Sign out
        </Button>

        <div className="h-px bg-border my-5" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-xs text-muted">Permanently erase your account and all creations.</p>
          </div>
          <button
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </Card>

      {/* Modals */}
      {cropFile && (
        <AvatarCropper
          file={cropFile}
          saving={applyingAvatar}
          onApply={handleApplyAvatar}
          onCancel={() => setCropFile(null)}
        />
      )}
      <ConfirmModal
        open={showRemoveAvatar}
        title="Remove profile photo?"
        description="Your avatar will go back to the default initial."
        confirmLabel="Remove"
        variant="danger"
        loading={removingAvatar}
        onConfirm={handleRemoveAvatar}
        onCancel={() => setShowRemoveAvatar(false)}
      />
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
      <DeleteAccountModal
        open={showDelete}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
