'use client';

import { AutoGrowingTextArea } from '@/components/ui/inputs/textarea';
import { PencilIcon } from '@/icons/icons';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

type PropsType = {
  message: string;
  showActions?: boolean;
  onEdit: (
    newMessage: string,
    options?: { isSubmitting: boolean }
  ) => Promise<void>;
};

export default function UserMessage({
  message,
  showActions,
  onEdit,
}: PropsType) {
  const [showEditInput, setShowEditInput] = useState(false);
  const [value, setValue] = useState(message);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleCancel() {
    setShowEditInput(false);
    setValue(message);
  }

  async function handleEdit() {
    setIsSubmitting(true);

    try {
      await onEdit(value, { isSubmitting });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
      setShowEditInput(false);
    }
  }

  return (
    <div>
      <div
        className={cn(
          'shadow-theme-xs bg-primary-100 dark:bg-[var(--token-white-10)] rounded-3xl rounded-tr-lg py-4 px-5 max-w-md ml-auto w-fit',
          showEditInput && 'max-w-none w-full'
        )}
      >
        {!showEditInput ? (
          message
        ) : (
          <AutoGrowingTextArea
            onChange={(value) => setValue(value)}
            value={value}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleCancel();
              }
            }}
            autoFocus
          />
        )}
      </div>

      {showActions && !showEditInput && (
        <div className="mt-2 ml-auto max-w-fit">
          <button
            title="Edit message"
            onClick={() => setShowEditInput(true)}
            className="flex gap-1 items-center text-[var(--token-gray-400)] hover:text-[var(--token-gray-800)] dark:hover:text-[var(--token-white-90)] dark:text-[var(--token-gray-400)] dark:border-[var(--token-white-5)] bg-[var(--token-white)] dark:bg-[var(--color-surface-dark-elevated)] h-8 rounded-full px-3 py-1.5 border font-medium border-[var(--token-gray-100)] text-xs"
          >
            <PencilIcon className="size-4.5" />

            <span className="sr-only">Edit message</span>
          </button>
        </div>
      )}

      {showEditInput && (
        <div className="flex justify-end gap-2 mt-3">
          <button
            className="hover:opacity-90 dark:text-[var(--token-gray-400)] dark:border-[var(--color-gray-700)] bg-[var(--token-white)] dark:bg-[var(--color-gray-800)] rounded-full px-4.5 py-2 border font-medium text-[var(--color-gray-700)] border-[var(--color-gray-300)] text-sm disabled:pointer-events-none disabled:opacity-80 shadow-xs"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            onClick={handleEdit}
            className="bg-primary-500 rounded-full px-4.5 py-2 font-medium text-[var(--token-white)] hover:opacity-90 text-sm disabled:pointer-events-none disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}
