export const guardianDemoData = {
  roleTitle: "Cuidador principal",
  student: {
    fullName: "Mateo Rojas",
    age: 8,
    supportLevel: "Apoyo comunicacional medio"
  },
  summary: {
    lastEmotion: "Tranquilo",
    lastObservation: "Respondio bien al uso de apoyos visuales en la tarde.",
    progressStatus: "Avance estable en expresion de necesidades basicas."
  },
  permissions: [
    "Registrar emociones",
    "Registrar observaciones",
    "Consultar historial",
    "Visualizar progreso"
  ]
};

export const therapistDemoData = {
  roleTitle: "Especialista de seguimiento",
  assignedCase: "Mateo Rojas",
  summary: {
    currentFocus: "Generalizacion del uso de pictogramas en rutinas diarias",
    recentPattern: "Mayor autonomia al solicitar apoyo",
    recommendation: "Mantener refuerzo visual y seguimiento semanal"
  },
  permissions: [
    "Consultar historial clinico funcional",
    "Revisar progreso",
    "Agregar observaciones terapeuticas"
  ]
};

export const adminDemoData = {
  roleTitle: "Administrador del sistema",
  summary: {
    activeUsers: 3,
    activeRoles: ["guardian", "therapist", "admin"],
    systemStatus: "Entorno productivo conectado a Supabase"
  },
  permissions: [
    "Gestionar usuarios",
    "Supervisar roles",
    "Mantener configuracion general"
  ]
};
