"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, LoaderCircle, Wifi } from "lucide-react";

type SerialPort = {
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
  writable: WritableStream<Uint8Array> | null;
};

type SerialNavigator = Navigator & {
  serial?: {
    requestPort: () => Promise<SerialPort>;
  };
};

export function WifiDeviceProvisioner({ onConfigured }: { onConfigured: () => void }) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState(
    "Configura la red una sola vez por USB. Despues el ESP32 funciona directo por WiFi."
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const serial = (navigator as SerialNavigator).serial;

    if (!serial) {
      setStatus("error");
      setMessage("Abre esta pagina en Chrome o Edge para configurar el WiFi.");
      return;
    }

    setStatus("saving");
    setMessage("Selecciona el puerto USB del ESP32...");
    let port: SerialPort | null = null;

    try {
      port = await serial.requestPort();
      await port.open({ baudRate: 115200 });

      // Opening a native USB serial port can reset an ESP32-S3. Wait until
      // setup() has initialized the serial command parser before writing.
      await new Promise((resolve) => window.setTimeout(resolve, 2500));

      if (!port.writable) {
        throw new Error("El puerto no permite enviar la configuracion.");
      }

      const writer = port.writable.getWriter();
      const command = `STCS_WIFI_CONFIG|${JSON.stringify({ ssid: ssid.trim(), password })}\n`;
      await writer.write(new TextEncoder().encode(command));
      writer.releaseLock();

      await new Promise((resolve) => window.setTimeout(resolve, 700));
      setStatus("saved");
      setMessage("Red guardada. El ESP32 se conectara y sincronizara el tablero automaticamente.");
      setPassword("");
      onConfigured();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No fue posible configurar el WiFi.");
    } finally {
      if (port) {
        await port.close().catch(() => undefined);
      }
    }
  };

  return (
    <div>
      <div className="text-center">
        <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${status === "saved" ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
          {status === "saving" ? (
            <LoaderCircle className="h-7 w-7 animate-spin" />
          ) : status === "saved" ? (
            <CheckCircle2 className="h-7 w-7" />
          ) : (
            <Wifi className="h-7 w-7" />
          )}
        </span>
        <h2 className="mt-4 font-display text-xl font-black text-stone-600">
          Conexion WiFi del ESP32
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm font-medium text-stone-400">{message}</p>
      </div>

      <form className="mx-auto mt-5 grid max-w-xs gap-3" onSubmit={submit}>
        <label className="text-left text-sm font-semibold text-stone-600">
          Nombre de la red WiFi
          <input
            autoComplete="off"
            className="mt-1 h-10 w-full rounded-lg border border-stone-200 px-3 font-normal"
            maxLength={120}
            onChange={(event) => setSsid(event.target.value)}
            required
            value={ssid}
          />
        </label>
        <label className="text-left text-sm font-semibold text-stone-600">
          Clave WiFi
          <input
            autoComplete="new-password"
            className="mt-1 h-10 w-full rounded-lg border border-stone-200 px-3 font-normal"
            maxLength={63}
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        <button
          className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#518b51] px-4 text-sm font-bold text-white transition hover:bg-[#457745] disabled:opacity-60"
          disabled={status === "saving"}
          type="submit"
        >
          <Wifi className="h-4 w-4" />
          {status === "saving" ? "Guardando..." : "Guardar WiFi en el ESP32"}
        </button>
      </form>
    </div>
  );
}
