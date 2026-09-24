# Deployment

Neptlium applications deploy independently. Repository convergence does not justify manual production deployment by itself.

## Policy

Deploy when runtime code, deployment configuration, a consumed shared runtime package, or established deployment policy requires it. Documentation-only changes must not trigger manual production deployment for ceremony.

Every production deployment should be traceable to a Git commit SHA. Verify the affected application after deployment and distinguish deployment readiness from financial/provider capability readiness.

See `VERCEL.md` for the verified project map.
