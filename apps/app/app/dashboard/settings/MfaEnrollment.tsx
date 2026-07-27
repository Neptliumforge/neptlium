"use client";

import { useEffect, useState } from "react";
import type { Factor } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@neptlium/lib";
import { Badge, Button, Field, FieldError, Input, Label } from "@neptlium/ui";
import { recordMfaEvent } from "./actions";

export function MfaEnrollment() {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [factors, setFactors] = useState<readonly Factor[] | null>(null);
  const [enrollingFactorId, setEnrollingFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadFactors() {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(data?.totp ?? []);
  }

  useEffect(() => {
    loadFactors();
  }, []);

  async function handleEnroll() {
    setError(null);
    setBusy(true);
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Authenticator app"
    });
    setBusy(false);

    if (enrollError || !data) {
      setError(enrollError?.message ?? "Unable to start enrollment.");
      return;
    }

    setEnrollingFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
  }

  async function handleVerify() {
    if (!enrollingFactorId) return;
    setError(null);
    setBusy(true);

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: enrollingFactorId
    });

    if (challengeError || !challenge) {
      setBusy(false);
      setError(challengeError?.message ?? "Unable to verify code.");
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enrollingFactorId,
      challengeId: challenge.id,
      code
    });

    setBusy(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    setEnrollingFactorId(null);
    setQrCode(null);
    setSecret(null);
    setCode("");
    await loadFactors();
    await recordMfaEvent("mfa_enrolled");
  }

  async function handleUnenroll(factorId: string) {
    setBusy(true);
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);

    if (!unenrollError) {
      await loadFactors();
      await recordMfaEvent("mfa_unenrolled");
    }
  }

  if (factors === null) return null;

  return (
    <div className="flex flex-col gap-4">
      {factors.map((factor) => (
        <div
          key={factor.id}
          className="flex items-center justify-between rounded-md border border-border-default p-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-body-sm font-medium text-text-primary">
              {factor.friendly_name ?? "Authenticator app"}
            </span>
            <Badge tone={factor.status === "verified" ? "success" : "neutral"}>{factor.status}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleUnenroll(factor.id)} loading={busy}>
            Remove
          </Button>
        </div>
      ))}

      {factors.length === 0 && !enrollingFactorId && (
        <p className="text-body-sm text-text-secondary">
          No authenticator app enrolled. Multi-factor authentication is not yet required, but strongly recommended.
        </p>
      )}

      {enrollingFactorId && qrCode ? (
        <div className="flex flex-col gap-4 rounded-md border border-border-default p-4">
          <p className="text-body-sm text-text-secondary">
            Scan this code with your authenticator app, then enter the 6-digit code it generates.
          </p>
          <img src={qrCode} alt="MFA enrollment QR code" className="size-40 self-center rounded-sm bg-white p-2" />
          {secret && <p className="break-all text-center text-caption text-text-muted">{secret}</p>}
          <Field>
            <Label htmlFor="mfa-code">Verification code</Label>
            <Input
              id="mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="123456"
            />
            <FieldError>{error}</FieldError>
          </Field>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setEnrollingFactorId(null);
                setQrCode(null);
                setSecret(null);
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button type="button" variant="accent" size="sm" className="flex-1" onClick={handleVerify} loading={busy}>
              Verify and enable
            </Button>
          </div>
        </div>
      ) : (
        !enrollingFactorId && (
          <div className="flex flex-col gap-2">
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={handleEnroll} loading={busy}>
              Enroll authenticator app
            </Button>
            {error && <FieldError>{error}</FieldError>}
          </div>
        )
      )}
    </div>
  );
}
