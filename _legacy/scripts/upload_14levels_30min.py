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
             full_description = "絶対音感トレーニング動画 (30分版)"
    else:
        full_description = "絶対音感トレーニング動画 (30分版)"

    titles = {
        1: "【赤】絶対音感トレーニング｜ 30分連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        2: "【黄色】絶対音感トレーニング｜ 30分連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        3: "【青】絶対音感トレーニング｜ 30分連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        4: "【黒】絶対音感トレーニング｜ 30分連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        5: "【緑】絶対音感トレーニング｜ 30分連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        6: "【オレンジ】絶対音感トレーニング｜ 30分連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        7: "【紫】絶対音感トレーニング｜ 30分連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        8: "【ピンク】絶対音感トレーニング｜ 30分連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        9: "【茶色】絶対音感トレーニング｜ 30分連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        10: "【黄緑】絶対音感トレーニング｜ 30分連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        11: "【薄橙】絶対音感トレーニング｜ 30分連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        12: "【藤色】絶対音感トレーニング｜ 30分連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        13: "【灰色】絶対音感トレーニング｜ 30分連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
        14: "【水色】絶対音感トレーニング｜ 30分連続再生 - Steinway Model B / 44.1kHz 16bit 高精度収録",
    }

    # 指定されたレベルのみアップロード (デフォルトは 1-14)
    # 割り込みで止まった場合は、残りのレベルを指定できるようにする
    levels = [int(x) for x in sys.argv[1:]] if len(sys.argv) > 1 else list(range(1, 15))

    for level in levels:
        if level not in titles: continue

        title = titles[level]
        video_path = f"videos/outputs_levels_30min/Lv{level}_30min.mp4"
        
        # サムネイルパスのロジックを修正
        # Lv1～Lv14まで、以下の優先順位で探す
        # 1. LvX_compressed.jpg
        # 2. LvX.png
        # 3. LvX_thumbnail_compressed.jpg (Lv1の特例対応)
        
        possible_thumbs = [
            f"videos/outputs/thumbnails/Lv{level}_30min_thumbnail.jpg", # Priority 1: New customized thumb
            f"videos/outputs/thumbnails/Lv{level}_compressed.jpg",
            f"videos/outputs/thumbnails/Lv{level}.png",
            f"videos/outputs/thumbnails/Lv{level}_thumbnail_compressed.jpg", # For Lv1 fallback
        ]
        
        # 表記ゆれ対応 (Lv.8.png, Lv.9.png)
        if level in [8, 9]:
             possible_thumbs.append(f"videos/outputs/thumbnails/Lv.{level}.png")

        thumb_path = None
        for p in possible_thumbs:
            if os.path.exists(p):
                thumb_path = p
                break
        
        if not thumb_path:
             print(f"Thumbnail for Lv{level} not found. Skipping thumbnail.")
             # thumb_path = None # already None

        print(f"Uploading Lv{level} ({video_path}) with thumb {thumb_path}...")
        try:
            upload_video(
                file_path=video_path,
                title=title,
                description=full_description,
                thumbnail_path=thumb_path,
                privacy="public"
            )
            print(f"Lv{level} uploaded successfully!")
        except Exception as e:
            print(f"Failed to upload Lv{level}: {e}")

if __name__ == "__main__":
    main()
