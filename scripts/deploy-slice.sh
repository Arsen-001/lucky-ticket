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
# The other half of the same hole: this deployment also bypasses CI entirely.
# Nothing here ever asked GitHub what it thought of the commit being shipped, so
# a green pipeline said nothing about production and a red one could not stop
# it. This script now asks — and refuses only on a KNOWN FAILURE.
#
# Deliberately not a hard gate on "CI has seen this commit": slicing an
# unpushed commit is a real, sanctioned flow here (when `main` is ahead with
# other people's commits, you cherry-pick or deploy locally rather than publish
# their work). Blocking that would only teach everyone to pass the override
# every time, which protects nothing. A commit whose CI actually FAILED is the
# one case that is never intentional, so that is the one case that stops.
#
# Usage:
#   npm run deploy:slice                    # deploy HEAD to production
#   npm run deploy:slice -- --preview       # same slice, but to a preview URL
#   npm run deploy:slice -- --dry           # build the slice, show what would go, stop
#   npm run deploy:slice -- <ref>           # deploy a specific commit instead of HEAD
#   npm run deploy:slice -- --no-ci-check   # ship anyway, CI verdict ignored
#
# `--preview` exists because this app is live: a change that players should not
# see yet still has to be looked at on the real backend, and the frontend is the
# only gate there is for a feature whose server half is already deployed. It
# takes the identical slice — same worktree at the same commit — so what you
# approve on the preview URL is byte-for-byte what production later gets.
#
# Anything uncommitted in your own tree is NOT deployed. That is the point: if
# your change is not committed, it is not ready to be on production.

set -euo pipefail

REF="HEAD"
DRY=0
CI_CHECK=1
PREVIEW=0
for arg in "$@"; do
  case "$arg" in
    --dry | --dry-run) DRY=1 ;;
    --no-ci-check) CI_CHECK=0 ;;
    --preview) PREVIEW=1 ;;
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

# What did CI make of this exact commit? Asked by full SHA, so a run on some
# neighbouring commit cannot be mistaken for a verdict on this one.
if [ "$CI_CHECK" = "1" ]; then
  FULL_SHA="$(git rev-parse "$REF")"
  if ! command -v gh >/dev/null 2>&1; then
    echo "CI:      не спрошен (нет gh) — вердикт неизвестен"
  else
    CI_JSON="$(gh run list --commit "$FULL_SHA" --workflow CI --limit 1 \
      --json status,conclusion,url 2>/dev/null || true)"
    CI_STATUS="$(printf '%s' "$CI_JSON" | sed -n 's/.*"status":"\([^"]*\)".*/\1/p')"
    CI_RESULT="$(printf '%s' "$CI_JSON" | sed -n 's/.*"conclusion":"\([^"]*\)".*/\1/p')"
    CI_URL="$(printf '%s' "$CI_JSON" | sed -n 's/.*"url":"\([^"]*\)".*/\1/p')"

    if [ -z "$CI_STATUS" ]; then
      # Almost always "not pushed yet" — legitimate, and the pre-commit hook has
      # already run type-check, tests and a build on it. Say so and continue.
      echo "CI:      прогона на этом коммите нет (не запушен?) — едет непроверенным"
    elif [ "$CI_STATUS" != "completed" ]; then
      echo "CI:      ещё идёт ($CI_STATUS) — вердикта нет, едет непроверенным"
      [ -n "$CI_URL" ] && echo "         $CI_URL"
    elif [ "$CI_RESULT" = "success" ]; then
      echo "CI:      зелёный на этом коммите"
    elif [ "$CI_RESULT" = "cancelled" ] || [ "$CI_RESULT" = "skipped" ]; then
      echo "CI:      $CI_RESULT — вердикта нет, едет непроверенным"
    else
      echo "CI НА ЭТОМ КОММИТЕ КРАСНЫЙ ($CI_RESULT) — деплой остановлен." >&2
      [ -n "$CI_URL" ] && echo "  $CI_URL" >&2
      echo "  Это единственный случай, который никогда не бывает намеренным." >&2
      echo "  Если всё же нужно: npm run deploy:slice -- --no-ci-check" >&2
      exit 1
    fi
  fi
fi

if [ "$DRY" = "1" ]; then
  echo "сухой прогон: деплой не запускался"
  exit 0
fi

cd "$WORKTREE"
if [ "$PREVIEW" = "1" ]; then
  echo "цель:    PREVIEW (продакшен не трогаем)"
  npx vercel --yes
else
  npx vercel --prod --yes
fi
