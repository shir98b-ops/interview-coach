import { describe, expect, it } from "vitest";
import {
  codeAnswerText,
  defaultCodeLanguage,
  defaultCodeLanguageForJob,
  parseCodeLanguage,
} from "./languages";

describe("code languages", () => {
  it("accepts only known languages", () => {
    expect(parseCodeLanguage("go")).toBe("go");
    expect(parseCodeLanguage("toString")).toBe("python");
    expect(parseCodeLanguage(null)).toBe("python");
  });

  it("guesses the language from the role", () => {
    expect(defaultCodeLanguage("Frontend Developer")).toBe("typescript");
    expect(defaultCodeLanguage("Data Analyst")).toBe("sql");
    expect(defaultCodeLanguage("iOS Developer")).toBe("swift");
    expect(defaultCodeLanguage("Java Backend Engineer")).toBe("java");
    expect(defaultCodeLanguage("Backend Developer")).toBe("python");
    expect(defaultCodeLanguage("FPGA Engineer")).toBe("verilog");
    expect(defaultCodeLanguage("Design Verification Engineer")).toBe("verilog");
    expect(defaultCodeLanguage("מהנדס אימות שבבים")).toBe("verilog");
    expect(defaultCodeLanguage("FPGA Engineer (VHDL)")).toBe("vhdl");
    expect(defaultCodeLanguage("Biostatistician")).toBe("r");
    expect(defaultCodeLanguage("Bioinformatician")).toBe("python");
  });

  it("picks VHDL when an FPGA posting asks mostly for it", () => {
    const posting =
      "Design blocks on FPGAs in VHDL. Requirements: VHDL or Verilog.";
    expect(defaultCodeLanguageForJob("FPGA Engineer", posting)).toBe("vhdl");
    expect(
      defaultCodeLanguageForJob("FPGA Engineer", "SystemVerilog, UVM"),
    ).toBe("verilog");
    expect(defaultCodeLanguageForJob("Backend Developer", "VHDL")).toBe(
      "python",
    );
    expect(defaultCodeLanguageForJob("FPGA Engineer", null)).toBe("verilog");
  });

  it("saves the code in a fenced block, then the explanation", () => {
    expect(codeAnswerText("python", "print(1)\n\n", " because ")).toBe(
      "```python\nprint(1)\n```\n\nbecause",
    );
    expect(codeAnswerText("sql", "SELECT 1", "")).toBe("```sql\nSELECT 1\n```");
  });
});
