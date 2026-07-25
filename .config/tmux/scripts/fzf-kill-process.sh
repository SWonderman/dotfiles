#!/usr/bin/env bash

# Fuzzy find and kill a process (multi-select with Tab)
command -v fzf >/dev/null 2>&1 || { echo 'fzf not installed'; sleep 2; exit 1; }

# -m multi-select: keep Tab as the toggle (overriding the wrapper's tab:down),
# use j/k purely to move.
pid=$(ps -f -u "$UID" | sed 1d | fzf --no-tmux --no-preview -m \
  --bind 'j:down,k:up,tab:toggle+down,shift-tab:toggle+up' \
  --header 'Tab: mark · j/k: move · Enter: kill marked' | awk '{print $2}')

if [[ -n "$pid" ]]; then
  echo "$pid" | xargs kill -9
  echo "Killed process(es): $pid"
  read -r -p "Press Enter to close..."
fi
