import {
  deriveKey,
  decrypt,
  deriveKeyPBKDF2,
  decryptWithAAD
} from "../utils/crypto";
import { checkRateLimit } from "../utils/rateLimit";

interface Env {
  SECRET_KEY?: string;
  SALT_KEY?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  // 1. Basic In-Memory Rate Limiting
  const ip = context.request.headers.get("CF-Connecting-IP") || 
             context.request.headers.get("X-Forwarded-For") || 
             "127.0.0.1";

  if (!checkRateLimit(ip)) {
    return new Response(
      "Too many requests. Please try again later.",
      { status: 429 }
    );
  }

  const encryptedData = context.params.data as string;
  if (!encryptedData) {
    return new Response("Missing identifier.", { status: 400 });
  }

  // 2. Size Guard
  if (encryptedData.length > 2048) {
    return new Response("Payload exceeds safe size limit.", { status: 400 });
  }

  try {
    const secretKey = context.env.SECRET_KEY || "dev-fallback-secret-key-change-in-prod";
    const saltKey = context.env.SALT_KEY || "dev-fallback-salt-key-change-in-prod";

    let decryptedData: string;

    // 3. Version Parsing & Legacy mode fallback
    if (encryptedData.startsWith("v1.")) {
      const ciphertext = encryptedData.substring(3);
      const key = await deriveKeyPBKDF2(secretKey, saltKey);
      decryptedData = await decryptWithAAD(ciphertext, key, "dnd-toolkit:v1");
    } else if (encryptedData.includes(".") && !encryptedData.startsWith("v1.")) {
      return new Response("Unsupported payload version.", { status: 400 });
    } else {
      const key = await deriveKey(secretKey);
      decryptedData = await decrypt(encryptedData, key);
    }

    const url = new URL(context.request.url);
    const acceptHeader = context.request.headers.get("Accept") || "";
    const wantJson = acceptHeader.includes("application/json") || url.searchParams.get("format") === "json";

    // 4. Return JSON if requested
    if (wantJson) {
      return new Response(
        JSON.stringify({ data: decryptedData }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 5. In-Memory client-side hydration via HTML loading shell (Eliminates Plaintext in Redirect URLs)
    let redirectPath = "/";
    if (decryptedData.includes("c:tHP")) {
      redirectPath = "/hp-calculator";
    } else if (decryptedData.includes("c:tPB")) {
      redirectPath = "/stat-generator/pointbuy";
    } else {
      redirectPath = "/stat-generator/rolled";
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>D&D GM Toolkit - Loading...</title>
  <style>
    body {
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: #0b0f19;
      color: #e2e8f0;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .loader-container {
      text-align: center;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      border-top-color: #3b82f6;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h2 {
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #94a3b8;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="loader-container">
    <div class="spinner"></div>
    <h2>Loading secure character data...</h2>
  </div>
  <script>
    try {
      sessionStorage.setItem("shared_character_data", ${JSON.stringify(decryptedData)});
      window.location.href = ${JSON.stringify(redirectPath)};
    } catch (err) {
      console.error("Failed to load character:", err);
      document.querySelector("h2").innerText = "Failed to load character.";
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
      },
    });

  } catch (error: any) {
    // Prevent sensitive info leak
    return new Response("Secure link decryption failed.", { status: 400 });
  }
};
