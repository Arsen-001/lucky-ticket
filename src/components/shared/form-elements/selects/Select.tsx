'use client';

import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';

export interface SelectOption {
  label?: ReactNode;
  value: string;
}

export interface SelectProps extends Omit<
  ComponentProps<'select'>,
  'value' | 'onChange'
> {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  classNames?: {
    list?: string;
    option?: string;
  };
}

export function Select({
  options = [],
  onChange,
  placeholder = '',
  className = '',
  classNames,
  ...rest
}: SelectProps) {
  const [value, setValue] = useState(rest?.value);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle option selection
  const handleSelect = (optionValue: string) => {
    setValue(optionValue);
    setIsOpen(false);
    setFocusedIndex(null);
    onChange?.(optionValue);
    buttonRef.current?.focus();
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(prev => !prev);
      setFocusedIndex(0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setFocusedIndex(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setFocusedIndex(options.length - 1);
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev =>
        prev === null || prev >= options.length - 1 ? 0 : prev + 1
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev =>
        prev === null || prev <= 0 ? options.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(options[index].value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setFocusedIndex(null);
      buttonRef.current?.focus();
    }
  };

  useEffect(() => {
    if (focusedIndex !== null && isOpen) {
      const optionEl =
        selectRef.current?.querySelectorAll<HTMLLIElement>('li')[focusedIndex];
      optionEl?.focus();
    }
  }, [focusedIndex, isOpen]);

  return (
    <div
      className={twMerge('relative inline-block text-left', className)}
      ref={selectRef}
    >
      {/* Select button */}
      <Button
        ref={buttonRef}
        variant="purpleGradient"
        className={twMerge(
          'inline-flex justify-between items-center w-full rounded-full border-none px-3 py-1.5 text-xs font-medium text-white-secondary',
          className
        )}
        onClick={() => {
          setIsOpen(prev => !prev);
          setFocusedIndex(0);
        }}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={placeholder}
        disabled={rest.disabled}
      >
        <span className="truncate">
          {selectedOption
            ? selectedOption.label || selectedOption.value
            : placeholder}
        </span>
        <ChevronDown
          className={`-mr-1 ml-2 h-4.5 w-4.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          aria-hidden="true"
        />
      </Button>

      {/* Options list */}
      {isOpen && (
        <div
          tabIndex={-1}
          className={twMerge(
            'absolute z-10 mt-1 w-fit rounded-2xl bg-purple-gradient shadow-lg max-h-60 overflow-auto scrollbar-hidden',
            classNames?.list
          )}
        >
          <ul role="listbox" className="p-1" tabIndex={-1}>
            {options.map((option, index) => (
              <li
                key={option.value}
                tabIndex={0}
                role="option"
                aria-selected={option.value === value}
                className={twMerge(
                  'inline-flex justify-between items-center w-full rounded-full border-none px-3 py-1.5 text-sm font-medium text-white-secondary focus-outline',
                  option.value === value
                    ? 'bg-pink-gradient text-white-secondary'
                    : 'hover:bg-gray-100/5',
                  classNames?.option
                )}
                onClick={() => handleSelect(option.value)}
                onKeyDown={e => handleOptionKeyDown(e, index)}
              >
                <span
                  className={twMerge(
                    'block truncate',
                    option.value === value ? 'font-semibold' : 'font-normal'
                  )}
                >
                  {option.label || option.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
