'use client';

import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type BillingPeriod = 'monthly' | 'yearly';

type PricingPlan = {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
};

type ComparisonRow = {
  feature: string;
  basic: boolean;
  premium: boolean;
  deluxe: boolean;
};

const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Basic',
    description:
      'Limited use, has minimal features and can be used on one platform.',
    monthlyPrice: 20,
    yearlyPrice: 192,
    ctaLabel: 'Try for Free',
    ctaHref: '/register',
  },
  {
    name: 'Premium',
    description: 'Unlimited usage and extra features not in basic class.',
    monthlyPrice: 60,
    yearlyPrice: 576,
    ctaLabel: 'Try for Free',
    ctaHref: '/register',
    featured: true,
  },
  {
    name: 'Deluxe',
    description:
      'Everything is in your hands, you can adjust it to your needs.',
    monthlyPrice: 80,
    yearlyPrice: 768,
    ctaLabel: 'Contact Us',
    ctaHref: '/#help',
  },
];

const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: '14 Days Free', basic: true, premium: true, deluxe: true },
  {
    feature: 'Accept Online Feedback',
    basic: true,
    premium: true,
    deluxe: true,
  },
  { feature: 'Unlimited Items', basic: false, premium: true, deluxe: true },
  { feature: 'Unlimited Tablets', basic: false, premium: true, deluxe: true },
  { feature: 'Tablet App Menu', basic: false, premium: true, deluxe: true },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US').format(price);
}

function FeatureCell({ enabled }: { enabled: boolean }) {
  if (enabled) {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-[var(--token-green-100)] text-[var(--token-green-600)] size-7">
        <Check size={16} aria-hidden />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center rounded-full bg-[var(--token-gray-100)] dark:bg-[var(--token-white-5)] text-[var(--token-gray-400)] size-7">
      <X size={16} aria-hidden />
    </span>
  );
}

export default function PosPricing() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  return (
    <section
      id="pricing"
      className="scroll-mt-28 py-18 md:py-24 bg-[var(--token-gray-50)] dark:bg-[var(--color-marketing-dark-canvas)]"
    >
      <div className="wrapper">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-title-sm font-bold text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
            The best choice for you
          </h2>
          <p className="mt-4 text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
            Free trial period of 14 days, unlocking all features.
          </p>

          <div className="mt-8 inline-flex items-center rounded-full border border-[var(--token-gray-200)] dark:border-[var(--color-border-dark-soft)] bg-[var(--token-white)] dark:bg-[var(--color-surface-dark-elevated)] p-1">
            <button
              type="button"
              aria-pressed={billingPeriod === 'monthly'}
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                'h-11 min-w-[124px] rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                billingPeriod === 'monthly'
                  ? 'bg-[var(--token-gray-900)] text-[var(--token-white)] dark:bg-[var(--token-white-10)]'
                  : 'text-[var(--token-gray-600)] dark:text-[var(--token-gray-400)]'
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              aria-pressed={billingPeriod === 'yearly'}
              onClick={() => setBillingPeriod('yearly')}
              className={cn(
                'h-11 min-w-[124px] rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                billingPeriod === 'yearly'
                  ? 'bg-[var(--token-gray-900)] text-[var(--token-white)] dark:bg-[var(--token-white-10)]'
                  : 'text-[var(--token-gray-600)] dark:text-[var(--token-gray-400)]'
              )}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start">
          {PRICING_PLANS.map((plan) => {
            const price =
              billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const periodLabel = billingPeriod === 'monthly' ? '/ mo' : '/ yr';

            return (
              <article
                key={plan.name}
                className={cn(
                  'rounded-3xl border p-8 transition-colors',
                  plan.featured
                    ? 'border-primary-500 bg-[var(--token-gray-900)] dark:bg-[var(--color-surface-dark-subtle)] shadow-theme-lg md:scale-[1.03]'
                    : 'border-[var(--token-gray-200)] dark:border-[var(--color-border-dark-soft)] bg-[var(--token-white)] dark:bg-[var(--color-surface-dark-elevated)]'
                )}
              >
                {plan.featured ? (
                  <p className="inline-flex rounded-full bg-[var(--token-white)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--token-gray-900)] uppercase">
                    Most Popular
                  </p>
                ) : null}

                <h3
                  className={cn(
                    'mt-4 text-2xl font-bold',
                    plan.featured
                      ? 'text-[var(--token-white)]'
                      : 'text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]'
                  )}
                >
                  {plan.name}
                </h3>

                <p
                  className={cn(
                    'mt-3 min-h-[3rem] text-sm',
                    plan.featured
                      ? 'text-[var(--token-white-70)]'
                      : 'text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]'
                  )}
                >
                  {plan.description}
                </p>

                <div className="mt-8 flex items-end gap-2">
                  <span
                    className={cn(
                      'text-4xl font-bold',
                      plan.featured
                        ? 'text-[var(--token-white)]'
                        : 'text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]'
                    )}
                  >
                    $ {formatPrice(price)}
                  </span>
                  <span
                    className={cn(
                      'pb-1 text-sm',
                      plan.featured
                        ? 'text-[var(--token-white-60)]'
                        : 'text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]'
                    )}
                  >
                    {periodLabel}
                  </span>
                </div>

                <Link
                  href={plan.ctaHref}
                  className={cn(
                    'mt-8 inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    plan.featured
                      ? 'bg-[var(--token-white)] text-[var(--token-gray-900)] hover:bg-[var(--token-gray-100)]'
                      : 'border border-[var(--token-gray-300)] dark:border-[var(--color-border-dark-strong)] text-[var(--token-gray-800)] dark:text-[var(--token-white-90)] hover:bg-[var(--token-gray-50)] dark:hover:bg-[var(--color-surface-dark-subtle)]'
                  )}
                >
                  {plan.ctaLabel}
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-14 overflow-x-auto rounded-2xl border border-[var(--token-gray-200)] dark:border-[var(--color-border-dark-soft)]">
          <table className="min-w-[760px] w-full border-collapse">
            <thead>
              <tr className="bg-[var(--token-gray-100)] dark:bg-[var(--color-surface-dark-elevated)] border-b border-[var(--token-gray-200)] dark:border-[var(--color-border-dark-soft)]">
                <th className="px-6 py-5 text-left text-xs font-semibold tracking-wide uppercase text-[var(--token-gray-500)]">
                  Plan Features
                </th>
                <th className="px-6 py-5 text-left text-xs font-semibold tracking-wide uppercase text-[var(--token-gray-500)]">
                  Basic
                </th>
                <th className="px-6 py-5 text-left text-xs font-semibold tracking-wide uppercase text-[var(--token-gray-500)]">
                  Premium
                </th>
                <th className="px-6 py-5 text-left text-xs font-semibold tracking-wide uppercase text-[var(--token-gray-500)]">
                  Deluxe
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--token-gray-200)] dark:divide-[var(--token-gray-800)]">
              {COMPARISON_ROWS.map((row) => (
                <tr
                  key={row.feature}
                  className="bg-[var(--token-white)] dark:bg-[var(--color-surface-dark-subtle)]"
                >
                  <td className="px-6 py-4 text-sm font-medium text-[var(--token-gray-700)] dark:text-[var(--token-gray-300)]">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4">
                    <FeatureCell enabled={row.basic} />
                  </td>
                  <td className="px-6 py-4">
                    <FeatureCell enabled={row.premium} />
                  </td>
                  <td className="px-6 py-4">
                    <FeatureCell enabled={row.deluxe} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
