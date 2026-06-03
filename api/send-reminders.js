// api/send-reminders.js
// Envia recordatorios SMS 24h antes de cada cita
// Cron configurado en vercel.json: "0 14 * * *" (9am EST)

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  // Seguridad: solo Vercel Cron puede llamar esto
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const twilio = (await import("twilio")).default;
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Fecha de manana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString().slice(0, 10);

    // Buscar citas de manana confirmadas
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        id, date, time_start, company_id,
        clients(name, phone, notify_sms),
        vans(name),
        appointment_pets(pets(name))
      `)
      .eq("date", tomorrowISO)
      .in("status", ["confirmed", "unconfirmed"]);

    if (error) throw error;

    const results = [];

    for (const appt of appointments || []) {
      const client = appt.clients;
      if (!client || !client.phone || !client.notify_sms) continue;

      const petNames = (appt.appointment_pets || [])
        .map(ap => ap.pets && ap.pets.name)
        .filter(Boolean)
        .join(", ") || "your pet";

      const time = (appt.time_start || "").slice(0, 5);
      const vanName = (appt.vans && appt.vans.name) || "our van";
      const companyName = appt.company_id === "atw" ? "All Tails Wag" : "El Pet Wash";

      const message = `Hi ${client.name}! Reminder: ${petNames} grooming appointment is tomorrow at ${time} with ${companyName} (${vanName}). See you tomorrow! Reply STOP to unsubscribe.`;

      const cleanPhone = client.phone.replace(/\D/g, "");
      const toPhone = client.phone.startsWith("+") ? client.phone : `+1${cleanPhone}`;

      try {
        const msg = await twilioClient.messages.create({
          body: message,
          messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
          to: toPhone,
        });

        await supabase.from("messages").insert({
          client_name: client.name,
          phone: client.phone,
          company_id: appt.company_id || "epw",
          direction: "outbound",
          body: message,
          status: "sent",
          twilio_sid: msg.sid,
        });

        results.push({ apptId: appt.id, client: client.name, status: "sent" });
      } catch (smsErr) {
        results.push({
          apptId: appt.id,
          client: client.name,
          status: "error",
          error: smsErr.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      date: tomorrowISO,
      total: results.length,
      results,
    });

  } catch (err) {
    console.error("Reminder error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
