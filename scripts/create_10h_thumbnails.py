import os
from PIL import Image, ImageDraw, ImageFont

# Path configuration
INPUT_DIR = './videos/outputs/thumbnails'
OUTPUT_DIR = './videos/outputs/thumbnails_5h'
FONT_PATH = '/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc'

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# List of files to process
FILES = [
    'Lv1_thumbnail_compressed.jpg',
    'Lv2.png',
    'Lv3.png',
    'Lv4.png',
    'Lv5.png',
    'Lv6.png',
    'Lv7.png',
    'Lv.8.png',
    'Lv.9.png',
    'Lv10.png',
    'Lv11.png',
    'Lv12.png',
    'Lv13.png',
    'Lv14.png'
]

def add_badge(img_path, output_path):
    print(f"Processing {img_path}...")
    try:
        with Image.open(img_path) as img:
            img = img.convert('RGBA')
            draw = ImageDraw.Draw(img)
            
            width, height = img.size
            
            # Badge text
            text = "5時間連続再生"
            
            # Dynamically calc font size based on image width
            font_size = int(width * 0.04) 
            try:
                font = ImageFont.truetype(FONT_PATH, font_size, index=0)
            except Exception as fe:
                print(f"Font error: {fe}. Using default.")
                font = ImageFont.load_default()
            
            # Get text size
            bbox = font.getbbox(text)
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]
            
            # Padding
            padx = int(width * 0.02)
            pady = int(height * 0.015)
            
            # Badge background dimensions
            bw = tw + padx * 2
            bh = th + pady * 2
            
            # Position
            margin_right = int(width * 0.04)
            margin_top = int(height * 0.08) # Shifted down (was width * 0.04 ~= height * 0.07 on 16:9)
            bx = width - bw - margin_right
            by = margin_top 
            
            # Draw badge background 
            badge_color = (220, 20, 60, 255) # Crimson red
            
            # Rounded rectangle
            draw.rounded_rectangle([bx, by, bx+bw, by+bh], radius=int(bh/4), fill=badge_color)
            
            # Draw text (White)
            tx = bx + padx
            ty = by + pady - bbox[1]
            draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255))
            
            # Save as JPEG for YouTube
            img.convert('RGB').save(output_path, 'JPEG', quality=95)
            print(f"Successfully generated: {output_path}")
            
    except Exception as e:
        print(f"Error processing {img_path}: {e}")

if __name__ == "__main__":
    # Process files
    for i, filename in enumerate(FILES):
        input_path = os.path.join(INPUT_DIR, filename)
        target_name = f"Lv{i+1}_5h_thumbnail.jpg"
        output_path = os.path.join(OUTPUT_DIR, target_name)
        
        if os.path.exists(input_path):
            add_badge(input_path, output_path)
        else:
            print(f"Warning: File not found: {input_path}")

    # Success message
    print(f"\nAll processed. Check {OUTPUT_DIR}")
