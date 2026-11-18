import { describe, expect, it } from "vitest";
import { strToU8, zipSync } from "fflate";
import { importFileText, parseCsv, readLinkedInJobs } from "./linkedin-import";

const file = `﻿Application Date,Contact Email,Contact Phone Number,Company Name,Job Title,Job Url,Resume Name,Question And Answers
"11/18/26, 10:02 PM",a@b.co,,Monday.com,Product Manager,https://www.linkedin.com/jobs/view/111,cv.pdf,"Q: ""Years"", A: 4"
"11/17/26, 9:00 AM",a@b.co,,"Wix, Ltd",Senior PM,https://www.linkedin.com/jobs/view/222,cv.pdf,
"11/16/26, 9:00 AM",a@b.co,,Monday.com,Product Manager,https://www.linkedin.com/jobs/view/111,cv.pdf,
`;

describe("parseCsv", () => {
  it("handles quotes, escaped quotes and commas", () => {
    expect(parseCsv('a,"b, c","d ""e"""\n1,2,3')).toEqual([
      ["a", "b, c", 'd "e"'],
      ["1", "2", "3"],
    ]);
  });
});

describe("readLinkedInJobs", () => {
  it("reads applications and skips duplicates", () => {
    const result = readLinkedInJobs(file);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.jobs).toHaveLength(2);
    expect(result.jobs[1]).toMatchObject({
      company: "Wix, Ltd",
      title: "Senior PM",
      link: "https://www.linkedin.com/jobs/view/222",
    });
  });

  it("explains when the file is not the applications file", () => {
    const result = readLinkedInJobs("First Name,Last Name\nShir,B");
    expect(result.ok).toBe(false);
  });

  it("reads saved jobs too", () => {
    const result = readLinkedInJobs(
      "Saved Date,Job Url,Job Title,Company Name\n11/1/26,https://x.com/j/1,PM,Acme\n",
    );
    expect(result.ok && result.jobs[0].company).toBe("Acme");
  });
});

describe("importFileText", () => {
  it("reads the applications file out of LinkedIn's zip", () => {
    const zip = zipSync({
      "Profile.csv": strToU8("First Name\nShir"),
      "Jobs/Job Applications.csv": strToU8("Company Name,Job Title\nAcme,PM"),
    });
    expect(importFileText("Basic_LinkedInDataExport.zip", zip)).toBe(
      "Company Name,Job Title\nAcme,PM",
    );
  });

  it("reads a CSV directly and rejects other files", () => {
    expect(importFileText("Job Applications.csv", strToU8("a,b"))).toBe("a,b");
    expect(importFileText("cv.pdf", strToU8("%PDF"))).toBeNull();
  });
});
