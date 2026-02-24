import {
  BarChart3,
  CheckCircle2,
  ImageIcon,
  Laptop,
  LayoutDashboard,
  Search,
  Settings,
  ShoppingBag,
  Smartphone,
  Store,
  Tablet,
  WifiOff,
} from 'lucide-react';
import Link from 'next/link';
import PosFaq from './pos-faq';
import PosPricing from './pos-pricing';

type ProductItem = {
  name: string;
  price: string;
};

type OrderItem = {
  name: string;
  price: string;
  quantity: number;
};

const PRODUCT_ITEMS: ProductItem[] = [
  {
    name: 'Almond Brown Sugar Croissant',
    price: '$12.98 / 3 pcs',
  },
  {
    name: 'Smoke Tenderloin Slice Croissant',
    price: '$10.01 / 2 pcs',
  },
  {
    name: 'Sweet Granulated Sugar Croissant',
    price: '$8.55 / 1 pcs',
  },
];

const ORDER_ITEMS: OrderItem[] = [
  {
    name: 'Smoke Tenderloin Slice',
    price: '$10.01',
    quantity: 1,
  },
  {
    name: 'Sweet Chocolate Choco',
    price: '$22.02',
    quantity: 1,
  },
];

const STATS = [
  {
    value: '+20K',
    label: 'Trusted Retails',
  },
  {
    value: '+50K',
    label: 'Customers',
  },
  {
    value: '+400K',
    label: 'Reviews',
  },
] as const;

const CATEGORY_ITEMS = ['Signature', 'Croissant', 'Ice Cream'] as const;

const DEVICE_ITEMS = [
  { label: 'Mobile', icon: Smartphone },
  { label: 'Tablet', icon: Tablet },
  { label: 'Desktop', icon: Laptop },
] as const;

const FEATURE_ITEMS = [
  'Centralized inventory management',
  'Real-time sales tracking',
  'Multi-platform integration',
] as const;

export default function PosLanding() {
  return (
    <>
      <section className="overflow-hidden bg-[var(--token-gray-50)] dark:bg-[var(--color-marketing-dark-canvas)] pt-26 pb-18 md:pt-30 md:pb-22">
        <div className="wrapper">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl md:text-title-sm lg:text-title-lg font-bold tracking-tight text-[var(--token-gray-900)] dark:text-[var(--token-white-90)]">
              The best way to{' '}
              <span className="bg-gradient-to-r from-primary-500 to-[var(--color-accent-purple-300)] bg-clip-text text-transparent">
                grow your business
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
              With Winkel can help you to be able to grow your business quickly
              and precisely with premium features tailored for modern retail.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-11 min-w-[150px] items-center justify-center rounded-full bg-primary-500 px-6 text-sm font-semibold text-[var(--token-white)] transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                Get Started
              </Link>
              <Link
                href="#pricing"
                className="inline-flex h-11 min-w-[150px] items-center justify-center rounded-full border border-[var(--token-gray-300)] bg-[var(--token-gray-100)] px-6 text-sm font-semibold text-[var(--token-gray-700)] transition-colors hover:bg-[var(--token-gray-200)] dark:border-[var(--color-border-dark-strong)] dark:bg-[var(--token-white-5)] dark:text-[var(--token-gray-300)] dark:hover:bg-[var(--token-white-10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                Watch Demo
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-14 max-w-6xl">
            <div className="absolute inset-x-8 bottom-0 h-20 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />
            <div className="relative overflow-hidden rounded-3xl border border-[var(--token-gray-200)] bg-[var(--token-white)] shadow-theme-lg dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-subtle)]">
              <div className="flex items-center border-b border-[var(--token-gray-200)] bg-[var(--token-gray-50)] px-5 py-3 dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)]">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-[var(--token-red-500)]" />
                  <span className="size-3 rounded-full bg-[var(--token-orange-400)]" />
                  <span className="size-3 rounded-full bg-[var(--token-green-600)]" />
                </div>
                <p className="mx-auto text-xs font-medium text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
                  dashboard.winkel.com
                </p>
              </div>

              <div className="flex min-h-[520px] flex-col lg:flex-row">
                <aside className="hidden w-20 shrink-0 flex-col items-center gap-6 border-r border-[var(--token-gray-200)] bg-[var(--token-gray-50)] py-6 dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)] md:flex">
                  <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary-500/12 text-primary-500">
                    <Store size={20} aria-hidden />
                  </span>
                  <div className="flex flex-col items-center gap-4 text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
                    <LayoutDashboard size={18} aria-hidden />
                    <ShoppingBag size={18} aria-hidden />
                    <BarChart3 size={18} aria-hidden />
                    <Settings size={18} aria-hidden />
                  </div>
                </aside>

                <div className="flex-1 p-5 md:p-7">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
                        Welcome, Gorry
                      </h2>
                      <p className="text-sm text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
                        Discover whatever you need easily.
                      </p>
                    </div>

                    <div className="relative w-full md:max-w-[280px]">
                      <Search
                        size={16}
                        aria-hidden
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--token-gray-400)]"
                      />
                      <input
                        type="search"
                        placeholder="Search product..."
                        readOnly
                        aria-label="Search product"
                        className="h-11 w-full rounded-xl border border-[var(--token-gray-200)] bg-[var(--token-gray-50)] pl-9 pr-3 text-sm text-[var(--token-gray-700)] dark:border-[var(--color-border-dark-strong)] dark:bg-[var(--token-white-5)] dark:text-[var(--token-gray-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 overflow-x-auto pb-1">
                    {CATEGORY_ITEMS.map((category, index) => (
                      <span
                        key={category}
                        className={
                          index === 0
                            ? 'inline-flex h-10 shrink-0 items-center rounded-xl bg-primary-500 px-4 text-sm font-medium text-[var(--token-white)]'
                            : 'inline-flex h-10 shrink-0 items-center rounded-xl border border-[var(--token-gray-200)] bg-[var(--token-gray-100)] px-4 text-sm font-medium text-[var(--token-gray-600)] dark:border-[var(--color-border-dark-strong)] dark:bg-[var(--token-white-5)] dark:text-[var(--token-gray-300)]'
                        }
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {PRODUCT_ITEMS.map((product) => (
                      <article
                        key={product.name}
                        className="rounded-2xl border border-[var(--token-gray-200)] bg-[var(--token-gray-50)] p-4 dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)]"
                      >
                        <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-[var(--token-gray-200)] text-[var(--token-gray-400)] dark:bg-[var(--color-surface-dark-subtle)]">
                          <ImageIcon size={34} aria-hidden />
                        </div>
                        <h3 className="text-sm font-semibold text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-xs text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
                          {product.price}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>

                <aside className="border-t border-[var(--token-gray-200)] bg-[var(--token-gray-50)] p-5 dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)] lg:w-[285px] lg:border-t-0 lg:border-l lg:p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
                      Current Order
                    </h3>
                    <Settings
                      size={16}
                      aria-hidden
                      className="text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]"
                    />
                  </div>

                  <div className="mt-5 space-y-3">
                    {ORDER_ITEMS.map((item) => (
                      <div
                        key={item.name}
                        className="rounded-xl border border-[var(--token-gray-200)] bg-[var(--token-white)] p-3 dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-subtle)]"
                      >
                        <div className="flex gap-3">
                          <span className="mt-0.5 size-10 rounded-lg bg-[var(--token-gray-200)] dark:bg-[var(--token-gray-700)]" />
                          <div className="w-full space-y-2">
                            <p className="text-xs font-medium text-[var(--token-gray-700)] dark:text-[var(--token-gray-300)]">
                              {item.name}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
                                {item.price}
                              </span>
                              <div className="inline-flex items-center gap-2 text-xs">
                                <span className="inline-flex size-6 items-center justify-center rounded-md bg-[var(--token-gray-200)] dark:bg-[var(--token-gray-700)] text-[var(--token-gray-600)] dark:text-[var(--token-gray-300)]">
                                  -
                                </span>
                                <span className="text-[var(--token-gray-700)] dark:text-[var(--token-gray-300)]">
                                  {item.quantity}
                                </span>
                                <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary-500 text-[var(--token-white)]">
                                  +
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 border-t border-[var(--token-gray-200)] pt-4 dark:border-[var(--color-border-dark-soft)]">
                    <div className="space-y-2 text-xs text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
                      <div className="flex items-center justify-between">
                        <span>Subtotal</span>
                        <span>$37.61</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Discount</span>
                        <span>-$5.00</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-dashed border-[var(--token-gray-200)] pt-3 text-sm font-semibold text-[var(--token-gray-800)] dark:border-[var(--color-border-dark-strong)] dark:text-[var(--token-white-90)]">
                      <span>Total</span>
                      <span>$34.86</span>
                    </div>

                    <span className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary-500 text-sm font-semibold text-[var(--token-white)]">
                      Continue to Payment
                    </span>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--token-gray-200)] bg-[var(--color-marketing-light-canvas)] py-10 dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-marketing-dark-canvas)]">
        <div className="wrapper">
          <div className="grid grid-cols-1 divide-y divide-[var(--token-gray-200)] text-center dark:divide-[var(--token-gray-800)] md:grid-cols-3 md:divide-y-0 md:divide-x">
            {STATS.map((stat) => (
              <div key={stat.label} className="px-4 py-5">
                <p className="text-4xl font-bold text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-28 bg-[var(--token-gray-50)] dark:bg-[var(--color-marketing-dark-canvas)] py-18 md:py-24"
      >
        <div className="wrapper">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="rounded-3xl border border-[var(--token-gray-200)] bg-[var(--token-white)] p-8 shadow-theme-sm dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)]">
              <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-[var(--token-gray-300)] bg-[var(--token-gray-50)] dark:border-[var(--color-border-dark-strong)] dark:bg-[var(--color-surface-dark-elevated)]">
                <LayoutDashboard
                  size={74}
                  aria-hidden
                  className="text-[var(--token-gray-300)] dark:text-[var(--token-gray-700)]"
                />
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-title-sm font-bold text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
                One place for everything you need
              </h2>
              <p className="mt-5 text-base leading-7 text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
                Winkel provides a variety of your business needs, from menu
                management with various platforms, easily and quickly accessible
                from a single dashboard.
              </p>

              <ul className="mt-7 space-y-3">
                {FEATURE_ITEMS.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm md:text-base text-[var(--token-gray-600)] dark:text-[var(--token-gray-300)]"
                  >
                    <CheckCircle2
                      size={18}
                      aria-hidden
                      className="text-primary-500 shrink-0"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-marketing-light-canvas)] dark:bg-[var(--color-marketing-dark-canvas)] py-18 md:py-24">
        <div className="wrapper">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-3xl md:text-title-sm font-bold text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
                You can settings anywhere and anytime
              </h2>
              <p className="mt-5 text-base leading-7 text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
                Winkel is very easy to use, because Winkel can be accessed
                anywhere, anytime on various devices in one account.
                Cloud-based technology ensures your data is always safe and
                accessible.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {DEVICE_ITEMS.map((device) => (
                  <div
                    key={device.label}
                    className="w-24 rounded-xl border border-[var(--token-gray-200)] bg-[var(--token-gray-50)] p-3 text-center dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)]"
                  >
                    <device.icon
                      size={22}
                      aria-hidden
                      className="mx-auto text-primary-500"
                    />
                    <p className="mt-2 text-xs font-semibold text-[var(--token-gray-700)] dark:text-[var(--token-gray-300)]">
                      {device.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--token-gray-200)] bg-[var(--token-gray-50)] p-8 shadow-theme-sm dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)]">
              <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-[var(--token-gray-300)] bg-[var(--token-white)] dark:border-[var(--color-border-dark-strong)] dark:bg-[var(--color-surface-dark-subtle)]">
                <Settings
                  size={74}
                  aria-hidden
                  className="text-[var(--token-gray-300)] dark:text-[var(--token-gray-700)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--token-gray-50)] dark:bg-[var(--color-marketing-dark-canvas)] py-18 md:py-24">
        <div className="wrapper">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--token-gray-200)] bg-[var(--token-white)] px-6 py-12 text-center shadow-theme-lg dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)] md:px-12 md:py-14">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-24 bg-primary-500/8 blur-2xl" />
            <h2 className="relative text-3xl md:text-title-sm font-bold text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
              Offline access anywhere, anytime and automatic synchronization
            </h2>
            <p className="relative mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
              Winkel can be used both offline and online. You can sync your
              menu based on dashboard updates when connected again.
            </p>

            <Link
              href="/#help"
              className="relative mt-8 inline-flex h-11 items-center justify-center rounded-full border border-[var(--token-gray-300)] bg-[var(--token-gray-100)] px-6 text-sm font-semibold text-[var(--token-gray-700)] transition-colors hover:bg-[var(--token-gray-200)] dark:border-[var(--color-border-dark-strong)] dark:bg-[var(--token-white-5)] dark:text-[var(--token-gray-300)] dark:hover:bg-[var(--token-white-10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              Learn More
            </Link>

            <div className="relative mx-auto mt-10 max-w-2xl rounded-t-[2rem] border-[8px] border-[var(--token-gray-700)] bg-[var(--token-gray-900)] p-3">
              <div className="aspect-video rounded-2xl bg-[var(--token-white)] dark:bg-[var(--color-surface-dark-subtle)] flex items-center justify-center">
                <div className="text-center">
                  <WifiOff
                    size={40}
                    aria-hidden
                    className="mx-auto text-primary-500"
                  />
                  <p className="mt-3 text-lg font-semibold text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
                    Offline Mode Active
                  </p>
                  <p className="mt-1 text-sm text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
                    Changes are saved locally.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PosPricing />
      <PosFaq />
    </>
  );
}
