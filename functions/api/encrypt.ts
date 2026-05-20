import { deriveKeyPBKDF2, encryptWithAAD } from "../utils/crypto";

interface Env {
  SECRET_KEY?: string;
  SALT_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // Parse request body
    const body = await context.request.json<{ data?: string }>().catch(() => null);
    if (!body || typeof body.data !== "string" || !body.data.trim()) {
      return new Response(
        JSON.stringify({ error: "Invalid request payload." }),
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

    // Derive 256-bit AES-GCM key using PBKDF2
    const key = await deriveKeyPBKDF2(secretKey, saltKey);

    // Encrypt with Additional Authenticated Data (AAD)
    const ciphertext = await encryptWithAAD(body.data, key, "dnd-toolkit:v1");

    // Output is prefixed with the version "v1."
    const encrypted = `v1.${ciphertext}`;

    return new Response(
      JSON.stringify({ encrypted }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    // Prevent internal details or stack traces from leaking
    return new Response(
      JSON.stringify({ error: "Encryption failed." }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
