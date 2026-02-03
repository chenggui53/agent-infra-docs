#!/usr/bin/env python3
"""
Cross-platform screen capture module
Supports macOS, Windows, and Linux
Requires: Pillow, mss, python-dotenv
"""

import os
import sys
import time
import mss
import mss.tools
from PIL import Image

def capture_fullscreen(output_file="screenshot.png"):
    """Capture full screen screenshot"""
    try:
        with mss.mss() as sct:
            # Get the first monitor (primary screen)
            monitor = sct.monitors[1]
            
            # Capture the screen
            sct_img = sct.grab(monitor)
            
            # Save as PNG
            mss.tools.to_png(sct_img.rgb, sct_img.size, output=output_file)
            print(f"Screenshot captured: {output_file}")
            return True
    except Exception as e:
        print(f"Error capturing full screen: {e}")
        return False

def capture_region(output_file="region-screenshot.png"):
    """Capture region screenshot with interactive selection"""
    try:
        from pynput import mouse
        
        print("Please select a region to capture...")
        print("Click and drag to select the region")
        
        start_pos = None
        end_pos = None
        
        def on_click(x, y, button, pressed):
            nonlocal start_pos, end_pos
            
            if pressed:
                start_pos = (x, y)
                print(f"Start: {start_pos}")
            else:
                end_pos = (x, y)
                print(f"End: {end_pos}")
                return False  # Stop listener
        
        # Start listening for mouse clicks
        listener = mouse.Listener(on_click=on_click)
        listener.start()
        listener.join()
        
        if start_pos and end_pos:
            # Calculate region coordinates
            x = min(start_pos[0], end_pos[0])
            y = min(start_pos[1], end_pos[1])
            width = abs(start_pos[0] - end_pos[0])
            height = abs(start_pos[1] - end_pos[1])
            
            if width > 0 and height > 0:
                with mss.mss() as sct:
                    monitor = {"top": y, "left": x, "width": width, "height": height}
                    sct_img = sct.grab(monitor)
                    mss.tools.to_png(sct_img.rgb, sct_img.size, output=output_file)
                    print(f"Region captured: {output_file}")
                    return True
            else:
                print("Error: Selected region must have non-zero dimensions")
                return False
        else:
            print("Error: No region selected")
            return False
            
    except ImportError:
        print("Error: pynput library not installed. Install with: pip install pynput")
        return False
    except Exception as e:
        print(f"Error capturing region: {e}")
        return False

def capture_window(output_file="window-screenshot.png"):
    """Capture active window screenshot (limited support)"""
    try:
        # This is a simplified version - actual window detection is OS-specific
        print("Note: Active window capture has limited cross-platform support")
        
        if sys.platform == "win32":
            import win32gui
            import win32ui
            import win32con
            
            hwnd = win32gui.GetForegroundWindow()
            rect = win32gui.GetWindowRect(hwnd)
            
            left, top, right, bottom = rect
            width = right - left
            height = bottom - top
            
            hwndDC = win32gui.GetWindowDC(hwnd)
            mfcDC = win32ui.CreateDCFromHandle(hwndDC)
            saveDC = mfcDC.CreateCompatibleDC()
            
            saveBitMap = win32ui.CreateBitmap()
            saveBitMap.CreateCompatibleBitmap(mfcDC, width, height)
            
            saveDC.SelectObject(saveBitMap)
            
            result = windll.user32.PrintWindow(hwnd, saveDC.GetSafeHdc(), 0)
            
            bmpinfo = saveBitMap.GetInfo()
            bmpstr = saveBitMap.GetBitmapBits(True)
            
            img = Image.frombuffer('RGB', 
                                  (bmpinfo['bmWidth'], bmpinfo['bmHeight']),
                                  bmpstr, 'raw', 'BGRX', 0, 1)
            
            img.save(output_file)
            print(f"Window captured: {output_file}")
            return True
            
        else:
            print("Active window capture not supported on this platform")
            return False
            
    except ImportError:
        print("Error: win32api library not installed. Install with: pip install pywin32")
        return False
    except Exception as e:
        print(f"Error capturing window: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python capture.py [command] [output-file]")
        print("\nCommands:")
        print("  fullscreen    Capture entire screen")
        print("  region        Capture selected region")
        print("  window        Capture active window")
        return 1
    
    command = sys.argv[1].lower()
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    if command == "fullscreen":
        capture_fullscreen(output_file or "screenshot.png")
    elif command == "region":
        capture_region(output_file or "region-screenshot.png")
    elif command == "window":
        capture_window(output_file or "window-screenshot.png")
    else:
        print(f"Error: Unknown command '{command}'")
        return 1

    return 0

if __name__ == "__main__":
    sys.exit(main())
