import os
import aifc
import wave
import struct
import array

# ==========================================
# Configuration Area
# ==========================================
INPUT_FOLDER = "Steinway_Raw/mf"
OUTPUT_FOLDER = "public/samples/steinway"
SILENCE_THRESHOLD = 500  # Amplitude threshold for silence (adjust if needed)
# ==========================================

def trim_silence_and_save_as_wav(input_path, output_path):
    """
    Reads AIFF, trims leading silence, and saves as WAV.
    """
    try:
        with aifc.open(input_path, 'rb') as af:
            params = af.getparams()
            n_frames = af.getnframes()
            # Read all frames as raw bytes
            frames_raw = af.readframes(n_frames)
            
        # Convert to signed 16-bit integers (assuming 16-bit AIFF)
        # Note: AIFF is Big-Endian
        samples = array.array('h', frames_raw)
        if struct.pack('H', 1) == b'\x01\x00': # Little-Endian system
            samples.byteswap()
            
        # Find start of audio (skip leading silence)
        start_idx = 0
        channels = params.nchannels
        for i in range(0, len(samples), channels):
            # Check maximum amplitude across all channels in this frame
            peak = max(abs(samples[i+j]) for j in range(channels))
            if peak > SILENCE_THRESHOLD:
                start_idx = i
                break
        
        trimmed_samples = samples[start_idx:]
        
        # Save as WAV (Little-Endian)
        with wave.open(output_path, 'wb') as wf:
            wf.setnchannels(params.nchannels)
            wf.setsampwidth(params.sampwidth)
            wf.setframerate(params.framerate)
            wf.writeframes(trimmed_samples.tobytes())
            
        return True
    except Exception as e:
        print(f"Error processing {input_path}: {e}")
        return False

def process_files():
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)
        print(f"Created folder: {OUTPUT_FOLDER}")

    if not os.path.exists(INPUT_FOLDER):
        print(f"Input folder not found: {INPUT_FOLDER}")
        return

    # Process samples (selecting a subset if needed, but here we process all in mf)
    files = [f for f in os.listdir(INPUT_FOLDER) if f.endswith(('.aiff', '.AIFF'))]
    print(f"Found {len(files)} files. Processing...")

    success_count = 0
    for filename in files:
        # Simplify filename: Piano.mf.C4.aiff -> C4.wav
        parts = filename.split('.')
        if len(parts) >= 3:
            note_name = parts[2]
            output_filename = f"{note_name}.wav"
        else:
            output_filename = filename.replace('.aiff', '.wav').replace('.AIFF', '.wav')
            
        input_path = os.path.join(INPUT_FOLDER, filename)
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)
        
        if trim_silence_and_save_as_wav(input_path, output_path):
            # print(f"Processed: {filename} -> {output_filename}")
            success_count += 1
            
    print(f"Finished! Processed {success_count}/{len(files)} files.")

if __name__ == "__main__":
    process_files()
