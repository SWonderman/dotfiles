#!/usr/bin/env bash

# Find and edit a file in the current pane's directory using fzf.
# Includes hidden files by default (so dotfiles repos work) but always excludes
# .git and node_modules; still respects .gitignore. Press Ctrl-H to switch to a
# gitignore-only view that hides dotfiles.
# Enter: edit in popup, Ctrl-S: edit in caller pane
command -v fzf >/dev/null 2>&1 || { echo 'fzf not installed'; sleep 2; exit 1; }
command -v fd >/dev/null 2>&1 || { echo 'fd not installed'; sleep 2; exit 1; }

RESULT_FILE=/tmp/tmux-fzf-result

FD_BASE="fd --type f --strip-cwd-prefix --follow --exclude .git --exclude node_modules"

file=$($FD_BASE --hidden | \
  fzf --no-tmux --preview 'bat --style=numbers --color=always {} 2>/dev/null || cat {}' \
    --prompt 'all> ' \
    --header 'Enter: edit here · Ctrl-S: edit in pane · Ctrl-H: toggle hidden' \
    --bind "ctrl-s:become(echo '{}' > $RESULT_FILE)" \
    --bind "ctrl-h:transform:[[ \$FZF_PROMPT == 'all> ' ]] && echo 'change-prompt(> )+reload($FD_BASE)' || echo 'change-prompt(all> )+reload($FD_BASE --hidden)'" \
    --exit-0)

if [[ -n "$file" ]]; then
  ${EDITOR:-nvim} "$file"
fi
