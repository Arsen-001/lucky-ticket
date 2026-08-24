/**
 * Когда мини-апп имеет право сам, без кнопки, спросить у игрока разрешение
 * писать ему в Telegram.
 *
 * Спрашивать вообще приходится потому, что бот не может начать разговор первым:
 * пока игрок не разрешил, каждое сообщение возвращается `chat not found`. А
 * приходят в игру по ссылке — мимо бота, мимо онбординга, сразу играть, — и
 * трёх мест с кнопкой («Забрать подарки», настройки, экран дуэли) такой игрок
 * не видит ни одного. @see useBotWriteAccess
 *
 * Отсюда правило: спрашиваем сразу всех — один раз, — а дальше раз в неделю у
 * тех, у кого разрешения так и нет. Отказ стоит игроку одного тапа и не
 * превращает следующий заход в допрос.
 */

/**
 * Пауза между вопросами после первого.
 *
 * Неделя — потому что разрешение стоит слишком дорого, чтобы отпускать игрока
 * после одного «нет»: без него для него не существует ни напоминания о
 * двигателе, ни вызова на дуэль, ни итогов турнира. И достаточно редко, чтобы
 * вопрос не стал условием входа в игру.
 */
export const WRITE_ACCESS_AUTO_ASK_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

const STORAGE_KEY = 'bot-write-access-prompt';

export interface WriteAccessPromptState {
  /** Сколько раз попап уже показывали — откуда угодно. */
  asks: number;
  /** Когда показали в последний раз (мс эпохи), 0 — ни разу. */
  lastAskAt: number;
}

const EMPTY: WriteAccessPromptState = { asks: 0, lastAskAt: 0 };

/**
 * Чистое правило, отдельно от хранилища — его и проверяют тесты.
 *
 * Первый раз — сразу и у всех, включая тех, кто играет давно: до сих пор их
 * никто ни о чём не спрашивал. Дальше раз в неделю, и верхнего предела нет
 * намеренно — разрешение можно дать в любой момент, и человек, отказавший на
 * второй день, через месяц игры отвечает уже иначе.
 */
export function shouldAutoAskWriteAccess(state: WriteAccessPromptState, now: number): boolean {
  if (state.asks === 0) return true;
  return now - state.lastAskAt >= WRITE_ACCESS_AUTO_ASK_COOLDOWN_MS;
}

export function readWriteAccessPrompt(): WriteAccessPromptState {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<WriteAccessPromptState>;
    return {
      asks: typeof parsed.asks === 'number' ? parsed.asks : 0,
      lastAskAt: typeof parsed.lastAskAt === 'number' ? parsed.lastAskAt : 0,
    };
  } catch {
    // Хранилище недоступно или в ключе мусор — считаем, что не спрашивали.
    return EMPTY;
  }
}

/**
 * Отметка ставится ДО показа попапа, а не по ответу: клиент, который его
 * проглотил и не позвал коллбэк, иначе оставлял бы счётчик нетронутым — и
 * следующий тап открывал бы попап снова.
 *
 * Зовётся из самого `ask()`, поэтому считается ЛЮБОЙ показ — и сторожевой, и
 * по кнопке в настройках, в дуэли, в онбординге. Иначе игрок, отказавший
 * онбордингу, получал бы тот же вопрос ещё раз через минуту, уже от сторожа.
 */
export function recordWriteAccessAsk(now: number): void {
  if (typeof window === 'undefined') return;
  const prev = readWriteAccessPrompt();
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ asks: prev.asks + 1, lastAskAt: now } satisfies WriteAccessPromptState)
    );
  } catch {
    /* без хранилища вопрос просто повторится в следующий заход */
  }
}
