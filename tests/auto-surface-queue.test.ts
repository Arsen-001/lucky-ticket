import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Всплывающие окна при заходе в игру идут ОЧЕРЕДЬЮ.
 *
 * Два разных дефекта, оба видел игрок:
 *
 *  1. Игрок, участвовавший в трёх турнирах, получал ОДНУ модалку, в которой
 *     награды переписывались на следующие без единого кадра закрытия — это
 *     читается как «цифры сами поменялись», а не «вот второй результат».
 *  2. Вызов на дуэль рисовался ПОВЕРХ карточки награды: два `role="dialog"` в
 *     DOM одновременно, кнопка «Не сейчас» ровно на «Таблице турнира».
 *
 * Оба чинятся одним и тем же — общим слотом и снимком показываемого результата,
 * — и оба легко отменяются одной строкой, отсюда этот файл.
 */

const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8');

describe('очередь результатов турниров', () => {
  const source = read('src/components/pages/tabs/tournaments/TournamentResultWatcher.tsx');

  it('показываемый результат — снимок, а не текущий элемент списка', () => {
    // Читать `queue[0]` прямо в JSX значит вернуть подмену содержимого: список
    // теряет турнир сразу после `markSeen`, ещё до того, как диалог закроется.
    expect(source).toMatch(/const \[shown, setShown\] = useState<ShownResult \| null>/);
    expect(source).toMatch(/const current = shown\?\.tournament/);
  });

  it('между двумя карточками модалка закрывается по-настоящему', () => {
    // Пауза обязана быть НЕ меньше анимации закрытия Modal — иначе снимок
    // отпускают, пока диалог ещё на экране, и он мигает пустым.
    const gap = Number(source.match(/const QUEUE_GAP_MS = (\d+)/)?.[1]);
    const modalMs = Number(
      read('src/components/shared/modals/Modal.tsx').match(/const ANIMATION_MS = (\d+)/)?.[1]
    );

    expect(gap).toBeGreaterThan(modalMs);
    expect(source).toMatch(/setOpen\(false\)/);
    expect(source).toMatch(/setTimeout\(\(\) => setShown\(null\), QUEUE_GAP_MS\)/);
  });

  it('слот держится, пока снимок на экране', () => {
    // Очередь уже пуста, а диалог ещё виден: отпустить слот здесь значит
    // впустить следующий попап ПОД открытый.
    expect(source).toMatch(
      /useAutoSurfaceSlot\('tournament-result', queue\.length > 0 \|\| !!shown\)/
    );
  });
});

describe('общий слот всплывающих окон', () => {
  const slice = read('src/lib/rtk/features/layout.slice.ts');

  it('вызов на дуэль стоит в очереди, а не поверх неё', () => {
    const duel = read('src/components/layout-elements/DuelInviteAutoSurface.tsx');

    expect(duel).toMatch(/useAutoSurfaceSlot\('duel-invite', Boolean\(invite\)\)/);
    // `open={Boolean(invite)}` — ровно та строка, что рисовала второй диалог
    // поверх первого.
    expect(duel).toMatch(/open=\{canShow\}/);
    expect(duel).not.toMatch(/open=\{Boolean\(invite\)\}/);
  });

  it('протухающее показывается раньше того, что подождёт', () => {
    // Вызов живёт три минуты; результат турнира не теряется никогда.
    const rank = (id: string) =>
      Number(slice.match(new RegExp(`'?${id}'?: (\\d+)`))?.[1] ?? Number.NaN);

    expect(rank('duel-invite')).toBeGreaterThan(rank('tournament-result'));
    expect(rank('tournament-result')).toBeGreaterThan(rank('notification'));
    // Промо приглашений не выдаёт ничего — оно пропускает вперёд всех.
    expect(rank('friends-promo')).toBeLessThan(rank('daily-gift'));
  });

  it('слот не отбирают у открытого окна', () => {
    expect(slice).toMatch(/if \(state\.autoSurface && state\.autoSurfaceQueue\.includes/);
  });
});

describe('промо «позови друзей»', () => {
  const source = read('src/components/layout-elements/FriendsPromoAutoSurface.tsx');

  it('раз в UTC-сутки, и сутки жгутся при показе, а не при закрытии', () => {
    // Убитое с открытой модалкой приложение показ уже потратило; ждать тапа
    // значит показать её второй раз тому, кто просто ушёл в другой чат.
    expect(source).toContain('lt-friends-promo-shown');
    expect(source).toMatch(/if \(!canShow\) return;\s*\n\s*localStorage\.setItem/);
  });

  it('показанное сегодня не дёргает сервер', () => {
    expect(source).toMatch(/const skip = shownToday !== false \|\| !me\?\.hasSeenTour/);
    expect(source).toMatch(/useGetPreLaunchGiftQuery\(undefined, \{ skip \}\)/);
    expect(source).toMatch(/useGetRouletteQuery\(undefined, \{ skip \}\)/);
  });

  it('нечего показать — модалки нет', () => {
    // `available: false` значит «выключено или уже получено» — рисовать пустую
    // лестницу нельзя, её некому оплатить.
    expect(source).toMatch(/gift && gift\.available !== false \? gift : undefined/);
    expect(source).toMatch(/roulette\?\.available \? roulette : undefined/);
    expect(source).toMatch(/Boolean\(giftLive \|\| rouletteLive\)/);
  });

  it('забрать награду отсюда нельзя — только уйти на экран друзей', () => {
    // Промо, которое подаёт заявку само, обязано и объяснять отказ сервера
    // словами; места на это в модалке нет.
    const modal = read(
      'src/components/pages/out-tabs/drawer/invite-friends/promo/InviteFriendsPromoModal.tsx'
    );

    expect(modal).not.toMatch(/useClaimPreLaunchGiftMutation|useSpinRouletteMutation/);
    expect(source).toMatch(/router\.push\(routes\.inviteFriends\)/);
  });
});
