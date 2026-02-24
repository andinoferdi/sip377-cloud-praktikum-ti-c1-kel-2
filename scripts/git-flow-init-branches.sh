#!/usr/bin/env bash
set -euo pipefail

base_branch="main"
integration_branches=("fe" "be" "test")

echo "== Git Flow Init Branches =="

if ! git rev-parse --verify "${base_branch}" >/dev/null 2>&1; then
  echo "Error: base branch '${base_branch}' belum memiliki commit."
  echo "Buat commit awal di '${base_branch}' terlebih dahulu."
  exit 1
fi

for br in "${integration_branches[@]}"; do
  if git show-ref --verify --quiet "refs/heads/${br}"; then
    echo "Skip: branch '${br}' sudah ada."
  else
    git branch "${br}" "${base_branch}"
    echo "Created: branch '${br}' dari '${base_branch}'."
  fi
done

echo
echo "Tidak ada push otomatis. Jalankan manual jika diperlukan:"
echo "  git push -u origin ${base_branch}"
for br in "${integration_branches[@]}"; do
  echo "  git push -u origin ${br}"
done
