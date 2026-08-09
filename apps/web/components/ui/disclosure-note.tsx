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
        'caption-text border-l-2 border-line pl-4 leading-relaxed text-muted',
        className,
      )}
    >
      {children}
    </p>
  )
}
