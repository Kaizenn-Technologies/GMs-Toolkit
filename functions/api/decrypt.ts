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
  // 1. Basic In-Memory Rate Limiting per sliding minute
  const ip = context.request.headers.get("CF-Connecting-IP") || 
             context.request.headers.get("X-Forwarded-For") || 
             "127.0.0.1";

  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const url = new URL(context.request.url);
    const encryptedData = url.searchParams.get("data");

    if (!encryptedData || !encryptedData.trim()) {
      return new Response(
        JSON.stringify({ error: "Invalid payload." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 2. Payload Size Guard
    if (encryptedData.length > 2048) {
      return new Response(
        JSON.stringify({ error: "Payload exceeds safe size limit." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const secretKey = context.env.SECRET_KEY || "dev-fallback-secret-key-change-in-prod";
    const saltKey = context.env.SALT_KEY || "dev-fallback-salt-key-change-in-prod";

    let decryptedData: string;

    // 3. Version Parsing & Backward Compatibility
    if (encryptedData.startsWith("v1.")) {
      // Modern format: PBKDF2 key derivation and AES-GCM decryption with AAD context
      const ciphertext = encryptedData.substring(3);
      const key = await deriveKeyPBKDF2(secretKey, saltKey);
      decryptedData = await decryptWithAAD(ciphertext, key, "dnd-toolkit:v1");
    } else if (encryptedData.includes(".") && !encryptedData.startsWith("v1.")) {
      // Future unsupported version detected
      return new Response(
        JSON.stringify({ error: "Unsupported version payload." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      // Legacy Mode: fallback to SHA-256 derived keys and no AAD
      const key = await deriveKey(secretKey);
      decryptedData = await decrypt(encryptedData, key);
    }

    return new Response(
      JSON.stringify({ data: decryptedData }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    // Robust Generic Error Handling (Prevent Leakage of Stacktraces, Key errors, or Crypto exceptions)
    return new Response(
      JSON.stringify({ error: "Decryption failed." }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
