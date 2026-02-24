'use client';

import {
  subscribeFormSchema,
  type SubscribeFormValues,
} from '@/features/marketing/schemas/contact-form.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function FooterSubscribeForm() {
  const form = useForm<SubscribeFormValues>({
    resolver: zodResolver(subscribeFormSchema),
    defaultValues: {
      email: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (_values: SubscribeFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    toast.success('Subscribed successfully');
    form.reset();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col items-center gap-2 w-full sm:max-w-64">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full h-12 p-4 text-sm text-[var(--token-gray-700)] dark:text-[var(--token-gray-300)] bg-[var(--token-gray-50)] dark:bg-[var(--token-white-5)] border border-[var(--token-gray-300)] dark:border-[var(--color-border-dark-strong)] rounded-full placeholder:text-center placeholder:text-[var(--token-gray-400)] placeholder:text-sm text-center placeholder:font-normal focus:outline-0"
          disabled={isSubmitting}
          {...form.register('email')}
        />
        {form.formState.errors.email?.message && (
          <p className="w-full text-center text-sm text-[var(--token-red-400)]">{form.formState.errors.email.message}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 text-sm font-medium text-[var(--token-white)] transition rounded-full cursor-pointer bg-primary-500 hover:bg-primary-600 disabled:opacity-75"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
        </button>
      </div>
    </form>
  );
}
