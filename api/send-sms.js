import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lpzwnbrjpayjhlwjmuda.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT'
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { to, message, companyId, clientId, clientName } = req.body;
  const fromNumber = companyId === 'atw' ? '+15619563957' : '+19542870564';
  try {
    const response = await fetch('https://api.openphone.com/v1/messages', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': process.env.OPENPHONE_API_KEY 
      },
      body: JSON.stringify({ 
        from: fromNumber,
        to: [to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`], 
        content: message 
      }),
    });
    const data = await response.json();
    console.log('OpenPhone:', JSON.stringify(data));
    
    // Guardar en Supabase
    if (response.ok) {
      await supabase.from('messages').insert({
        phone: to,
        body: message,
        direction: 'outbound',
        company_id: companyId || 'epw',
        client_id: clientId || null,
        client_name: clientName || null,
        message_id: data.id || null,
        status: 'sent',
      });
    }
    
    if (!response.ok) return res.status(400).json({ success: false, error: data });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
