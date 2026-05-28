// api/square-payment.js
// Vercel Serverless Function para procesar pagos con Square

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sourceId, amount, currency = 'USD', note = '' } = req.body;

    if (!sourceId || !amount) {
      return res.status(400).json({ error: 'Missing sourceId or amount' });
    }

    const accessToken = process.env.VITE_SQUARE_ACCESS_TOKEN;
    const locationId = process.env.VITE_SQUARE_LOCATION_ID;

    if (!accessToken || !locationId) {
      return res.status(500).json({ error: 'Square not configured' });
    }

    // Llamada a Square API
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
        amount_money: {
          amount: Math.round(amount), // en centavos
          currency,
        },
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
