// "What's new" message, shown once in a dialog when any page opens.
// It stays closed after the confirm button is tapped (remembered per device). To announce
// something new, change `id` (so everyone sees it again) and the text.

export interface Announcement {
  /** Change this for every new announcement. */
  id: string
  title: string
  /** One paragraph per entry. */
  paragraphs: string[]
  button: string
}

export const announcement: Announcement | null = {
  id: '2026-10-parts-of-speech',
  title: '🎉 最新消息',
  paragraphs: [
    '新增第二種測驗: Parts of Speech (noun, verb, adjective, article). 可以透過右上角選單進入.',
    '測驗內容可以混合不同類型(e.g. noun + verb + article), 增加實戰經驗~~!',
  ],
  button: '確認',
}
