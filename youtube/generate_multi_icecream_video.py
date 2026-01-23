import subprocess
import os
import math

# Paths
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, 'public')
OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'youtube')

# Config
CYCLE_DURATION = 4.5
TOTAL_DURATION = 1800  # 30 Minutes
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'multi_icecream_training.mp4')
TEMP_ROUND_FILE = os.path.join(OUTPUT_DIR, 'temp_round.mp4')

# Chord definitions
CHORDS = [
    {
        'id': 'red',
        'notes': ['C4', 'E4', 'G4'],
        'narration': '赤',
        'image': 'red_ice_cream_transparent.png',
        'bg_color': '0xE0F2FE' # Light Blue
    },
    {
        'id': 'yellow',
        'notes': ['C4', 'F4', 'A4'],
        'narration': '黄色',
        'image': 'yellow_ice_cream_transparent.png',
        'bg_color': '0xFEF9C3' # Light Yellow
    },
    {
        'id': 'blue',
        'notes': ['B3', 'D4', 'G4'],
        'narration': '青',
        'image': 'blue_ice_cream_transparent.png',
        'bg_color': '0xDBEAFE' # Light Blue/Purple
    }
]

def run_ffmpeg(cmd):
    print(f"Executing: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

def generate_segment(chord, output_path):
    note_paths = [os.path.join(PUBLIC_DIR, f'samples/steinway/ff/{n}.mp3') for n in chord['notes']]
    narr_path = os.path.join(PUBLIC_DIR, f'narration/google/{chord["narration"]}.mp3')
    img_path = os.path.join(OUTPUT_DIR, chord['image'])
    
    inputs = "".join([f'-i "{p}" ' for p in note_paths])
    inputs += f'-i "{narr_path}" -loop 1 -i "{img_path}"'
    
    # note inputs are 0,1,2. narr is 3. img is 4.
    filter_complex = (
        f'"[0:a][1:a][2:a]amix=inputs=3:duration=first:dropout_transition=0[mix];'
        f'[mix]volume=3[chord];'
        f'[3:a]adelay=3000|3000[narration];'
        f'[chord][narration]amix=inputs=2:duration=first:dropout_transition=0[aout];'
        f'color=c={chord["bg_color"]}:s=1920x1080:d={CYCLE_DURATION}[bg];'
        f'[4:v]scale=-1:800[ic];'
        f'[bg][ic]overlay=(W-w)/2:(H-h)/2+50[vout]"'
    )
    
    cmd = (
        f'ffmpeg -y {inputs} '
        f'-filter_complex {filter_complex} '
        f'-map "[vout]" -map "[aout]" '
        f'-c:v libx264 -pix_fmt yuv420p -t {CYCLE_DURATION} '
        f'-c:a aac -b:a 192k "{output_path}"'
    )
    run_ffmpeg(cmd)

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    temp_segments = []
    for chord in CHORDS:
        out = os.path.join(OUTPUT_DIR, f'temp_{chord["id"]}.mp4')
        generate_segment(chord, out)
        temp_segments.append(out)

    print("Concatenating segments into a single round...")
    # Concat segments
    concat_list = os.path.join(OUTPUT_DIR, 'concat_list.txt')
    with open(concat_list, 'w') as f:
        for p in temp_segments:
            f.write(f"file '{os.path.basename(p)}'\n")

    run_ffmpeg(f'ffmpeg -y -f concat -i "{concat_list}" -c copy "{TEMP_ROUND_FILE}"')

    round_duration = len(CHORDS) * CYCLE_DURATION
    loop_count = math.ceil(TOTAL_DURATION / round_duration)
    
    print(f"Looping {loop_count} times to create final 30-minute video...")
    run_ffmpeg(f'ffmpeg -y -stream_loop {loop_count} -i "{TEMP_ROUND_FILE}" -c copy -t {TOTAL_DURATION} "{OUTPUT_FILE}"')

    # Cleanup
    os.remove(concat_list)
    os.remove(TEMP_ROUND_FILE)
    for p in temp_segments:
        os.remove(p)
        
    print(f"Success! Video generated at: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
