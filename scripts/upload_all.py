
import os
import glob
import sys
# scriptsディレクトリ内にあるupload_videoをインポートするためにパスを追加
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from upload_to_youtube import upload_video

def main():
    video_dir = "/Users/shun/src/zettaionkan/videos/outputs"
    # Lv1からLv14までの動画を取得
    videos = glob.glob(os.path.join(video_dir, "Lv*_10min.mp4"))
    
    # レベル順にソート (Lv1, Lv2, ..., Lv14)
    def get_level(path):
        filename = os.path.basename(path)
        try:
            return int(filename.split('_')[0].replace('Lv', ''))
        except:
            return 999
            
    videos.sort(key=get_level)

    common_desc_prefix = "https://zettaionkan.jp\n\n毎日1分でできる、聴くだけの絶対音感トレーニング動画です。\n"

    for video_path in videos:
        filename = os.path.basename(video_path)
        # 例: Lv1_赤100_10min.mp4 -> parts=['Lv1', '赤100', '10min.mp4']
        parts = filename.split('_')
        if len(parts) < 2:
            continue
            
        lv_str = parts[0]
        chord_info = parts[1]
        
        # タイトルの生成
        # 赤100 -> 赤
        clean_chord_name = chord_info.replace('100', '').replace('40', '')
        title = f"{lv_str} {clean_chord_name} | 絶対音感トレーニング 10分連続聴き流し"
        
        # 説明文の生成
        description = f"{common_desc_prefix}\n構成内容: {chord_info.replace('40', '（新音 40%）').replace('100', '（新音 100%）')}\n\n#絶対音感 #ピアノ #トレーニング #音感教育"
        
        # サムネイルパスの推測
        thumbnail_path = video_path.replace(".mp4", ".png")

        print(f"\n🚀 Ready to upload: {title}")
        print(f"   Video: {filename}")
        
        try:
            upload_video(
                video_path, 
                title, 
                description, 
                thumbnail_path=thumbnail_path if os.path.exists(thumbnail_path) else None,
                privacy="public" # 一般公開
            )
        except Exception as e:
            print(f"❌ Error uploading {lv_str}: {e}")

if __name__ == "__main__":
    main()
