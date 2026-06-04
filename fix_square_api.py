new_content = '''// api/square-payment.js
// Vercel Serverless Function para procesar pagos con Square
// Soporta dos empresas: epw (El Pet Wash) y atw (All Tails Wag)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { sourceId, amount, currency = 'USD', note = '', companyId = 'epw' } = req.body;

    if (!sourceId || !amount) {
      return res.status(400).json({ error: 'Missing sourceId or amount' });
    }

    let accessToken, locationId;

    if (companyId === 'atw') {
      accessToken = process.env.SQUARE_ACCESS_TOKEN_ATW;
      locationId  = process.env.SQUARE_LOCATION_ID_ATW || 'L2GY0521F3XAG';
    } else {
      accessToken = process.env.SQUARE_ACCESS_TOKEN_EPW || process.env.VITE_SQUARE_ACCESS_TOKEN;
      locationId  = process.env.SQUARE_LOCATION_ID_EPW || process.env.VITE_SQUARE_LOCATION_ID || 'LVYKDEEJCC7NE';
    }

    if (!accessToken) {
      return res.status(500).json({ error: `Square not configured for company: ${companyId}` });
    }

    const squareResponse = await fetch('https://connect.squareup.com/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Square-Version': '2024-01-18',
      },
      body: JSON.stringify({
        source_id: sourceId,
        idempotency_key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        amount_money: { amount: Math.round(amount), currency },
        location_id: locationId,
        note,
      }),
    });

    const data = await squareResponse.json();

    if (!squareResponse.ok) {
      const errorMsg = data.errors?.[0]?.detail || 'Payment failed';
      return res.status(400).json({ error: errorMsg });
    }

    return res.status(200).json({
      success: true,
      paymentId: data.payment?.id,
      status: data.payment?.status,
      amount: data.payment?.amount_money?.amount,
    });

  } catch (error) {
    console.error('Square payment error:', error);
    return res.status(500).json({ error: error.message });
  }
}
'''

with open('api/square-payment.js', 'w') as f:
    f.write(new_content)

print("Listo:", len(new_content.splitlines()), "lineas")