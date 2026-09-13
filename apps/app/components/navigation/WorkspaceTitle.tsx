'use client';

import { usePathname } from 'next/navigation';

const titles: readonly [string, string][] = [
  ['/dashboard/capital', 'Capital'],
  ['/dashboard/capital-account', 'Capital'],
  ['/dashboard/treasury', 'Treasury'],
  ['/dashboard/companies', 'Companies'],
  ['/dashboard/company-intelligence', 'Companies'],
  ['/dashboard/portfolio', 'Portfolio'],
  ['/dashboard/allocation', 'Allocation'],
  ['/dashboard/allocations', 'Allocation'],
  ['/dashboard/activity', 'Activity'],
  ['/dashboard/transactions', 'Activity'],
  ['/dashboard/documents', 'Documents'],
  ['/dashboard/notifications', 'Notifications'],
  ['/dashboard/settings', 'Settings'],
  ['/dashboard', 'Overview'],
];

export function WorkspaceTitle() {
  const pathname = usePathname();
  const title = titles.find(([path]) => pathname === path || (path !== '/dashboard' && pathname.startsWith(`${path}/`)))?.[1] ?? 'Neptlium';
  return (
    <div className="workspace-context">
      <span>{title}</span>
      <em>Governed capital state</em>
    </div>
  );
}
