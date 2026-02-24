import { z } from 'zod';

export const contactFormSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Email is not valid'),
  message: z.string().trim().min(1, 'Message is required'),
});

export const subscribeFormSchema = z.object({
  email: z.string().trim().email('Email is not valid'),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type SubscribeFormValues = z.infer<typeof subscribeFormSchema>;
