"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronDown, LogOut, X } from "lucide-react";
import { signOutAction } from "@/components/security/actions";

type Theme = "light" | "dark" | "system";
interface ProfileMenuProps {
  readonly name: string;
  readonly email: string;
  readonly membership: string | null;
  readonly verified: boolean;
}
const destinations = [
  ["Profile", "profile"],
  ["Account Settings", "account"],
  ["Verification Status", "verification"],
  ["Password & Security", "security"],
  ["Appearance", "appearance"],
  ["Membership", "membership"],
] as const;

function applyTheme(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function ProfileMenu({
  name,
  email,
  membership,
  verified,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");
  const [pending, startTransition] = useTransition();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const initials =
    (name || email)
      .split(/\s+|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "N";
  useEffect(() => {
    const saved = localStorage.getItem("neptlium-theme") as Theme | null;
    const next =
      saved && ["light", "dark", "system"].includes(saved) ? saved : "system";
    setTheme(next);
    applyTheme(next);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    if (innerWidth < 640) document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab" || !panel.current) return;
      const stops = [
        ...panel.current.querySelectorAll<HTMLElement>(
          "a[href],button:not([disabled]),input:not([disabled])",
        ),
      ];
      const first = stops[0],
        last = stops.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      trigger.current?.focus();
    };
  }, [open]);
  const chooseTheme = (next: Theme) => {
    setTheme(next);
    localStorage.setItem("neptlium-theme", next);
    applyTheme(next);
  };
  return (
    <div className="relative">
      <button
        ref={trigger}
        type="button"
        aria-label="Open investor profile"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex min-h-11 items-center gap-2 rounded-md px-1.5 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <span className="flex size-9 items-center justify-center rounded-full border border-border-default bg-surface-2 text-xs font-semibold">
          {initials}
        </span>
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block max-w-36 truncate text-sm text-text-primary">
            {name}
          </span>
          <span className="block text-[11px] text-text-muted">
            {membership ?? "Membership unavailable"}
          </span>
        </span>
        <ChevronDown className="size-4 text-text-muted" aria-hidden="true" />
      </button>
      {open && (
        <button
          type="button"
          aria-label="Close profile menu"
          className="fixed inset-0 z-40 bg-surface-overlay/70 sm:bg-transparent"
          onClick={() => setOpen(false)}
        />
      )}
      {open && (
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Investor profile"
          className="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-xl border border-border-default bg-surface-1 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg sm:absolute sm:inset-auto sm:right-0 sm:top-[calc(100%+8px)] sm:w-80 sm:rounded-lg sm:p-3"
        >
          <button
            type="button"
            aria-label="Close profile menu"
            onClick={() => setOpen(false)}
            className="absolute right-3 top-3 flex size-11 items-center justify-center sm:hidden"
          >
            <X className="size-5" />
          </button>
          <div className="border-b border-border-hairline px-2 pb-3 pr-12 sm:pr-2">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-text-muted">{email}</p>
            {verified && (
              <p className="mt-1 text-xs text-success">Verified account</p>
            )}
            <p className="mt-1 text-xs text-text-muted">
              {membership ?? "Membership data unavailable"}
            </p>
          </div>
          <nav aria-label="Account settings" className="py-2">
            {destinations.map(([label, hash]) => (
              <Link
                key={hash}
                href={`/dashboard/settings#${hash}`}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-md px-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                {label}
              </Link>
            ))}
          </nav>
          <fieldset
            id="appearance"
            className="border-y border-border-hairline px-2 py-3"
          >
            <legend className="text-xs font-medium text-text-muted">
              Appearance
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-1">
              {(["light", "dark", "system"] as Theme[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={theme === option}
                  onClick={() => chooseTheme(option)}
                  className={`min-h-11 rounded-md border text-xs capitalize ${theme === option ? "border-accent-primary text-accent-primary" : "border-border-default text-text-secondary"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => signOutAction())}
            className="flex min-h-11 w-full items-center gap-3 px-2 pt-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-60"
          >
            <LogOut className="size-4" />
            {pending ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      )}
    </div>
  );
}
