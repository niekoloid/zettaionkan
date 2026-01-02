import os
import shutil

# 設定
TARGET_DIR = "Steinway_Raw"
CATEGORIES = {
    "pp": "pp",
    "ff": "ff",
    "mf": "mf" 
}

def organize_files():
    # ディレクトリが存在するか確認
    if not os.path.exists(TARGET_DIR):
        print(f"ディレクトリが見つかりません: {TARGET_DIR}")
        return

    # カレゴリフォルダの作成
    for folder_name in CATEGORIES.values():
        folder_path = os.path.join(TARGET_DIR, folder_name)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
            print(f"フォルダ作成: {folder_path}")

    # ファイルの移動
    files = [f for f in os.listdir(TARGET_DIR) if os.path.isfile(os.path.join(TARGET_DIR, f))]
    count = 0

    for filename in files:
        # ファイル名からダイナミクスを判別 (.pp., .ff., .mf.)
        # 例: Piano.pp.Bb0.aiff
        parts = filename.split('.')
        if len(parts) < 2:
            continue
        
        dynamic = parts[1] # 'pp', 'ff', 'mf' など

        if dynamic in CATEGORIES:
            src_path = os.path.join(TARGET_DIR, filename)
            dest_dir = os.path.join(TARGET_DIR, CATEGORIES[dynamic])
            dest_path = os.path.join(dest_dir, filename)
            
            try:
                shutil.move(src_path, dest_path)
                # print(f"移動: {filename} -> {CATEGORIES[dynamic]}/")
                count += 1
            except Exception as e:
                print(f"エラー: {filename} の移動中に問題が発生しました: {e}")
        else:
            # 想定外のファイル名パターン
            pass
            # print(f"スキップ (一致なし): {filename}")

    print(f"完了: {count} 個のファイルを整理しました。")

if __name__ == "__main__":
    organize_files()
