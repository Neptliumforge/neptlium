-- MANUAL ROLLBACK ONLY. Apply after incident-owner approval and only in a transaction.
-- This restores the pre-containment behavior, including capabilities considered unsafe.
BEGIN;

DROP FUNCTION IF EXISTS public.admin_add_deposit_address(text,text,text,text,text,text);
DROP FUNCTION IF EXISTS public.confirm_crypto_deposit(uuid,text,text,numeric,text);
DROP FUNCTION IF EXISTS public.confirm_payment_intent(uuid);
DROP FUNCTION IF EXISTS public.credit_balance(uuid,text,text,numeric,text,uuid);
DROP FUNCTION IF EXISTS public.create_withdrawal_request(text,text,numeric,text);
DROP FUNCTION IF EXISTS public.provision_deposit_address(uuid,text,text);
DROP FUNCTION IF EXISTS public.request_wallet_withdrawal(uuid,text,text,numeric,text,text);

ALTER FUNCTION public.contained_admin_add_deposit_address(text,text,text,text,text,text) RENAME TO admin_add_deposit_address;
ALTER FUNCTION public.contained_confirm_crypto_deposit(uuid,text,text,numeric,text) RENAME TO confirm_crypto_deposit;
ALTER FUNCTION public.contained_confirm_payment_intent(uuid) RENAME TO confirm_payment_intent;
ALTER FUNCTION public.contained_credit_balance(uuid,text,text,numeric,text,uuid) RENAME TO credit_balance;
ALTER FUNCTION public.contained_create_withdrawal_request(text,text,numeric,text) RENAME TO create_withdrawal_request;
ALTER FUNCTION public.contained_provision_deposit_address(uuid,text,text) RENAME TO provision_deposit_address;
ALTER FUNCTION public.contained_request_wallet_withdrawal(uuid,text,text,numeric,text,text) RENAME TO request_wallet_withdrawal;

ALTER FUNCTION public.admin_add_deposit_address(text,text,text,text,text,text) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION public.confirm_crypto_deposit(uuid,text,text,numeric,text) SECURITY DEFINER RESET search_path;
ALTER FUNCTION public.confirm_payment_intent(uuid) SECURITY DEFINER RESET search_path;
ALTER FUNCTION public.credit_balance(uuid,text,text,numeric,text,uuid) SECURITY DEFINER RESET search_path;
ALTER FUNCTION public.create_withdrawal_request(text,text,numeric,text) SECURITY DEFINER RESET search_path;
ALTER FUNCTION public.provision_deposit_address(uuid,text,text) SECURITY DEFINER SET search_path = '';
ALTER FUNCTION public.request_wallet_withdrawal(uuid,text,text,numeric,text,text) SECURITY DEFINER SET search_path = '';

GRANT EXECUTE ON FUNCTION public.admin_add_deposit_address(text,text,text,text,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_crypto_deposit(uuid,text,text,numeric,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_payment_intent(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.credit_balance(uuid,text,text,numeric,text,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_withdrawal_request(text,text,numeric,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.provision_deposit_address(uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_wallet_withdrawal(uuid,text,text,numeric,text,text) TO authenticated;

ALTER VIEW public.allocations RESET (security_invoker, security_barrier);
ALTER VIEW public.signals RESET (security_invoker, security_barrier);
GRANT SELECT ON public.allocations, public.signals TO anon, authenticated;

CREATE POLICY "capital_allocation_requests_insert_own" ON public.capital_allocation_requests FOR INSERT
  WITH CHECK (auth.uid()=profile_id AND status='pending_review');
CREATE POLICY "capital_allocation_requests_cancel_own" ON public.capital_allocation_requests FOR UPDATE
  USING (auth.uid()=profile_id AND status='pending_review') WITH CHECK (status='cancelled');
GRANT INSERT, UPDATE ON public.capital_allocation_requests TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.strategy_allocations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.rebalancing_events TO service_role;
CREATE POLICY "provider_events_service_role_insert" ON public.provider_events FOR INSERT
  WITH CHECK (auth.role()='service_role');
GRANT INSERT, UPDATE, DELETE ON public.provider_events, public.crypto_deposit_events, public.payment_intents TO service_role;

UPDATE public.custody_addresses c SET status=a.previous_state->>'status'
FROM public.security_containment_archive a WHERE a.table_name='custody_addresses' AND a.row_id=c.id;
UPDATE public.deposit_addresses d SET status=a.previous_state->>'status'
FROM public.security_containment_archive a WHERE a.table_name='deposit_addresses' AND a.row_id=d.id;
UPDATE public.platform_deposit_addresses p SET active=(a.previous_state->>'active')::boolean
FROM public.security_containment_archive a WHERE a.table_name='platform_deposit_addresses' AND a.row_id=p.id;

COMMIT;
