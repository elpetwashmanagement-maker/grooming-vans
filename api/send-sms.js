// api/send-sms.js — Raykota SMS via Twilio
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, message, companyId, clientId, clientName } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const accountSid        = process.env.TWILIO_ACCOUNT_SID;
  const authToken         = process.env.TWILIO_AUTH_TOKEN;
  const messagingService  = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (!accountSid || !authToken || !messagingService) {
    console.error('Twilio env vars missing:', { accountSid: !!accountSid, authToken: !!authToken, messagingService: !!messagingService });
    return res.status(500).json({ error: 'Twilio not configured' });
  }

  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(accountSid, authToken);
    const msg = await client.messages.create({
      body: message,
      messagingServiceSid: messagingService,
      to,
    });

    // Guardar en tabla messages
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      'https://lpzwnbrjpayjhlwjmuda.supabase.co',
      process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY
    );
    await supabase.from('messages').insert({
      id: msg.sid,
      client_id: clientId || null,
      client_name: clientName || to,
      phone: to,
      company_id: companyId || 'epw',
      direction: 'outbound',
      body: message,
      status: 'sent',
      twilio_sid: msg.sid,
    });

    return res.status(200).json({ success: true, sid: msg.sid });
  } catch (err) {
    console.error('Twilio error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
