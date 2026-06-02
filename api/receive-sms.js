// api/receive-sms.js — Webhook para SMS entrantes de Twilio
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const { From, To, Body, MessageSid } = req.body;

  if (!From || !Body) {
    return res.status(400).send('Missing fields');
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || 'https://lpzwnbrjpayjhlwjmuda.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY
  );

  // Determinar company por número destino
  const companyId = To === process.env.TWILIO_PHONE_ATW ? 'atw' : 'epw';

  // Buscar cliente por teléfono
  const cleanPhone = From.replace(/\D/g, '');
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .or(`phone.ilike.%${cleanPhone.slice(-10)}%`)
    .limit(1);

  const client = clients?.[0];

  // Guardar mensaje entrante
  await supabase.from('messages').insert({
    id: MessageSid || `inbound-${Date.now()}`,
    client_id: client?.id || null,
    client_name: client?.name || From,
    phone: From,
    company_id: companyId,
    direction: 'inbound',
    body: Body,
    status: 'received',
    twilio_sid: MessageSid,
  });

  // Responder a Twilio con TwiML vacío
  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
}
