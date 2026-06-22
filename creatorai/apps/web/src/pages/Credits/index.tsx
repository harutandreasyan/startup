import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Gem, CheckCircle2, AlertCircle, XCircle, Sparkles } from 'lucide-react';
import { getCreditPacks, purchaseCredits, getCreditHistory, subscribe } from '@creatorai/api-client';
import { PLANS } from '@creatorai/shared';
import { useAuthStore } from '../../stores/auth.store';
import { apiErrorMessage } from '../../lib/apiError';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useStyles } from '../../lib/useStyles';
import { creditsStyles } from './styles';

export function Credits() {
  const s = useStyles(creditsStyles);
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
    <div className={s.root}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Credits & Plans</h1>
          <p className={s.subtitle}>Power your creativity.</p>
        </div>
        <span className={s.balancePill}>
          <Gem className={s.balanceGem} />
          <span className={s.balanceValue}>{user?.creditBalance ?? 0}</span>
          <span className={s.balanceLabel}>credits</span>
        </span>
      </div>

      {status === 'success' && <Banner icon={CheckCircle2} tone="success">Payment successful! Your credits will appear shortly.</Banner>}
      {status === 'subscribed' && <Banner icon={CheckCircle2} tone="success">Subscription active! Your monthly credits will appear shortly.</Banner>}
      {status === 'cancelled' && <Banner icon={XCircle} tone="muted">Checkout cancelled — no charge was made.</Banner>}
      {error && <Banner icon={AlertCircle} tone="danger">{error}</Banner>}

      {/* Plans */}
      <section>
        <h2 className={s.sectionHeading}>Subscription plans</h2>
        <div className={s.planGrid}>
          {(['FREE', 'PRO', 'BUSINESS'] as const).map((planKey) => {
            const plan = PLANS[planKey];
            const isCurrent = currentPlan === planKey;
            const isPaid = planKey !== 'FREE';
            const featured = planKey === 'PRO';
            return (
              <Card
                key={planKey}
                className={s.planCard(isCurrent, featured)}
              >
                {featured && (
                  <span className={s.popularBadge}>
                    Popular
                  </span>
                )}
                <div className={s.planHead}>
                  <h3 className={s.planName}>{plan.name}</h3>
                  {isCurrent && (
                    <span className={s.currentBadge}>Current</span>
                  )}
                </div>
                <p className={s.planPrice}>
                  ${(plan.priceUsd / 100).toFixed(0)}
                  <span className={s.planPriceUnit}>/mo</span>
                </p>
                <p className={s.planCredits}>{plan.monthlyCredits} credits / month</p>
                <ul className={s.planFeatures}>
                  {plan.features.map((f) => (
                    <li key={f} className={s.planFeature}>
                      <Check className={s.planFeatureIcon} />
                      {f}
                    </li>
                  ))}
                </ul>
                {isPaid && !isCurrent && (
                  <Button
                    className={s.subscribeBtn}
                    fullWidth
                    onClick={() => handleSubscribe(planKey as 'PRO' | 'BUSINESS')}
                    loading={subscribing === planKey}
                    disabled={subscribing !== null}
                  >
                    Subscribe to {plan.name}
                  </Button>
                )}
                {isCurrent && isPaid && (
                  <p className={s.currentPlanNote}>You're on this plan</p>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Packs */}
      <section>
        <h2 className={s.sectionHeading}>One-time credit packs</h2>
        <div className={s.packGrid}>
          {packs?.map((pack) => (
            <Card key={pack.id} hover className={s.packCard}>
              <div className={s.packIconWrap}>
                <Gem className={s.packIcon} />
              </div>
              <h3 className={s.packName}>{pack.name}</h3>
              <p className={s.packCredits}>
                {pack.credits}
                <span className={s.packCreditsUnit}> credits</span>
              </p>
              <p className={s.packPrice}>${(pack.priceUsd / 100).toFixed(2)}</p>
              <Button
                variant="secondary"
                fullWidth
                className={s.buyBtn}
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
        <h2 className={s.sectionHeading}>Transaction history</h2>
        <Card className={s.historyCard}>
          {!history?.data.length ? (
            <div className={s.historyEmpty}>
              <Sparkles className={s.historyEmptyIcon} />
              No transactions yet
            </div>
          ) : (
            <ul className={s.historyList}>
              {history.data.map((tx) => (
                <li key={tx.id} className={s.historyRow}>
                  <div className={s.historyInfo}>
                    <p className={s.historyDesc}>{tx.description}</p>
                    <p className={s.historyDate}>{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={s.historyAmount(tx.amount >= 0)}>
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
  const s = useStyles(creditsStyles);
  return (
    <div className={s.banner(s.bannerTones[tone])}>
      <Icon className={s.bannerIcon} />
      {children}
    </div>
  );
}
