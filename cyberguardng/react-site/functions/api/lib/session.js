// Shared session-token creation/verification and cookie parsing.
//
// Previously duplicated across google/callback.js, saml/callback.js,
// session.js and db.js, each with its own copy of the SESSION_SECRET
// fallback bug. One copy now, so that bug only needs fixing once.

// Returns the configured secret, or null. No fallback string: a caller
// that gets null must refuse to create or verify a session, never sign
// with a value anyone can read on GitHub.
export function getSessionSecret(env) {
  return env.SESSION_SECRET || null;
}

export async function createSessionToken(data, secret) {
  const encoder = new TextEncoder();
  const payload = JSON.stringify(data);
  const payloadBase64 = base64UrlEncode(payload);

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadBase64));
  const signatureBase64 = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));

  return `${payloadBase64}.${signatureBase64}`;
}

export async function verifySessionToken(token, secret) {
  try {
    const [payloadBase64, signatureBase64] = token.split(".");
    if (!payloadBase64 || !signatureBase64) {
      return null;
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signature = Uint8Array.from(base64UrlDecode(signatureBase64), (c) => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(payloadBase64));
    if (!isValid) {
      return null;
    }

    return JSON.parse(base64UrlDecode(payloadBase64));
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader) {
  const cookies = {};
  (cookieHeader || "").split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = value;
    }
  });
  return cookies;
}

function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4;
  if (padding) {
    base64 += "=".repeat(4 - padding);
  }
  return decodeURIComponent(escape(atob(base64)));
}
