-- Security hardening: pin the allocation history trigger function search_path.
-- Forward-only. Does not alter financial or allocation history.

alter function public.prevent_allocation_history_mutation()
  set search_path = public, pg_temp;
