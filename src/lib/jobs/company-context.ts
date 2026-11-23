/**
 * When the user practices for a real job, every question, case and take-home
 * is set in that company's world: its product, customers and industry. The
 * same instruction is shared by every AI prompt built from a job posting.
 */
export const companyContext = `Tailor everything to this company and its
industry. First read from the posting what the company does: its product or
service, customers, industry, business model, scale, stage, markets and any
regulation it works under. Then set every scenario, case, example, data set
and number in that world: its product, its users, its data and the problems a
company like it really faces (for example payments and fraud at a fintech,
patient safety and medical-device regulation at a med-tech company, inventory
and seasonality at a retailer). Ask about the industry knowledge an
interviewer at this company would expect a candidate to bring. Use only the
facts the posting states about the company itself; for anything else, use
what is typical of its industry and stage, without presenting it as a fact
about this company.`;
