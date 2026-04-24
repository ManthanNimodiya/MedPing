const { medicationSchema, medicationUpdateSchema, timeSchema } = require('../../schemas/medication');

const validMed = {
  patientId:     '123e4567-e89b-12d3-a456-426614174000',
  name:          'Metformin 500mg',
  dosage:        '1 tablet',
  reminderTimes: ['08:00', '14:00', '21:00'],
  startDate:     '2025-05-01',
  endDate:       '2025-07-31',
  instructions:  'Take with food',
};

// ── timeSchema ────────────────────────────────────────────────────────────────

describe('timeSchema', () => {
  test('accepts 08:00', () => expect(() => timeSchema.parse('08:00')).not.toThrow());
  test('accepts 23:59', () => expect(() => timeSchema.parse('23:59')).not.toThrow());
  test('accepts 00:00', () => expect(() => timeSchema.parse('00:00')).not.toThrow());

  test('rejects 24:00 (out of range)', () =>
    expect(timeSchema.safeParse('24:00').success).toBe(false));
  test('rejects 8:00 (no leading zero)', () =>
    expect(timeSchema.safeParse('8:00').success).toBe(false));
  test('rejects "morning" (non-time string)', () =>
    expect(timeSchema.safeParse('morning').success).toBe(false));
  test('rejects 08:60 (invalid minutes)', () =>
    expect(timeSchema.safeParse('08:60').success).toBe(false));
});

// ── medicationSchema ──────────────────────────────────────────────────────────

describe('medicationSchema — valid cases', () => {
  test('accepts a fully valid medication', () =>
    expect(() => medicationSchema.parse(validMed)).not.toThrow());

  test('accepts medication without endDate', () => {
    const { endDate, ...noEnd } = validMed;
    expect(() => medicationSchema.parse(noEnd)).not.toThrow();
  });

  test('accepts medication without instructions', () => {
    const { instructions, ...noInstr } = validMed;
    expect(() => medicationSchema.parse(noInstr)).not.toThrow();
  });

  test('accepts single reminder time', () =>
    expect(() => medicationSchema.parse({ ...validMed, reminderTimes: ['07:00'] })).not.toThrow());

  test('accepts 6 reminder times (max)', () =>
    expect(() => medicationSchema.parse({
      ...validMed,
      reminderTimes: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
    })).not.toThrow());
});

describe('medicationSchema — invalid reminder times', () => {
  test('rejects empty reminderTimes array', () =>
    expect(medicationSchema.safeParse({ ...validMed, reminderTimes: [] }).success).toBe(false));

  test('rejects 7 reminder times (exceeds max)', () =>
    expect(medicationSchema.safeParse({
      ...validMed,
      reminderTimes: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
    }).success).toBe(false));

  test('rejects invalid time in array', () =>
    expect(medicationSchema.safeParse({ ...validMed, reminderTimes: ['08:00', '25:00'] }).success).toBe(false));

  test('rejects "morning" as reminder time', () =>
    expect(medicationSchema.safeParse({ ...validMed, reminderTimes: ['morning'] }).success).toBe(false));
});

describe('medicationSchema — date validation', () => {
  test('rejects endDate before startDate', () =>
    expect(medicationSchema.safeParse({
      ...validMed,
      startDate: '2025-07-31',
      endDate:   '2025-05-01',
    }).success).toBe(false));

  test('rejects endDate equal to startDate', () =>
    expect(medicationSchema.safeParse({
      ...validMed,
      startDate: '2025-05-01',
      endDate:   '2025-05-01',
    }).success).toBe(false));

  test('rejects invalid date format', () =>
    expect(medicationSchema.safeParse({ ...validMed, startDate: '01-05-2025' }).success).toBe(false));
});

describe('medicationSchema — required fields', () => {
  test('rejects missing patientId', () => {
    const { patientId, ...rest } = validMed;
    expect(medicationSchema.safeParse(rest).success).toBe(false);
  });

  test('rejects missing name', () => {
    const { name, ...rest } = validMed;
    expect(medicationSchema.safeParse(rest).success).toBe(false);
  });

  test('rejects invalid UUID for patientId', () =>
    expect(medicationSchema.safeParse({ ...validMed, patientId: 'not-a-uuid' }).success).toBe(false));
});

// ── medicationUpdateSchema ────────────────────────────────────────────────────

describe('medicationUpdateSchema', () => {
  test('accepts partial update with just reminderTimes', () =>
    expect(() => medicationUpdateSchema.parse({ reminderTimes: ['09:00', '21:00'] })).not.toThrow());

  test('accepts setting active to false (pause medication)', () =>
    expect(() => medicationUpdateSchema.parse({ active: false })).not.toThrow());

  test('rejects empty update object', () =>
    expect(medicationUpdateSchema.safeParse({}).success).toBe(false));

  test('rejects invalid reminderTimes in update', () =>
    expect(medicationUpdateSchema.safeParse({ reminderTimes: ['9am'] }).success).toBe(false));
});
