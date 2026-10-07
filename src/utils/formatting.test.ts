import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatDayRange, formatPersonName, formatPrice, printItinerary } from './index';
import { translations } from '../i18n/translations';
afterEach(() => vi.restoreAllMocks());
describe('localized itinerary formatting', () => {
  it('groups yen without decimals and retains cents for other currencies', () => {
    expect(formatPrice(12345, 'JPY', 'ja')).toBe('JPY\u00a012,345');
    expect(formatPrice(12345.67, 'EUR', 'ja')).toBe('EUR\u00a012,345.67');
    expect(formatPrice(12345.67, 'EUR', 'de')).toBe(new Intl.NumberFormat('de', {style:'currency',currency:'EUR',currencyDisplay:'code'}).format(12345.67));
  });
  it('places Japanese day counters and surnames after and before the correct values', () => {
    expect(formatDayRange(0, 0, 'ja')).toBe('1日目');
    expect(formatDayRange(0, 2, 'ja')).toBe('1〜3日目');
    expect(formatDayRange(0, 0, 'en')).toBe('Day 1');
    expect(formatPersonName('結衣', '山田', 'ja')).toBe('山田 結衣');
    expect(formatPersonName('Yui', 'Yamada', 'en')).toBe('Yui Yamada');
  });
  it('prints Japanese day labels and uses the trip currency for unlabelled prices', () => {
    const write = vi.fn();
    vi.spyOn(window, 'open').mockReturnValue({document:{open:vi.fn(),write,close:vi.fn()},focus:vi.fn()} as unknown as Window);
    const t=translations.ja;
    printItinerary([{title:'東京',activities:[{name:'浅草',time:'09:00',description:'',price:12000}]}],[],{title:t.printItinerary,day:t.day,activities:t.activities,optionalActivities:t.optionalActivities,accommodation:t.whereWeSleep,noAccommodation:t.noAccommodation,importantInfo:t.importantInfo,noTime:t.noTime,tripName:'日本',language:'ja',currency:'JPY'});
    expect(write.mock.calls[0][0]).toContain('1日目: 東京');
    expect(write.mock.calls[0][0]).toContain('JPY\u00a012,000');
    expect(write.mock.calls[0][0]).toContain('<html lang="ja">');
  });
});
