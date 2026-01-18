
import os
import sys
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# 設定
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CLIENT_SECRETS_FILE = os.path.join(SCRIPT_DIR, 'client_secrets.json')
TOKEN_PICKLE_FILE = os.path.join(SCRIPT_DIR, 'token.pickle')
SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

def get_authenticated_service():
    credentials = None
    # token.pickle に以前の認証情報が保存されているか確認
    if os.path.exists(TOKEN_PICKLE_FILE):
        with open(TOKEN_PICKLE_FILE, 'rb') as token:
            credentials = pickle.load(token)

    # 認証情報がない、または無効な場合は再取得
    if not credentials or not credentials.valid:
        if credentials and credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
        else:
            if not os.path.exists(CLIENT_SECRETS_FILE):
                print(f"Error: {CLIENT_SECRETS_FILE} が見つかりません。")
                print("Google Cloud Console から OAuth 2.0 クライアントID（デスクトップアプリ）を作成し、JSONを保存してください。")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)
            credentials = flow.run_local_server(port=0)
        
        # 次回のために認証情報を保存
        with open(TOKEN_PICKLE_FILE, 'wb') as token:
            pickle.dump(credentials, token)

    return build('youtube', 'v3', credentials=credentials)

def upload_video(file_path, title, description, category="27", privacy="unlisted", thumbnail_path=None):
    youtube = get_authenticated_service()

    body = {
        'snippet': {
            'title': title,
            'description': description,
            'categoryId': category,
            'tags': ['絶対音感', 'ピアノ', 'トレーニング']
        },
        'status': {
            'privacyStatus': privacy,
            'selfDeclaredMadeForKids': False # 子供限定向けではない設定に変更
        }
    }

    media = MediaFileUpload(file_path, chunksize=-1, resumable=True)

    print(f"Uploading file: {file_path}")
    print(f"Title: {title}")
    
    request = youtube.videos().insert(
        part=','.join(body.keys()),
        body=body,
        media_body=media
    )

    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"Uploaded Video {int(status.progress() * 100)}%")

    video_id = response.get('id')
    print(f"Video Upload Successful! Video ID: {video_id}")

    # サムネイルのアップロード
    if thumbnail_path and os.path.exists(thumbnail_path):
        print(f"Uploading thumbnail: {thumbnail_path}")
        youtube.thumbnails().set(
            videoId=video_id,
            media_body=MediaFileUpload(thumbnail_path)
        ).execute()
        print("Thumbnail Upload Successful!")

    print(f"URL: https://www.youtube.com/watch?v={video_id}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python upload_to_youtube.py <video_file_path> <title> [description] [thumbnail_path]")
        sys.exit(1)

    file_path = sys.argv[1]
    title = sys.argv[2] if len(sys.argv) > 2 else os.path.basename(file_path)
    description = sys.argv[3] if len(sys.argv) > 3 else "自動生成された絶対音感トレーニング動画です。"
    thumbnail_path = sys.argv[4] if len(sys.argv) > 4 else None
    
    if not os.path.exists(file_path):
        print(f"Error: ファイルが見つかりません: {file_path}")
        sys.exit(1)

    upload_video(file_path, title, description, thumbnail_path=thumbnail_path)
