-- Phase 1: production-security containment. Review and apply to staging first.
-- Idempotent, data-preserving, and reversible with docs/security/rollback-production-containment.sql.

BEGIN;

-- Record only rows changed by containment so a reviewed rollback can restore them.
CREATE TABLE IF NOT EXISTS public.security_containment_archive (
  table_name text NOT NULL,
  row_id uuid NOT NULL,
  previous_state jsonb NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now(),
  reason text NOT NULL,
  PRIMARY KEY (table_name, row_id)
);
ALTER TABLE public.security_containment_archive ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.security_containment_archive FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.security_containment_archive TO service_role;

-- Preserve original function definitions by renaming once, then install deny-by-default stubs.
DO $$
BEGIN
  IF to_regprocedure('public.admin_add_deposit_address(text,text,text,text,text,text)') IS NOT NULL
     AND to_regprocedure('public.contained_admin_add_deposit_address(text,text,text,text,text,text)') IS NULL THEN
    ALTER FUNCTION public.admin_add_deposit_address(text,text,text,text,text,text) RENAME TO contained_admin_add_deposit_address;
  END IF;
  IF to_regprocedure('public.confirm_crypto_deposit(uuid,text,text,numeric,text)') IS NOT NULL
     AND to_regprocedure('public.contained_confirm_crypto_deposit(uuid,text,text,numeric,text)') IS NULL THEN
    ALTER FUNCTION public.confirm_crypto_deposit(uuid,text,text,numeric,text) RENAME TO contained_confirm_crypto_deposit;
  END IF;
  IF to_regprocedure('public.confirm_payment_intent(uuid)') IS NOT NULL
     AND to_regprocedure('public.contained_confirm_payment_intent(uuid)') IS NULL THEN
    ALTER FUNCTION public.confirm_payment_intent(uuid) RENAME TO contained_confirm_payment_intent;
  END IF;
  IF to_regprocedure('public.credit_balance(uuid,text,text,numeric,text,uuid)') IS NOT NULL
     AND to_regprocedure('public.contained_credit_balance(uuid,text,text,numeric,text,uuid)') IS NULL THEN
    ALTER FUNCTION public.credit_balance(uuid,text,text,numeric,text,uuid) RENAME TO contained_credit_balance;
  END IF;
  IF to_regprocedure('public.create_withdrawal_request(text,text,numeric,text)') IS NOT NULL
     AND to_regprocedure('public.contained_create_withdrawal_request(text,text,numeric,text)') IS NULL THEN
    ALTER FUNCTION public.create_withdrawal_request(text,text,numeric,text) RENAME TO contained_create_withdrawal_request;
  END IF;
  IF to_regprocedure('public.provision_deposit_address(uuid,text,text)') IS NOT NULL
     AND to_regprocedure('public.contained_provision_deposit_address(uuid,text,text)') IS NULL THEN
    ALTER FUNCTION public.provision_deposit_address(uuid,text,text) RENAME TO contained_provision_deposit_address;
  END IF;
  IF to_regprocedure('public.request_wallet_withdrawal(uuid,text,text,numeric,text,text)') IS NOT NULL
     AND to_regprocedure('public.contained_request_wallet_withdrawal(uuid,text,text,numeric,text,text)') IS NULL THEN
    ALTER FUNCTION public.request_wallet_withdrawal(uuid,text,text,numeric,text,text) RENAME TO contained_request_wallet_withdrawal;
  END IF;
END $$;

-- Renamed implementations are retained for rollback but cannot be invoked by API roles.
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.contained_admin_add_deposit_address(text,text,text,text,text,text) FROM anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.contained_confirm_crypto_deposit(uuid,text,text,numeric,text) FROM anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.contained_confirm_payment_intent(uuid) FROM anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.contained_credit_balance(uuid,text,text,numeric,text,uuid) FROM anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.contained_create_withdrawal_request(text,text,numeric,text) FROM anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.contained_provision_deposit_address(uuid,text,text) FROM anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.contained_request_wallet_withdrawal(uuid,text,text,numeric,text,text) FROM anon, authenticated, service_role;
ALTER FUNCTION public.contained_admin_add_deposit_address(text,text,text,text,text,text) SECURITY INVOKER SET search_path = '';
ALTER FUNCTION public.contained_confirm_crypto_deposit(uuid,text,text,numeric,text) SECURITY INVOKER SET search_path = '';
ALTER FUNCTION public.contained_confirm_payment_intent(uuid) SECURITY INVOKER SET search_path = '';
ALTER FUNCTION public.contained_credit_balance(uuid,text,text,numeric,text,uuid) SECURITY INVOKER SET search_path = '';
ALTER FUNCTION public.contained_create_withdrawal_request(text,text,numeric,text) SECURITY INVOKER SET search_path = '';
ALTER FUNCTION public.contained_provision_deposit_address(uuid,text,text) SECURITY INVOKER SET search_path = '';
ALTER FUNCTION public.contained_request_wallet_withdrawal(uuid,text,text,numeric,text,text) SECURITY INVOKER SET search_path = '';

CREATE OR REPLACE FUNCTION public.admin_add_deposit_address(text,text,text,text,text,text) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$ BEGIN RAISE EXCEPTION 'Custody funding is unavailable' USING ERRCODE='0A000'; END $$;
CREATE OR REPLACE FUNCTION public.confirm_crypto_deposit(uuid,text,text,numeric,text) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$ BEGIN RAISE EXCEPTION 'Crypto deposit confirmation is unavailable' USING ERRCODE='0A000'; END $$;
CREATE OR REPLACE FUNCTION public.confirm_payment_intent(uuid) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$ BEGIN RAISE EXCEPTION 'Capital payment confirmation is unavailable' USING ERRCODE='0A000'; END $$;
CREATE OR REPLACE FUNCTION public.credit_balance(uuid,text,text,numeric,text,uuid) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$ BEGIN RAISE EXCEPTION 'Balance crediting is unavailable' USING ERRCODE='0A000'; END $$;
CREATE OR REPLACE FUNCTION public.create_withdrawal_request(text,text,numeric,text) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$ BEGIN RAISE EXCEPTION 'Withdrawals are unavailable' USING ERRCODE='0A000'; END $$;
CREATE OR REPLACE FUNCTION public.provision_deposit_address(uuid,text,text) RETURNS public.custody_addresses LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$ BEGIN RAISE EXCEPTION 'Custody funding is unavailable' USING ERRCODE='0A000'; END $$;
CREATE OR REPLACE FUNCTION public.request_wallet_withdrawal(uuid,text,text,numeric,text,text) RETURNS public.wallet_transactions LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$ BEGIN RAISE EXCEPTION 'Withdrawals are unavailable' USING ERRCODE='0A000'; END $$;

REVOKE ALL ON FUNCTION public.admin_add_deposit_address(text,text,text,text,text,text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.confirm_crypto_deposit(uuid,text,text,numeric,text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.confirm_payment_intent(uuid) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.credit_balance(uuid,text,text,numeric,text,uuid) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.create_withdrawal_request(text,text,numeric,text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.provision_deposit_address(uuid,text,text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.request_wallet_withdrawal(uuid,text,text,numeric,text,text) FROM PUBLIC, anon, authenticated, service_role;

-- Preserve required authentication/provisioning triggers while fixing their search path.
ALTER FUNCTION public.handle_new_user() SET search_path = pg_catalog, public;
ALTER FUNCTION public.handle_new_portfolio() SET search_path = pg_catalog, public;
ALTER FUNCTION public.is_admin(uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION public.prevent_rebalancing_update() SET search_path = pg_catalog, public;
ALTER FUNCTION public.set_updated_at() SET search_path = pg_catalog, public;
ALTER FUNCTION public.validate_strategy_allocation_total() SET search_path = pg_catalog, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_portfolio() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_rebalancing_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_strategy_allocation_total() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated, service_role;

-- Views must enforce invoker permissions and underlying RLS instead of view-owner access.
ALTER VIEW public.allocations SET (security_invoker = true, security_barrier = true);
ALTER VIEW public.signals SET (security_invoker = true, security_barrier = true);
REVOKE ALL ON public.allocations, public.signals FROM PUBLIC, anon;
REVOKE ALL ON public.allocations, public.signals FROM authenticated;
GRANT SELECT ON public.allocations, public.signals TO authenticated;

-- Disable direct and simulated allocation execution while preserving reads and history.
DROP POLICY IF EXISTS "capital_allocation_requests_insert_own" ON public.capital_allocation_requests;
DROP POLICY IF EXISTS "capital_allocation_requests_cancel_own" ON public.capital_allocation_requests;
REVOKE INSERT, UPDATE, DELETE ON public.capital_allocation_requests FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.strategy_allocations FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.rebalancing_events FROM anon, authenticated, service_role;

-- Disable placeholder provider/webhook writes until verified custody infrastructure exists.
DROP POLICY IF EXISTS "provider_events_service_role_insert" ON public.provider_events;
REVOKE INSERT, UPDATE, DELETE ON public.provider_events FROM anon, authenticated, service_role;
REVOKE INSERT, UPDATE, DELETE ON public.crypto_deposit_events FROM anon, authenticated, service_role;
REVOKE INSERT, UPDATE, DELETE ON public.payment_intents FROM anon, authenticated, service_role;

-- Snapshot and retire legacy internal/USD/WIRE destinations without deleting records.
INSERT INTO public.security_containment_archive(table_name,row_id,previous_state,reason)
SELECT 'custody_addresses', id, to_jsonb(c), 'legacy internal or fiat funding destination'
FROM public.custody_addresses c
WHERE status IN ('active','pending_activation')
  AND (lower(provider)='internal' OR upper(asset)='USD' OR lower(network) IN ('wire','ach','fiat') OR address LIKE 'NLM-%')
ON CONFLICT DO NOTHING;
UPDATE public.custody_addresses
SET status='retired'
WHERE status IN ('active','pending_activation')
  AND (lower(provider)='internal' OR upper(asset)='USD' OR lower(network) IN ('wire','ach','fiat') OR address LIKE 'NLM-%');

INSERT INTO public.security_containment_archive(table_name,row_id,previous_state,reason)
SELECT 'deposit_addresses', id, to_jsonb(d), 'legacy internal or fiat funding destination'
FROM public.deposit_addresses d
WHERE status IN ('active','available','assigned')
  AND (lower(provider)='internal' OR upper(asset)='USD' OR lower(network) IN ('wire','ach','fiat') OR address LIKE 'NLM-%')
ON CONFLICT DO NOTHING;
UPDATE public.deposit_addresses
SET status='archived'
WHERE status IN ('active','available','assigned')
  AND (lower(provider)='internal' OR upper(asset)='USD' OR lower(network) IN ('wire','ach','fiat') OR address LIKE 'NLM-%');

INSERT INTO public.security_containment_archive(table_name,row_id,previous_state,reason)
SELECT 'platform_deposit_addresses', id, to_jsonb(p), 'legacy fiat funding destination'
FROM public.platform_deposit_addresses p
WHERE active IS TRUE AND (upper(coalesce(token,''))='USD' OR lower(chain) IN ('wire','ach','fiat'))
ON CONFLICT DO NOTHING;
UPDATE public.platform_deposit_addresses
SET active=FALSE
WHERE active IS TRUE AND (upper(coalesce(token,''))='USD' OR lower(chain) IN ('wire','ach','fiat'));

COMMIT;
