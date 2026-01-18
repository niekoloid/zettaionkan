from PIL import Image
import os
import math

def remove_white_bg(image_path, tolerance=30):
    try:
        print(f"Processing {image_path}...")
        img = Image.open(image_path).convert("RGBA")
        datas = img.getdata()
        
        new_data = []
        for item in datas:
            # RGB values
            r, g, b, a = item
            
            # Simple distance from white (255, 255, 255)
            # If all channels are high, it's white/near-white background
            if r > (255 - tolerance) and g > (255 - tolerance) and b > (255 - tolerance):
                new_data.append((255, 255, 255, 0)) # Make Transparent
            else:
                new_data.append(item)
        
        img.putdata(new_data)
        img.save(image_path, "PNG")
        print(f"Done: {image_path}")
    except Exception as e:
        print(f"Error processing {image_path}: {e}")

icons = [
    "public/assets/icons/cola.png",
    "public/assets/icons/ramune.png", 
    "public/assets/icons/black_sesame.png"
]

if __name__ == "__main__":
    for icon in icons:
        # Check relative to CWD
        full_path = os.path.join(os.getcwd(), icon)
        remove_white_bg(full_path)
