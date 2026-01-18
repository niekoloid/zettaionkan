import os
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CLIENT_SECRETS_FILE = os.path.join(SCRIPT_DIR, 'client_secrets.json')
TOKEN_PICKLE_FILE = os.path.join(SCRIPT_DIR, 'token_manage.pickle')
# Need youtube scope to delete videos
SCOPES = ['https://www.googleapis.com/auth/youtube']

def get_authenticated_service():
    credentials = None
    if os.path.exists(TOKEN_PICKLE_FILE):
        with open(TOKEN_PICKLE_FILE, 'rb') as token:
            credentials = pickle.load(token)

    if not credentials or not credentials.valid:
        if credentials and credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE, SCOPES)
            credentials = flow.run_local_server(port=0)
        
        with open(TOKEN_PICKLE_FILE, 'wb') as token:
            pickle.dump(credentials, token)

    return build('youtube', 'v3', credentials=credentials)

def delete_video(video_id):
    youtube = get_authenticated_service()
    try:
        youtube.videos().delete(id=video_id).execute()
        print(f"Deleted: {video_id}")
        return True
    except Exception as e:
        print(f"Failed to delete {video_id}: {e}")
        return False

if __name__ == "__main__":
    # Lv2-14 (5h versions) to delete - replace with actual video IDs
    video_ids_to_delete = [
        # Lv9: MurMi0R31y4
        "MurMi0R31y4",
        # Lv10: IF2wBXiIpzk
        "IF2wBXiIpzk",
        # Lv11: kcNXcJfdPeA
        "kcNXcJfdPeA",
        # Lv12: CtbrPbW0cWY
        "CtbrPbW0cWY",
        # Lv13: aJctKjV6Mno
        "aJctKjV6Mno",
        # Lv14: CdMUZU9ylWA
        "CdMUZU9ylWA",
        # Lv14 Delayed: 5HAd0FXz1x4
        "5HAd0FXz1x4",
    ]
    
    print(f"Deleting {len(video_ids_to_delete)} videos...")
    for vid in video_ids_to_delete:
        delete_video(vid)
    print("Done!")
