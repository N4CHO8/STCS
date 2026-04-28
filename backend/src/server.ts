import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, env.host, () => {
  console.log(`STCS backend escuchando en http://${env.host}:${env.port}`);
});
