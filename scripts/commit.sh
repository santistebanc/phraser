#!/bin/bash

# Get the commit message from command line argument
if [ $# -eq 0 ]; then
    echo "Usage: ./scripts/commit.sh \"commit message\""
    exit 1
fi

COMMIT_MESSAGE="$1"

# Add all changes
git add .

# Commit with the provided message
git commit -m "$COMMIT_MESSAGE"

echo "✅ Committed: $COMMIT_MESSAGE" 