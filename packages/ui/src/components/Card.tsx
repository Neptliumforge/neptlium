import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils/cn';

const cardVariants = cva('rounded-md border border-border-default', {
  variants: {
    elevation: {
      flat: 'bg-surface-1 shadow-none',
      raised: 'bg-surface-1 shadow-none',
      floating: 'bg-surface-2 shadow-md',
    },
  },
  defaultVariants: {
    elevation: 'raised',
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, elevation, ...props }: CardProps) {
  return <div className={cn(cardVariants({ elevation }), className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 px-5 pb-3 pt-5', className)} {...props} />;
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { readonly children?: ReactNode }) {
  return (
    <h3 className={cn('nt-component-title text-text-primary', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('nt-body-14 text-text-secondary', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pb-5 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center gap-3 px-5 pb-5 pt-3', className)} {...props} />;
}
