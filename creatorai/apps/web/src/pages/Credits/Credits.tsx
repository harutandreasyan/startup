import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Gem, CheckCircle2, AlertCircle, XCircle, Sparkles, Images, Wand2 } from 'lucide-react';
import { getCreditPacks, purchaseCredits, getCreditHistory, subscribe, getStats } from '@creatorai/api-client';
import { PLANS } from '@creatorai/shared';
import { useAuthStore } from '../../stores/auth.store';
import { apiErrorMessage } from '../../lib/apiError';
import { typeLabel } from '../../lib/generation';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useStyles } from '../../lib/useStyles';
import { creditsStyles } from './styles';

export default function Credits() {
  const styles = useStyles(creditsStyles);
  const user = useAuthStore((s) => s.user);
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const [buying, setBuying] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const currentPlan = user?.plan ?? 'FREE';

  const { data: packs } = useQuery({ queryKey: ['credit-packs'], queryFn: getCreditPacks });
  const { data: history } = useQuery({ queryKey: ['credits-history'], queryFn: () => getCreditHistory({ limit: 10 }) });
  const { data: stats } = useQuery({ queryKey: ['user-stats'], queryFn: getStats });

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
    <div className={styles.root}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Credits & Plans</h1>
          <p className={styles.subtitle}>Power your creativity.</p>
        </div>
        <span className={styles.balancePill}>
          <Gem className={styles.balanceGem} />
          <span className={styles.balanceValue}>{user?.creditBalance ?? 0}</span>
          <span className={styles.balanceLabel}>credits</span>
        </span>
      </div>

      {status === 'success' && <Banner icon={CheckCircle2} tone="success">Payment successful! Your credits will appear shortly.</Banner>}
      {status === 'subscribed' && <Banner icon={CheckCircle2} tone="success">Subscription active! Your monthly credits will appear shortly.</Banner>}
      {status === 'cancelled' && <Banner icon={XCircle} tone="muted">Checkout cancelled — no charge was made.</Banner>}
      {error && <Banner icon={AlertCircle} tone="danger">{error}</Banner>}

      {/* Usage */}
      {stats && stats.totalGenerations > 0 && (
        <section>
          <h2 className={styles.sectionHeading}>Your usage</h2>
          <div className={styles.usageGrid}>
            <Card className={styles.statCard}>
              <div className={styles.statIconWrap}><Images className={styles.statIcon} /></div>
              <div>
                <p className={styles.statValue}>{stats.completedGenerations}</p>
                <p className={styles.statLabel}>Creations</p>
              </div>
            </Card>
            <Card className={styles.statCard}>
              <div className={styles.statIconWrap}><Gem className={styles.statIcon} /></div>
              <div>
                <p className={styles.statValue}>{stats.creditsSpent}</p>
                <p className={styles.statLabel}>Credits spent</p>
              </div>
            </Card>
            <Card className={styles.statCard}>
              <div className={styles.statIconWrap}><Wand2 className={styles.statIcon} /></div>
              <div>
                <p className={styles.statValue}>{stats.byType.length}</p>
                <p className={styles.statLabel}>Tools used</p>
              </div>
            </Card>
          </div>
          {stats.byType.length > 0 && (
            <div className={styles.byTypeRow}>
              {stats.byType.map((t) => (
                <span key={t.type} className={styles.byTypeChip}>
                  {typeLabel(t.type)} <span className={styles.byTypeChipCount}>{t.count}</span>
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Plans */}
      <section>
        <h2 className={styles.sectionHeading}>Subscription plans</h2>
        <div className={styles.planGrid}>
          {(['FREE', 'PRO', 'BUSINESS'] as const).map((planKey) => {
            const plan = PLANS[planKey];
            const isCurrent = currentPlan === planKey;
            const isPaid = planKey !== 'FREE';
            const featured = planKey === 'PRO';
            return (
              <Card
                key={planKey}
                className={styles.planCard(isCurrent, featured)}
              >
                {featured && (
                  <span className={styles.popularBadge}>
                    Popular
                  </span>
                )}
                <div className={styles.planHead}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  {isCurrent && (
                    <span className={styles.currentBadge}>Current</span>
                  )}
                </div>
                <p className={styles.planPrice}>
                  ${(plan.priceUsd / 100).toFixed(0)}
                  <span className={styles.planPriceUnit}>/mo</span>
                </p>
                <p className={styles.planCredits}>{plan.monthlyCredits} credits / month</p>
                <ul className={styles.planFeatures}>
                  {plan.features.map((f) => (
                    <li key={f} className={styles.planFeature}>
                      <Check className={styles.planFeatureIcon} />
                      {f}
                    </li>
                  ))}
                </ul>
                {isPaid && !isCurrent && (
                  <Button
                    className={styles.subscribeBtn}
                    fullWidth
                    onClick={() => handleSubscribe(planKey as 'PRO' | 'BUSINESS')}
                    loading={subscribing === planKey}
                    disabled={subscribing !== null}
                  >
                    Subscribe to {plan.name}
                  </Button>
                )}
                {isCurrent && isPaid && (
                  <p className={styles.currentPlanNote}>You're on this plan</p>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Packs */}
      <section>
        <h2 className={styles.sectionHeading}>One-time credit packs</h2>
        <div className={styles.packGrid}>
          {packs?.map((pack) => (
            <Card key={pack.id} hover className={styles.packCard}>
              <div className={styles.packIconWrap}>
                <Gem className={styles.packIcon} />
              </div>
              <h3 className={styles.packName}>{pack.name}</h3>
              <p className={styles.packCredits}>
                {pack.credits}
                <span className={styles.packCreditsUnit}> credits</span>
              </p>
              <p className={styles.packPrice}>${(pack.priceUsd / 100).toFixed(2)}</p>
              <Button
                variant="secondary"
                fullWidth
                className={styles.buyBtn}
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
        <h2 className={styles.sectionHeading}>Transaction history</h2>
        <Card className={styles.historyCard}>
          {!history?.data.length ? (
            <div className={styles.historyEmpty}>
              <Sparkles className={styles.historyEmptyIcon} />
              No transactions yet
            </div>
          ) : (
            <ul className={styles.historyList}>
              {history.data.map((tx) => (
                <li key={tx.id} className={styles.historyRow}>
                  <div className={styles.historyInfo}>
                    <p className={styles.historyDesc}>{tx.description}</p>
                    <p className={styles.historyDate}>{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={styles.historyAmount(tx.amount >= 0)}>
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
  const styles = useStyles(creditsStyles);
  return (
    <div className={styles.banner(styles.bannerTones[tone])}>
      <Icon className={styles.bannerIcon} />
      {children}
    </div>
  );
}
