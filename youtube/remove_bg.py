from PIL import Image
import os

def make_transparent(img_path):
    print(f"Processing {img_path}...")
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()

    new_data = []
    for item in data:
        # If the pixel is very white, make it transparent
        # 240 is a threshold for "nearly white"
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    # Save as PNG to keep transparency
    base_name = os.path.splitext(img_path)[0]
    out_path = f"{base_name}_transparent.png"
    img.save(out_path, "PNG")
    print(f"Saved to {out_path}")
    return out_path

if __name__ == "__main__":
    youtube_dir = "youtube"
    images = ["red_ice_cream.png", "yellow_ice_cream.png", "blue_ice_cream.png"]
    for img_name in images:
        path = os.path.join(youtube_dir, img_name)
        if os.path.exists(path):
            make_transparent(path)
        else:
            print(f"File not found: {path}")
