---
name: screenshot
description: Capture screenshots of the desktop, applications, or specific regions using system-level tools. Use for debugging, documentation, or visual reference. Supports macOS and Windows systems.
---

# Screenshot Capture Skill

This skill provides functionality to capture screenshots of the desktop, applications, or specific regions using system-level tools.

## Supported Systems

### macOS
- Uses `screencapture` command-line tool
- Supports various capture modes: entire screen, specific region, window, etc.

### Windows
- Uses PowerShell and .NET Framework
- Supports screen capture through system APIs

## Usage Instructions

### 1. Capture Entire Screen

#### macOS
```bash
/usr/sbin/screencapture -t png -x screenshot.png
```

#### Windows
```powershell
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 1920, 1080
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.CopyFromScreen(0,0,0,0,$bmp.Size)
$bmp.Save("screenshot.png")
```

### 2. Capture Specific Region

#### macOS
```bash
/usr/sbin/screencapture -i -s -t png region-screenshot.png
```

#### Windows
```powershell
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Show region selection
$screenBounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$form = New-Object System.Windows.Forms.Form
$form.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::None
$form.StartPosition = [System.Windows.Forms.FormStartPosition]::Manual
$form.Bounds = $screenBounds
$form.TopMost = $true
$form.Opacity = 0.3
$form.BackColor = [System.Drawing.Color]::Black

$startPoint = $null
$endPoint = $null

$form.MouseDown.Add({
    $startPoint = $_.Location
})

$form.MouseMove.Add({
    if ($startPoint -ne $null) {
        $endPoint = $_.Location
        $form.Refresh()
    }
})

$form.MouseUp.Add({
    $endPoint = $_.Location
    $form.Close()
})

$form.Paint.Add({
    $e = $_.Graphics
    if ($startPoint -ne $null -and $endPoint -ne $null) {
        $rect = New-Object System.Drawing.Rectangle(
            [Math]::Min($startPoint.X, $endPoint.X),
            [Math]::Min($startPoint.Y, $endPoint.Y),
            [Math]::Abs($startPoint.X - $endPoint.X),
            [Math]::Abs($startPoint.Y - $endPoint.Y)
        )
        $e.DrawRectangle([System.Drawing.Pens]::Red, $rect)
    }
})

$form.ShowDialog() | Out-Null

if ($startPoint -ne $null -and $endPoint -ne $null) {
    $rect = New-Object System.Drawing.Rectangle(
        [Math]::Min($startPoint.X, $endPoint.X),
        [Math]::Min($startPoint.Y, $endPoint.Y),
        [Math]::Abs($startPoint.X - $endPoint.X),
        [Math]::Abs($startPoint.Y - $endPoint.Y)
    )
    $bmp = New-Object System.Drawing.Bitmap $rect.Width, $rect.Height
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.CopyFromScreen($rect.Location, (0,0), $rect.Size)
    $bmp.Save("region-screenshot.png")
}
```

### 3. Capture Active Window

#### macOS
```bash
/usr/sbin/screencapture -W -t png window-screenshot.png
```

#### Windows
```powershell
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

$activeWindow = [System.Windows.Forms.Form]::ActiveForm
if ($activeWindow -eq $null) {
    $activeWindow = [System.Windows.Forms.Form]::ActiveForm
}

if ($activeWindow -ne $null) {
    $bmp = New-Object System.Drawing.Bitmap $activeWindow.Width, $activeWindow.Height
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.CopyFromScreen($activeWindow.PointToScreen((0,0)), (0,0), $activeWindow.Size)
    $bmp.Save("window-screenshot.png")
}
```

## Scripts

The `scripts/` directory contains reusable scripts for different platforms:

### macOS Scripts
- `capture-fullscreen.sh`: Captures entire screen
- `capture-region.sh`: Captures specific region
- `capture-window.sh`: Captures active window

### Windows Scripts
- `capture-fullscreen.ps1`: Captures entire screen
- `capture-region.ps1`: Captures specific region
- `capture-window.ps1`: Captures active window

### Python Scripts
- `capture.py`: Cross-platform screen capture using Python libraries

## References

### macOS Screen Capture Reference
- Command-line options for `screencapture`
- Advanced usage and automation examples

### Windows Screen Capture Reference
- PowerShell screen capture techniques
- System API documentation

## Assets

The `assets/` directory contains any necessary resources or templates for the screenshot functionality.

## Troubleshooting

### Common Issues

#### macOS Screencapture Not Working
- **Problem**: `screencapture` command not found
- **Solution**: Check if `/usr/sbin/screencapture` exists

#### Windows Capture Fails
- **Problem**: Permission issues or API restrictions
- **Solution**: Run PowerShell as administrator

## Safety Considerations

- Always respect user privacy and only capture screenshots when explicitly requested
- Be mindful of sensitive information that may be visible on screen
- Clean up temporary files after use

## Performance Tips

- For high-resolution screens, consider capturing at lower quality
- Use appropriate file formats (PNG for quality, JPEG for size)
- Compress screenshots if needed for sharing
