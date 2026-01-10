require('dotenv').config();
const fs = require('fs');
const path = require('path');
const textToSpeech = require('@google-cloud/text-to-speech');

const ttsClient = new textToSpeech.TextToSpeechClient();

const OUTPUT_DIR = path.join(__dirname, '../public/narration/google');
const VOICE_CONFIG = {
  languageCode: 'ja-JP',
  name: 'ja-JP-Neural2-B', // 最高品質の女性音声
};

// 新しい色名のみ生成
const COLORS_TO_GENERATE = [
  '藤色',
  '薄橙',
  '肌色',
  '空色',
  '灰色'
];

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateNarration(text) {
  const fileName = `${text}.mp3`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  // Force regenerate (don't skip)
  console.log(`🎙️ 生成中: ${text}...`);
  const request = {
    input: { text: text },
    voice: VOICE_CONFIG,
    audioConfig: { audioEncoding: 'MP3' }, 
  };

  try {
    const [response] = await ttsClient.synthesizeSpeech(request);
    fs.writeFileSync(filePath, response.audioContent, 'binary');
    console.log(`✅ 保存完了: ${fileName}`);
  } catch (e) {
    console.error(`❌ 生成失敗: ${text}`, e);
  }
}

async function run() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('❌ GOOGLE_APPLICATION_CREDENTIALS が設定されていません。');
    process.exit(1);
  }

  console.log('🚀 新しい色名のナレーション生成を開始します...');
  for (const color of COLORS_TO_GENERATE) {
    await generateNarration(color);
  }
  console.log('✨ すべてのナレーション生成が完了しました！');
  console.log(`保存先: ${OUTPUT_DIR}`);
}

run();
