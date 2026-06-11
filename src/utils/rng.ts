import { Random, MersenneTwister19937 } from "random-js";

let fallback: Random | null = null;
const testRandom: Random | null = null;

function getFallback(): Random {
  if (!fallback) {
    fallback = new Random(MersenneTwister19937.autoSeed());
  }
  return fallback;
}



/**
 * Generates a secure random integer between min and max (inclusive).
 * Prefers native cryptographic RNG APIs, falling back to random-js.
 *
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 */
export function randomInt(min: number, max: number): number {
  if (testRandom) {
    return testRandom.integer(min, max);
  }

  // Node.js environment
  if (typeof crypto !== "undefined" && "randomInt" in crypto) {
    const nodeCrypto = crypto as unknown as { randomInt: (min: number, max: number) => number };
    return nodeCrypto.randomInt(min, max + 1);
  }

  // Browser environment
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const range = max - min + 1;
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return min + (array[0] % range);
  }

  // Fallback engine (Mersenne Twister)
  return getFallback().integer(min, max);
}
