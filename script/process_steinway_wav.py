import os
import aifc
import wave
import struct
import array

# ==========================================
# Configuration Area
# ==========================================
BASE_INPUT_FOLDER = "Steinway_Raw"
BASE_OUTPUT_FOLDER = "public/samples/steinway"
DYNAMICS = ["ff"]
SILENCE_THRESHOLD = 500  # Amplitude threshold for silence
# ==========================================

def trim_silence_and_save_as_wav(input_path, output_path):
    """
    Reads AIFF, trims leading silence, limits duration, and saves as WAV.
    """
    try:
        if not os.path.exists(input_path):
            return False

        with aifc.open(input_path, 'rb') as af:
            params = af.getparams()
            n_frames = af.getnframes()
            frames_raw = af.readframes(n_frames)
            
        samples = array.array('h', frames_raw)
        if struct.pack('H', 1) == b'\x01\x00': # Little-Endian system
            samples.byteswap()
            
        # Find start of audio (skip leading silence)
        start_idx = 0
        channels = params.nchannels
        for i in range(0, len(samples), channels):
            peak = max(abs(samples[i+j]) for j in range(channels))
            if peak > SILENCE_THRESHOLD:
                start_idx = i
                break
        
        # Use content from start_idx to end (no duration limit)
        trimmed_samples = samples[start_idx:]
        
        with wave.open(output_path, 'wb') as wf:
            wf.setnchannels(params.nchannels)
            wf.setsampwidth(params.sampwidth)
            wf.setframerate(params.framerate)
            wf.writeframes(trimmed_samples.tobytes())
            
        return True
    except Exception as e:
        print(f"Error processing {input_path}: {e}")
        return False

def is_subset_note(note_name):
    """
    Originally used to filter for a subset (C, Eb, Gb, A).
    Now returns True for all notes to process everything.
    """
    return True

def process_all_dynamics():
    for dyn in DYNAMICS:
        input_dir = os.path.join(BASE_INPUT_FOLDER, dyn)
        output_dir = os.path.join(BASE_OUTPUT_FOLDER, dyn)
        
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        if not os.path.exists(input_dir):
            print(f"[{dyn}] Input directory not found: {input_dir}")
            continue

        files = [f for f in os.listdir(input_dir) if f.endswith(('.aiff', '.AIFF'))]
        print(f"[{dyn}] Found {len(files)} files. Processing ALL notes...")

        success_count = 0
        for filename in files:
            parts = filename.split('.')
            if len(parts) >= 3:
                note_name = parts[2]
            else:
                continue
                
            # No filtering anymore
            # if not is_subset_note(note_name):
            #    continue
                
            output_filename = f"{note_name}.wav"
            input_path = os.path.join(input_dir, filename)
            output_path = os.path.join(output_dir, output_filename)
            
            if trim_silence_and_save_as_wav(input_path, output_path):
                success_count += 1
                
        print(f"[{dyn}] Finished! Processed {success_count} files.")

if __name__ == "__main__":
    process_all_dynamics()
