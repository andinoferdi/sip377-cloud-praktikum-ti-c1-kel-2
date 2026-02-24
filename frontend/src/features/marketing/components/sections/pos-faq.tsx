'use client';

import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 1,
    question: 'What is Winkel POS?',
    answer:
      'Winkel is a point of sale application that helps you manage menu, sales, and store operations from one dashboard.',
  },
  {
    id: 2,
    question: 'What devices does Winkel support?',
    answer:
      'Winkel supports desktop, tablet, and mobile devices. Your team can access the same account across all supported devices.',
  },
  {
    id: 3,
    question: 'How can I start using Winkel?',
    answer:
      'Create your account, set up your products, and start taking orders. You can begin with the free trial to explore all core features.',
  },
];

export default function PosFaq() {
  const [activeItemId, setActiveItemId] = useState<number>(FAQ_ITEMS[0].id);

  return (
    <section
      id="help"
      className="scroll-mt-28 py-18 md:py-24 bg-[var(--token-gray-50)] dark:bg-[var(--color-marketing-dark-canvas)]"
    >
      <div className="wrapper">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-3xl md:text-title-sm font-bold text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
              We have some answers to your questions.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {FAQ_ITEMS.map((item) => {
              const isActive = activeItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[var(--token-gray-200)] dark:border-[var(--color-border-dark-soft)] bg-[var(--token-white)] dark:bg-[var(--color-surface-dark-subtle)] px-5"
                >
                  <button
                    type="button"
                    aria-expanded={isActive}
                    aria-controls={`faq-item-${item.id}`}
                    onClick={() =>
                      setActiveItemId((prevId) =>
                        prevId === item.id ? prevId : item.id
                      )
                    }
                    className="flex h-14 w-full items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <span className="text-base font-medium text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
                      {item.question}
                    </span>
                    <span className="inline-flex items-center justify-center rounded-full text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
                      {isActive ? (
                        <Minus size={18} aria-hidden />
                      ) : (
                        <Plus size={18} aria-hidden />
                      )}
                    </span>
                  </button>

                  {isActive ? (
                    <div id={`faq-item-${item.id}`} className="pb-5">
                      <p className="text-sm leading-6 text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
                        {item.answer}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
