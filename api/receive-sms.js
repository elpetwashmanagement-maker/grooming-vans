export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { data } = req.body;
    if (!data) return res.status(200).json({ ok: true });
    const msg = data.object;
    if (!msg || msg.object !== 'message') return res.status(200).json({ ok: true });
    const to = msg.to?.[0] || msg.to;
    const fromPhone = msg.from;
    const body = msg.content || msg.text || msg.body || '';
    const cleanPhone = fromPhone.replace(/\D/g, '').slice(-10);

    // Calcular hoy y mañana en EST
    const now = new Date();
    const estOffset = -4 * 60;
    const estNow = new Date(now.getTime() + (estOffset - now.getTimezoneOffset()) * 60000);
    const todayISO = estNow.toISOString().split('T')[0];
    const tomorrow = new Date(estNow);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString().split('T')[0];

    // Buscar cliente
    const clientRes = await fetch(
      'https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/clients?select=id,name&phone=ilike.*' + cleanPhone + '*&limit=1',
      { headers: { 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT' } }
    );
    const clients = await clientRes.json();
    const client = clients?.[0];

    // Buscar cita de hoy O mañana para saber empresa correcta
    let apptCompanyId = to === '+15619563957' ? 'atw' : 'epw';
    let apptDate = tomorrowISO;

    if (client?.id) {
      const apptRes = await fetch(
        'https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/appointments?select=company_id,date&client_id=eq.' + client.id + '&date=in.(' + todayISO + ',' + tomorrowISO + ')&order=date.asc&limit=1',
        { headers: { 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT' } }
      );
      const appts = await apptRes.json();
      console.log('Appts found:', JSON.stringify(appts));
      if (appts?.[0]?.company_id) {
        apptCompanyId = appts[0].company_id;
        apptDate = appts[0].date;
      }
    }

    const companyId = apptCompanyId;
    const companyName = companyId === 'atw' ? 'All Tails Wag' : 'El Pet Wash';
    const fromNumber = companyId === 'atw' ? '+15619563957' : '+19542870564';
    const firstName = client?.name?.split(' ')[0] || 'there';

    console.log('Company resolved:', companyId, 'fromNumber:', fromNumber, 'apptDate:', apptDate);

    // Guardar mensaje
    await fetch('https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ id: msg.id || 'msg_' + Date.now(), phone: fromPhone, body, direction: 'inbound', company_id: companyId, client_id: client?.id || null, client_name: client?.name || null, message_id: msg.id, status: 'received', created_at: new Date().toISOString() })
    });

    const response = body.trim().toUpperCase();
    if (response === 'YES' || response === 'SI' || response === 'SÍ') {
      if (client?.id) {
        await fetch(
          'https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/appointments?client_id=eq.' + client.id + '&date=eq.' + apptDate,
          { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT' }, body: JSON.stringify({ status: 'confirmed' }) }
        );
      }
      await fetch('https://api.openphone.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': process.env.OPENPHONE_API_KEY },
        body: JSON.stringify({ from: fromNumber, to: [fromPhone], content: 'Thank you ' + firstName + '! Your appointment is confirmed. See you then! - ' + companyName })
      });
    } else if (response === 'NO') {
      await fetch('https://api.openphone.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': process.env.OPENPHONE_API_KEY },
        body: JSON.stringify({ from: fromNumber, to: [fromPhone], content: 'No problem ' + firstName + '! What day works better for you? Please reply with a date and we will reschedule. - ' + companyName })
      });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(200).json({ ok: true });
  }
}
