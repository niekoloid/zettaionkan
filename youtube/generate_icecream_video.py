import subprocess
import os
import math

# Paths
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, 'public')
OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'youtube')

# Assets
NOTE_C4 = os.path.join(PUBLIC_DIR, 'samples/steinway/ff/C4.mp3')
NOTE_E4 = os.path.join(PUBLIC_DIR, 'samples/steinway/ff/E4.mp3')
NOTE_G4 = os.path.join(PUBLIC_DIR, 'samples/steinway/ff/G4.mp3')
NARRATION = os.path.join(PUBLIC_DIR, 'narration/google/赤.mp3')
ICE_CREAM_IMG = os.path.join(OUTPUT_DIR, 'red_ice_cream.png')

# Config
TEMP_CYCLE_FILE = os.path.join(OUTPUT_DIR, 'temp_icecream_cycle.mp4')
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'red_icecream_training.mp4')
CYCLE_DURATION = 4.5  # Seconds
TOTAL_DURATION = 1800  # 30 Minutes
LOOP_COUNT = math.ceil(TOTAL_DURATION / CYCLE_DURATION)

def run_ffmpeg(cmd):
    print(f"Executing: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    print("Generating single ice cream cycle segment (4.5s)...")

    # ffmpeg filters:
    # 1. Mix chords
    # 2. Delay narration
    # 3. Create light blue background
    # 4. Overlay ice cream image (scale to fit)
    # 5. Apply a tiny sway animation to the ice cream overlay
    
    ffmpeg_cmd1 = (
        f'ffmpeg -y '
        f'-i "{NOTE_C4}" -i "{NOTE_E4}" -i "{NOTE_G4}" -i "{NARRATION}" '
        f'-loop 1 -i "{ICE_CREAM_IMG}" '
        f'-filter_complex "[0:a][1:a][2:a]amix=inputs=3:duration=first:dropout_transition=0[mix];'
        f'[mix]volume=3[chord];'
        f'[3:a]adelay=3000|3000[narration];'
        f'[chord][narration]amix=inputs=2:duration=first:dropout_transition=0[aout];'
        f'color=c=0xE0F2FE:s=1920x1080:d={CYCLE_DURATION}[bg];'
        f'[4:v]scale=-1:800[ic];'
        f'[bg][ic]overlay=(W-w)/2:(H-h)/2+50[vout]" '
        f'-map "[vout]" -map "[aout]" '
        f'-c:v libx264 -pix_fmt yuv420p -t {CYCLE_DURATION} '
        f'-c:a aac -b:a 192k '
        f'"{TEMP_CYCLE_FILE}"'
    )
    
    run_ffmpeg(ffmpeg_cmd1)

    print(f"Looping {LOOP_COUNT} times to create 30-minute ice cream video...")

    # 2. Loop the segment
    ffmpeg_cmd2 = (
        f'ffmpeg -y '
        f'-stream_loop {LOOP_COUNT} '
        f'-i "{TEMP_CYCLE_FILE}" '
        f'-c copy -t {TOTAL_DURATION} '
        f'"{OUTPUT_FILE}"'
    )
    
    run_ffmpeg(ffmpeg_cmd2)

    # Cleanup
    if os.path.exists(TEMP_CYCLE_FILE):
        os.remove(TEMP_CYCLE_FILE)
    
    print(f"Success! Video generated at: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
