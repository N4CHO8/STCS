// Deliberately public demonstration credentials, never used for real accounts.
// Database flags and assignments control activation exceptions and record access.
export const HARDWARE_DEMO_ACCOUNTS = [
  {
    role: "therapist",
    email: "especialista.prueba01@stcs.test",
    password: "Especialista123!",
  },
  {
    role: "teacher",
    email: "docente.prueba01@stcs.test",
    password: "Docente1234!",
  },
  {
    role: "guardian",
    email: "apoderado.prueba01@stcs.test",
    password: "Apoderado123!",
  },
] as const;
