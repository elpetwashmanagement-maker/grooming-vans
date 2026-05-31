const twilio = require('twilio');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, message, companyId } = req.body;

  if (!to || !message || !companyId) {
    return res.status(400).json({ error: 'Faltan datos: to, message, companyId' });
  }

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const from = companyId === 'epw'
    ? process.env.TWILIO_NUMBER_EPW
    : process.env.TWILIO_NUMBER_ATW;

  try {
    const result = await client.messages.create({
      body: message,
      from,
      to,
    });

    return res.status(200).json({ success: true, sid: result.sid });
  } catch (err) {
    console.error('Twilio error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
