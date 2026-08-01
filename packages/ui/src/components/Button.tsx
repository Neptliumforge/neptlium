'use client';

import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, type HTMLMotionProps, motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from './utils/cn';
import { MOTION_DURATION, MOTION_EASE } from '../theme/motion';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-body font-medium transition duration-[120ms] ease-out focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-accent-primary text-accent-primary-foreground hover:bg-accent-primary-hover active:bg-accent-primary-pressed shadow-sm',
        accent:
          'bg-accent-primary text-accent-primary-foreground hover:bg-accent-primary-hover active:bg-accent-primary-pressed shadow-sm',
        cta: '[background:var(--gradient-cta-primary)] text-white shadow-sm hover:brightness-110 active:brightness-95',
        secondary:
          'bg-surface-3 text-text-primary border border-border-default hover:border-border-hover',
        ghost: 'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary',
        outline: 'bg-transparent text-text-primary border border-border-default hover:bg-surface-2',
        soft: 'bg-accent-primary/12 text-accent-primary hover:bg-accent-primary/20',
        destructive: 'bg-danger text-danger-foreground hover:brightness-110 shadow-sm',
        success: 'bg-success text-success-foreground hover:brightness-110 shadow-sm',
        warning: 'bg-warning text-warning-foreground hover:brightness-110 shadow-sm',
      },
      size: {
        sm: 'h-9 px-3 text-body-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-5 text-body-lg',
        icon: 'size-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
>;

export interface ButtonProps extends NativeButtonProps, VariantProps<typeof buttonVariants> {
  readonly loading?: boolean;
  readonly href?: string;
  readonly children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, loading, disabled, href, children, ...props },
  ref,
) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <motion.button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...(props as HTMLMotionProps<'button'>)}
    >
      <AnimatePresence initial={false}>
        {loading && (
          <motion.span
            key="spinner"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.out }}
            className="inline-flex overflow-hidden"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </motion.button>
  );
});
