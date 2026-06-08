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
      const timeStart = appt.time_start || '';
      const timeEnd = appt.time_end || '';
      const timeRange = timeStart && timeEnd ? ' between ' + timeStart + '-' + timeEnd : timeStart ? ' at ' + timeStart : '';
      const firstName = client.name.split(' ')[0];
      const msg = 'Hi ' + firstName + '! Your grooming appointment is tomorrow' + timeRange + '. We will come to your home. Reply YES to confirm or NO to reschedule. - ' + companyName;
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
