export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { data } = req.body;
    if (!data) return res.status(200).json({ ok: true });
    const msg = data.object;
    if (!msg || msg.object !== 'message') return res.status(200).json({ ok: true });

    const toNumber = msg.to?.[0] || msg.to || '';
    const fromPhone = msg.from;
    const body = (msg.content || msg.text || msg.body || '').trim();
    const cleanPhone = fromPhone.replace(/\D/g, '').slice(-10);
    const companyId = toNumber.includes('5619563957') ? 'atw' : 'epw';
    const companyName = companyId === 'atw' ? 'All Tails Wag' : 'El Pet Wash';
    const fromNumber = companyId === 'atw' ? '+15619563957' : '+19542870564';

    console.log('to:', toNumber, 'companyId:', companyId, 'body:', body);

    // Buscar cliente existente
    const clientRes = await fetch(
      'https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/clients?select=id,name&phone=ilike.*' + cleanPhone + '*&limit=1',
      { headers: { 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT' } }
    );
    const clients = await clientRes.json();
    const client = clients?.[0];
    const firstName = client?.name?.split(' ')[0] || 'there';

    // Calcular fechas EST
    const now = new Date();
    const estOffset = -4 * 60;
    const estNow = new Date(now.getTime() + (estOffset - now.getTimezoneOffset()) * 60000);
    const todayISO = estNow.toISOString().split('T')[0];
    const tomorrow = new Date(estNow);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString().split('T')[0];

    // Guardar mensaje entrante
    await fetch('https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ id: msg.id || 'msg_' + Date.now(), phone: fromPhone, body, direction: 'inbound', company_id: companyId, client_id: client?.id || null, client_name: client?.name || null, message_id: msg.id, status: 'received', created_at: new Date().toISOString() })
    });

    const response = body.toUpperCase();

    // ── SI ES CLIENTE EXISTENTE → manejar YES/NO ──
    if (client) {
      if (response === 'YES' || response === 'SI' || response === 'SÍ') {
        await fetch(
          'https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/appointments?client_id=eq.' + client.id + '&date=in.(' + todayISO + ',' + tomorrowISO + ')',
          { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT' }, body: JSON.stringify({ status: 'confirmed' }) }
        );
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
    }

    // ── CLIENTE NUEVO → flujo de idioma ──
    const stateRes = await fetch(
      'https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/conversation_state?phone=eq.' + fromPhone + '&limit=1',
      { headers: { 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT' } }
    );
    const states = await stateRes.json();
    const state = states?.[0];

    const sendReply = async (content) => {
      await fetch('https://api.openphone.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': process.env.OPENPHONE_API_KEY },
        body: JSON.stringify({ from: fromNumber, to: [fromPhone], content })
      });
    };

    const saveState = async (newState, language) => {
      const payload = { id: fromPhone + '_' + companyId, phone: fromPhone, company_id: companyId, state: newState, language, updated_at: new Date().toISOString() };
      await fetch('https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/conversation_state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(payload)
      });
    };

    if (!state || state.state === 'new') {
      // Primer mensaje — pedir idioma
      await saveState('waiting_language', null);
      await sendReply('Welcome to ' + companyName + '! 🐾\nReply 1 for English\nReply 2 para Español');
    } else if (state.state === 'waiting_language') {
      if (body === '1') {
        await saveState('waiting_info', 'en');
        await sendReply('Great! 🐾 Please reply with:\n1. Full name\n2. Address\n3. Pet name & breed\n4. Pet size (small/medium/large)\n\nExample: Maria Garcia, 123 SW 5th St Miami FL 33130, Max golden retriever medium');
      } else if (body === '2') {
        await saveState('waiting_info', 'es');
        await sendReply('¡Perfecto! 🐾 Por favor responde con:\n1. Nombre completo\n2. Dirección\n3. Nombre y raza de tu mascota\n4. Tamaño (pequeño/mediano/grande)\n\nEjemplo: Maria Garcia, 123 SW 5th St Miami FL 33130, Max golden retriever mediano');
      } else {
        await sendReply('Please reply 1 for English or 2 para Español 🐾');
      }
    } else if (state.state === 'waiting_info') {
      // Cliente envió su info — notificar al admin en Messages
      await saveState('info_received', state.language);
      if (state.language === 'es') {
        await sendReply('¡Gracias! 🐾 Hemos recibido tu información. Un miembro de nuestro equipo te contactará pronto para confirmar tu cita. - ' + companyName);
      } else {
        await sendReply('Thank you! 🐾 We have received your information. A team member will contact you shortly to confirm your appointment. - ' + companyName);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(200).json({ ok: true });
  }
}
