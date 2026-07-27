import { cn } from '@/lib/utils'

export function DisclosureNote({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        'border-l-2 border-line pl-4 text-[0.8125rem] leading-relaxed text-muted',
        className,
      )}
    >
      {children}
    </p>
  )
}
