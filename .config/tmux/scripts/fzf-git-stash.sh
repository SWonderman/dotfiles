#!/usr/bin/env bash

# Browse git stashes with diff preview
# Enter to apply, Ctrl-D to drop
command -v fzf >/dev/null 2>&1 || { echo 'fzf not installed'; sleep 2; exit 1; }

git stash list | \
  fzf --no-tmux --bind 'j:down,k:up' --header 'Enter: apply, Ctrl-D: drop' \
      --preview 'git stash show -p --color=always $(echo {} | cut -d: -f1)' \
      --preview-window=right,60% \
      --bind 'ctrl-d:become(git stash drop $(echo {} | cut -d: -f1))' \
      --exit-0 | \
  cut -d: -f1 | xargs -r git stash apply
