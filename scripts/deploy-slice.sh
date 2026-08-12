#!/usr/bin/env bash
#
# Deploy exactly what is committed — nothing else.
#
# This project's Vercel deployment has no Git integration: `vercel --prod`
# uploads the WORKING DIRECTORY. In a repository where several sessions edit at
# once, that means someone else's half-finished work ships with yours the moment
# you deploy, and neither of you finds out until production behaves oddly. It
# has already happened twice (BoostRow / HomeUpcomingTournaments /
# TelegramStarIcon, 03.08.2026).
#
# So: build the upload from a detached worktree at HEAD, which by construction
# contains only committed code, and delete it afterwards. The project link
# (`.vercel/`) is gitignored, so it is copied over rather than re-created.
#
# Usage:
#   npm run deploy:slice            # deploy HEAD to production
#   npm run deploy:slice -- --dry   # build the slice, show what would go, stop
#   npm run deploy:slice -- <ref>   # deploy a specific commit instead of HEAD
#
# Anything uncommitted in your own tree is NOT deployed. That is the point: if
# your change is not committed, it is not ready to be on production.

set -euo pipefail

REF="HEAD"
DRY=0
for arg in "$@"; do
  case "$arg" in
    --dry | --dry-run) DRY=1 ;;
    *) REF="$arg" ;;
  esac
done

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

if [ ! -f .vercel/project.json ]; then
  echo "нет .vercel/project.json — проект не привязан; сперва 'vercel link'" >&2
  exit 1
fi

SHA="$(git rev-parse --short "$REF")"
SUBJECT="$(git log -1 --format=%s "$REF")"
WORKTREE="$(mktemp -d)/slice-$SHA"

cleanup() {
  git worktree remove --force "$WORKTREE" >/dev/null 2>&1 || true
  git worktree prune >/dev/null 2>&1 || true
}
trap cleanup EXIT

git worktree add --detach "$WORKTREE" "$REF" >/dev/null
cp -R .vercel "$WORKTREE/.vercel"

echo "срез:    $SHA  $SUBJECT"
echo "дерево:  $WORKTREE"

# What the working tree is holding back — printed so nobody mistakes "deployed"
# for "everything I have is live". Untracked files are listed too: they are
# exactly what a plain `vercel --prod` WOULD have uploaded from here.
DIRTY="$(git status --porcelain || true)"
if [ -n "$DIRTY" ]; then
  echo "не поедет (незакоммичено в рабочем дереве):"
  echo "$DIRTY" | sed 's/^/  /'
fi

if [ "$DRY" = "1" ]; then
  echo "сухой прогон: деплой не запускался"
  exit 0
fi

cd "$WORKTREE"
npx vercel --prod --yes
