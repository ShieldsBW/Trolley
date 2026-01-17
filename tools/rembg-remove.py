#!/usr/bin/env python3
"""
AI Background Removal using rembg (U2-Net model)

Usage:
    python rembg-remove.py <input.png> [output.png]
    python rembg-remove.py --batch <directory>
    python rembg-remove.py --trim <input.png>

Options:
    --trim      Also trim transparent pixels after removal
    --batch     Process all PNG files in directory
    --model     Model to use: u2net (default), u2netp (faster), u2net_human_seg
"""

import sys
import os
from pathlib import Path

def remove_background(input_path, output_path=None, trim=True):
    """Remove background from a single image."""
    from rembg import remove
    from PIL import Image

    if output_path is None:
        output_path = input_path

    print(f"Processing: {Path(input_path).name}")

    # Load and process
    input_img = Image.open(input_path)
    original_size = input_img.size

    print("  Running AI background removal...")
    output_img = remove(input_img)

    # Trim if requested
    if trim:
        bbox = output_img.getbbox()
        if bbox:
            output_img = output_img.crop(bbox)
            print(f"  Trimmed: {original_size} -> {output_img.size}")

    # Save
    output_img.save(output_path)
    print(f"  Saved: {output_path}")

    return output_img.size

def process_batch(directory, trim=True):
    """Process all PNG files in a directory."""
    directory = Path(directory)
    png_files = list(directory.glob("*.png"))

    print(f"Found {len(png_files)} PNG files in {directory}\n")

    success = 0
    failed = 0

    for png_file in png_files:
        try:
            remove_background(str(png_file), trim=trim)
            success += 1
        except Exception as e:
            print(f"  Error: {e}")
            failed += 1
        print()

    print(f"\nCompleted: {success} success, {failed} failed")

def main():
    args = sys.argv[1:]

    if not args or args[0] in ['-h', '--help']:
        print(__doc__)
        return

    trim = '--trim' in args or True  # Default to trim
    batch = '--batch' in args

    # Remove flags from args
    args = [a for a in args if not a.startswith('--')]

    if not args:
        print("Error: No input file specified")
        print(__doc__)
        return

    if batch:
        process_batch(args[0], trim=trim)
    else:
        input_path = args[0]
        output_path = args[1] if len(args) > 1 else None

        if not os.path.exists(input_path):
            print(f"Error: File not found: {input_path}")
            return

        remove_background(input_path, output_path, trim=trim)

if __name__ == "__main__":
    main()
