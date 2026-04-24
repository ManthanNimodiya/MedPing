const { patientSchema, patientUpdateSchema } = require('../../schemas/patient');

const validPatient = {
  name:        'Ravi Sharma',
  phone:       '+919876543210',
  dateOfBirth: '1980-03-15',
  notes:       'Diabetic, check sugar weekly',
};

describe('patientSchema — valid cases', () => {
  test('accepts a fully valid patient', () =>
    expect(() => patientSchema.parse(validPatient)).not.toThrow());

  test('accepts patient without dateOfBirth', () => {
    const { dateOfBirth, ...rest } = validPatient;
    expect(() => patientSchema.parse(rest)).not.toThrow();
  });

  test('accepts patient without notes', () => {
    const { notes, ...rest } = validPatient;
    expect(() => patientSchema.parse(rest)).not.toThrow();
  });
});

describe('patientSchema — phone validation', () => {
  test('rejects phone without country code', () =>
    expect(patientSchema.safeParse({ ...validPatient, phone: '9876543210' }).success).toBe(false));

  test('rejects phone with + but no country code digits', () =>
    expect(patientSchema.safeParse({ ...validPatient, phone: '+9876543210' }).success).toBe(false));

  test('accepts +1 US number', () =>
    expect(() => patientSchema.parse({ ...validPatient, phone: '+14155552671' })).not.toThrow());

  test('rejects letters in phone', () =>
    expect(patientSchema.safeParse({ ...validPatient, phone: '+91ABCD43210' }).success).toBe(false));
});

describe('patientSchema — required fields', () => {
  test('rejects missing name', () => {
    const { name, ...rest } = validPatient;
    expect(patientSchema.safeParse(rest).success).toBe(false);
  });

  test('rejects missing phone', () => {
    const { phone, ...rest } = validPatient;
    expect(patientSchema.safeParse(rest).success).toBe(false);
  });

  test('rejects name shorter than 2 chars', () =>
    expect(patientSchema.safeParse({ ...validPatient, name: 'A' }).success).toBe(false));
});

describe('patientUpdateSchema', () => {
  test('accepts partial update with just name', () =>
    expect(() => patientUpdateSchema.parse({ name: 'Ravi Kumar' })).not.toThrow());

  test('accepts partial update with just notes', () =>
    expect(() => patientUpdateSchema.parse({ notes: 'Updated notes' })).not.toThrow());

  test('rejects empty update', () =>
    expect(patientUpdateSchema.safeParse({}).success).toBe(false));
});
