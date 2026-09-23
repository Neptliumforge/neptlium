import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TableHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from './utils/cn';

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mx-auto w-full max-w-[var(--container-content)] px-[var(--page-gutter)]', className)} {...props} />;
}
export function Stack({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-[var(--space-4)]', className)} {...props} />;
}
export function Cluster({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-wrap items-center gap-[var(--space-3)]', className)} {...props} />;
}
export function Grid({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('grid gap-[var(--space-5)]', className)} {...props} />;
}
export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn('py-[var(--space-8)] sm:py-[var(--space-10)]', className)} {...props} />;
}
export function Divider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn('border-0 border-t border-border-default', className)} {...props} />;
}
export function Surface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border border-border-default bg-surface-1', className)} {...props} />;
}
export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border border-border-default bg-surface-1 p-[var(--space-5)] shadow-sm', className)} {...props} />;
}
export function TextLink({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cn('text-text-secondary underline-offset-4 hover:text-text-primary hover:underline focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)]', className)} {...props} />;
}
export function IconButton({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { readonly children?: ReactNode }) {
  return <button type="button" className={cn('inline-flex size-10 items-center justify-center rounded-sm border border-border-default bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)] disabled:opacity-50', className)} {...props}>{children}</button>;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('min-h-28 w-full rounded-sm border border-border-default bg-surface-inset px-3 py-2 text-body text-text-primary outline-none placeholder:text-text-muted focus:border-border-focus focus:shadow-[var(--shadow-focus-ring)] disabled:opacity-50', className)} {...props} />;
}
export function Switch({ checked, className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <label className={cn('inline-flex min-h-11 cursor-pointer items-center gap-3 text-body-sm text-text-secondary', className)}><input type="checkbox" role="switch" checked={checked} className="peer sr-only" {...props} /><span aria-hidden="true" className="relative h-6 w-11 rounded-full border border-border-default bg-surface-3 transition peer-checked:border-brand peer-checked:bg-brand after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-text-primary after:transition-transform peer-checked:after:translate-x-5" /></label>;
}

export function Dialog({ open, title, description, children, className }: { readonly open: boolean; readonly title: string; readonly description?: string; readonly children?: ReactNode; readonly className?: string }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[var(--z-dialog)] grid place-items-center bg-[var(--color-surface-overlay)] p-4" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="n-dialog-title" aria-describedby={description ? 'n-dialog-description' : undefined} className={cn('w-full max-w-lg border border-border-strong bg-dialog p-6 shadow-lg', className)}><h2 id="n-dialog-title" className="text-h3 font-medium text-text-primary">{title}</h2>{description && <p id="n-dialog-description" className="mt-2 text-body-sm text-text-secondary">{description}</p>}<div className="mt-5">{children}</div></section></div>;
}
export function Sheet({ open, title, children, className }: { readonly open: boolean; readonly title: string; readonly children?: ReactNode; readonly className?: string }) {
  if (!open) return null;
  return <aside role="dialog" aria-modal="true" aria-labelledby="n-sheet-title" className={cn('fixed inset-y-0 right-0 z-[var(--z-dialog)] w-full max-w-md border-l border-border-strong bg-dialog p-6 shadow-lg', className)}><h2 id="n-sheet-title" className="text-h3 font-medium text-text-primary">{title}</h2><div className="mt-5">{children}</div></aside>;
}
export function Popover({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="dialog" className={cn('border border-border-default bg-popover p-3 text-popover-foreground shadow-md', className)} {...props} />;
}
export function Dropdown({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('min-h-10 rounded-sm border border-border-default bg-surface-1 px-3 text-body text-text-primary focus:border-border-focus focus:outline-none focus:shadow-[var(--shadow-focus-ring)]', className)} {...props} />;
}
export function Tooltip({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return <span title={label} aria-label={label}>{children}</span>;
}

export function Tabs({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="tablist" className={cn('flex gap-1 border-b border-border-default', className)} {...props} />;
}
export function Tab({ active, className, ...props }: HTMLAttributes<HTMLButtonElement> & { readonly active?: boolean }) {
  return <button role="tab" aria-selected={active} className={cn('min-h-11 border-b px-3 text-body-sm focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus-ring)]', active ? 'border-brand text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary', className)} {...props} />;
}
export function Breadcrumb({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <nav aria-label="Breadcrumb" className={cn('text-body-sm text-text-muted', className)} {...props} />;
}
export function Pagination({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <nav aria-label="Pagination" className={cn('flex min-h-11 items-center gap-2 text-body-sm', className)} {...props} />;
}

export function Alert({ tone='info', title, children, className }: { readonly tone?: 'info'|'success'|'warning'|'danger'; readonly title: string; readonly children?: ReactNode; readonly className?: string }) {
  const tones={info:'border-info',success:'border-success',warning:'border-warning',danger:'border-danger'};
  return <section role={tone==='danger'?'alert':'status'} className={cn('border-l-2 bg-surface-1 p-4', tones[tone], className)}><strong className="text-body-sm text-text-primary">{title}</strong>{children && <div className="mt-1 text-body-sm text-text-secondary">{children}</div>}</section>;
}
export const Notice = Alert;

export function Avatar({ initials, className }: { readonly initials: string; readonly className?: string }) {
  return <span aria-label={initials} className={cn('inline-grid size-9 place-items-center rounded-full border border-border-default bg-surface-2 text-label font-medium text-text-secondary', className)}>{initials}</span>;
}

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <div className="w-full overflow-x-auto"><table className={cn('w-full min-w-[40rem] border-collapse text-left text-body-sm tabular-nums', className)} {...props} /></div>;
}
export function DataTable({ caption, headers, rows }: { readonly caption: string; readonly headers: readonly string[]; readonly rows: readonly (readonly ReactNode[])[] }) {
  return <Table><caption className="sr-only">{caption}</caption><thead><tr>{headers.map(h=><th key={h} scope="col" className="border-b border-border-strong px-3 py-3 text-label font-medium text-text-muted">{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i} className="border-b border-border-default">{row.map((cell,j)=><td key={j} className="px-3 py-3 text-text-secondary">{cell}</td>)}</tr>)}</tbody></Table>;
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn('animate-pulse bg-surface-3', className)} {...props} />;
}
export function LoadingState({ label='Loading' }: { readonly label?: string }) {
  return <div role="status" className="space-y-3 py-6"><span className="sr-only">{label}</span><Skeleton className="h-4 w-1/3" /><Skeleton className="h-20 w-full" /></div>;
}
export function ErrorState({ title='Unable to load', description }: { readonly title?: string; readonly description: string }) {
  return <Alert tone="danger" title={title}>{description}</Alert>;
}

export function Percentage({ value, className }: { readonly value?: number|null; readonly className?: string }) {
  return <span className={cn('tabular-nums',className)}>{value==null?'Unavailable':new Intl.NumberFormat('en-US',{style:'percent',maximumFractionDigits:2}).format(value)}</span>;
}
export function Delta({ value, className }: { readonly value?: number|null; readonly className?: string }) {
  const label=value==null?'Unavailable':`${value>0?'+':''}${value.toLocaleString('en-US',{maximumFractionDigits:2})}`;
  return <span className={cn('tabular-nums', value==null?'text-text-muted':value>0?'text-success':value<0?'text-danger':'text-text-secondary',className)}><span className="sr-only">{value==null?'Value unavailable':value>0?'Positive change: ':value<0?'Negative change: ':'No change: '}</span>{label}</span>;
}
