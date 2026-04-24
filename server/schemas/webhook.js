const { z } = require('zod');

// Twilio WhatsApp incoming message webhook payload
const twilioWebhookSchema = z.object({
  From:        z.string().startsWith('whatsapp:+', 'Must be a WhatsApp number'),
  Body:        z.string().min(1, 'Message body required'),
  MessageSid:  z.string().min(1),
  AccountSid:  z.string().min(1),
  // Optional fields Twilio may send
  To:          z.string().optional(),
  ProfileName: z.string().optional(),
  WaId:        z.string().optional(),
});

// Normalised patient reply after parsing
const adherenceReplySchema = z.object({
  phone:        z.string(),                           // +919876543210 (no whatsapp: prefix)
  rawMessage:   z.string(),
  intent:       z.enum(['taken', 'skipped', 'unknown']),
  receivedAt:   z.string().datetime(),
});

module.exports = { twilioWebhookSchema, adherenceReplySchema };
