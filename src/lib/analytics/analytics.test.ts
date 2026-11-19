import { describe, expect, it } from "vitest";
import { cleanProps, parseAnswerMethod } from "./events";
import { deviceFromUserAgent } from "./device";
import { costUsd } from "./pricing";

describe("costUsd", () => {
  it("prices input and output tokens per model", () => {
    expect(
      costUsd("claude-sonnet-5-5", {
        input_tokens: 1_000_000,
        output_tokens: 100_000,
      }),
    ).toBe(3);
    expect(
      costUsd("claude-haiku-5-5", { input_tokens: 2000, output_tokens: 1000 }),
    ).toBe(0.0007);
  });

  it("counts cache writes and reads", () => {
    expect(
      costUsd("claude-sonnet-5-5", {
        input_tokens: 0,
        output_tokens: 0,
        cache_creation_input_tokens: 1_000_000,
        cache_read_input_tokens: 1_000_000,
      }),
    ).toBe(2.7);
  });

  it("never prices an unknown model as free", () => {
    expect(
      costUsd("claude-new", { input_tokens: 1_000_000, output_tokens: 0 }),
    ).toBe(2);
  });
});

describe("deviceFromUserAgent", () => {
  it.each([
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148",
      "phone",
    ],
    ["Mozilla/5.0 (Linux; Android 15; Pixel 9) Mobile Safari/537.36", "phone"],
    ["Mozilla/5.0 (Linux; Android 15; SM-X710) Safari/537.36", "tablet"],
    ["Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)", "tablet"],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0", "desktop"],
  ])("%s is a %s", (ua, device) => {
    expect(deviceFromUserAgent(ua)).toBe(device);
  });

  it("is unknown without a user agent", () => {
    expect(deviceFromUserAgent(null)).toBeNull();
  });
});

describe("event props", () => {
  it("cuts long strings so no free text is stored", () => {
    expect(cleanProps({ mode: "x".repeat(100) }).mode).toHaveLength(40);
  });

  it("reads the answer method, defaulting to text", () => {
    expect(parseAnswerMethod("voice")).toBe("voice");
    expect(parseAnswerMethod("code")).toBe("code");
    expect(parseAnswerMethod("anything")).toBe("text");
    expect(parseAnswerMethod(null)).toBe("text");
  });
});
