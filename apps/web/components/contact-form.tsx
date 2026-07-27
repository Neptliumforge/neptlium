'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { SITE } from '@/lib/content/site'

/**
 * Visual-only contact form.
 * There is no backend in this marketing project, so the form intentionally
 * does NOT submit or imply a success state. Attempting to submit surfaces a
 * clear notice and points the user to the support email.
 */
export function ContactForm() {
  const [notice, setNotice] = useState(false)

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        setNotice(true)
      }}
      className="border border-line bg-surface p-6 md:p-8"
      aria-describedby="contact-form-status"
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="name" className="text-sm font-medium text-ink">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="h-11 rounded-lg border border-line bg-surface px-3 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-focus"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="h-11 rounded-lg border border-line bg-surface px-3 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-focus"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="message" className="text-sm font-medium text-ink">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-focus"
          />
        </div>
      </div>

      <button type="submit" className="button mt-6 w-full sm:w-auto">
        Send message
      </button>

      <div
        id="contact-form-status"
        role="status"
        aria-live="polite"
        className="mt-4 min-h-[1.25rem]"
      >
        {notice && (
          <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-surface-subtle p-3 text-sm text-text">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-warning"
              aria-hidden="true"
            />
            <span>
              This form is not yet connected to a backend, so your message was not
              sent. Please email us directly at{' '}
              <a
                href={`mailto:${SITE.supportEmail}`}
                className="font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
              >
                {SITE.supportEmail}
              </a>
              .
            </span>
          </div>
        )}
      </div>
    </form>
  )
}
