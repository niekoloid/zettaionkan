import os
from pydub import AudioSegment
from pydub.silence import detect_leading_silence

# ==========================================
# 設定エリア
# ==========================================
INPUT_FOLDER = "Piano.mf.Steinway"  # 解凍したフォルダ名に合わせて変更してください
OUTPUT_FOLDER = "processed_sounds"  # 出力先フォルダ
TARGET_FORMAT = "mp3"               # mp3 または m4a (iOS推奨)
BITRATE = "192k"                    # 音質 (128k, 192k, 256kなど)
SILENCE_THRESH = -50.0              # 無音判定の閾値 (dB)
# ==========================================

def trim_silence(sound, silence_threshold=-50.0, chunk_size=10):
    """
    音声の先頭と末尾の無音をカットする関数
    """
    # 先頭の無音時間を検出
    start_trim = detect_leading_silence(sound, silence_threshold=silence_threshold, chunk_size=chunk_size)
    
    # 末尾の無音時間を検出（音声を反転させて検出）
    end_trim = detect_leading_silence(sound.reverse(), silence_threshold=silence_threshold, chunk_size=chunk_size)
    
    duration = len(sound)
    # 元に戻してカット
    trimmed_sound = sound[start_trim:duration-end_trim]
    return trimmed_sound

def process_audio_files():
    # 出力フォルダがなければ作成
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)

    files = [f for f in os.listdir(INPUT_FOLDER) if f.endswith(('.aiff', '.wav', '.AIFF', '.WAV'))]
    total_files = len(files)

    print(f"--- 処理開始: {total_files}個のファイルを処理します ---")

    for i, filename in enumerate(files):
        try:
            # ファイルの読み込み
            file_path = os.path.join(INPUT_FOLDER, filename)
            sound = AudioSegment.from_file(file_path)

            # 無音カット
            trimmed_sound = trim_silence(sound, silence_threshold=SILENCE_THRESH)

            # ファイル名の整形（例: Steinway.mf.C4.aiff -> C4.mp3）
            # ファイル名に含まれる音階名（C4, Db4など）だけ抽出したい場合の簡易ロジック
            # ※必要に応じて調整してください。ここでは単純に元の名前を使います。
            name_body = os.path.splitext(filename)[0]
            export_name = f"{name_body}.{TARGET_FORMAT}"
            export_path = os.path.join(OUTPUT_FOLDER, export_name)

            # 書き出し
            trimmed_sound.export(export_path, format=TARGET_FORMAT, bitrate=BITRATE)
            
            print(f"[{i+1}/{total_files}] 完了: {export_name}")

        except Exception as e:
            print(f"[{i+1}/{total_files}] エラー: {filename} -> {e}")

    print("--- 全処理が完了しました ---")

if __name__ == "__main__":
    process_audio_files()