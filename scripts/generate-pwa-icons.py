#!/usr/bin/env python3
"""Generate PWA icons for URY Dashboard."""

from PIL import Image, ImageDraw, ImageFont
import os

# Output directory
PUBLIC_DIR = "/home/z/my-project/public"

# Colors
BG_COLOR = (5, 150, 105)  # emerald-600
TEXT_COLOR = (255, 255, 255)

def create_icon(size, output_path):
    """Create a PWA icon with the URY branding."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Rounded rectangle background
    radius = size // 6
    draw.rounded_rectangle(
        [(0, 0), (size - 1, size - 1)],
        radius=radius,
        fill=BG_COLOR
    )
    
    # Draw a plate/circle in the center
    center = size // 2
    plate_radius = int(size * 0.32)
    draw.ellipse(
        [(center - plate_radius, center - plate_radius), 
         (center + plate_radius, center + plate_radius)],
        fill=(255, 255, 255, 40),
        outline=TEXT_COLOR,
        width=max(2, size // 80)
    )
    
    # Inner circle (plate rim)
    inner_r = int(size * 0.22)
    draw.ellipse(
        [(center - inner_r, center - inner_r), 
         (center + inner_r, center + inner_r)],
        outline=(255, 255, 255, 120),
        width=max(1, size // 120)
    )
    
    # Draw "URY" text
    font_size = int(size * 0.18)
    try:
        # Try to use a system font
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    text = "URY"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    text_x = center - text_w // 2
    text_y = center - text_h // 2 - int(size * 0.02)
    draw.text((text_x, text_y), text, fill=TEXT_COLOR, font=font)
    
    # Draw small fork and knife symbols (simplified)
    symbol_y = center + int(size * 0.18)
    symbol_size = max(1, size // 60)
    
    # Fork (left)
    fork_x = center - int(size * 0.12)
    draw.rectangle([fork_x - symbol_size, symbol_y, fork_x, symbol_y + int(size * 0.08)], fill=TEXT_COLOR)
    for dx in [-symbol_size * 2, -symbol_size, 0]:
        draw.rectangle([fork_x + dx - 1, symbol_y - int(size * 0.03), fork_x + dx + 1, symbol_y], fill=TEXT_COLOR)
    
    # Knife (right)
    knife_x = center + int(size * 0.10)
    draw.rectangle([knife_x, symbol_y, knife_x + symbol_size, symbol_y + int(size * 0.08)], fill=TEXT_COLOR)
    draw.rectangle([knife_x - 1, symbol_y - int(size * 0.04), knife_x + symbol_size + 1, symbol_y], fill=TEXT_COLOR)
    
    # Save
    img.save(output_path, 'PNG')
    print(f"Created: {output_path} ({size}x{size})")

if __name__ == '__main__':
    create_icon(192, os.path.join(PUBLIC_DIR, "icon-192.png"))
    create_icon(512, os.path.join(PUBLIC_DIR, "icon-512.png"))
    print("\nPWA icons generated successfully!")
