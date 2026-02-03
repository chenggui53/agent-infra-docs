# macOS Screen Capture Reference

## Introduction

macOS provides the `screencapture` command-line tool for capturing screenshots programmatically. This guide covers the available options and usage patterns.

## Command Reference

### Basic Usage

```bash
/usr/sbin/screencapture [options] <output-file>
```

### Key Options

#### Capture Types
- `-i`: Interactive mode - click to capture
- `-s`: Select a region to capture (interactive)
- `-W`: Capture active window (without interactive mode)
- `-w`: Capture active window (with interactive mode)

#### Output Formats
- `-t <format>`: Specify output format (png, jpg, gif, tiff)
- `-P`: Open image in Preview after capture

#### Quality and Compression
- `-l <value>`: Image quality (0-100, 100 is best quality)
- `-m`: Capture with mouse cursor
- `-o`: Capture without mouse cursor

#### Timing
- `-T <seconds>`: Delay before capturing (in seconds)

#### Advanced
- `-C`: Capture entire screen (default)
- `-R <x,y,w,h>`: Capture specific region by coordinates
- `-B <path>`: Use background window (for hidden windows)
- `-c`: Copy to clipboard instead of saving to file

## Common Usage Examples

### Capture Full Screen
```bash
# Capture entire screen to screenshot.png
/usr/sbin/screencapture -t png -x screenshot.png
```

### Capture Region with Delay
```bash
# Capture region after 3 second delay
/usr/sbin/screencapture -i -s -T 3 region-screenshot.png
```

### Capture Active Window
```bash
# Capture active window with cursor
/usr/sbin/screencapture -W -m window-screenshot.png
```

### Capture Specific Region by Coordinates
```bash
# Capture region at (100, 100) with size 800x600
/usr/sbin/screencapture -R 100,100,800,600 coordinate-screenshot.png
```

### Copy to Clipboard
```bash
# Capture region and copy to clipboard
/usr/sbin/screencapture -i -s -c
```

## Error Handling

### Common Errors

#### "could not create image from display"
- **Cause**: Permission issues or display access restrictions
- **Solution**: Ensure terminal has screen recording permissions

#### "Operation not permitted"
- **Cause**: Security permissions block the command
- **Solution**: Go to System Preferences > Security & Privacy > Screen Recording
- **Fix**: Add Terminal or your IDE to the allowed applications

#### "command not found"
- **Cause**: `screencapture` not available or not in PATH
- **Solution**: Use the full path `/usr/sbin/screencapture`

## Performance Considerations

### File Size Optimization
```bash
# Capture in JPEG format with 80% quality
/usr/sbin/screencapture -t jpg -l 80 optimized-screenshot.jpg
```

### Multiple Displays
```bash
# Capture all displays to separate files
/usr/sbin/screencapture -x display1.png display2.png
```

### Batch Capture
```bash
# Capture screenshot every 5 seconds
while true; do
  FILENAME="screenshot_$(date +%Y%m%d_%H%M%S).png"
  /usr/sbin/screencapture -t png -x "$FILENAME"
  sleep 5
done
```

## Automation Tips

### Scripting Examples

#### Capture and Upload to Cloud
```bash
#!/bin/bash
FILENAME="screenshot_$(date +%Y%m%d_%H%M%S).png"
/usr/sbin/screencapture -t png -x "$FILENAME"
curl -X POST -F "file=@$FILENAME" https://api.example.com/upload
rm "$FILENAME"
```

#### Capture and Email
```bash
#!/bin/bash
FILENAME="document-screenshot.png"
/usr/sbin/screencapture -t png -x "$FILENAME"
mail -a "$FILENAME" -s "Screenshot" user@example.com < /dev/null
rm "$FILENAME"
```

## Resources

- Apple Documentation: `man screencapture`
- macOS Automation Guide: https://developer.apple.com/library/archive/documentation/LanguagesUtilities/Conceptual/MacAutomationScriptingGuide/
- Scripting Bridge: https://developer.apple.com/documentation/scriptingbridge
