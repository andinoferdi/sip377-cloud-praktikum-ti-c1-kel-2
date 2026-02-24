import type { UIMessage } from 'ai';

export type HistoryGroup = 'Today' | 'Yesterday';

export type HistorySession = {
  id: string;
  title: string;
  group: HistoryGroup;
  messages: UIMessage[];};

const createMessage = (
  id: string,
  role: 'user' | 'assistant',
  content: string
): UIMessage => ({
  id,
  role,
  parts: [{ type: 'text', text: content }],
});

export const aiHistorySessions: HistorySession[] = [
  {
    id: 'today-follow-up-email',
    title: 'Write a follow-up email to a client',
    group: 'Today',
    messages: [
      createMessage('msg-1', 'user', 'Write a follow-up email to a client after demo call.'),
      createMessage('msg-2', 'assistant', 'Subject: Thank you for your time\n\nHi [Client Name],\n\nThank you for joining the demo earlier. I wanted to quickly follow up and share the key points we covered...'),
    ],
  },
  {
    id: 'yesterday-login-layout',
    title: 'Generate responsive login form layout',
    group: 'Yesterday',
    messages: [
      createMessage('msg-3', 'user', 'Create responsive login form layout with Tailwind.'),
      createMessage('msg-4', 'assistant', 'Use a centered max-width card, full-width fields on mobile, and proper focus states for accessibility.'),
    ],
  },
];