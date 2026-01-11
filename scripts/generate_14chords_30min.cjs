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
  outputDir: path.join(__dirname, '../videos/outputs_14chords_30min'),
  durationPerChord: 5.0,
  width: 1920,
  height: 1080,
  fps: 30,
  siteUrl: 'zettaionkan.jp',
  fullUrl: 'https://zettaionkan.jp',
  fontFile: '/System/Library/Fonts/Supplemental/Arial.ttf',
  audioBitrate: '384k',
  chords: [
    { id: 'domiso', name: '赤', notes: ['C4', 'E4', 'G4'], color: '#FF0000', narrationFile: "赤.mp3" },
    { id: 'shireso', name: '青', notes: ['B3', 'D4', 'G4'], color: '#0000FF', narrationFile: "青.mp3" },
    { id: 'dofara', name: '黄色', notes: ['C4', 'F4', 'A4'], color: '#FFFF00', narrationFile: "黄色.mp3" },
    { id: 'radofa', name: '黒', notes: ['A3', 'C4', 'F4'], color: '#000000', narrationFile: "黒.mp3" },
    { id: 'resoshi', name: '緑', notes: ['D4', 'G4', 'B4'], color: '#00FF00', narrationFile: "緑.mp3" },
    { id: 'misodo', name: 'オレンジ', notes: ['E4', 'G4', 'C5'], color: '#FF8000', narrationFile: "オレンジ.mp3" },
    { id: 'farado', name: '紫', notes: ['F4', 'A4', 'C5'], color: '#800080', narrationFile: "紫.mp3" },
    { id: 'soshire', name: 'ピンク', notes: ['G4', 'B4', 'D5'], color: '#FF69B4', narrationFile: "ピンク.mp3" },
    { id: 'sodomi', name: '茶色', notes: ['G4', 'C5', 'E5'], color: '#8B4513', narrationFile: "茶色.mp3" },
    { id: 'lacismi', name: '黄緑', notes: ['A3', 'C#4', 'E4'], color: '#7FFF00', narrationFile: "黄緑.mp3" },
    { id: 'refisla', name: '薄橙', notes: ['D4', 'F#4', 'A4'], color: '#F5DEB3', narrationFile: "薄橙.mp3" },
    { id: 'migissi', name: '藤色', notes: ['E4', 'G#4', 'B4'], color: '#DDA0DD', narrationFile: "藤色.mp3" },
    { id: 'berefa', name: '灰色', notes: ['Bb3', 'D4', 'F4'], color: '#808080', narrationFile: "灰色.mp3" },
    { id: 'essobe', name: '水色', notes: ['Eb4', 'G4', 'Bb4'], color: '#00FFFF', narrationFile: "水色.mp3" }
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

  console.log('🔨 素材の動画クリップを生成中...');
  const clips = {};

  for (const chord of CONFIG.chords) {
    const chordAudioPath = path.join(tempDir, `${chord.id}_chord.wav`);
    const narrationWavPath = path.join(CONFIG.narrationDir, chord.narrationFile);
    const finalAudioPath = path.join(tempDir, `${chord.id}_final_audio.wav`);
    const clipPath = path.join(tempDir, `${chord.id}_clip.mp4`);

    if (!fs.existsSync(narrationWavPath)) {
      console.error(`❌ ナレーションファイルが見つかりません: ${narrationWavPath}`);
      process.exit(1);
    }

    const audioInputs = chord.notes.map(n => path.join(CONFIG.sampleDir, `Piano.ff.${normalizeNote(n)}.aiff`));
    
    // 1. 和音音声をミックス
    const silenceFreeStreams = audioInputs.map((_, i) => `[${i}:a]silenceremove=start_periods=1:start_threshold=-50dB[a${i}]`).join('; ');
    const mixStreams = audioInputs.map((_, i) => `[a${i}]`).join('');
    const filterComplexAudio = `${silenceFreeStreams}; ${mixStreams}amix=inputs=${audioInputs.length}:duration=first,volume=1.8`;

    const mixCmd = `ffmpeg -y ${audioInputs.map(i => `-i "${i}"`).join(' ')} -filter_complex "${filterComplexAudio}" -t ${CONFIG.durationPerChord} "${chordAudioPath}"`;
    execSync(mixCmd, { stdio: 'ignore' });

    // 2. 和音とナレーションをミックス
    const overlayAudioCmd = `ffmpeg -y -i "${chordAudioPath}" -i "${narrationWavPath}" -filter_complex "[0:a]volume=1.0[p]; [1:a]adelay=2500|2500,volume=0.42[n]; [p][n]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,volume=1.8" -t ${CONFIG.durationPerChord} "${finalAudioPath}"`;
    execSync(overlayAudioCmd, { stdio: 'ignore' });

    // 3. 動画クリップを生成
    const brandFilter = `[1:v]format=rgba,colorchannelmixer=aa=0.7[qr]`;
    const drawtextFilter = `drawtext=fontfile='${CONFIG.fontFile}':text='${CONFIG.siteUrl}':fontcolor=black@0.6:fontsize=24:shadowcolor=white@0.4:shadowx=1:shadowy=1:x=W-tw-30:y=H-th-25`;
    const filterComplexVideo = `${brandFilter}; [0:v][qr]overlay=W-w-30:H-h-60,${drawtextFilter}`;
    
    const clipCmd = `ffmpeg -y -f lavfi -i color=c=${chord.color.replace('#', '0x')}:s=${CONFIG.width}x${CONFIG.height}:r=${CONFIG.fps}:d=${CONFIG.durationPerChord} -i "${qrPath}" -i "${finalAudioPath}" -filter_complex "${filterComplexVideo}" -c:v libx264 -tune stillimage -pix_fmt yuv420p -c:a aac -b:a ${CONFIG.audioBitrate} -shortest "${clipPath}"`;
    
    execSync(clipCmd, { stdio: 'ignore' });

    clips[chord.id] = clipPath;
    console.log(`✅ 素材生成完了: ${chord.name}`);
  }

  // 全14和音ランダム 30分版の生成
  console.log(`\n🚀 全14和音 (30分版) の動画を生成開始...`);

  const totalDurationMin = 30;
  const totalDurationSec = totalDurationMin * 60;
  const totalRepeats = Math.ceil(totalDurationSec / CONFIG.durationPerChord); // 1800 / 5 = 360 回

  const pool = [];
  const chordIndices = Array.from({ length: 14 }, (_, i) => i); // 0 to 13

  for (let i = 0; i < totalRepeats; i++) {
    // 完全ランダム
    const randomIdx = Math.floor(Math.random() * chordIndices.length);
    pool.push(randomIdx);
  }

  const listPath = path.join(tempDir, `concat_list_14chords_30min.txt`);
  let listContent = '';
  for (const idx of pool) {
    const chord = CONFIG.chords[idx];
    listContent += `file '${clips[chord.id]}'\n`;
  }
  fs.writeFileSync(listPath, listContent);

  // 最終結合
  const finalOutput = path.join(CONFIG.outputDir, `All14Chords_30min.mp4`);
  console.log(`🎬 結合中... (30分版)`);
  const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${finalOutput}"`;
  execSync(concatCmd, { stdio: 'ignore' });

  console.log(`✨ 全14和音 (30分版) 完成！: ${finalOutput}`);
}

generate().catch(console.error);
