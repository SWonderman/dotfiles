#!/usr/bin/env bash

# Fuzzy-jump between project directories, opening/attaching a tmux session per dir.
# Usage: tmux-sessionizer.sh [directory]
command -v fzf >/dev/null 2>&1 || { echo 'fzf not installed'; sleep 2; exit 1; }

# Directories to offer. Edit this to taste:
#   - `find <dir> -mindepth 1 -maxdepth 1 -type d` lists each subdirectory
#   - a bare `echo <dir>` offers that directory itself
list_projects() {
  find "$HOME/Dev" -mindepth 1 -maxdepth 1 -type d 2>/dev/null
  echo "$HOME/dotfiles"
}

if [[ $# -eq 1 ]]; then
  selected=$1
else
  selected=$(list_projects | fzf --no-tmux --exit-0)
fi

# exit if nothing selected
[[ -z $selected ]] && exit 0

selected_name=$(basename "$selected" | tr . _)
tmux_running=$(pgrep tmux)

# create new session if not in tmux
if [[ -z $TMUX ]] && [[ -z $tmux_running ]]; then
  tmux new-session -s "$selected_name" -c "$selected"
  exit 0
fi

# create new session if name doesn't exist
if ! tmux has-session -t="$selected_name" 2>/dev/null; then
  tmux new-session -ds "$selected_name" -c "$selected"
fi

if [[ -n $TMUX ]]; then
  tmux switch-client -t "$selected_name"
else
  tmux attach-session -t "$selected_name"
fi
