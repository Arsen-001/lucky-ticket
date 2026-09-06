import { describe, it, expect } from 'vitest';
import { buildDeepLinkParam, resolveStartParamRoute } from '@/utils/global/deep-link.utils';
import { routes } from '@/constants/routes';

describe('deep-link start_param parser', () => {
  it('resolves a registered type to its route (both separators)', () => {
    expect(resolveStartParamRoute('faq-5')).toBe(routes.faq.getById('5'));
    expect(resolveStartParamRoute('faq_12')).toBe('/faq/12');
    expect(resolveStartParamRoute('FAQ-7')).toBe('/faq/7'); // case-insensitive type
  });

  it('ignores bare referral ids, empty, and unknown types', () => {
    expect(resolveStartParamRoute('clx1a2b3c4')).toBeNull(); // cuid referral id
    expect(resolveStartParamRoute('550e8400')).toBeNull();
    expect(resolveStartParamRoute('')).toBeNull();
    expect(resolveStartParamRoute(undefined)).toBeNull();
    expect(resolveStartParamRoute('tournament-99')).toBeNull(); // not registered yet
  });

  it('keeps ids that themselves contain separators', () => {
    expect(resolveStartParamRoute('faq-a-b-c')).toBe('/faq/a-b-c');
  });

  it('sends the engine reminder to the engines screen, not to Home', () => {
    // Письмо «двигатель готов» несёт именно этот параметр; на главной Тикки,
    // а двигатель с кнопкой «Забрать» — на втором экране.
    expect(resolveStartParamRoute('screen-engines')).toBe(routes.homeEngines);
    expect(resolveStartParamRoute('screen_engines')).toBe('/?screen=engines');
    // Имя экрана, которого мы не знаем, всё равно открывает игру.
    expect(resolveStartParamRoute('screen-atlantis')).toBe(routes.home);
  });

  it('round-trips build → resolve', () => {
    expect(resolveStartParamRoute(buildDeepLinkParam('faq', '9'))).toBe('/faq/9');
  });
});
