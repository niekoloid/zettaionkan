require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const normalizeNote = (note) => {
  return note
    .replace('C#', 'Db')
    .replace('D#', 'Eb')
    .replace('F#', 'Gb')
    .replace('G#', 'Ab')
    .replace('A#', 'Bb');
};

/**
 * 構成設定
 */
const CONFIG = {
  sampleDir: path.join(__dirname, '../Steinway_Raw/ff'),
  narrationDir: path.join(__dirname, '../public/narration/google'),
  videoAssetsDir: path.join(__dirname, '../videos/assets'),
  outputDir: path.join(__dirname, '../videos/outputs_5h_delayed'), // Separate dir for delayed versions
  durationPerChord: 5.0,
  revealDelay: 3.0, // Reveal after 3 seconds
  width: 1920,
  height: 1080,
  fps: 30,
  siteUrl: 'zettaionkan.jp',
  fullUrl: 'https://zettaionkan.jp',
  fontFile: '/System/Library/Fonts/Supplemental/Arial.ttf',
  audioBitrate: '384k',
  chords: [
    { id: 'domiso', name: '赤', notes: ['C4', 'E4', 'G4'], color: '#EF4444', narrationFile: "赤.mp3" },
    { id: 'shireso', name: '青', notes: ['B3', 'D4', 'G4'], color: '#3B82F6', narrationFile: "青.mp3" },
    { id: 'dofara', name: '黄色', notes: ['C4', 'F4', 'A4'], color: '#FFFF00', narrationFile: "黄色.mp3" },
    { id: 'radofa', name: '黒', notes: ['A3', 'C4', 'F4'], color: '#000000', narrationFile: "黒.mp3" },
    { id: 'resoshi', name: '緑', notes: ['D4', 'G4', 'B4'], color: '#16a34a', narrationFile: "緑.mp3" },
    { id: 'misodo', name: 'オレンジ', notes: ['E4', 'G4', 'C5'], color: '#F97316', narrationFile: "オレンジ.mp3" },
    { id: 'farado', name: '紫', notes: ['F4', 'A4', 'C5'], color: '#9333ea', narrationFile: "紫.mp3" },
    { id: 'soshire', name: 'ピンク', notes: ['G4', 'B4', 'D5'], color: '#fbcfe8', narrationFile: "ピンク.mp3" },
    { id: 'sodomi', name: '茶色', notes: ['G4', 'C5', 'E5'], color: '#713F12', narrationFile: "茶色.mp3" },
    { id: 'lacismi', name: '黄緑', notes: ['A3', 'C#4', 'E4'], color: '#84cc16', narrationFile: "黄緑.mp3" },
    { id: 'refisla', name: 'ベージュ', notes: ['D4', 'F#4', 'A4'], color: '#F5DEB3', narrationFile: "ベージュ.mp3" },
    { id: 'migissi', name: '薄紫', notes: ['E4', 'G#4', 'B4'], color: '#c4b5fd', narrationFile: "薄紫.mp3" },
    { id: 'berefa', name: 'グレー', notes: ['Bb3', 'D4', 'F4'], color: '#6B7280', narrationFile: "グレー.mp3" },
    { id: 'essobe', name: '水色', notes: ['Eb4', 'G4', 'Bb4'], color: '#7FDBFF', narrationFile: "水色.mp3" }
  ]
};

// フォルダ作成
if (!fs.existsSync(CONFIG.outputDir)) fs.mkdirSync(CONFIG.outputDir, { recursive: true });

const tempDir = path.join(CONFIG.outputDir, 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

async function generate() {
  console.log('🔨 QRコードを生成中...');
  const qrPath = path.join(tempDir, 'qr.png');
  await QRCode.toFile(qrPath, CONFIG.fullUrl, {
    width: 150,
    margin: 1,
    color: { dark: '#000000CC', light: '#ffffffCC' }
  });

  console.log('🔨 素材の動画クリップ (Delayed Reveal) を生成中...');
  const clips = {};

  for (const chord of CONFIG.chords) {
    const chordAudioPath = path.join(tempDir, `${chord.id}_chord.wav`);
    const narrationWavPath = path.join(CONFIG.narrationDir, chord.narrationFile);
    const finalAudioPath = path.join(tempDir, `${chord.id}_final_audio.wav`);
    const clipPath = path.join(tempDir, `${chord.id}_delayed_clip.mp4`);

    const audioInputs = chord.notes.map(n => path.join(CONFIG.sampleDir, `Piano.ff.${normalizeNote(n)}.aiff`));
    
    // 1. 和音音声をミックス
    const silenceFreeStreams = audioInputs.map((_, i) => `[${i}:a]silenceremove=start_periods=1:start_threshold=-50dB[a${i}]`).join('; ');
    const mixStreams = audioInputs.map((_, i) => `[a${i}]`).join('');
    const filterComplexAudio = `${silenceFreeStreams}; ${mixStreams}amix=inputs=${audioInputs.length}:duration=first,volume=1.8`;

    const mixCmd = `ffmpeg -y ${audioInputs.map(i => `-i "${i}"`).join(' ')} -filter_complex "${filterComplexAudio}" -t ${CONFIG.durationPerChord} "${chordAudioPath}"`;
    execSync(mixCmd, { stdio: 'ignore' });

    // 2. 和音とナレーションをミックス (Delayed Reveal: Narration at CONFIG.revealDelay)
    const narrationDelayMs = CONFIG.revealDelay * 1000;
    const overlayAudioCmd = `ffmpeg -y -i "${chordAudioPath}" -i "${narrationWavPath}" -filter_complex "[0:a]volume=1.0[p]; [1:a]adelay=${narrationDelayMs}|${narrationDelayMs},volume=0.42[n]; [p][n]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,volume=1.8" -t ${CONFIG.durationPerChord} "${finalAudioPath}"`;
    execSync(overlayAudioCmd, { stdio: 'ignore' });

    // 3. 動画クリップを生成 (White background -> Chord color after 3s)
    const brandFilter = `[1:v]format=rgba,colorchannelmixer=aa=0.7[qr]`;
    const drawtextFilter = `drawtext=fontfile='${CONFIG.fontFile}':text='${CONFIG.siteUrl}':fontcolor=black@0.6:fontsize=24:shadowcolor=white@0.4:shadowx=1:shadowy=1:x=W-tw-30:y=H-th-25`;
    
    // Delayed color reveal using drawbox (filling the whole screen)
    const colorHex = chord.color.replace('#', '0x');
    const delayedColorFilter = `drawbox=c=${colorHex}:t=fill:enable='gt(t,${CONFIG.revealDelay})'`;
    
    const filterComplexVideo = `${delayedColorFilter}; ${brandFilter}; [0:v][qr]overlay=W-w-30:H-h-60,${drawtextFilter}`;
    
    const clipCmd = `ffmpeg -y -f lavfi -i color=c=white:s=${CONFIG.width}x${CONFIG.height}:r=${CONFIG.fps}:d=${CONFIG.durationPerChord} -i "${qrPath}" -i "${finalAudioPath}" -filter_complex "${filterComplexVideo}" -c:v libx264 -tune stillimage -pix_fmt yuv420p -c:a aac -b:a ${CONFIG.audioBitrate} -shortest "${clipPath}"`;
    
    execSync(clipCmd, { stdio: 'ignore' });

    clips[chord.id] = clipPath;
    console.log(`✅ 素材生成完了: ${chord.name} (Delayed Reveal)`);
  }

  const levelOrder = [0, 2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const targetLevel = process.argv[2] ? parseInt(process.argv[2]) : null;
  const levels = targetLevel ? [targetLevel] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  for (let L of levels) {
    console.log(`\n🚀 Level ${L} (5時間版・答え遅延表示) の動画を生成開始...`);
    
    const currentLevelIndices = levelOrder.slice(0, L);
    const newChordIdx = levelOrder[L - 1];
    const oldChordIndices = levelOrder.slice(0, L - 1);
    
    let countOld, countNew, totalRepeats;
    totalRepeats = 3600;

    if (L === 1) {
      countNew = 3600;
      countOld = 0;
    } else {
      const N_old = oldChordIndices.length;
      const totalOldTarget = Math.round(totalRepeats * 0.6);
      countOld = Math.round(totalOldTarget / N_old);
      const actualTotalOld = countOld * N_old;
      countNew = totalRepeats - actualTotalOld;
    }
    
    const targetCounts = {};
    targetCounts[newChordIdx] = countNew;
    oldChordIndices.forEach(idx => {
      targetCounts[idx] = countOld;
    });

    const pool = [];
    const counts = { ...targetCounts };
    let lastIdx = -1;

    for (let i = 0; i < totalRepeats; i++) {
      let candidates = currentLevelIndices.filter(idx => counts[idx] > 0 && idx !== lastIdx);
      if (i === 0 && L > 1 && counts[newChordIdx] > 0) candidates = [newChordIdx];
      if (candidates.length === 0) candidates = currentLevelIndices.filter(idx => counts[idx] > 0);
      
      const totalWeight = candidates.reduce((sum, idx) => sum + counts[idx], 0);
      let r = Math.random() * totalWeight;
      let selectedIdx = candidates[candidates.length - 1];
      for (const idx of candidates) {
        r -= counts[idx];
        if (r <= 0) {
          selectedIdx = idx;
          break;
        }
      }
      
      pool.push(selectedIdx);
      counts[selectedIdx]--;
      lastIdx = selectedIdx;
    }

    const listPath = path.join(tempDir, `concat_list_lv${L}_5h_delayed.txt`);
    let listContent = '';
    for (const idx of pool) {
      const chord = CONFIG.chords[idx];
      listContent += `file '${clips[chord.id]}'\n`;
    }
    fs.writeFileSync(listPath, listContent);

    const finalOutput = path.join(CONFIG.outputDir, `Lv${L}_5h_delayed_reveal.mp4`);
    console.log(`🎬 Level ${L} 結合中... (5時間版・答え遅延表示)`);
    const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${finalOutput}"`;
    execSync(concatCmd, { stdio: 'ignore' });

    console.log(`✨ Level ${L} (5時間版・答え遅延表示) 完成！: ${finalOutput}`);
  }
}

generate().catch(console.error);
