/**
 * Pure scheduler logic — no DB/Twilio calls here so it's fully unit-testable.
 *
 * The cron runner calls isDueNow() every minute to decide which medication
 * reminders to fire.
 */

/**
 * Returns true if any of the medication's reminderTimes matches the given
 * HH:MM string and the medication is active within [startDate, endDate].
 *
 * @param {object} medication
 * @param {string[]} medication.reminderTimes  e.g. ["08:00", "13:00", "21:00"]
 * @param {string}   medication.startDate      "YYYY-MM-DD"
 * @param {string|null} medication.endDate     "YYYY-MM-DD" or null
 * @param {boolean}  medication.active
 * @param {string}   currentHHMM               e.g. "08:00"
 * @param {string}   currentDateStr            "YYYY-MM-DD"  (in patient's timezone)
 * @returns {boolean}
 */
function isDueNow(medication, currentHHMM, currentDateStr) {
  if (!medication.active) return false;

  const currentDate = new Date(currentDateStr);
  const startDate   = new Date(medication.startDate);

  if (currentDate < startDate) return false;
  if (medication.endDate && currentDate > new Date(medication.endDate)) return false;

  return medication.reminderTimes.includes(currentHHMM);
}

/**
 * From a list of medications, returns those due right now.
 *
 * @param {object[]} medications
 * @param {string}   currentHHMM
 * @param {string}   currentDateStr
 * @returns {object[]}
 */
function getDueMedications(medications, currentHHMM, currentDateStr) {
  return medications.filter(m => isDueNow(m, currentHHMM, currentDateStr));
}

/**
 * Formats the WhatsApp reminder message sent to the patient.
 *
 * @param {object} params
 * @param {string} params.patientName
 * @param {string} params.medicationName
 * @param {string} params.dosage
 * @param {string} params.time            HH:MM (24h)
 * @param {string} [params.instructions]
 * @returns {string}
 */
function buildReminderMessage({ patientName, medicationName, dosage, time, instructions }) {
  const firstName = patientName.split(' ')[0];
  let msg = `💊 Hi ${firstName}! Time to take your *${medicationName}* — ${dosage}`;
  if (instructions) msg += `\n📝 ${instructions}`;
  msg += `\n\nReply *YES* once taken or *NO* to skip.`;
  return msg;
}

module.exports = { isDueNow, getDueMedications, buildReminderMessage };
