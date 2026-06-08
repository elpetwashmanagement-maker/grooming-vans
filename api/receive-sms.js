export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { data } = req.body;
    if (!data) return res.status(200).json({ ok: true });
    const msg = data.object;
    if (!msg || msg.object !== 'message') return res.status(200).json({ ok: true });
    const to = msg.to?.[0];
    const companyId = to === '+15619563957' ? 'atw' : 'epw';
    const fromPhone = msg.from;
    const body = msg.content || msg.text || msg.body || '';
    const cleanPhone = fromPhone.replace(/\D/g, '').slice(-10);
    const clientRes = await fetch(
      `https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/clients?select=id,name&phone=ilike.*${cleanPhone}*&limit=1`,
      { headers: { 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT' } }
    );
    const clients = await clientRes.json();
    const client = clients?.[0];
    const payload = {
      id: msg.id || `msg_${Date.now()}`,
      phone: fromPhone,
      body,
      direction: 'inbound',
      company_id: companyId,
      client_id: client?.id || null,
      client_name: client?.name || null,
      message_id: msg.id,
      status: 'received',
      created_at: new Date().toISOString(),
    };
    console.log('Inserting message:', JSON.stringify(payload));
    const r = await fetch('https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT',
        'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    const text = await r.text();
    console.log('Supabase response:', r.status, text);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(200).json({ ok: true });
  }
}
