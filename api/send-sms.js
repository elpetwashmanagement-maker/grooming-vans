// api/send-sms.js — Raykota SMS via Twilio
const twilio = require('twilio');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, message, companyId } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Missing to or message' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromEPW    = process.env.TWILIO_PHONE_EPW; // +17868336807
  const fromATW    = process.env.TWILIO_PHONE_ATW; // +15615627689

  if (!accountSid || !authToken) {
    return res.status(500).json({ error: 'Twilio not configured' });
  }

  // Seleccionar número según la empresa
  const from = companyId === 'atw' ? fromATW : fromEPW;

  try {
    const client = twilio(accountSid, authToken);
    const msg = await client.messages.create({
      body: message,
      from,
      to,
    });
    return res.status(200).json({ success: true, sid: msg.sid });
  } catch (err) {
    console.error('Twilio error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
