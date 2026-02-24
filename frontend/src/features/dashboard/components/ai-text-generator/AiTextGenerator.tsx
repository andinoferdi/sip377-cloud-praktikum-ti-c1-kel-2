'use client';

import { useChat } from '@ai-sdk/react';
import { createIdGenerator } from 'ai';
import copy from 'copy-text-to-clipboard';
import {
  aiTextGeneratorSchema,
  type AiTextGeneratorFormValues,
} from '@/features/dashboard/schemas/ai-text-generator.schema';
import { getErrorMessage } from '@/lib/errors';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

export default function AiTextGenerator() {
  const [isCopiedByMessageId, setIsCopiedByMessageId] = useState<Record<string, boolean>>({});
  const form = useForm<AiTextGeneratorFormValues>({
    resolver: zodResolver(aiTextGeneratorSchema),
    mode: 'onChange',
    defaultValues: {
      prompt: '',
    },
  });

  const { messages, status, sendMessage, error } = useChat({
    generateId: createIdGenerator({ prefix: 'msgd' }),
  });

  const onPromptSubmit = async (values: AiTextGeneratorFormValues) => {
    if (status === 'streaming' || status === 'submitted') {
      return;
    }

    const value = values.prompt.trim();
    if (!value) {
      return;
    }

    form.reset();
    await sendMessage({ text: value });
  };

  const copyMessage = (messageId: string, text: string) => {
    copy(text);
    setIsCopiedByMessageId((prev) => ({ ...prev, [messageId]: true }));

    window.setTimeout(() => {
      setIsCopiedByMessageId((prev) => ({ ...prev, [messageId]: false }));
    }, 2000);
  };

  return (
    <div className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]">
        Text Generator
      </h2>

      <div className="space-y-4 rounded-2xl border border-[var(--token-gray-200)] bg-[var(--token-white)] p-4 dark:border-[var(--color-border-dark-soft)] dark:bg-[var(--color-surface-dark-elevated)]">
        <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <p className="text-sm text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">
              Start a new AI conversation.
            </p>
          )}

          {messages.map((message) => {
            if (message.role !== 'user' && message.role !== 'assistant') return null;

            const textContent = extractMessageText(message);
            if (!textContent.trim()) return null;

            return (
              <div key={message.id} className="space-y-2">
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                    message.role === 'user'
                      ? 'ml-auto bg-brand-100 text-[var(--token-gray-800)] dark:bg-brand-500/20 dark:text-[var(--token-white-90)]'
                      : 'bg-[var(--token-gray-100)] text-[var(--token-gray-800)] dark:bg-[var(--token-white-5)] dark:text-[var(--token-white-90)]'
                  }`}
                >
                  {textContent}
                </div>
                {message.role === 'assistant' && (
                  <button
                    type="button"
                    onClick={() => copyMessage(message.id, textContent)}
                    className="text-xs text-[var(--token-gray-500)] hover:text-[var(--token-gray-700)] dark:text-[var(--token-gray-400)] dark:hover:text-[var(--token-white-90)]"
                  >
                    {isCopiedByMessageId[message.id] ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            );
          })}

          {(status === 'submitted' || status === 'streaming') && (
            <p className="text-sm text-[var(--token-gray-500)] dark:text-[var(--token-gray-400)]">Model is generating...</p>
          )}

          {error && (
            <p className="text-sm text-error-600 dark:text-error-400">{getErrorMessage(error)}</p>
          )}
        </div>

        <form onSubmit={form.handleSubmit(onPromptSubmit)}>
          <textarea
            placeholder="Type your prompt here..."
            className="h-24 w-full resize-none rounded-xl border border-[var(--token-gray-200)] bg-[var(--token-white)] p-3 text-sm text-[var(--token-gray-800)] outline-none focus:border-brand-300 dark:border-[var(--color-border-dark-strong)] dark:bg-[var(--color-surface-dark-subtle)] dark:text-[var(--token-white)]"
            disabled={status === 'submitted' || status === 'streaming'}
            {...form.register('prompt')}
          />
          {form.formState.errors.prompt?.message && (
            <p className="mt-2 text-sm text-error-600 dark:text-error-400">
              {form.formState.errors.prompt.message}
            </p>
          )}

          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={!form.formState.isValid || status === 'submitted' || status === 'streaming'}
              className="rounded-lg bg-[var(--token-gray-900)] px-4 py-2 text-sm font-medium text-[var(--token-white)] disabled:opacity-50 dark:bg-[var(--token-white-90)] dark:text-[var(--token-gray-800)]"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function extractMessageText(message: { content?: string; parts?: unknown[] }) {
  if (!message.parts || message.parts.length === 0) return message.content ?? '';

  const textParts = message.parts
    .map((part) => {
      if (
        typeof part === 'object' &&
        part &&
        'type' in part &&
        'text' in part &&
        (part as { type: string }).type === 'text'
      ) {
        return (part as { text: string }).text;
      }
      return '';
    })
    .join('');

  return textParts || message.content || '';
}
