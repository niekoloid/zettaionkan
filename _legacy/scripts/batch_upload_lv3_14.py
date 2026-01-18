
import os
import sys
import glob
import subprocess

# Add scripts directory to path to import upload_to_youtube
sys.path.append(os.path.join(os.getcwd(), 'scripts'))
from upload_to_youtube import upload_video

def compress_thumbnail(input_path, output_path):
    print(f"Compressing {input_path} -> {output_path}")
    cmd = [
        'ffmpeg', '-y', '-i', input_path,
        '-q:v', '2',
        '-update', 'true', '-frames:v', '1',
        output_path
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

def main():
    metadata_path = 'videos/youtube_metadata.md'
    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata_content = f.read()

    # Extract common description
    desc_start_marker = "## 📋 Common Description Template"
    desc_end_marker = "### 🏷️ Recommended Tags"
    desc_start = metadata_content.find(desc_start_marker) + len(desc_start_marker)
    desc_end = metadata_content.find(desc_end_marker)
    full_description = metadata_content[desc_start:desc_end].strip()

    # Level titles mapping
    titles = {
        3: "【青】絶対音感トレーニング｜混合リピート 10分 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        4: "【黒】絶対音感トレーニング｜混合リピート 10分 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        5: "【緑】絶対音感トレーニング｜混合リピート 10分 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        6: "【オレンジ】絶対音感トレーニング｜混合リピート 10分 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        7: "【紫】絶対音感トレーニング｜混合リピート 10分 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        8: "【ピンク】絶対音感トレーニング｜混合リピート 10分 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        9: "【茶色】絶対音感トレーニング｜混合リピート 10分 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        10: "【黄緑】絶対音感トレーニング｜混合リピート 10分 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        11: "【ベージュ】絶対音感トレーニング｜混合リピート 10分 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        12: "【薄紫】絶対音感トレーニング｜混合リピート 10分 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        13: "【グレー】絶対音感トレーニング｜混合リピート 10分 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        14: "【水色】絶対音感トレーニング｜混合リピート 10分 - Steinway Model B / 44.1kHz 16bit 高精度収録",
    }

    video_dir = "videos/outputs"
    thumb_dir = "videos/outputs/thumbnails"

    for lv in range(3, 15):
        print(f"\n=== Processing Level {lv} ===")
        
        # Find video file
        video_files = glob.glob(os.path.join(video_dir, f"Lv{lv}_*.mp4"))
        if not video_files:
            print(f"Error: Video for Lv{lv} not found")
            continue
        video_path = video_files[0]

        # Find thumbnail file (it can be LvX.png or Lv.X.png)
        thumb_path = os.path.join(thumb_dir, f"Lv{lv}.png")
        if not os.path.exists(thumb_path):
            thumb_path = os.path.join(thumb_dir, f"Lv.{lv}.png")
        
        if not os.path.exists(thumb_path):
            print(f"Error: Thumbnail for Lv{lv} not found")
            continue

        # Compress thumbnail
        compressed_thumb = os.path.join(thumb_dir, f"Lv{lv}_compressed.jpg")
        compress_thumbnail(thumb_path, compressed_thumb)

        # Upload
        print(f"Uploading Lv{lv}...")
        try:
            upload_video(
                file_path=video_path,
                title=titles[lv],
                description=full_description,
                thumbnail_path=compressed_thumb,
                privacy="public"
            )
            print(f"Lv{lv} uploaded successfully!")
        except Exception as e:
            print(f"Failed to upload Lv{lv}: {e}")

if __name__ == "__main__":
    main()
