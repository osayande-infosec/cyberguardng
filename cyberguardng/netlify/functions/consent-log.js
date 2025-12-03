// netlify/functions/consent-log.js
// Optional: logs user consent choices for compliance/audit

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { consent, timestamp, userAgent } = body;

  // Log to console (in production, send to analytics service, database, etc.)
  console.log("Consent logged:", {
    consent,
    timestamp,
    userAgent,
    clientIP: event.headers["client-ip"] || "unknown",
  });

  // Optional: Send to external service (e.g., Segment, Mixpanel, custom DB)
  // await sendToAnalytics({ consent, timestamp, userAgent });

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};
