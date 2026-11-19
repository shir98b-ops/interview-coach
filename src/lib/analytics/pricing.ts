/**
 * What each AI call costs, from the token counts the AI service returns.
 * Prices are US dollars per million tokens. The raw token counts are stored
 * too, so the cost can be recomputed if prices change.
 */
export const modelPrices: Record<string, { input: number; output: number }> = {
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
};

/** Cache writes cost a bit more than plain input, cache reads much less. */
const CACHE_WRITE_FACTOR = 1.25;
const CACHE_READ_FACTOR = 0.1;

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
}

export function costUsd(model: string, usage: TokenUsage): number {
  // An unknown model is priced like the most expensive one, so a new model
  // never shows up as free.
  const price = modelPrices[model] ?? modelPrices["claude-sonnet-5-5"];
  const input =
    usage.input_tokens +
    (usage.cache_creation_input_tokens ?? 0) * CACHE_WRITE_FACTOR +
    (usage.cache_read_input_tokens ?? 0) * CACHE_READ_FACTOR;
  const dollars =
    (input * price.input + usage.output_tokens * price.output) / 1_000_000;
  return Math.round(dollars * 1_000_000) / 1_000_000;
}
