console.log(
  JSON.stringify(
    {
      provider: "postgres",
      steps: [
        "Create target database and roles",
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
