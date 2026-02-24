#!/usr/bin/env bash
set -euo pipefail

echo "== Git Flow Check =="

current_branch="$(git branch --show-current 2>/dev/null || true)"
if [[ -z "${current_branch}" ]]; then
  current_branch="(unborn/no-commit)"
fi
echo "Active branch: ${current_branch}"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree: DIRTY"
else
  echo "Working tree: CLEAN"
fi

echo
echo "Local branches:"
git branch || true

echo
echo "Local + remote branches:"
git branch -a || true

echo
echo "Remote origin:"
git remote -v | awk '$1 == "origin" {print}'
