import { useAuthStore } from '../stores/auth.store';
import { CREDIT_PACKS } from '@creatorai/shared';

export function Credits() {
  const user = useAuthStore((s) => s.user);

  const handlePurchase = async (packIndex: number) => {
    // TODO: Call purchaseCredits API → redirect to Stripe Checkout
    alert(`Purchase flow coming soon for ${CREDIT_PACKS[packIndex].name} pack`);
  };

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-2">Credits</h1>
      <p className="text-gray-400 mb-8">
        Current balance: <span className="text-white font-semibold">💎 {user?.creditBalance ?? 0}</span>
      </p>

      <h2 className="text-lg font-semibold mb-4">Buy Credits</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {CREDIT_PACKS.map((pack, i) => (
          <div
            key={pack.name}
            className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-indigo-500/50 transition-colors"
          >
            <h3 className="font-semibold text-lg mb-1">{pack.name}</h3>
            <p className="text-3xl font-bold text-indigo-400 mb-1">
              {pack.credits} <span className="text-sm font-normal text-gray-400">credits</span>
            </p>
            <p className="text-gray-400 text-sm mb-4">${(pack.priceUsd / 100).toFixed(2)}</p>
            <button
              onClick={() => handlePurchase(i)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
            >
              Buy {pack.name}
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
        <p className="text-gray-500">No transactions yet</p>
      </div>
    </div>
  );
}
