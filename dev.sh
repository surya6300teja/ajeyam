#!/bin/bash

# Check if terminal-session is installed
if ! command -v tmux &> /dev/null; then
  echo "tmux is not installed. Running in separate terminals instead."
  echo "Starting Express server..."
  osascript -e 'tell app "Terminal" to do script "cd '$PWD'/server && npm start"'
  echo "Starting React dev server..."
  cd ajeyam-new && npm run dev
  exit 0
fi

# Script to start both servers in development mode using tmux
echo "=== Starting Development Environment ==="

# Create a new tmux session
tmux new-session -d -s ajeyam-dev

# First pane - Express server
tmux send-keys -t ajeyam-dev "cd server && npm start" C-m

# Split the window horizontally
tmux split-window -h -t ajeyam-dev

# Second pane - React dev server
tmux send-keys -t ajeyam-dev "cd ajeyam-new && npm run dev" C-m

# Attach to the session
tmux attach-session -t ajeyam-dev

# If tmux session ends, make sure both processes are terminated
echo "Development session ended. Cleaning up..."
pkill -f "node.*server/src/server.js" 
pkill -f "vite" 