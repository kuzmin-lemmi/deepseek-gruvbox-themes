/**
 * Picker copy. Registering these dictionaries through `ctx.locale` keeps the
 * row in the same translation system as the rest of Settings.
 */

/** Locale namespace owning the picker copy. */
export const SETTINGS_NS = 'settings.deepseek-gruvbox-themes'

/** English dictionary; the key set is the source of truth. */
export const en = {
  'row.title': 'Gruvbox themes',
  'row.description':
    'Seven palettes built from the original Gruvbox colors. The choice is saved in this profile, and it can follow the system light or dark scheme.',
  'follow.label': 'Follow system appearance',
  'follow.description':
    'Switch between the light and dark member of the selected family when the system scheme changes. Whale Edition stays dark.',
  'reset.label': 'Use standard theme',
  'reset.description': 'Restore the built-in DeepSeek appearance.',
  'badge.light': 'Light',
  'badge.dark': 'Dark',
  'badge.darkOnly': 'Dark only',
  'state.saved': 'Saved',
  'state.saving': 'Saving…',
  'state.pending': 'Settings are still loading; try again in a moment.',
  'state.failed': 'Not saved — this choice applies until the page reloads.',
  'state.readonly': 'This profile does not allow saving here, so the choice applies to this session only.',
  'state.unavailable': 'Theme saving is unavailable in this build, so the choice applies to this session only.',
  'state.standard': 'The standard theme is active. Pick a card to apply Gruvbox.',
  'state.unsupported': 'This Harness build does not expose the theme API; nothing was changed.',
  'selected': 'Selected',
  'themes.darkHard': 'Almost black ground with strong contrast and orange accents.',
  'themes.darkMedium': 'Classic Gruvbox, balanced for everyday use.',
  'themes.darkSoft': 'Soft charcoal ground with a gentle pink accent.',
  'themes.lightHard': 'Light cream ground with dark, high-contrast text.',
  'themes.lightMedium': 'Warm parchment, easy on the eyes for long sessions.',
  'themes.lightSoft': 'Warm sand with muted turquoise details.',
  'themes.whale': 'Classic DeepSeek Gruvbox with blue accents.',
} as const

/** Russian dictionary, checked against the English key set. */
export const ru: Record<keyof typeof en, string> = {
  'row.title': 'Темы Gruvbox',
  'row.description':
    'Семь палитр на основе оригинальных цветов Gruvbox. Выбор сохраняется в профиле и может следовать светлой или тёмной схеме системы.',
  'follow.label': 'Следовать оформлению системы',
  'follow.description':
    'Переключаться между светлым и тёмным вариантом выбранного семейства при смене схемы системы. Whale Edition всегда тёмная.',
  'reset.label': 'Вернуть стандартную тему',
  'reset.description': 'Восстановить встроенное оформление DeepSeek.',
  'badge.light': 'Светлая',
  'badge.dark': 'Тёмная',
  'badge.darkOnly': 'Только тёмная',
  'state.saved': 'Сохранено',
  'state.saving': 'Сохранение…',
  'state.pending': 'Настройки ещё загружаются; повторите через мгновение.',
  'state.failed': 'Не сохранено — выбор действует до перезагрузки страницы.',
  'state.readonly': 'В этом профиле запись недоступна, поэтому выбор действует только в текущем сеансе.',
  'state.unavailable': 'Сохранение тем недоступно в этой сборке, поэтому выбор действует только в текущем сеансе.',
  'state.standard': 'Активна стандартная тема. Выберите карточку, чтобы применить Gruvbox.',
  'state.unsupported': 'Эта сборка Harness не предоставляет API тем; ничего не изменено.',
  'selected': 'Выбрано',
  'themes.darkHard': 'Почти чёрный фон, высокий контраст и оранжевые акценты.',
  'themes.darkMedium': 'Классический Gruvbox, сбалансированный на каждый день.',
  'themes.darkSoft': 'Мягкий тёмно-коричневый фон и приглушённый розовый акцент.',
  'themes.lightHard': 'Светлый кремовый фон и тёмный контрастный текст.',
  'themes.lightMedium': 'Тёплая бумажная палитра, подходит для длинных чатов.',
  'themes.lightSoft': 'Тёплый песочный фон с мягкими бирюзовыми деталями.',
  'themes.whale': 'Классический Gruvbox для DeepSeek с голубыми акцентами.',
}

/** Dictionaries passed to `ctx.locale.register`. */
export const DICTIONARIES = { en, ru }
