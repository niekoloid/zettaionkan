from PIL import Image, ImageDraw, ImageFont
import os

def add_text_to_image(input_path, output_path, text):
    try:
        # Load image
        img = Image.open(input_path)
        draw = ImageDraw.Draw(img)
        
        # Image dimensions
        W, H = img.size
        
        # Font settings
        # Using a very bold/heavy Japanese font if possible, or fall back to standard
        font_path = "/System/Library/Fonts/Hiragino Sans GB.ttc"
        if not os.path.exists(font_path):
            # Fallback
            font_path = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"

        # Calculate font size relative to image width (e.g. 8% of width)
        font_size = int(W * 0.08)
        
        try:
            font = ImageFont.truetype(font_path, font_size)
        except Exception as e:
            print(f"Font loading failed: {e}")
            return

        # Calculate text size using textbbox (newer PIL) or textsize (older)
        if hasattr(draw, "textbbox"):
            bbox = draw.textbbox((0, 0), text, font=font)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]
        else:
            text_w, text_h = draw.textsize(text, font=font)

        # === Design: Gold/Yellow Badge Style (Premium Look) ===
        
        # Padding & Positioning (Bottom Center)
        padding_bottom = H * 0.08
        
        # Badge dimensions
        badge_padding_x = font_size * 0.8
        badge_padding_y = font_size * 0.4
        badge_w = text_w + (badge_padding_x * 2)
        badge_h = text_h + (badge_padding_y * 2)
        
        badge_x = (W - badge_w) / 2
        badge_y = H - badge_h - padding_bottom
        
        # Draw Shadow for Badge
        shadow_offset = 10
        draw.rounded_rectangle(
            (badge_x + shadow_offset, badge_y + shadow_offset, badge_x + badge_w + shadow_offset, badge_y + badge_h + shadow_offset),
            radius=badge_h/2,
            fill="#00000066"
        )

        # Draw Badge Background (Solid Gold/Yellow Gradient simulation or Solid Color)
        # Using a solid punchy Gold/Orange
        badge_color = "#FFD700" # Gold
        draw.rounded_rectangle(
            (badge_x, badge_y, badge_x + badge_w, badge_y + badge_h),
            radius=badge_h/2,
            fill=badge_color,
            outline="white",
            width=5
        )

        # Text Position (Centered on Badge)
        # Adjust y slightly for visual centering
        text_x = badge_x + badge_padding_x
        text_y = badge_y + badge_padding_y - (font_size * 0.1) 

        # Draw Text (Black text on Gold looks premium)
        text_color = "#1a1a1a" # Dark Gray/Black
        draw.text((text_x, text_y), text, font=font, fill=text_color)
        
        # Save
        img.save(output_path, quality=95)
        print(f"Successfully saved to {output_path}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    input_file = "videos/outputs/thumbnails/Lv1_thumbnail_compressed.jpg"
    output_file = "videos/outputs/thumbnails/Lv1_30min_thumbnail.jpg"
    text = "30分連続再生"
    
    if os.path.exists(input_file):
        add_text_to_image(input_file, output_file, text)
    else:
        print(f"Input file not found: {input_file}")
