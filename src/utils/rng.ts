import { Random, MersenneTwister19937 } from "random-js";

let fallback: Random | null = null;
let testRandom: Random | null = null;

function getFallback(): Random {
  if (!fallback) {
    fallback = new Random(MersenneTwister19937.autoSeed());
  }
  return fallback;
}

/**
 * Sets a seeded engine for deterministic testing.
 * @param seed The seed value to initialize the Mersenne Twister engine.
 */
export function setSeededEngine(seed: number): void {
  testRandom = new Random(MersenneTwister19937.seed(seed));
}

/**
 * Clears the seeded test engine, reverting to default secure/fallback RNG.
 */
export function clearSeededEngine(): void {
  testRandom = null;
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
