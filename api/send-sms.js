export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { to, message, companyId } = req.body;
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
    if (!response.ok) return res.status(400).json({ success: false, error: data });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
