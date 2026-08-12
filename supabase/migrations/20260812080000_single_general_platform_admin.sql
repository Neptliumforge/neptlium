-- Enforce a single General Platform Administrator without collapsing the wider role model.
-- This migration intentionally does not assign or revoke any role.

DO $$
BEGIN
  IF (SELECT count(*) FROM public.user_roles WHERE role = 'super_admin') > 1 THEN
    RAISE EXCEPTION 'Cannot enforce single super_admin: production already contains multiple super_admin rows';
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS user_roles_single_super_admin_idx
  ON public.user_roles ((1))
  WHERE role = 'super_admin';
