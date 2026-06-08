export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { messages } = req.body;
  
  try {
    const prompt = `Extract client information from these SMS messages and return ONLY a valid JSON object with these fields: name, address, zip, city, state, phone, petName, petBreed, petSize (small/medium/large/xlarge), petSpecies (dog/cat). If info not found leave empty string.

Messages:
${messages}

Return ONLY the JSON object, no explanation.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    const data = await response.json();
    const text = data.content?.[0]?.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const info = JSON.parse(clean);
    
    return res.status(200).json({ success: true, data: info });
  } catch (err) {
    console.error('Parse error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
