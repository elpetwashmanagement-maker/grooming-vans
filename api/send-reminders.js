export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const now = new Date();
    const estOffset = -4 * 60;
    const estNow = new Date(now.getTime() + (estOffset - now.getTimezoneOffset()) * 60000);
    const tomorrow = new Date(estNow);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString().split('T')[0];
    console.log('Sending reminders for:', tomorrowISO);

    const apptRes = await fetch(
      'https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/appointments?select=*&date=eq.' + tomorrowISO + '&status=in.(confirmed,unconfirmed)',
      { headers: { 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT' } }
    );
    const appointments = await apptRes.json();
    console.log('Appointments found:', appointments.length);

    // Cargar groomers
    const groomersRes = await fetch(
      'https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/groomers?select=id,name,van_id',
      { headers: { 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT' } }
    );
    const groomers = await groomersRes.json();

    let sent = 0;
    for (const appt of appointments) {
      const clientRes = await fetch(
        'https://lpzwnbrjpayjhlwjmuda.supabase.co/rest/v1/clients?select=*&id=eq.' + appt.client_id + '&notify_sms=eq.true',
        { headers: { 'apikey': 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT', 'Authorization': 'Bearer sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT' } }
      );
      const clients = await clientRes.json();
      const client = clients?.[0];
      if (!client?.phone) continue;

      const companyId = appt.company_id || 'epw';
      const companyName = companyId === 'atw' ? 'All Tails Wag' : 'El Pet Wash';
      const firstName = client.name.split(' ')[0];

      // Calcular ETA de 2 horas
      const timeStart = appt.time_start || '';
      let timeRange = '';
      if (timeStart) {
        const [h, m] = timeStart.split(':').map(Number);
        const endH = (h + 2) % 24;
        const endTime = String(endH).padStart(2, '0') + ':' + String(m).padStart(2, '0');
        timeRange = ' between ' + timeStart + '-' + endTime;
      }

      // Nombre del groomer
      const groomer = groomers.find(g => g.id === appt.groomer_id || g.van_id === appt.van_id);
      const groomerName = groomer?.name ? ' Your groomer will be ' + groomer.name + '.' : '';

      const msg = 'Hi ' + firstName + '! Your grooming appointment is tomorrow' + timeRange + '.' + groomerName + ' We will come to your home. Reply YES to confirm or NO to reschedule. - ' + companyName;

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
