export default async function handler(req, res) {
  // Verificar que es un cron job de Vercel
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Obtener fecha de mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString().split('T')[0];

    // Buscar citas de mañana
    const apptRes = await fetch(
      `https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/appointments?select=*,appointment_pets(*)&date=eq.${tomorrowISO}&status=in.(confirmed,unconfirmed)`,
      { headers: { 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT' } }
    );
    const appointments = await apptRes.json();

    let sent = 0;
    for (const appt of appointments) {
      // Buscar cliente
      const clientRes = await fetch(
        `https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/clients?select=*&id=eq.${appt.client_id}&notify_sms=eq.true`,
        { headers: { 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT' } }
      );
      const clients = await clientRes.json();
      const client = clients?.[0];
      if (!client?.phone) continue;

      const companyId = appt.company_id || 'epw';
      const companyName = companyId === 'atw' ? 'All Tails Wag' : 'El Pet Wash';
      const time = appt.time_start || '';
      const msg = `Hi ${client.name.split(' ')[0]}! 🐾 Reminder: your grooming appointment is tomorrow${time ? ` at ${time}` : ''}. We'll come to your home. See you then! — ${companyName}`;

      // Enviar SMS
      await fetch('https://grooming-vans.vercel.app/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: client.phone, message: msg, companyId, clientId: client.id, clientName: client.name })
      });
      sent++;
    }

    return res.status(200).json({ success: true, sent, date: tomorrowISO });
  } catch (err) {
    console.error('Reminders error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
