import os
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# ==========================================
# 設定エリア
# ==========================================
# アイオワ大学 ピアノ音源ページ
TARGET_URL = "https://theremin.music.uiowa.edu/MISpiano.html"
# 保存先フォルダ名
DOWNLOAD_FOLDER = "Steinway_Raw"
# ダウンロードする対象の拡張子
TARGET_EXTS = (".aiff", ".AIFF", ".wav", ".WAV", ".zip")
# ==========================================

def download_files():
    # 保存先フォルダを作成
    if not os.path.exists(DOWNLOAD_FOLDER):
        os.makedirs(DOWNLOAD_FOLDER)
        print(f"フォルダ作成: {DOWNLOAD_FOLDER}")

    print(f"サイト情報取得中: {TARGET_URL}")
    try:
        response = requests.get(TARGET_URL)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"エラー: サイトにアクセスできませんでした。 {e}")
        return

    soup = BeautifulSoup(response.content, "html.parser")
    
    # リンクを全て取得してフィルタリング
    links = soup.find_all("a")
    target_links = []
    
    for link in links:
        href = link.get("href")
        if href and href.endswith(TARGET_EXTS):
            # 相対パスを絶対パスに変換
            full_url = urljoin(TARGET_URL, href)
            target_links.append(full_url)

    total_files = len(target_links)
    print(f"--- {total_files} 個のファイルが見つかりました。ダウンロードを開始します ---")

    for i, file_url in enumerate(target_links):
        file_name = os.path.basename(file_url)
        save_path = os.path.join(DOWNLOAD_FOLDER, file_name)

        # 既に同名ファイルがある場合はスキップ（再開用）
        if os.path.exists(save_path):
            print(f"[{i+1}/{total_files}] スキップ（済み）: {file_name}")
            continue

        try:
            print(f"[{i+1}/{total_files}] ダウンロード中...: {file_name}")
            file_data = requests.get(file_url, stream=True)
            
            with open(save_path, "wb") as f:
                for chunk in file_data.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # サーバー負荷軽減のため少し待機
            time.sleep(0.5)

        except Exception as e:
            print(f"  × エラー: {file_name} -> {e}")

    print("\n--- 全てのダウンロードが完了しました ---")
    print(f"保存場所: {os.path.abspath(DOWNLOAD_FOLDER)}")

if __name__ == "__main__":
    download_files()
