import { mkdir, readFile, rename, writeFile, unlink } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";
import { ServiceUnavailableError } from "./errors";

// Objects are private. Public downloads always pass through role/device authorization.
function keyPath(key: string) {
  if (!/^[a-z0-9/-]+\.(png|rgb|wav)$/.test(key) || key.includes(".."))
    throw new Error("Invalid object key");
  const root = process.env.STCS_MEDIA_DIR;
  if (!root)
    throw new ServiceUnavailableError(
      "El almacenamiento de archivos no está configurado.",
    );
  const path = resolve(root, key);
  if (!path.startsWith(resolve(root) + sep))
    throw new Error("Invalid object path");
  return path;
}
function remoteUrl(key: string) {
  if (!/^[a-z0-9/-]+\.(png|rgb|wav)$/.test(key) || key.includes(".."))
    throw new Error("Invalid object key");
  const url = process.env.SUPABASE_URL,
    bucket = process.env.STCS_MEDIA_BUCKET;
  if (!url || !bucket || !process.env.SUPABASE_SECRET_KEY)
    throw new ServiceUnavailableError(
      "Configura el bucket privado y la credencial del servidor para almacenar archivos.",
    );
  if (!/^[a-z0-9-]+$/.test(bucket)) throw new Error("Invalid bucket");
  return `${url}/storage/v1/object/${bucket}/${key}`;
}
export async function putMedia(key: string, data: Buffer, type: string) {
  if (process.env.STCS_MEDIA_STORAGE === "supabase") {
    const r = await fetch(remoteUrl(key), {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SECRET_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
        "Content-Type": type,
        "x-upsert": "true",
      },
      body: new Uint8Array(data),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok)
      throw new ServiceUnavailableError(
        "No se pudo guardar el archivo. Reintenta.",
      );
    return;
  }
  const path = keyPath(key),
    temp = path + "." + randomUUID() + ".tmp";
  await mkdir(dirname(path), { recursive: true });
  try {
    await writeFile(temp, data, { flag: "wx" });
    await rename(temp, path);
  } finally {
    await unlink(temp).catch(() => undefined);
  }
}
export async function readMedia(key: string): Promise<Buffer> {
  if (process.env.STCS_MEDIA_STORAGE === "supabase") {
    const r = await fetch(remoteUrl(key), {
      headers: {
        apikey: process.env.SUPABASE_SECRET_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
      },
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (!r.ok)
      throw new ServiceUnavailableError("El archivo no está disponible.");
    return Buffer.from(await r.arrayBuffer());
  }
  try {
    return await readFile(keyPath(key));
  } catch {
    throw new ServiceUnavailableError("El archivo no está disponible.");
  }
}
