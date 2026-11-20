"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export function AdminMobileNavigation({ children }: { readonly children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = panel.current;
    const focusables = () => Array.from(root?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])') ?? []);
    focusables()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); return; }
      if (event.key !== "Tab") return;
      const stops = focusables();
      if (!stops.length) { event.preventDefault(); root?.focus(); return; }
      const first = stops[0]; const last = stops[stops.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = previous; trigger.current?.focus(); };
  }, [open]);

  return <>
    <button ref={trigger} type="button" aria-label="Open admin navigation" aria-expanded={open} aria-controls="admin-mobile-drawer" onClick={() => setOpen(true)} className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring lg:hidden"><Menu aria-hidden="true" size={20} /></button>
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`} inert={!open} aria-hidden={open ? undefined : "true"}>
      <button type="button" tabIndex={open ? 0 : -1} aria-label="Close admin navigation" onClick={() => setOpen(false)} className={`absolute inset-0 bg-surface-overlay transition-opacity motion-reduce:transition-none ${open ? "opacity-100" : "opacity-0"}`} />
      <div ref={panel} id="admin-mobile-drawer" role="dialog" aria-modal="true" aria-label="Admin navigation" tabIndex={-1} className={`relative flex h-[100dvh] w-[min(88vw,22rem)] flex-col border-r border-border-hairline bg-sidebar transition-transform motion-reduce:transition-none ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex min-h-14 items-center justify-between border-b border-border-hairline px-4"><span className="text-body-sm font-semibold text-text-primary">Neptlium Admin</span><button type="button" onClick={() => setOpen(false)} aria-label="Close admin navigation" className="flex size-10 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"><X size={20} aria-hidden="true" /></button></div>
        <nav aria-label="Admin workspace navigation" className="flex-1 overflow-y-auto p-3" onClick={(event) => { if ((event.target as HTMLElement).closest("a")) setOpen(false); }}>{children}</nav>
      </div>
    </div>
  </>;
}
