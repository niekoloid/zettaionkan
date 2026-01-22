import type { SubscriptionTier } from '~/composables/usePro'

export type FeatureKey = 
  // --- Pages ---
  | 'page_index'            // ホーム
  | 'page_autoplay'         // 和音の聞き流し
  | 'page_chordquiz'        // 和音クイズ
  | 'page_single_note_test' // 単音テスト
  | 'page_history'          // 学習履歴
  | 'page_songs'            // 課題曲
  | 'page_voice_settings'   // 声の管理/設定
  | 'page_settings'         // 一般設定
  
  // --- Chord Access (Home) ---
  | 'home_chord_domiso'      // 赤
  | 'home_chord_dofara'      // 黄色
  | 'home_chord_shireso'     // 青
  | 'home_chord_radofa'      // 黒
  | 'home_chord_resoshi'     // 緑
  | 'home_chord_misodo'      // オレンジ
  | 'home_chord_farado'      // 紫
  | 'home_chord_soshire'     // ピンク
  | 'home_chord_sodomi'      // 茶色
  | 'home_chord_lacismi'     // 黄緑
  | 'home_chord_refisla'     // ベージュ
  | 'home_chord_migissi'     // 薄紫
  | 'home_chord_berefa'      // グレー
  | 'home_chord_essobe'      // 水色

  // --- Chord Access (Autoplay) ---
  | 'autoplay_chord_domiso'
  | 'autoplay_chord_dofara'
  | 'autoplay_chord_shireso'
  | 'autoplay_chord_radofa'
  | 'autoplay_chord_resoshi'
  | 'autoplay_chord_misodo'
  | 'autoplay_chord_farado'
  | 'autoplay_chord_soshire'
  | 'autoplay_chord_sodomi'
  | 'autoplay_chord_lacismi'
  | 'autoplay_chord_refisla'
  | 'autoplay_chord_migissi'
  | 'autoplay_chord_berefa'
  | 'autoplay_chord_essobe'

  // --- Components & Logic Features ---
  | 'instrument_steinway'   // Steinway 音源
  | 'parent_voice'          // 保護者の声モード
  
  // --- Autoplay Display Modes ---
  | 'mode_icecream'         // アイス
  | 'mode_cat'              // ねこ
  | 'mode_video_cat'        // 動画ねこ
  | 'mode_cat_flag'         // ねこ旗揚げ
  | 'mode_train'            // 電車
  | 'mode_vehicle'          // 車

  // --- Settings ---
  | 'settings_instrument_yamaha'
  | 'settings_instrument_steinway'
  | 'settings_keyboard_sound'
  | 'settings_color_format'
  | 'settings_color_format_hiragana'
  | 'settings_naming_convention'
  | 'settings_chord_customization'
  
  // --- Quiz Settings ---
  | 'quiz_content_black_keys'
  | 'quiz_settings_frequency'

  // --- Single Note Test Settings ---
  | 'singlenote_setting_white_keys'
  | 'singlenote_setting_match_octave'
  | 'singlenote_setting_88_keys'

  // --- History Features ---
  | 'history_detailed_view'
  | 'history_delete_feature'

export interface FeatureConfig {
  tier: SubscriptionTier
  enabled: boolean
}

export const FEATURE_GATES: Record<FeatureKey, FeatureConfig> = {
  // --- Page Access ---
  'page_index': { tier: 'free', enabled: true },
  'page_autoplay': { tier: 'free', enabled: true },
  'page_chordquiz': { tier: 'free', enabled: true },
  'page_single_note_test': { tier: 'free', enabled: true },
  'page_history': { tier: 'free', enabled: true },
  'page_songs': { tier: 'premium', enabled: true },
  'page_voice_settings': { tier: 'free', enabled: true },
  'page_settings': { tier: 'free', enabled: true },

  // --- Chord Access (Home) ---
  'home_chord_domiso':      { tier: 'free',  enabled: true },
  'home_chord_dofara':      { tier: 'free',  enabled: true },
  'home_chord_shireso':     { tier: 'free',  enabled: true },
  'home_chord_radofa':      { tier: 'free',  enabled: true },
  'home_chord_resoshi':     { tier: 'free',  enabled: true },
  'home_chord_misodo':      { tier: 'free',  enabled: true },
  'home_chord_farado':      { tier: 'free',  enabled: true },
  'home_chord_soshire':     { tier: 'free',  enabled: true },
  'home_chord_sodomi':      { tier: 'free',  enabled: true },
  'home_chord_lacismi':     { tier: 'free',  enabled: true },
  'home_chord_refisla':     { tier: 'free',  enabled: true },
  'home_chord_migissi':     { tier: 'free',  enabled: true },
  'home_chord_berefa':      { tier: 'free',  enabled: true },
  'home_chord_essobe':      { tier: 'free',  enabled: true },

  // --- Chord Access (Autoplay) ---
  'autoplay_chord_domiso':  { tier: 'free',    enabled: true },
  'autoplay_chord_dofara':  { tier: 'premium', enabled: true },
  'autoplay_chord_shireso': { tier: 'premium', enabled: true },
  'autoplay_chord_radofa':  { tier: 'premium', enabled: true },
  'autoplay_chord_resoshi': { tier: 'premium', enabled: true },
  'autoplay_chord_misodo':  { tier: 'premium', enabled: true },
  'autoplay_chord_farado':  { tier: 'premium', enabled: true },
  'autoplay_chord_soshire': { tier: 'premium', enabled: true },
  'autoplay_chord_sodomi':  { tier: 'premium', enabled: true },
  'autoplay_chord_lacismi': { tier: 'premium', enabled: true },
  'autoplay_chord_refisla': { tier: 'premium', enabled: true },
  'autoplay_chord_migissi': { tier: 'premium', enabled: true },
  'autoplay_chord_berefa':  { tier: 'premium', enabled: true },
  'autoplay_chord_essobe':  { tier: 'premium', enabled: true },

  // --- Content Features ---
  'instrument_steinway': { tier: 'premium', enabled: true },
  'parent_voice': { tier: 'premium', enabled: false },

  // --- Autoplay Specific Modes ---
  'mode_icecream': { tier: 'premium', enabled: true },
  'mode_cat': { tier: 'premium', enabled: false },
  'mode_video_cat': { tier: 'premium', enabled: false },
  'mode_cat_flag': { tier: 'premium', enabled: false },
  'mode_train': { tier: 'premium', enabled: true },
  'mode_vehicle': { tier: 'premium', enabled: false },

  // --- Settings ---
  'settings_instrument_yamaha': { tier: 'free', enabled: true },
  'settings_instrument_steinway': { tier: 'premium', enabled: true },
  'settings_keyboard_sound': { tier: 'premium', enabled: true },
  'settings_color_format': { tier: 'free', enabled: true },
  'settings_color_format_hiragana': { tier: 'premium', enabled: true },
  'settings_naming_convention': { tier: 'free', enabled: true },
  'settings_chord_customization': { tier: 'premium', enabled: true },

  // --- Quiz Settings ---
  'quiz_content_black_keys': { tier: 'premium', enabled: true },
  'quiz_settings_frequency': { tier: 'free', enabled: true },

  // --- Single Note Test Settings ---
  'singlenote_setting_white_keys': { tier: 'premium', enabled: true },
  'singlenote_setting_match_octave': { tier: 'premium', enabled: true },
  'singlenote_setting_88_keys': { tier: 'premium', enabled: true },

  // --- History Features ---
  'history_detailed_view': { tier: 'premium', enabled: true },
  'history_delete_feature': { tier: 'free', enabled: true },
}

export const FEATURE_DESCRIPTIONS: Record<FeatureKey, string> = {
  // --- Pages ---
  'page_index': 'ホーム',
  'page_autoplay': '和音の聞き流し',
  'page_chordquiz': '和音クイズ',
  'page_single_note_test': '単音テスト',
  'page_history': '学習履歴',
  'page_songs': '課題曲',
  'page_voice_settings': '声の管理/設定',
  'page_settings': '一般設定',

  // --- Chord Access (Home) ---
  'home_chord_domiso': 'ホーム: 赤 (ドミソ)',
  'home_chord_dofara': 'ホーム: 黄色 (ドファラ)',
  'home_chord_shireso': 'ホーム: 青 (シレソ)',
  'home_chord_radofa': 'ホーム: 黒 (ラドファ)',
  'home_chord_resoshi': 'ホーム: 緑 (レソシ)',
  'home_chord_misodo': 'ホーム: オレンジ (ミソド)',
  'home_chord_farado': 'ホーム: 紫 (ファラド)',
  'home_chord_soshire': 'ホーム: ピンク (ソシレ)',
  'home_chord_sodomi': 'ホーム: 茶色 (ソドミ)',
  'home_chord_lacismi': 'ホーム: 黄緑 (ラド#ミ)',
  'home_chord_refisla': 'ホーム: ベージュ (レファ#ラ)',
  'home_chord_migissi': 'ホーム: 薄紫 (ミソ#シ)',
  'home_chord_berefa': 'ホーム: グレー (シ♭レファ)',
  'home_chord_essobe': 'ホーム: 水色 (ミ♭ソシ♭)',

  // --- Chord Access (Autoplay) ---
  'autoplay_chord_domiso': '聞き流し: 赤 (ドミソ)',
  'autoplay_chord_dofara': '聞き流し: 黄色 (ドファラ)',
  'autoplay_chord_shireso': '聞き流し: 青 (シレソ)',
  'autoplay_chord_radofa': '聞き流し: 黒 (ラドファ)',
  'autoplay_chord_resoshi': '聞き流し: 緑 (レソシ)',
  'autoplay_chord_misodo': '聞き流し: オレンジ (ミソド)',
  'autoplay_chord_farado': '聞き流し: 紫 (ファラド)',
  'autoplay_chord_soshire': '聞き流し: ピンク (ソシレ)',
  'autoplay_chord_sodomi': '聞き流し: 茶色 (ソドミ)',
  'autoplay_chord_lacismi': '聞き流し: 黄緑 (ラド#ミ)',
  'autoplay_chord_refisla': '聞き流し: ベージュ (レファ#ラ)',
  'autoplay_chord_migissi': '聞き流し: 薄紫 (ミソ#シ)',
  'autoplay_chord_berefa': '聞き流し: グレー (シ♭レファ)',
  'autoplay_chord_essobe': '聞き流し: 水色 (ミ♭ソシ♭)',

  // --- Components & Logic Features ---
  'instrument_steinway': 'Steinway 音源',
  'parent_voice': '保護者の声モード',

  // --- Autoplay Display Modes ---
  'mode_icecream': 'モード: アイス',
  'mode_cat': 'モード: ねこ',
  'mode_video_cat': 'モード: 動画ねこ',
  'mode_cat_flag': 'モード: ねこ旗揚げ',
  'mode_train': 'モード: 電車',
  'mode_vehicle': 'モード: 車',

  // --- Settings ---
  'settings_instrument_yamaha': '設定: Yamaha音源',
  'settings_instrument_steinway': '設定: Steinway音源',
  'settings_keyboard_sound': '設定: 鍵盤の音',
  'settings_color_format': '設定: 色の表示形式',
  'settings_color_format_hiragana': '設定: 色の表示形式 (ひらがな)',
  'settings_naming_convention': '設定: 音名の表示形式',
  'settings_chord_customization': '設定: 和音カスタマイズ',

  // --- Quiz Settings ---
  'quiz_content_black_keys': 'クイズ: 黒鍵 (Lv10-14)',
  'quiz_settings_frequency': 'クイズ: 出題頻度設定',

  // --- Single Note Test Settings ---
  'singlenote_setting_white_keys': '単音: 黒鍵を含める',
  'singlenote_setting_match_octave': '単音: オクターブ一致',
  'singlenote_setting_88_keys': '単音: 88鍵盤モード',

  // --- History Features ---
  'history_detailed_view': '履歴: 詳細表示 (PRO)',
  'history_delete_feature': '履歴: 削除機能',
}
