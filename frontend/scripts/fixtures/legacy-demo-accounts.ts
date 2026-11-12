// Public credentials, restricted in the database to synthetic demo records.
// These values are never used for real accounts or as an activation bypass by email domain.
export const CLOUD_DEMO_PASSWORD = "DemoSTCS2026!";
export const CLOUD_DEMO_ACCOUNTS = [
  {
    role: "therapist",
    email: "especialista@demo.stcs.local",
    fullName: "Especialista demo",
  },
  {
    role: "teacher",
    email: "docente@demo.stcs.local",
    fullName: "Docente demo",
  },
  {
    role: "guardian",
    email: "apoderado@demo.stcs.local",
    fullName: "Apoderado demo",
  },
] as const;
