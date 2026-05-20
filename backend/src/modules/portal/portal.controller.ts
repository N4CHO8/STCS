import { Response } from "express";

import { AuthenticatedRequest } from "../auth/auth.types";

const guardianDemoData = {
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

const therapistDemoData = {
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

const adminDemoData = {
  roleTitle: "Administrador del sistema",
  summary: {
    activeUsers: 3,
    activeRoles: ["guardian", "therapist", "admin"],
    systemStatus: "Entorno local operativo con autenticacion activa"
  },
  permissions: [
    "Gestionar usuarios",
    "Supervisar roles",
    "Mantener configuracion general"
  ]
};

export const getPortalOverview = (
  req: AuthenticatedRequest,
  res: Response
): void => {
  res.json({
    message: "Acceso autorizado al portal protegido.",
    session: {
      fullName: req.authUser?.fullName,
      email: req.authUser?.email,
      role: req.authUser?.role
    }
  });
};

export const getGuardianPortal = (_req: AuthenticatedRequest, res: Response): void => {
  res.json({
    message: "Informacion demo para cuidador obtenida correctamente.",
    data: guardianDemoData
  });
};

export const getTherapistPortal = (_req: AuthenticatedRequest, res: Response): void => {
  res.json({
    message: "Informacion demo para especialista obtenida correctamente.",
    data: therapistDemoData
  });
};

export const getAdminPortal = (_req: AuthenticatedRequest, res: Response): void => {
  res.json({
    message: "Informacion demo para administrador obtenida correctamente.",
    data: adminDemoData
  });
};
