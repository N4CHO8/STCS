// Alex/Luna were retired from the cloud. Their fixtures remain only in isolated tests.
const message =
  "La demo antigua fue retirada. Usa /demo para Luis y su ESP; npm run test:isolated comprueba las fixtures antiguas solo en localhost.";
if (process.argv.includes("--apply")) throw new Error(message);
console.log(message);
