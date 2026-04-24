const { parseAdherenceReply, normaliseTwilioPhone } = require('../../services/adherence');

describe('parseAdherenceReply — taken responses', () => {
  test('"Yes"',        () => expect(parseAdherenceReply('Yes')).toBe('taken'));
  test('"yes"',        () => expect(parseAdherenceReply('yes')).toBe('taken'));
  test('"YES"',        () => expect(parseAdherenceReply('YES')).toBe('taken'));
  test('"Haan"',       () => expect(parseAdherenceReply('Haan')).toBe('taken'));
  test('"haan"',       () => expect(parseAdherenceReply('haan')).toBe('taken'));
  test('"le li"',      () => expect(parseAdherenceReply('le li')).toBe('taken'));
  test('"taken"',      () => expect(parseAdherenceReply('taken')).toBe('taken'));
  test('"done"',       () => expect(parseAdherenceReply('done')).toBe('taken'));
  test('"ok"',         () => expect(parseAdherenceReply('ok')).toBe('taken'));
  test('"liya"',       () => expect(parseAdherenceReply('liya')).toBe('taken'));
  test('"✅"',         () => expect(parseAdherenceReply('✅')).toBe('taken'));
  test('"1"',          () => expect(parseAdherenceReply('1')).toBe('taken'));
  test('"Yes, taken"', () => expect(parseAdherenceReply('Yes, taken it')).toBe('taken'));
});

describe('parseAdherenceReply — skipped responses', () => {
  test('"No"',      () => expect(parseAdherenceReply('No')).toBe('skipped'));
  test('"nahi"',    () => expect(parseAdherenceReply('nahi')).toBe('skipped'));
  test('"skip"',    () => expect(parseAdherenceReply('skip')).toBe('skipped'));
  test('"skipped"', () => expect(parseAdherenceReply('skipped')).toBe('skipped'));
  test('"nhi"',     () => expect(parseAdherenceReply('nhi')).toBe('skipped'));
  test('"na"',      () => expect(parseAdherenceReply('na')).toBe('skipped'));
  test('"missed"',  () => expect(parseAdherenceReply('missed')).toBe('skipped'));
  test('"0"',       () => expect(parseAdherenceReply('0')).toBe('skipped'));
});

describe('parseAdherenceReply — unknown responses', () => {
  test('random text',   () => expect(parseAdherenceReply('what time is it?')).toBe('unknown'));
  test('empty string',  () => expect(parseAdherenceReply('')).toBe('unknown'));
  test('null',          () => expect(parseAdherenceReply(null)).toBe('unknown'));
  test('undefined',     () => expect(parseAdherenceReply(undefined)).toBe('unknown'));
  test('number',        () => expect(parseAdherenceReply(42)).toBe('unknown'));
  test('gibberish',     () => expect(parseAdherenceReply('xzqwerty')).toBe('unknown'));
});

describe('normaliseTwilioPhone', () => {
  test('strips whatsapp: prefix',       () =>
    expect(normaliseTwilioPhone('whatsapp:+919876543210')).toBe('+919876543210'));
  test('strips WhatsApp: (mixed case)', () =>
    expect(normaliseTwilioPhone('WhatsApp:+14155552671')).toBe('+14155552671'));
  test('leaves plain number unchanged',  () =>
    expect(normaliseTwilioPhone('+919876543210')).toBe('+919876543210'));
});
