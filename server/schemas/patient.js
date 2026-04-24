const { z } = require('zod');

const patientSchema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters'),
  // WhatsApp number — must include country code
  // Min 11 digits after + (e.g. +1XXXXXXXXXX US) up to 15 (ITU-T E.164 max)
  // Rejects bare 10-digit numbers without a proper country code
  phone:       z.string().regex(/^\+[1-9]\d{10,14}$/, 'Phone must include country code, e.g. +919876543210'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD').optional(),
  notes:       z.string().max(500).optional(),
});

const patientUpdateSchema = patientSchema.partial().refine(
  data => Object.keys(data).length > 0,
  { message: 'At least one field required for update' }
);

module.exports = { patientSchema, patientUpdateSchema };
