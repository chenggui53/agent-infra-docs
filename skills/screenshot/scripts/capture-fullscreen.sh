#!/bin/bash

# Capture full screen screenshot
# Usage: ./capture-fullscreen.sh [output-file]

OUTPUT_FILE="${1:-screenshot.png}"
DATE=$(date +"%Y%m%d_%H%M%S")
FILENAME="${OUTPUT_FILE:-screenshot_$DATE.png}"

# Check if screencapture is available
if ! command -v /usr/sbin/screencapture &> /dev/null; then
    echo "Error: screencapture command not found"
    exit 1
fi

# Capture screenshot
/usr/sbin/screencapture -t png -x "$FILENAME"

if [ $? -eq 0 ]; then
    echo "Screenshot captured: $FILENAME"
else
    echo "Error: Failed to capture screenshot"
    exit 1
fi
