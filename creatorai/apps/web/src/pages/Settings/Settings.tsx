import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, Crown, ArrowUpRight, Camera, Trash2 } from 'lucide-react';
import { updateProfile, deleteAccount, getSubscription, cancelSubscription, getMe, changeEmail } from '@creatorai/api-client';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/auth.store';
import { apiErrorMessage } from '../../lib/apiError';
import { toast } from '../../stores/toast.store';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import ConfirmModal from '../../components/common/ConfirmModal';
import DeleteAccountModal from '../../components/common/DeleteAccountModal';
import AvatarCropper from '../../components/common/AvatarCropper';
import { useStyles } from '../../lib/useStyles';
import { settingsStyles } from './styles';

export default function Settings() {
  const s = useStyles(settingsStyles);
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

  return (
    <div className={s.page}>
      <h1 className={s.title}>Settings</h1>

      {/* Profile */}
      <Card glow className={s.card}>
        <h2 className={s.cardHeading}>Profile</h2>

        {/* Avatar */}
        <div className={s.avatarRow}>
          <div className={s.avatarWrap}>
            <Avatar name={user?.name} username={user?.username} email={user?.email} src={user?.avatarUrl} size={72} />
            <button
              onClick={() => fileRef.current?.click()}
              aria-label="Change photo"
              className={s.avatarBtn}
            >
              <Camera className={s.cameraIcon} />
            </button>
          </div>
          <div>
            <p className={s.avatarTitle}>Profile photo</p>
            <p className={s.avatarHint}>JPG or PNG, square looks best.</p>
            <div className={s.avatarBtnRow}>
              <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
                Upload
              </Button>
              {user?.avatarUrl && (
                <Button size="sm" variant="ghost" onClick={() => setShowRemoveAvatar(true)}>
                  Remove
                </Button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFilePick} className={s.hiddenInput} />
          </div>
        </div>

        <div className={s.fields}>
          {user?.username && (
            <div>
              <label className={s.fieldLabel}>Username</label>
              <p className={s.usernameValue}>@{user.username}</p>
            </div>
          )}
          <div>
            <label className={s.fieldLabel}>Display name</label>
            <div className={s.fieldRow}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={s.inputClass}
              />
              <Button onClick={handleSave} loading={saving} disabled={!dirty || saving} size="sm">
                Save
              </Button>
            </div>
          </div>
          <div>
            <label className={s.fieldLabel}>Email</label>
            <div className={s.fieldRow}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoCapitalize="none"
                placeholder="you@example.com"
                className={s.inputClass}
              />
              <Button onClick={handleChangeEmail} loading={savingEmail} disabled={!emailDirty || savingEmail} size="sm">
                Update
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Subscription */}
      <Card glow className={s.card}>
        <h2 className={s.subHeading}>
          <Crown className={s.crownIcon} /> Subscription
        </h2>
        {subscription ? (
          <div className={s.subContent}>
            <div className={s.subRow}>
              <span><span className={s.subMuted}>Plan: </span><span className={s.subPlan}>{subscription.plan}</span></span>
              <span><span className={s.subMuted}>Renews: </span>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
            </div>
            <Button variant="secondary" onClick={() => setShowCancelSub(true)}>
              Cancel subscription
            </Button>
          </div>
        ) : (
          <p className={s.freeText}>
            You're on the Free plan.{' '}
            <Link to="/credits" className={s.upgradeLink}>
              Upgrade <ArrowUpRight className={s.upgradeIcon} />
            </Link>
          </p>
        )}
      </Card>

      {/* Account */}
      <Card glow className={s.card}>
        <h2 className={s.accountHeading}>Account</h2>
        <Button variant="secondary" onClick={() => setShowSignOut(true)} leftIcon={<LogOut className={s.signOutIcon} />}>
          Sign out
        </Button>

        <div className={s.divider} />

        <div className={s.deleteRow}>
          <div>
            <p className={s.deleteTitle}>Delete account</p>
            <p className={s.deleteHint}>Permanently erase your account and all creations.</p>
          </div>
          <button
            onClick={() => setShowDelete(true)}
            className={s.deleteBtn}
          >
            <Trash2 className={s.trashIcon} /> Delete
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
