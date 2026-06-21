import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCreditPacks, purchaseCredits, getCreditHistory } from '@creatorai/api-client';
import { useAuthStore } from '../stores/auth.store';
import { apiErrorMessage } from '../lib/apiError';

export function Credits() {
  const user = useAuthStore((s) => s.user);
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const [buying, setBuying] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data: packs } = useQuery({ queryKey: ['credit-packs'], queryFn: getCreditPacks });
  const { data: history } = useQuery({
    queryKey: ['credits-history'],
    queryFn: () => getCreditHistory({ limit: 10 }),
  });

  const handlePurchase = async (packId: string) => {
    setError('');
    setBuying(packId);
    try {
      const { url } = await purchaseCredits(packId);
      window.location.assign(url); // redirect to Stripe Checkout
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not start checkout. Is Stripe configured?'));
      setBuying(null);
    }
  };

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold mb-2">Credits</h1>
      <p className="text-gray-400 mb-6">
        Current balance: <span className="text-white font-semibold">💎 {user?.creditBalance ?? 0}</span>
      </p>

      {status === 'success' && (
        <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
          Payment successful! Your credits will appear shortly.
        </div>
      )}
      {status === 'cancelled' && (
        <div className="mb-6 p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg text-gray-400 text-sm">
          Checkout cancelled — no charge was made.
        </div>
      )}
      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4">Buy Credits</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {packs?.map((pack) => (
          <div
            key={pack.id}
            className="p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-indigo-500/50 transition-colors"
          >
            <h3 className="font-semibold text-lg mb-1">{pack.name}</h3>
            <p className="text-3xl font-bold text-indigo-400 mb-1">
              {pack.credits} <span className="text-sm font-normal text-gray-400">credits</span>
            </p>
            <p className="text-gray-400 text-sm mb-4">${(pack.priceUsd / 100).toFixed(2)}</p>
            <button
              onClick={() => handlePurchase(pack.id)}
              disabled={buying !== null}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {buying === pack.id ? 'Redirecting…' : `Buy ${pack.name}`}
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {!history?.data.length ? (
          <div className="p-8 text-center text-gray-500">No transactions yet</div>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {history.data.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-800 last:border-0">
                  <td className="px-4 py-3 text-gray-300">{tx.description}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      tx.amount >= 0 ? 'text-green-400' : 'text-gray-400'
                    }`}
                  >
                    {tx.amount >= 0 ? '+' : ''}
                    {tx.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
