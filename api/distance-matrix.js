export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { origin, destinations } = req.body;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyBR-RQ639CWkt-SprO3EM4iHp89ahPVvmE';

  try {
    const dest = destinations.map(d => encodeURIComponent(d)).join('|');
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${dest}&units=imperial&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
