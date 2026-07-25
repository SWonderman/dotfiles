#!/usr/bin/env bash

# Live interactive ripgrep with file preview
# Type to search, Enter to edit in popup, Ctrl-S to edit in caller pane
command -v fzf >/dev/null 2>&1 || { echo 'fzf not installed'; sleep 2; exit 1; }
command -v rg >/dev/null 2>&1 || { echo 'rg not installed'; sleep 2; exit 1; }

# --hidden + exclude .git so dotfiles repos are searchable; .gitignore still applies
RG_PREFIX="rg --column --line-number --no-heading --color=always --smart-case --hidden -g !.git"

RESULT_FILE=/tmp/tmux-fzf-result

result=$(fzf --no-tmux --ansi --disabled \
    --bind "start:reload:$RG_PREFIX {q} || true" \
    --bind "change:reload:$RG_PREFIX {q} || true" \
    --delimiter : \
    --header 'Enter: edit here, Ctrl-S: edit in pane' \
    --preview 'bat --color=always --highlight-line {2} {1} 2>/dev/null || cat {1}' \
    --preview-window '+{2}/2' \
    --bind "ctrl-s:become(echo '+{2}' '{1}' > $RESULT_FILE)" \
    --exit-0)

if [[ -n "$result" ]]; then
  file=$(echo "$result" | awk -F: '{print $1}')
  line=$(echo "$result" | awk -F: '{print $2}')
  ${EDITOR:-nvim} "+$line" "$file"
fi
