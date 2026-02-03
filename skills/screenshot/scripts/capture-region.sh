#!/bin/bash

# Capture region screenshot
# Usage: ./capture-region.sh [output-file]

OUTPUT_FILE="${1:-region-screenshot.png}"
DATE=$(date +"%Y%m%d_%H%M%S")
FILENAME="${OUTPUT_FILE:-region_screenshot_$DATE.png}"

# Check if screencapture is available
if ! command -v /usr/sbin/screencapture &> /dev/null; then
    echo "Error: screencapture command not found"
    exit 1
fi

# Capture screenshot
/usr/sbin/screencapture -i -s -t png "$FILENAME"

if [ $? -eq 0 ]; then
    echo "Region screenshot captured: $FILENAME"
else
    echo "Error: Failed to capture region screenshot"
    exit 1
fi
