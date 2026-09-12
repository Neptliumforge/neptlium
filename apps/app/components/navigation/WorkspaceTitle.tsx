'use client';

import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

const titles: readonly [string,string][] = [
  ['/dashboard/capital-account','Capital Account'],
  ['/dashboard/treasury','Treasury'],
  ['/dashboard/company-intelligence','Companies'],
  ['/dashboard/portfolio','Portfolio'],
  ['/dashboard/allocations','Allocation'],
  ['/dashboard/transactions','Activity'],
  ['/dashboard/documents','Documents'],
  ['/dashboard/notifications','Notifications'],
  ['/dashboard/settings','Settings'],
  ['/dashboard','Overview'],
];

export function WorkspaceTitle() {
  const pathname = usePathname();
  const title = titles.find(([path]) => pathname === path || (path !== '/dashboard' && pathname.startsWith(path + '/')))?.[1] ?? 'Neptlium';
  return <div className="workspace-title"><span>{title}</span><button type="button" className="workspace-search" aria-label="Search Neptlium"><Search size={15}/><span>Search</span><kbd>⌘K</kbd></button></div>;
}
