#!/bin/sh
# Vercel treats zero as skip and one as build.
if [ "$VERCEL_ENV" = preview ]; then
  previous=$VERCEL_GIT_PREVIOUS_SHA
  if [ -z "$previous" ] || [ "$previous" = "$VERCEL_GIT_COMMIT_SHA" ]; then
    exit 1
  fi
  git diff --quiet "$previous" HEAD -- . ../../package.json ../../pnpm-lock.yaml ../../pnpm-workspace.yaml ../../turbo.json || exit 1
else
  git diff --quiet HEAD^ HEAD -- . ../../package.json ../../pnpm-lock.yaml ../../pnpm-workspace.yaml ../../turbo.json
fi
