const { z } = require('zod');

const doctorRegisterSchema = z.object({
  name:       z.string().min(2, 'Name must be at least 2 characters'),
  email:      z.string().email('Invalid email address'),
  password:   z.string().min(8, 'Password must be at least 8 characters'),
  clinicName: z.string().min(2, 'Clinic name required'),
  phone:      z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
});

const doctorLoginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

const doctorUpdateSchema = z.object({
  name:       z.string().min(2).optional(),
  clinicName: z.string().min(2).optional(),
  phone:      z.string().regex(/^\+?[1-9]\d{9,14}$/).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field required for update',
});

module.exports = { doctorRegisterSchema, doctorLoginSchema, doctorUpdateSchema };
