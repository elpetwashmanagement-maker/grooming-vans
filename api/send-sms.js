// api/send-sms.js — Raykota SMS via Twilio
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, message, companyId } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromEPW    = process.env.TWILIO_PHONE_EPW;
  const fromATW    = process.env.TWILIO_PHONE_ATW;

  if (!accountSid || !authToken) {
    return res.status(500).json({ error: 'Twilio not configured' });
  }

  const from = companyId === 'atw' ? fromATW : fromEPW;

  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(accountSid, authToken);
    const msg = await client.messages.create({ body: message, from, to });
    return res.status(200).json({ success: true, sid: msg.sid });
  } catch (err) {
    console.error('Twilio error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
