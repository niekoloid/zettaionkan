import os
import sys

# Add scripts directory to path to import upload_to_youtube
sys.path.append(os.path.join(os.getcwd(), 'scripts'))
from upload_to_youtube import upload_video

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

    title = "【水色】絶対音感トレーニング｜ 5時間連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録"
    video_path = "videos/outputs_5h/Lv14_5h_continuous.mp4"
    thumb_path = "videos/outputs/thumbnails_5h/Lv14_5h_thumbnail.jpg"

    print(f"Uploading Lv14 ({video_path})...")
    upload_video(
        file_path=video_path,
        title=title,
        description=full_description,
        thumbnail_path=thumb_path,
        privacy="public"
    )
    print("Lv9 uploaded successfully!")

if __name__ == "__main__":
    main()
