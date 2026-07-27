const links = [
  { label: "Privacy", href: "https://neptlium.com/privacy" },
  { label: "Terms", href: "https://neptlium.com/terms" },
  { label: "Security", href: "https://neptlium.com/security" },
  { label: "System Status", href: "https://neptlium.com/status" },
] as const;

export function TrustFooter() {
  return (
    <nav aria-label="Legal and security links">
      <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] tracking-wide text-text-disabled">
        {links.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-sm"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
