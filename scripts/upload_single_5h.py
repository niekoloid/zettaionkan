import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'scripts'))
from upload_to_youtube import upload_video

def main():
    metadata_path = 'videos/youtube_metadata.md'
    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata_content = f.read()

    desc_start_marker = "## 📋 Common Description Template"
    desc_end_marker = "### 🏷️ Recommended Tags"
    desc_start = metadata_content.find(desc_start_marker) + len(desc_start_marker)
    desc_end = metadata_content.find(desc_end_marker)
    full_description = metadata_content[desc_start:desc_end].strip()

    # Get level from command line
    level = int(sys.argv[1]) if len(sys.argv) > 1 else 2
    
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
        11: "【薄橙】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        12: "【藤色】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        13: "【灰色】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        14: "【水色】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
    }

    title = titles[level]
    video_path = f"videos/outputs_5h/Lv{level}_5h_continuous.mp4"
    thumb_path = f"videos/outputs/thumbnails_5h/Lv{level}_5h_thumbnail.jpg"

    print(f"Uploading Lv{level} ({video_path})...")
    upload_video(
        file_path=video_path,
        title=title,
        description=full_description,
        thumbnail_path=thumb_path,
        privacy="public"
    )
    print(f"Lv{level} uploaded successfully!")

if __name__ == "__main__":
    main()