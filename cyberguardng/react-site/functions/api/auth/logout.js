// Logout endpoint - Clear session cookie

export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  
  // Clear session cookie
  return new Response(
    JSON.stringify({ success: true, message: "Logged out successfully" }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": "session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
      }
    }
  );
}

// Also handle GET for simple logout links
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  
  // Clear session cookie and redirect to login
  return new Response(null, {
    status: 302,
    headers: {
      "Location": "/portal/login",
      "Set-Cookie": "session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
    }
  });
}
