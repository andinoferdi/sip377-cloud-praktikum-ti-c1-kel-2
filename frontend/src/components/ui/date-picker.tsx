import { useEffect } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Label } from './label';
import { CalenderIcon } from '@/icons';
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
}: PropsType) {
  useEffect(() => {
    const flatPickr = flatpickr(`#${id}`, {
      mode: mode || "single",
      static: false,
      monthSelectorType: "static",
      enableTime: true,
      enableSeconds: true,
      time_24hr: true,
      dateFormat: "Y-m-d H:i:S",
      defaultDate,
      onChange,
    });

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          className="surface-elevated h-11 w-full appearance-none rounded-lg border border-soft px-4 py-2.5 text-sm text-(--token-gray-800) shadow-theme-xs placeholder:text-(--token-gray-400) focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:text-(--token-white-90) dark:placeholder:text-(--token-white-30) dark:focus:border-brand-800"
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--token-gray-500) dark:text-(--token-gray-400)">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
