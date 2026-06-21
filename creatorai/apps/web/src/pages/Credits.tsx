import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Gem, CheckCircle2, AlertCircle, XCircle, Sparkles } from 'lucide-react';
import { getCreditPacks, purchaseCredits, getCreditHistory, subscribe } from '@creatorai/api-client';
import { PLANS } from '@creatorai/shared';
import { useAuthStore } from '../stores/auth.store';
import { apiErrorMessage } from '../lib/apiError';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export function Credits() {
  const user = useAuthStore((s) => s.user);
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const [buying, setBuying] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const currentPlan = user?.plan ?? 'FREE';

  const { data: packs } = useQuery({ queryKey: ['credit-packs'], queryFn: getCreditPacks });
  const { data: history } = useQuery({ queryKey: ['credits-history'], queryFn: () => getCreditHistory({ limit: 10 }) });

  const handlePurchase = async (packId: string) => {
    setError('');
    setBuying(packId);
    try {
      const { url } = await purchaseCredits(packId);
      window.location.assign(url);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not start checkout. Is Stripe configured?'));
      setBuying(null);
    }
  };

  const handleSubscribe = async (plan: 'PRO' | 'BUSINESS') => {
    setError('');
    setSubscribing(plan);
    try {
      const { url } = await subscribe(plan);
      window.location.assign(url);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not start subscription. Is Stripe configured?'));
      setSubscribing(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Credits & Plans</h1>
          <p className="text-muted mt-1">Power your creativity.</p>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-border">
          <Gem className="h-4 w-4 text-primary" />
          <span className="font-semibold">{user?.creditBalance ?? 0}</span>
          <span className="text-muted text-sm">credits</span>
        </span>
      </div>

      {status === 'success' && <Banner icon={CheckCircle2} tone="success">Payment successful! Your credits will appear shortly.</Banner>}
      {status === 'subscribed' && <Banner icon={CheckCircle2} tone="success">Subscription active! Your monthly credits will appear shortly.</Banner>}
      {status === 'cancelled' && <Banner icon={XCircle} tone="muted">Checkout cancelled — no charge was made.</Banner>}
      {error && <Banner icon={AlertCircle} tone="danger">{error}</Banner>}

      {/* Plans */}
      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Subscription plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['FREE', 'PRO', 'BUSINESS'] as const).map((planKey) => {
            const plan = PLANS[planKey];
            const isCurrent = currentPlan === planKey;
            const isPaid = planKey !== 'FREE';
            const featured = planKey === 'PRO';
            return (
              <Card
                key={planKey}
                className={`p-6 relative flex flex-col ${
                  isCurrent ? 'border-primary ring-1 ring-primary/30' : ''
                } ${featured && !isCurrent ? 'border-primary/30' : ''}`}
              >
                {featured && (
                  <span className="absolute -top-2.5 left-6 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold">
                    Popular
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  {isCurrent && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">Current</span>
                  )}
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  ${(plan.priceUsd / 100).toFixed(0)}
                  <span className="text-sm font-normal text-muted">/mo</span>
                </p>
                <p className="text-sm text-primary mt-1 mb-5">{plan.monthlyCredits} credits / month</p>
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-muted flex gap-2">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isPaid && !isCurrent && (
                  <Button
                    className="mt-6"
                    fullWidth
                    onClick={() => handleSubscribe(planKey as 'PRO' | 'BUSINESS')}
                    loading={subscribing === planKey}
                    disabled={subscribing !== null}
                  >
                    Subscribe to {plan.name}
                  </Button>
                )}
                {isCurrent && isPaid && (
                  <p className="mt-6 text-xs text-muted text-center">You're on this plan</p>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Packs */}
      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">One-time credit packs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packs?.map((pack) => (
            <Card key={pack.id} hover className="p-6 flex flex-col">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Gem className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{pack.name}</h3>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {pack.credits}
                <span className="text-sm font-normal text-muted"> credits</span>
              </p>
              <p className="text-muted text-sm mt-1 mb-5">${(pack.priceUsd / 100).toFixed(2)}</p>
              <Button
                variant="secondary"
                fullWidth
                className="mt-auto"
                onClick={() => handlePurchase(pack.id)}
                loading={buying === pack.id}
                disabled={buying !== null}
              >
                Buy {pack.name}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* History */}
      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Transaction history</h2>
        <Card className="overflow-hidden">
          {!history?.data.length ? (
            <div className="p-10 text-center text-muted text-sm flex flex-col items-center gap-2">
              <Sparkles className="h-5 w-5" />
              No transactions yet
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {history.data.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm truncate">{tx.description}</p>
                    <p className="text-xs text-muted">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${tx.amount >= 0 ? 'text-success' : 'text-muted'}`}>
                    {tx.amount >= 0 ? '+' : ''}
                    {tx.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}

function Banner({
  icon: Icon,
  tone,
  children,
}: {
  icon: typeof Check;
  tone: 'success' | 'danger' | 'muted';
  children: React.ReactNode;
}) {
  const tones = {
    success: 'bg-success/10 border-success/20 text-success',
    danger: 'bg-danger/10 border-danger/20 text-danger',
    muted: 'bg-surface-2 border-border text-muted',
  };
  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm ${tones[tone]}`}>
      <Icon className="h-4 w-4 shrink-0" />
      {children}
    </div>
  );
}
