import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

import { env } from "./config/env";
import { apiRouter } from "./routes";

const app = express();

app.use(
  cors({
    origin: env.corsOrigin
  })
);
app.use(express.json());

app.use("/api", apiRouter);

app.use((_req, res) => {
  res.status(404).json({
    message: "Ruta no encontrada."
  });
});

app.use(
  (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error(error);
    res.status(500).json({
      message: "Ocurrio un error inesperado en la API."
    });
  }
);

export { app };
