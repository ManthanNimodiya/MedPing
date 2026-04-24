/**
 * Parses a patient's free-text WhatsApp reply into a structured intent.
 *
 * Patients reply to reminder messages with natural language like:
 *   "Yes", "Haan", "le li", "nahi", "skip", "taken", etc.
 *
 * Returns: 'taken' | 'skipped' | 'unknown'
 */

// Multi-word phrases checked as substrings (safe — unlikely to appear mid-word)
const TAKEN_PHRASES  = ['le li', 'leli'];
const SKIPPED_PHRASES = [];

// Single-word keywords matched against individual tokens to avoid
// false positives like 'ha' matching inside 'what'
const TAKEN_WORDS  = ['yes', 'haan', 'ha', 'taken', 'done', 'ok', 'okay', 'liya', '✓', '✅', '1'];
const SKIPPED_WORDS = ['no', 'nahi', 'nope', 'skip', 'skipped', 'nhi', 'na', 'missed', '0'];

/**
 * @param {string} message  Raw WhatsApp message body
 * @returns {'taken' | 'skipped' | 'unknown'}
 */
function parseAdherenceReply(message) {
  if (!message || typeof message !== 'string') return 'unknown';

  const normalised = message.trim().toLowerCase();
  // Tokenise on whitespace and common punctuation
  const words = normalised.split(/[\s,!?.]+/).filter(Boolean);

  // Multi-word phrase check (substring is safe here)
  if (TAKEN_PHRASES.some(p  => normalised.includes(p))) return 'taken';
  if (SKIPPED_PHRASES.some(p => normalised.includes(p))) return 'skipped';

  // Whole-word check
  if (TAKEN_WORDS.some(k  => words.includes(k))) return 'taken';
  if (SKIPPED_WORDS.some(k => words.includes(k))) return 'skipped';

  return 'unknown';
}

/**
 * Strips the "whatsapp:" prefix from Twilio's From field.
 * "whatsapp:+919876543210" → "+919876543210"
 *
 * @param {string} twilioFrom
 * @returns {string}
 */
function normaliseTwilioPhone(twilioFrom) {
  return twilioFrom.replace(/^whatsapp:/i, '');
}

module.exports = { parseAdherenceReply, normaliseTwilioPhone };
