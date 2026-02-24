'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

export type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

export interface SelectProps {
  id?: string;
  options: Option[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  isMulti?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  maxMenuHeight?: number;
  className?: string;
  menuClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'elevated';
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      id,
      value,
      defaultValue = '',
      onChange,
      placeholder = 'Select an option',
      isMulti = false,
      isSearchable = true,
      isClearable = true,
      isDisabled = false,
      maxMenuHeight = 300,
      className = '',
      menuClassName = '',
      size = 'md',
      variant = 'default',
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedValues, setSelectedValues] = useState<string | string[]>(value || defaultValue);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Sync external value changes
    useEffect(() => {
      if (value !== undefined) {
        setSelectedValues(value);
      }
    }, [value]);

    // Focus search input when menu opens
    useEffect(() => {
      if (isOpen && isSearchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
    }, [isOpen, isSearchable]);

    // Filter options based on search query
    const filteredOptions = options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !option.disabled,
    );

    const isSelected = (optionValue: string): boolean => {
      if (isMulti) {
        return Array.isArray(selectedValues) && selectedValues.includes(optionValue);
      }
      return selectedValues === optionValue;
    };

    const handleSelect = (optionValue: string) => {
      let newValue: string | string[];

      if (isMulti) {
        const current = Array.isArray(selectedValues) ? selectedValues : [];
        newValue = current.includes(optionValue)
          ? current.filter((v) => v !== optionValue)
          : [...current, optionValue];
      } else {
        newValue = optionValue;
        setIsOpen(false);
      }

      setSelectedValues(newValue);
      onChange(newValue);
      setSearchQuery('');
      setHighlightedIndex(0);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      const newValue = isMulti ? [] : '';
      setSelectedValues(newValue);
      onChange(newValue);
    };

    const handleRemoveTag = (tagValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (Array.isArray(selectedValues)) {
        const newValue = selectedValues.filter((v) => v !== tagValue);
        setSelectedValues(newValue);
        onChange(newValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex].value);
          }
          break;
        case 'Tab':
          setIsOpen(false);
          break;
      }
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    const variantClasses = {
      default:
        'surface-elevated border border-strong',
      minimal:
        'border-b-2 border-[var(--token-gray-300)] bg-transparent dark:border-[var(--color-border-dark-strong)]',
      elevated:
        'surface-elevated border border-soft shadow-md',
    };

    const selectedOptions = isMulti
      ? options.filter((opt) => Array.isArray(selectedValues) && selectedValues.includes(opt.value))
      : options.filter((opt) => opt.value === selectedValues);

    const displayLabel = isMulti
      ? `${Array.isArray(selectedValues) ? selectedValues.length : 0} selected`
      : selectedOptions[0]?.label || placeholder;

    const setContainerNode = (node: HTMLDivElement | null) => {
      containerRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
        return;
      }

      if (ref) {
        ref.current = node;
      }
    };

    return (
      <div
        ref={setContainerNode}
        className={`relative w-full ${className}`}
        onKeyDown={handleKeyDown}
      >
        {/* Trigger Button */}
        <button
          type="button"
          id={id}
          ref={triggerRef}
          onClick={() => !isDisabled && setIsOpen(!isOpen)}
          disabled={isDisabled}
          className={`
            group flex w-full items-center justify-between rounded-xl border
            transition-all duration-200 ease-out
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:-translate-y-[1px] hover:border-brand-400 hover:shadow-theme-sm dark:hover:border-brand-400'}
            ${isOpen ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-theme-sm dark:border-brand-400' : ''}
            focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:focus:border-brand-400
          `}
        >
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            {isMulti && Array.isArray(selectedValues) && selectedValues.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedValues.map((val) => {
                  const opt = options.find((o) => o.value === val);
                  return (
                    <span
                      key={val}
                      className="inline-flex items-center gap-1 rounded-md bg-brand-500/10 px-2 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-200"
                    >
                      {opt?.label}
                      {isClearable && (
                        <button
                          type="button"
                          onClick={(e) => handleRemoveTag(val, e)}
                          className="hover:text-brand-900 dark:hover:text-white"
                          aria-label={`Remove ${opt?.label}`}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            ) : (
              <span
                className={
                  Array.isArray(selectedValues)
                    ? selectedValues.length === 0
                      ? 'text-[var(--token-gray-400)]'
                      : 'text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]'
                    : selectedValues
                      ? 'text-[var(--token-gray-800)] dark:text-[var(--token-white-90)]'
                      : 'text-[var(--token-gray-400)]'
                }
              >
                {displayLabel}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isClearable &&
              ((isMulti && Array.isArray(selectedValues) && selectedValues.length > 0) ||
                (!isMulti && selectedValues)) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[var(--token-gray-400)] hover:text-[var(--token-gray-600)] dark:hover:text-[var(--token-gray-300)]"
                  aria-label="Clear selection"
                >
                  <X size={16} />
                </button>
              )}
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              } text-[var(--token-gray-500)] group-hover:text-brand-500`}
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            className={`
              absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl
              surface-elevated border border-soft shadow-[0_20px_45px_-24px_rgba(15,23,42,0.45)] backdrop-blur-md
              data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
              ${menuClassName}
            `}
            data-state="open"
          >
            {/* Search Input */}
            {isSearchable && (
              <div className="border-b border-soft p-2">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--token-gray-400)]"
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setHighlightedIndex(0);
                    }}
                    className="surface-elevated w-full rounded-lg border border-strong py-2 pl-8 pr-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: `${maxMenuHeight}px` }}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[var(--token-gray-500)]">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-4 py-2.5 text-left text-sm transition-colors duration-150
                      ${
                        index === highlightedIndex
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200'
                          : 'text-[var(--token-gray-700)] hover:bg-[var(--token-gray-50)] dark:text-[var(--token-gray-200)] dark:hover:bg-[var(--color-surface-dark-subtle)]'
                      }
                      ${isSelected(option.value) ? 'bg-brand-500/10 font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-200' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {isMulti && (
                        <div
                          className={`h-4 w-4 rounded border transition-all ${
                            isSelected(option.value)
                              ? 'border-brand-500 bg-brand-500'
                              : 'border-[var(--token-gray-300)] bg-white dark:border-[var(--color-border-dark-strong)] dark:bg-[var(--color-surface-dark-subtle)]'
                          }`}
                        >
                          {isSelected(option.value) && (
                            <svg
                              className="h-3 w-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      )}
                      <span>{option.label}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
