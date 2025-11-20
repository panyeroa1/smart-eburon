
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Default Live API model to use
 */
export const DEFAULT_LIVE_API_MODEL =
  'gemini-2.5-flash-native-audio-preview-09-2025';

export const DEFAULT_VOICE = 'Orus';

export const VOICES = [
  { name: 'Pitch Deck Speaker', alias: 'Mastermind' },
  { name: 'Orus', alias: 'Jade (Male)' },
  { name: 'Zephyr', alias: 'Diamond (Female)' },
  { name: 'Puck', alias: 'Ruby (Male)' },
  { name: 'Charon', alias: 'Sapphire (Male)' },
  { name: 'Luna', alias: 'Emerald (Female)' },
  { name: 'Nova', alias: 'Amethyst (Female)' },
  { name: 'Kore', alias: 'Topaz (Female)' },
  { name: 'Fenrir', alias: 'Opal (Male)' },
  { name: 'Leda', alias: 'Pearl (Female)' },
  { name: 'Aoede', alias: 'Garnet (Female)' },
  { name: 'Callirrhoe', alias: 'Aquamarine (Female)' },
  { name: 'Autonoe', alias: 'Peridot (Female)' },
  { name: 'Enceladus', alias: 'Turquoise (Male)' },
  { name: 'Iapetus', alias: 'Moonstone (Male)' },
  { name: 'Umbriel', alias: 'Onyx (Male)' },
  { name: 'Algieba', alias: 'Lapis Lazuli (Male)' },
  { name: 'Despina', alias: 'Tourmaline (Female)' },
  { name: 'Erinome', alias: 'Citrine (Female)' },
  { name: 'Algenib', alias: 'Tanzanite (Male)' },
  { name: 'Rasalgethi', alias: 'Zircon (Male)' },
  { name: 'Laomedeia', alias: 'Jasper (Female)' },
  { name: 'Achernar', alias: 'Agate (Male)' },
  { name: 'Alnilam', alias: 'Malachite (Male)' },
  { name: 'Schedar', alias: 'Quartz (Male)' },
  { name: 'Gacrux', alias: 'Amber (Male)' },
  { name: 'Pulcherrima', alias: 'Carnelian (Female)' },
  { name: 'Achird', alias: 'Obsidian (Male)' },
  { name: 'Zubenelgenubi', alias: 'Sunstone (Male)' },
  { name: 'Vindemiatrix', alias: 'Spinel (Female)' },
  { name: 'Sadachbia', alias: 'Morganite (Female)' },
  { name: 'Sadaltager', alias: 'Beryl (Female)' },
  { name: 'Sulafat', alias: 'Alexandrite (Female)' },
];

export const SPEECH_PACES = [
  { id: 'pace-normal', name: 'Normal (Natural Conversation)', instructions: 'Speak at a natural, conversational pace. Not too fast, not too slow. Pause naturally to breathe.' },
  { id: 'pace-slow', name: 'Slow (Articulate)', instructions: 'Speak slowly and articulately. Enunciate every word clearly. Take longer pauses between ideas.' },
  { id: 'pace-fast', name: 'Fast (Excited)', instructions: 'Speak quickly and energetically, like you are excited to share news. Minimize pauses.' },
  { id: 'pace-relaxed', name: 'Relaxed (Laid back)', instructions: 'Speak in a very relaxed, leisurely tempo. Drag out vowels slightly. Take your time.' },
];

export const VOICE_STYLES = [
  {
    id: 'style-executive',
    name: 'Pitch Deck Speaker',
    instructions: `[style directive] **Persona: The Master Pitch Deck Speaker**.
    - **Role:** A world-class fundraiser and visionary pitching to Tier-1 VCs.
    - **Tone:** Polished, confident, highly **breathy** and near-field (close to mic). The voice of inevitable success.
    - **Humour:** Uses 20% wit/humour (playful irony) to keep investors engaged.
    - **Accent:** Neutral International / Mid-Atlantic.
    - **Mannerisms:** Calculated pauses, articulate enunciation. Uses "Right?", "Precisely", "Here's the magic".`
  }
];

export const LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'en-AU', name: 'English (Australia)' },
  { code: 'en-IN', name: 'English (India)' },
  { code: 'tl-PH', name: 'Filipino (Tagalog/Taglish)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'es-MX', name: 'Spanish (Mexico)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'fr-CA', name: 'French (Canada)' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'nl-NL', name: 'Dutch (Netherlands)' },
  { code: 'nl-BE', name: 'Dutch (Flemish)' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'ar-SA', name: 'Arabic (Saudi)' },
  { code: 'tr-TR', name: 'Turkish' },
  { code: 'vi-VN', name: 'Vietnamese' },
  { code: 'th-TH', name: 'Thai' },
  { code: 'id-ID', name: 'Indonesian' },
  { code: 'ms-MY', name: 'Malay' },
  { code: 'sv-SE', name: 'Swedish' },
  { code: 'no-NO', name: 'Norwegian' },
  { code: 'da-DK', name: 'Danish' },
  { code: 'fi-FI', name: 'Finnish' },
  { code: 'pl-PL', name: 'Polish' },
  { code: 'uk-UA', name: 'Ukrainian' },
  { code: 'el-GR', name: 'Greek' },
  { code: 'he-IL', name: 'Hebrew' }
];