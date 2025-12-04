// Cloudflare Pages Function for consent logging
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    
    // Log consent event (in production, you'd store this in a database)
    console.log("Consent event:", {
      timestamp: new Date().toISOString(),
      categories: body.categories || {},
      userAgent: context.request.headers.get("user-agent"),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
