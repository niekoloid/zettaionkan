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
  outputDir: path.join(__dirname, '../videos/outputs'),
  durationPerChord: 5.0,
  width: 1920,
  height: 1080,
  fps: 30,
  siteUrl: 'zettaionkan.jp',
  fullUrl: 'https://zettaionkan.jp',
  fontFile: '/System/Library/Fonts/Supplemental/Arial.ttf',
  audioBitrate: '384k', // 最高品質
  chords: [
    { id: 'domiso', name: '赤', notes: ['C4', 'E4', 'G4'], color: '#EF4444', narrationFile: "赤.wav" },
    { id: 'shireso', name: '青', notes: ['B3', 'D4', 'G4'], color: '#3B82F6', narrationFile: "青.wav" },
    { id: 'dofara', name: '黄色', notes: ['C4', 'F4', 'A4'], color: '#FFFF00', narrationFile: "黄色.wav" },
    { id: 'radofa', name: '黒', notes: ['A3', 'C4', 'F4'], color: '#000000', narrationFile: "黒.wav" },
    { id: 'resoshi', name: '緑', notes: ['D4', 'G4', 'B4'], color: '#16a34a', narrationFile: "緑.wav" },
    { id: 'misodo', name: 'オレンジ', notes: ['E4', 'G4', 'C5'], color: '#F97316', narrationFile: "オレンジ.wav" },
    { id: 'farado', name: '紫', notes: ['F4', 'A4', 'C5'], color: '#9333ea', narrationFile: "紫.wav" },
    { id: 'soshire', name: 'ピンク', notes: ['G4', 'B4', 'D5'], color: '#fbcfe8', narrationFile: "ピンク.wav" },
    { id: 'sodomi', name: '茶色', notes: ['G4', 'C5', 'E5'], color: '#713F12', narrationFile: "茶色.wav" },
    { id: 'lacismi', name: '黄緑', notes: ['A3', 'C#4', 'E4'], color: '#84cc16', narrationFile: "黄緑.wav" },
    { id: 'refisla', name: '肌色', notes: ['D4', 'F#4', 'A4'], color: '#FFCC99', narrationFile: "肌色.wav" },
    { id: 'migissi', name: '薄紫', notes: ['E4', 'G#4', 'B4'], color: '#c4b5fd', narrationFile: "薄紫.wav" },
    { id: 'berefa', name: 'グレー', notes: ['Bb3', 'D4', 'F4'], color: '#6B7280', narrationFile: "グレー.wav" },
    { id: 'essobe', name: '水色', notes: ['Eb4', 'G4', 'Bb4'], color: '#7FDBFF', narrationFile: "水色.wav" }
  ]
};

// フォルダ作成
if (!fs.existsSync(CONFIG.outputDir)) fs.mkdirSync(CONFIG.outputDir, { recursive: true });
if (!fs.existsSync(CONFIG.videoAssetsDir)) fs.mkdirSync(CONFIG.videoAssetsDir, { recursive: true });

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

    // 1. 和音音声をミックス (AIFFソースを使用 & 無音除去)
    const audioInputs = chord.notes.map(n => path.join(CONFIG.sampleDir, `Piano.ff.${normalizeNote(n)}.aiff`));
    
    // ファイル存在確認
    for (const input of audioInputs) {
      if (!fs.existsSync(input)) {
        console.error(`❌ サンプルファイルが見つかりません: ${input}`);
        process.exit(1);
      }
    }

    const silenceFreeStreams = audioInputs.map((_, i) => `[${i}:a]silenceremove=start_periods=1:start_threshold=-50dB[a${i}]`).join('; ');
    const mixStreams = audioInputs.map((_, i) => `[a${i}]`).join('');
    const filterComplexAudio = `${silenceFreeStreams}; ${mixStreams}amix=inputs=${audioInputs.length}:duration=first,volume=1.8`;

    const mixCmd = `ffmpeg -y ${audioInputs.map(i => `-i "${i}"`).join(' ')} -filter_complex "${filterComplexAudio}" -t ${CONFIG.durationPerChord} "${chordAudioPath}"`;
    execSync(mixCmd, { stdio: 'ignore' });

    // 2. 和音とナレーションをミックス (2.5秒後に再生)
    const overlayAudioCmd = `ffmpeg -y -i "${chordAudioPath}" -i "${narrationWavPath}" -filter_complex "[0:a]volume=1.0[p]; [1:a]adelay=2500|2500,volume=0.42[n]; [p][n]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,volume=1.8" -t ${CONFIG.durationPerChord} "${finalAudioPath}"`;
    execSync(overlayAudioCmd, { stdio: 'ignore' });

    // 3. 背景色 + QR + テキスト を結合
    const brandFilter = `[1:v]format=rgba,colorchannelmixer=aa=0.7[qr]`;
    const drawtextFilter = `drawtext=fontfile='${CONFIG.fontFile}':text='${CONFIG.siteUrl}':fontcolor=black@0.6:fontsize=24:shadowcolor=white@0.4:shadowx=1:shadowy=1:x=W-tw-30:y=H-th-25`;
    const filterComplexVideo = `${brandFilter}; [0:v][qr]overlay=W-w-30:H-h-60,${drawtextFilter}`;
    
    const clipCmd = `ffmpeg -y -f lavfi -i color=c=${chord.color.replace('#', '0x')}:s=${CONFIG.width}x${CONFIG.height}:r=${CONFIG.fps}:d=${CONFIG.durationPerChord} -i "${qrPath}" -i "${finalAudioPath}" -filter_complex "${filterComplexVideo}" -c:v libx264 -tune stillimage -pix_fmt yuv420p -c:a aac -b:a ${CONFIG.audioBitrate} -shortest "${clipPath}"`;
    
    execSync(clipCmd, { stdio: 'ignore' });

    clips[chord.id] = clipPath;
    console.log(`✅ 素材生成完了: ${chord.name}`);
  }

  // --- 和音の導入順序 (赤, 黄色, 青, 黒, 緑, オレンジ, 紫, ピンク, 茶色, 黄緑, 肌色, 薄紫, グレー, 水色) ---
  const levelOrder = [0, 2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

  for (let L = 1; L <= 14; L++) {
    console.log(`\n🚀 Level ${L} の動画を生成開始...`);
    
    const currentLevelIndices = levelOrder.slice(0, L);
    const newChordIdx = levelOrder[L - 1];
    const oldChordIndices = levelOrder.slice(0, L - 1);
    
    let countOld, countNew, totalRepeats;

    if (L === 1) {
      countNew = 120; // 10分
      countOld = 0;
      totalRepeats = 120;
    } else {
      // --- 4:6 の割合で配分 (新出:既出群) ---
      // 既出群(N_old個)の合計が全体の60%になるようにする
      const N_old = oldChordIndices.length;
      
      // 既出群の1色あたりの回数 c を、合計が約72回(120の60%)になるように算出
      countOld = Math.round(72 / N_old);
      const totalOld = countOld * N_old;
      
      // 新出の回数を、既出群合計の 4/6 倍にする
      countNew = Math.round(totalOld * (4 / 6));
      totalRepeats = totalOld + countNew;
    }
    
    const targetCounts = {};
    targetCounts[newChordIdx] = countNew;
    oldChordIndices.forEach(idx => {
      targetCounts[idx] = countOld;
    });

    // プレイリストの構築 (連続重複回避ロジック)
    const pool = [];
    const counts = { ...targetCounts };
    let lastIdx = -1;

    for (let i = 0; i < totalRepeats; i++) {
      let candidates = currentLevelIndices.filter(idx => counts[idx] > 0 && idx !== lastIdx);
      
      // 最初は必ず新音にする (L > 1 の場合)
      if (i === 0 && L > 1 && counts[newChordIdx] > 0) {
        candidates = [newChordIdx];
      }
      
      // 万が一候補がゼロになった場合（Lv1やLv2などの特殊ケース）
      if (candidates.length === 0) {
        candidates = currentLevelIndices.filter(idx => counts[idx] > 0);
      }
      
      // 残り数に応じた重み付きランダム選択
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

    const listPath = path.join(tempDir, `concat_list_lv${L}.txt`);
    let listContent = '';
    for (const idx of pool) {
      const chord = CONFIG.chords[idx];
      listContent += `file '${clips[chord.id]}'\n`;
    }
    fs.writeFileSync(listPath, listContent);

    // --- ファイル名用の形式作成 (新出の色 -> 既出の色の順) ---
    const nameOrder = [newChordIdx, ...[...oldChordIndices].reverse()];
    const freqString = nameOrder
      .map(idx => {
        const chord = CONFIG.chords[idx];
        const count = targetCounts[idx];
        const percent = Math.round((count / totalRepeats) * 100);
        return `${chord.name}${percent}`;
      })
      .join('_');

    // 5. 最終結合
    const finalOutput = path.join(CONFIG.outputDir, `Lv${L}_${freqString}_10min.mp4`);
    console.log(`🎬 Level ${L} 動画を結合中... (割合 4:6 | 新音:${CONFIG.chords[newChordIdx].name} ${countNew}回, 他:${countOld}回ずつ)`);
    const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${finalOutput}"`;
    execSync(concatCmd, { stdio: 'ignore' });

    console.log(`✨ Level ${L} 完成！: ${finalOutput}`);
  }
}

generate().catch(console.error);
