const { isDueNow, getDueMedications, buildReminderMessage } = require('../../services/scheduler');

const baseMed = {
  id:            'med_001',
  name:          'Metformin 500mg',
  dosage:        '1 tablet',
  reminderTimes: ['08:00', '14:00', '21:00'],
  startDate:     '2025-05-01',
  endDate:       '2025-07-31',
  active:        true,
};

// ── isDueNow ─────────────────────────────────────────────────────────────────

describe('isDueNow — time matching', () => {
  test('fires at 08:00 on an active day', () =>
    expect(isDueNow(baseMed, '08:00', '2025-06-01')).toBe(true));

  test('fires at 14:00', () =>
    expect(isDueNow(baseMed, '14:00', '2025-06-01')).toBe(true));

  test('fires at 21:00', () =>
    expect(isDueNow(baseMed, '21:00', '2025-06-01')).toBe(true));

  test('does NOT fire at 09:00 (not in reminderTimes)', () =>
    expect(isDueNow(baseMed, '09:00', '2025-06-01')).toBe(false));

  test('does NOT fire at 08:01 (off by one minute)', () =>
    expect(isDueNow(baseMed, '08:01', '2025-06-01')).toBe(false));
});

describe('isDueNow — date range', () => {
  test('does NOT fire before startDate', () =>
    expect(isDueNow(baseMed, '08:00', '2025-04-30')).toBe(false));

  test('fires on startDate itself', () =>
    expect(isDueNow(baseMed, '08:00', '2025-05-01')).toBe(true));

  test('fires on endDate itself', () =>
    expect(isDueNow(baseMed, '08:00', '2025-07-31')).toBe(true));

  test('does NOT fire after endDate', () =>
    expect(isDueNow(baseMed, '08:00', '2025-08-01')).toBe(false));

  test('fires indefinitely when endDate is null', () =>
    expect(isDueNow({ ...baseMed, endDate: null }, '08:00', '2099-12-31')).toBe(true));
});

describe('isDueNow — active flag', () => {
  test('does NOT fire when active is false (paused medication)', () =>
    expect(isDueNow({ ...baseMed, active: false }, '08:00', '2025-06-01')).toBe(false));
});

describe('isDueNow — per-patient schedule variation', () => {
  const patientAMed = { ...baseMed, reminderTimes: ['07:30', '20:00'] };
  const patientBMed = { ...baseMed, reminderTimes: ['09:00', '22:00'] };

  test('Patient A fires at 07:30, not 09:00', () => {
    expect(isDueNow(patientAMed, '07:30', '2025-06-01')).toBe(true);
    expect(isDueNow(patientAMed, '09:00', '2025-06-01')).toBe(false);
  });

  test('Patient B fires at 09:00, not 07:30', () => {
    expect(isDueNow(patientBMed, '09:00', '2025-06-01')).toBe(true);
    expect(isDueNow(patientBMed, '07:30', '2025-06-01')).toBe(false);
  });
});

// ── getDueMedications ─────────────────────────────────────────────────────────

describe('getDueMedications', () => {
  const med2 = { ...baseMed, id: 'med_002', reminderTimes: ['09:00'], startDate: '2025-05-01' };
  const med3 = { ...baseMed, id: 'med_003', reminderTimes: ['08:00'], active: false };

  test('returns only the medication due at 08:00', () => {
    const due = getDueMedications([baseMed, med2, med3], '08:00', '2025-06-01');
    expect(due.length).toBe(1);
    expect(due[0].id).toBe('med_001');
  });

  test('returns empty array when nothing is due', () => {
    expect(getDueMedications([baseMed, med2], '03:00', '2025-06-01')).toHaveLength(0);
  });

  test('returns multiple when two medications share the same reminder time', () => {
    const shared = { ...med2, reminderTimes: ['08:00'] };
    const due = getDueMedications([baseMed, shared], '08:00', '2025-06-01');
    expect(due.length).toBe(2);
  });
});

// ── buildReminderMessage ──────────────────────────────────────────────────────

describe('buildReminderMessage', () => {
  test('includes medication name and dosage', () => {
    const msg = buildReminderMessage({
      patientName:    'Ravi Sharma',
      medicationName: 'Metformin 500mg',
      dosage:         '1 tablet',
      time:           '08:00',
    });
    expect(msg).toContain('Metformin 500mg');
    expect(msg).toContain('1 tablet');
  });

  test('uses first name only', () => {
    const msg = buildReminderMessage({
      patientName:    'Ravi Sharma',
      medicationName: 'Aspirin',
      dosage:         '1 tablet',
      time:           '08:00',
    });
    expect(msg).toContain('Ravi');
    expect(msg).not.toContain('Sharma');
  });

  test('includes instructions when provided', () => {
    const msg = buildReminderMessage({
      patientName:    'Priya',
      medicationName: 'Metformin',
      dosage:         '1 tablet',
      time:           '08:00',
      instructions:   'Take with food',
    });
    expect(msg).toContain('Take with food');
  });

  test('omits instructions line when not provided', () => {
    const msg = buildReminderMessage({
      patientName:    'Priya',
      medicationName: 'Metformin',
      dosage:         '1 tablet',
      time:           '08:00',
    });
    expect(msg).not.toContain('📝');
  });

  test('includes YES/NO reply instructions', () => {
    const msg = buildReminderMessage({
      patientName:    'Ravi',
      medicationName: 'Aspirin',
      dosage:         '75mg',
      time:           '08:00',
    });
    expect(msg).toContain('YES');
    expect(msg).toContain('NO');
  });
});
