const provider = process.argv[2] ?? "postgres";

if (!["postgres", "mysql"].includes(provider)) {
  throw new Error("Usage: node scripts/db/import-production-template.mjs <postgres|mysql>");
}

console.log(
  JSON.stringify(
    {
      provider,
      businessExportDir: "data/exports/business",
      contentExportDir: "data/exports/content",
      nextStep: "Implement provider-specific import using docs/production/schema-mapping.md and docs/production/database-cutover.md"
    },
    null,
    2
  )
);
