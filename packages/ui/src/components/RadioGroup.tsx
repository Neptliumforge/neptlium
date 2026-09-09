'use client';

import { type ComponentPropsWithoutRef, type ElementRef, type ReactNode, forwardRef } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from './utils/cn';

export const RadioGroup = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Root>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(function RadioGroup({ className, ...props }, ref) {
  return <RadioGroupPrimitive.Root ref={ref} className={cn('grid gap-3', className)} {...props} />;
});

export const RadioGroupItem = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(function RadioGroupItem({ className, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-full border border-border-default bg-surface-2 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)] data-[state=checked]:border-accent-emerald',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-accent-emerald" />
    </RadioGroupPrimitive.Item>
  );
});

export interface OptionCardProps {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly selected: boolean;
  readonly icon?: ReactNode;
  readonly className?: string;
}

export function OptionCard({
  value,
  label,
  description,
  selected,
  icon,
  className,
}: OptionCardProps) {
  return (
    <RadioGroupPrimitive.Item
      value={value}
      className={cn(
        'flex w-full items-start gap-3 rounded-md border border-[color:var(--color-border-whisper)] bg-surface-1 p-4 text-left transition-colors duration-150 ease-out hover:border-border-hover focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)] data-[state=checked]:border-accent-emerald data-[state=checked]:bg-accent-emerald/6',
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            'mt-0.5 shrink-0 text-text-muted transition-colors duration-150 ease-out',
            selected && 'text-accent-emerald',
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <span className="flex flex-col gap-1">
        <span className="text-body font-medium text-text-primary">{label}</span>
        {description && <span className="text-body-sm text-text-secondary">{description}</span>}
      </span>
    </RadioGroupPrimitive.Item>
  );
}
