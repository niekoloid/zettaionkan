import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'scripts'))
from upload_to_youtube import upload_video

def main():
    metadata_path = 'videos/youtube_metadata.md'
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata_content = f.read()

        desc_start_marker = "## 📋 Common Description Template"
        desc_end_marker = "### 🏷️ Recommended Tags"
        try:
            desc_start = metadata_content.find(desc_start_marker) + len(desc_start_marker)
            desc_end = metadata_content.find(desc_end_marker)
            if desc_start == -1 or desc_end == -1: raise ValueError("Description markers error")
            full_description = metadata_content[desc_start:desc_end].strip()
        except:
             full_description = "絶対音感トレーニング動画 (30分版)\n全14和音のランダム再生です。"
    else:
        full_description = "絶対音感トレーニング動画 (30分版)\n全14和音のランダム再生です。"

    title = "【全14和音】絶対音感トレーニング｜ 30分連続ランダム再生 - Steinway Model B / 44.1kHz 16bit 高精度収録"
    video_path = "videos/outputs_14chords_30min/All14Chords_30min.mp4"
    thumb_path = "" # サムネイルは自動選択（または適宜パスを指定）

    print(f"Uploading 30min Random Mix ({video_path})...")
    upload_video(
        file_path=video_path,
        title=title,
        description=full_description,
        thumbnail_path=thumb_path if os.path.exists(thumb_path) else None,
        privacy="public"
    )
    print(f"Upload completed successfully!")

if __name__ == "__main__":
    main()
