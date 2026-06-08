import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lpzwnbrjpayjhlwjmuda.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'sb_publishable_lhP4mOguArbd8w-GFDn1CA_8lqEyseT'
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { data } = req.body;
    if (!data) return res.status(200).json({ ok: true });
    
    const msg = data.object;
    if (!msg || msg.object !== 'message') return res.status(200).json({ ok: true });
    
    // Determinar empresa por número receptor
    const to = msg.to?.[0];
    const companyId = to === '+15619563957' ? 'atw' : 'epw';
    const fromPhone = msg.from;
    
    // Guardar en Supabase
    await supabase.from('messages').insert({
      phone: fromPhone,
      body: msg.content,
      direction: 'inbound',
      company_id: companyId,
      message_id: msg.id,
      status: 'received',
    });
    
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(200).json({ ok: true });
  }
}
