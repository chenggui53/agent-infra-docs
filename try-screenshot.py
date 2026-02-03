#!/usr/bin/env python3

import mss
import mss.tools
import sys
import os

def try_capture_screenshot():
    try:
        print("Attempting to capture screen...")
        
        # Try with mss library
        with mss.mss() as sct:
            monitor = sct.monitors[1]
            print(f"Monitor: {monitor}")
            
            try:
                sct_img = sct.grab(monitor)
                output_file = "/Users/xiongqi/.openclaw/workspace/desktop-screenshot.png"
                mss.tools.to_png(sct_img.rgb, sct_img.size, output=output_file)
                
                if os.path.exists(output_file) and os.path.getsize(output_file) > 0:
                    print(f"✓ Screenshot captured successfully: {output_file}")
                    print(f"Size: {os.path.getsize(output_file)} bytes")
                    return True
                else:
                    print(f"✗ Failed to create valid image file")
                    return False
                    
            except Exception as e:
                print(f"✗ Capture error: {e}")
                import traceback
                print(traceback.format_exc())
                return False
                
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        print(traceback.format_exc())
        return False

if __name__ == "__main__":
    success = try_capture_screenshot()
    if not success:
        print("\n--- Troubleshooting ---")
        print("1. Check screen recording permissions in System Preferences > Security & Privacy")
        print("2. Ensure terminal has access to screen capture")
        print("3. Try using the interactive region capture method")
        sys.exit(1)
    else:
        sys.exit(0)
