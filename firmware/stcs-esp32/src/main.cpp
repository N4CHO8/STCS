#include <Arduino.h>
#include <ArduinoJson.h>
#include <WiFi.h>

struct Pictogram {
  const char *id;
  const char *label;
  const char *message;
  const char *category;
};

const Pictogram initialPictograms[] = {
  {"agua", "Agua", "quiero agua", "Necesidades"},
  {"comer", "Comer", "quiero comer", "Necesidades"},
  {"ayuda", "Ayuda", "necesito ayuda", "Apoyo"},
  {"feliz", "Feliz", "estoy feliz", "Emociones"}
};

void printDeviceInfo() {
  Serial.println();
  Serial.println("STCS - Prototipo ESP32");
  Serial.println("----------------------");
  Serial.printf("Dispositivo: %s\n", STCS_DEVICE_ID);
  Serial.printf("API base: %s\n", STCS_API_BASE_URL);
  Serial.printf("Pantalla objetivo: %dx%d px\n", STCS_SCREEN_WIDTH, STCS_SCREEN_HEIGHT);
  Serial.printf("Flash detectada: %u MB\n", ESP.getFlashChipSize() / (1024 * 1024));
  Serial.printf("PSRAM detectada: %s\n", psramFound() ? "si" : "no");
  Serial.printf("Memoria libre: %u bytes\n", ESP.getFreeHeap());
}

void printApiContracts() {
  JsonDocument configRequest;
  configRequest["method"] = "GET";
  configRequest["url"] = String(STCS_API_BASE_URL) + "/devices/" + STCS_DEVICE_ID + "/config";
  configRequest["header"] = "x-stcs-device-key";

  JsonDocument eventRequest;
  eventRequest["method"] = "POST";
  eventRequest["url"] = String(STCS_API_BASE_URL) + "/devices/" + STCS_DEVICE_ID + "/events";
  JsonObject body = eventRequest["body"].to<JsonObject>();
  body["eventType"] = "pictogram_selected";
  body["pictogramId"] = "agua";
  body["category"] = "Necesidades";
  body["message"] = "quiero agua";
  body["batteryLevel"] = 85;

  Serial.println();
  Serial.println("Contrato para descargar configuracion:");
  serializeJsonPretty(configRequest, Serial);
  Serial.println();

  Serial.println();
  Serial.println("Contrato para enviar eventos:");
  serializeJsonPretty(eventRequest, Serial);
  Serial.println();
}

void printInitialCatalog() {
  JsonDocument document;
  JsonArray pictograms = document["pictograms"].to<JsonArray>();

  for (const Pictogram &pictogram : initialPictograms) {
    JsonObject item = pictograms.add<JsonObject>();
    item["id"] = pictogram.id;
    item["label"] = pictogram.label;
    item["message"] = pictogram.message;
    item["category"] = pictogram.category;
  }

  Serial.println();
  Serial.println("Catalogo inicial de pictogramas:");
  serializeJsonPretty(document, Serial);
  Serial.println();
}

void scanWifiNetworks() {
  Serial.println();
  Serial.println("Buscando redes Wi-Fi 2.4 GHz...");

  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true);
  delay(300);

  const int networks = WiFi.scanNetworks();

  if (networks <= 0) {
    Serial.println("No se detectaron redes. Revisar antena, entorno o permisos.");
    return;
  }

  Serial.printf("Redes detectadas: %d\n", networks);

  for (int index = 0; index < networks; index++) {
    Serial.printf(
      "%d. %s | RSSI: %d dBm | Canal: %d\n",
      index + 1,
      WiFi.SSID(index).c_str(),
      WiFi.RSSI(index),
      WiFi.channel(index)
    );
  }
}

void setup() {
  Serial.begin(115200);
  delay(1500);

  printDeviceInfo();
  printInitialCatalog();
  printApiContracts();
  scanWifiNetworks();

  Serial.println();
  Serial.println("Ambiente listo. Siguiente paso: integrar ejemplo oficial de pantalla/touch Waveshare.");
}

void loop() {
  delay(5000);
  Serial.println("STCS ESP32 activo. Esperando integracion de pantalla tactil.");
}
