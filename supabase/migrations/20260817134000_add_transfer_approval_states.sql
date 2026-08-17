-- Forward-only enum expansion for the governed transfer approval lifecycle.
-- REVIEW ONLY. Do not apply remotely without an explicit production migration gate.
-- AUTHORIZED remains in the enum for compatibility with already-persisted historical rows.

alter type public.transfer_execution_state
  add value if not exists 'pending_approval' after 'reserved';
