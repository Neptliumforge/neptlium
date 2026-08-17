-- Forward-only continuation of the governed transfer approval enum expansion.
-- REVIEW ONLY. Do not apply remotely without an explicit production migration gate.
-- Kept separate so the preceding pending_approval enum value commits first.

alter type public.transfer_execution_state
  add value if not exists 'approved' after 'pending_approval';
