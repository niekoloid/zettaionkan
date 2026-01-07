import os
import sys
import glob
import subprocess

# Add scripts directory to path to import upload_to_youtube
sys.path.append(os.path.join(os.getcwd(), 'scripts'))
try:
    from upload_to_youtube import upload_video
except ImportError:
    print("Error: Could not import upload_video from scripts/upload_to_youtube.py")
    sys.exit(1)

def main():
    metadata_path = 'videos/youtube_metadata.md'
    if not os.path.exists(metadata_path):
        print(f"Error: {metadata_path} not found")
        return

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
        1: "【赤】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        2: "【黄色】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        3: "【青】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        4: "【黒】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        5: "【緑】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        6: "【オレンジ】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        7: "【紫】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        8: "【ピンク】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        9: "【茶色】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        10: "【黄緑】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        11: "【ベージュ】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        12: "【薄紫】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        13: "【グレー】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        14: "【水色】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
    }

    video_dir = "videos/outputs_5h"
    thumb_dir = "videos/outputs/thumbnails_5h"

    # Start from Lv1, up to Lv14
    for lv in range(1, 15):
        print(f"\n=== Checking Level {lv} ===")
        
        # Find video file
        video_files = glob.glob(os.path.join(video_dir, f"Lv{lv}_5h_continuous.mp4"))
        if not video_files:
            print(f"Skipping Lv{lv}: Video not generated yet.")
            continue
        video_path = video_files[0]

        # Find thumbnail file
        thumb_path = os.path.join(thumb_dir, f"Lv{lv}_5h_thumbnail.jpg")
        
        if not os.path.exists(thumb_path):
            print(f"Error: Thumbnail for Lv{lv} not found at {thumb_path}")
            continue

        # Upload
        print(f"Uploading Lv{lv} ({video_path})...")
        try:
            upload_video(
                file_path=video_path,
                title=titles[lv],
                description=full_description,
                thumbnail_path=thumb_path,
                privacy="public"
            )
            print(f"Lv{lv} uploaded successfully!")
        except Exception as e:
            print(f"Failed to upload Lv{lv}: {e}")

if __name__ == "__main__":
    main()
