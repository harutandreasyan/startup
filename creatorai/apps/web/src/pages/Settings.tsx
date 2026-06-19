import { useAuth } from '../hooks/useAuth';

export function Settings() {
  const { user, signOut } = useAuth();

  return (
    <div className="text-white max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="font-semibold mb-4">Profile</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <p className="text-sm">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <p className="text-sm">{user?.name || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Plan</label>
            <p className="text-sm">{user?.plan || 'Free'}</p>
          </div>
        </div>
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

      <div className="bg-gray-900 rounded-xl border border-red-900/30 p-6">
        <h2 className="font-semibold mb-2 text-red-400">Danger Zone</h2>
        <p className="text-sm text-gray-400 mb-4">
          Permanently delete your account and all data. This cannot be undone.
        </p>
        <button className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg text-sm transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
