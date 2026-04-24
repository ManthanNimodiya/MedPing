const { doctorRegisterSchema, doctorLoginSchema } = require('../../schemas/doctor');

const validDoctor = {
  name:       'Dr. Priya Nair',
  email:      'priya@clinic.com',
  password:   'Secure@123',
  clinicName: 'Nair Diabetic Centre',
  phone:      '+919876543210',
};

describe('doctorRegisterSchema', () => {
  test('accepts a valid registration', () =>
    expect(() => doctorRegisterSchema.parse(validDoctor)).not.toThrow());

  test('rejects invalid email', () =>
    expect(doctorRegisterSchema.safeParse({ ...validDoctor, email: 'not-an-email' }).success).toBe(false));

  test('rejects password shorter than 8 chars', () =>
    expect(doctorRegisterSchema.safeParse({ ...validDoctor, password: 'short' }).success).toBe(false));

  test('rejects name shorter than 2 chars', () =>
    expect(doctorRegisterSchema.safeParse({ ...validDoctor, name: 'D' }).success).toBe(false));

  test('rejects missing clinicName', () => {
    const { clinicName, ...rest } = validDoctor;
    expect(doctorRegisterSchema.safeParse(rest).success).toBe(false);
  });
});

describe('doctorLoginSchema', () => {
  test('accepts valid login', () =>
    expect(() => doctorLoginSchema.parse({ email: 'priya@clinic.com', password: 'Secure@123' })).not.toThrow());

  test('rejects missing password', () =>
    expect(doctorLoginSchema.safeParse({ email: 'priya@clinic.com', password: '' }).success).toBe(false));

  test('rejects invalid email', () =>
    expect(doctorLoginSchema.safeParse({ email: 'bad', password: 'Secure@123' }).success).toBe(false));
});
