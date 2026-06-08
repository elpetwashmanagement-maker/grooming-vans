export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { data } = req.body;
    if (!data) return res.status(200).json({ ok: true });
    const msg = data.object;
    if (!msg || msg.object !== 'message') return res.status(200).json({ ok: true });

    const fromPhone = msg.from;
    const body = (msg.content || msg.text || msg.body || '').trim();
    const cleanPhone = fromPhone.replace(/\D/g, '').slice(-10);
    
    // Usar phoneNumberId para determinar empresa - más confiable
    const phoneNumberId = msg.phoneNumberId;
    const companyId = phoneNumberId === 'PNNfm96Y4a' ? 'atw' : 'epw';
    const companyName = companyId === 'atw' ? 'All Tails Wag' : 'El Pet Wash';
    const fromNumber = companyId === 'atw' ? '+15619563957' : '+19542870564';

    console.log('phoneNumberId:', phoneNumberId, 'companyId:', companyId, 'fromNumber:', fromNumber);

    // Buscar cliente
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

    // Guardar mensaje
    await fetch('https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ id: msg.id || 'msg_' + Date.now(), phone: fromPhone, body, direction: 'inbound', company_id: companyId, client_id: client?.id || null, client_name: client?.name || null, message_id: msg.id, status: 'received', created_at: new Date().toISOString() })
    });

    const response = body.toUpperCase();

    const sendReply = async (content) => {
      await fetch('https://api.openphone.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': process.env.OPENPHONE_API_KEY },
        body: JSON.stringify({ from: fromNumber, to: [fromPhone], content })
      });
    };

    // Cliente existente → manejar YES/NO
    if (client) {
      if (response === 'YES' || response === 'SI' || response === 'SÍ') {
        if (client.id) {
          await fetch(
            'https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/appointments?client_id=eq.' + client.id + '&date=in.(' + todayISO + ',' + tomorrowISO + ')',
            { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT' }, body: JSON.stringify({ status: 'confirmed' }) }
          );
        }
        await sendReply('Thank you ' + firstName + '! Your appointment is confirmed. See you then! - ' + companyName);
      } else if (response === 'NO') {
        await sendReply('No problem ' + firstName + '! What day works better for you? Please reply with a date and we will reschedule. - ' + companyName);
      }
      return res.status(200).json({ ok: true });
    }

    // Cliente nuevo → flujo de idioma
    const stateRes = await fetch(
      'https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/conversation_state?phone=eq.' + fromPhone + '&limit=1',
      { headers: { 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT' } }
    );
    const states = await stateRes.json();
    const state = states?.[0];

    const saveState = async (newState, language) => {
      await fetch('https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/conversation_state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ id: fromPhone + '_' + companyId, phone: fromPhone, company_id: companyId, state: newState, language, updated_at: new Date().toISOString() })
      });
    };

    if (!state || state.state === 'new') {
      await saveState('waiting_language', null);
      await sendReply('Welcome to ' + companyName + '! 🐾\nReply 1 for English\nReply 2 para Español');
    } else if (state.state === 'waiting_language') {
      if (body === '1') {
        await saveState('waiting_info', 'en');
        await sendReply('Great! 🐾 Please reply with:\nFull name, Home address, Pet name, Pet breed, Pet size (small/medium/large)\n\nExample: Maria Garcia, 123 SW 5th St Miami FL 33130, Max, Golden Retriever, medium - ' + companyName);
      } else if (body === '2') {
        await saveState('waiting_info', 'es');
        await sendReply('¡Perfecto! 🐾 Por favor responde con:\nNombre completo, Dirección, Nombre mascota, Raza, Tamaño (pequeño/mediano/grande)\n\nEjemplo: Maria Garcia, 123 SW 5th St Miami FL 33130, Max, Golden Retriever, mediano - ' + companyName);
      } else {
        await sendReply('Please reply 1 for English or 2 para Español 🐾');
      }
    } else if (state.state === 'waiting_info') {
      await saveState('info_received', state.language);
      if (state.language === 'es') {
        await sendReply('¡Gracias! 🐾 Hemos recibido tu información. Un miembro de nuestro equipo te contactará pronto. - ' + companyName);
      } else {
        await sendReply('Thank you! 🐾 We have received your information. A team member will contact you shortly. - ' + companyName);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(200).json({ ok: true });
  }
}
