const { z } = require('zod');

// Validates HH:MM format (24-hour)
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be HH:MM in 24-hour format (e.g. 08:30)');

const medicationSchema = z.object({
  patientId:   z.string().uuid('Invalid patient ID'),

  name:        z.string().min(1, 'Medication name required'),
  dosage:      z.string().min(1, 'Dosage required, e.g. "500mg" or "1 tablet"'),

  // Doctor sets the exact times for THIS patient's schedule
  // e.g. ["07:30", "13:00", "21:00"] — entirely per-patient
  reminderTimes: z
    .array(timeSchema)
    .min(1, 'At least one reminder time required')
    .max(6,  'Maximum 6 reminder times per medication'),

  startDate:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  endDate:     z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD')
    .optional(),

  instructions: z.string().max(300).optional(),
}).refine(
  data => {
    if (!data.endDate) return true;
    return new Date(data.endDate) > new Date(data.startDate);
  },
  { message: 'End date must be after start date', path: ['endDate'] }
);

const medicationUpdateSchema = z.object({
  name:          z.string().min(1).optional(),
  dosage:        z.string().min(1).optional(),
  reminderTimes: z.array(timeSchema).min(1).max(6).optional(),
  startDate:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  instructions:  z.string().max(300).optional(),
  active:        z.boolean().optional(),
}).refine(
  data => Object.keys(data).length > 0,
  { message: 'At least one field required for update' }
);

module.exports = { medicationSchema, medicationUpdateSchema, timeSchema };
