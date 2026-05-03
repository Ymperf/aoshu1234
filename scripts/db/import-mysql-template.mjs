console.log(
  JSON.stringify(
    {
      provider: "mysql",
      steps: [
        "Create target schema and credentials",
        "Apply schema from docs/production/schema-mapping.md",
        "Import JSON exports from data/exports/business and data/exports/content",
        "Switch DB_PROVIDER and connection environment variables",
        "Run runtime verification"
      ]
    },
    null,
    2
  )
);
