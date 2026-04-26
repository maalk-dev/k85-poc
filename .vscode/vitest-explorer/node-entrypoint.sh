#!/bin/sh

# Wrapper so the Vitest VSCode extension uses the pnpm-managed Node.js binary
# (configured via `useNodeVersion` in pnpm-workspace.yaml) rather than whatever
# `node` happens to be on $PATH. The pnpm binary itself is always on $PATH
# regardless of which Node.js version manager the developer uses (nvm, fnm, n, ...)
# See `.vscode/settings.json` for how this is configured.

cd "$(dirname "$0")/../.." || exit 1
exec pnpm node "$@"
