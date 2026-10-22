export const DEVICE_CATEGORIES = [
  "Necesidades",
  "Emociones",
  "Acciones",
  "Lugares"
] as const;

export type DeviceCategory = (typeof DEVICE_CATEGORIES)[number];

export const DEVICE_ITEMS_PER_PAGE = 4;
export const DEVICE_MAX_PAGES_PER_CATEGORY = 2;
export const DEVICE_MAX_ITEMS_PER_CATEGORY =
  DEVICE_ITEMS_PER_PAGE * DEVICE_MAX_PAGES_PER_CATEGORY;
export const DEVICE_MAX_PICTOGRAMS =
  DEVICE_CATEGORIES.length * DEVICE_MAX_ITEMS_PER_CATEGORY;

export type DevicePictogramAsset = {
  id: string;
  label: string;
  message: string;
  category: DeviceCategory;
  colorTone: string;
  iconName: string;
  imagePath: string;
  position: number;
};

// This is the shared hardware catalog. Every image below is also embedded in
// the ESP32 firmware, so the web editor and the physical device stay aligned.
export const DEVICE_PICTOGRAM_ASSETS: DevicePictogramAsset[] = [
  { id: "caa00000-0000-4000-8000-000000000001", label: "Agua", message: "Quiero agua", category: "Necesidades", colorTone: "sky", iconName: "Droplets", imagePath: "/pictograms/water.png", position: 1 },
  { id: "caa00000-0000-4000-8000-000000000002", label: "Comida", message: "Quiero comida", category: "Necesidades", colorTone: "amber", iconName: "Utensils", imagePath: "/pictograms/food.png", position: 2 },
  { id: "caa00000-0000-4000-8000-000000000003", label: "Bano", message: "Necesito ir al bano", category: "Necesidades", colorTone: "cyan", iconName: "Bath", imagePath: "/pictograms/bathroom-need.png", position: 3 },
  { id: "caa00000-0000-4000-8000-000000000004", label: "Ayuda", message: "Necesito ayuda", category: "Necesidades", colorTone: "rose", iconName: "HelpCircle", imagePath: "/pictograms/help.png", position: 4 },
  { id: "caa00000-0000-4000-8000-000000000005", label: "Feliz", message: "Estoy feliz", category: "Emociones", colorTone: "yellow", iconName: "Smile", imagePath: "/pictograms/happy.png", position: 5 },
  { id: "caa00000-0000-4000-8000-000000000006", label: "Triste", message: "Estoy triste", category: "Emociones", colorTone: "blue", iconName: "Frown", imagePath: "/pictograms/sad.png", position: 6 },
  { id: "caa00000-0000-4000-8000-000000000007", label: "Enojado", message: "Estoy enojado", category: "Emociones", colorTone: "rose", iconName: "AlertTriangle", imagePath: "/pictograms/angry.png", position: 7 },
  { id: "caa00000-0000-4000-8000-000000000008", label: "Cansado", message: "Estoy cansado", category: "Emociones", colorTone: "violet", iconName: "Clock", imagePath: "/pictograms/tired.png", position: 8 },
  { id: "caa00000-0000-4000-8000-000000000009", label: "Jugar", message: "Quiero jugar", category: "Acciones", colorTone: "emerald", iconName: "Gamepad2", imagePath: "/pictograms/play.png", position: 9 },
  { id: "caa00000-0000-4000-8000-000000000010", label: "Comer", message: "Quiero comer", category: "Acciones", colorTone: "orange", iconName: "Utensils", imagePath: "/pictograms/eat.png", position: 10 },
  { id: "caa00000-0000-4000-8000-000000000011", label: "Dormir", message: "Quiero dormir", category: "Acciones", colorTone: "indigo", iconName: "Moon", imagePath: "/pictograms/sleep.png", position: 11 },
  { id: "caa00000-0000-4000-8000-000000000012", label: "Ir", message: "Quiero ir", category: "Acciones", colorTone: "cyan", iconName: "ArrowRight", imagePath: "/pictograms/go.png", position: 12 },
  { id: "caa00000-0000-4000-8000-000000000013", label: "Casa", message: "Quiero ir a casa", category: "Lugares", colorTone: "orange", iconName: "Home", imagePath: "/pictograms/home.png", position: 13 },
  { id: "caa00000-0000-4000-8000-000000000014", label: "Escuela", message: "Quiero ir a la escuela", category: "Lugares", colorTone: "blue", iconName: "School", imagePath: "/pictograms/school.png", position: 14 },
  { id: "caa00000-0000-4000-8000-000000000015", label: "Bano", message: "Quiero ir al bano", category: "Lugares", colorTone: "emerald", iconName: "Bath", imagePath: "/pictograms/bathroom-place.png", position: 15 },
  { id: "caa00000-0000-4000-8000-000000000016", label: "Parque", message: "Quiero ir al parque", category: "Lugares", colorTone: "sage", iconName: "MapPin", imagePath: "/pictograms/park.png", position: 16 },
  { id: "caa00000-0000-4000-8000-000000000017", label: "Dolor", message: "Me duele", category: "Necesidades", colorTone: "rose", iconName: "AlertTriangle", imagePath: "/pictograms/pain.png", position: 17 },
  { id: "caa00000-0000-4000-8000-000000000018", label: "Miedo", message: "Tengo miedo", category: "Emociones", colorTone: "violet", iconName: "Frown", imagePath: "/pictograms/fear.png", position: 18 },
  { id: "caa00000-0000-4000-8000-000000000019", label: "Hablar", message: "Quiero hablar", category: "Acciones", colorTone: "sky", iconName: "MessageCircle", imagePath: "/pictograms/talk.png", position: 19 },
  { id: "caa00000-0000-4000-8000-000000000020", label: "Hospital", message: "Quiero ir al hospital", category: "Lugares", colorTone: "blue", iconName: "MapPin", imagePath: "/pictograms/hospital.png", position: 20 }
];

export const DEVICE_IMAGE_PATHS = new Set(
  DEVICE_PICTOGRAM_ASSETS.map((item) => item.imagePath)
);

export const isDeviceCategory = (value: string): value is DeviceCategory =>
  DEVICE_CATEGORIES.includes(value as DeviceCategory);

export const getCatalogAsset = (imagePath: string) =>
  DEVICE_PICTOGRAM_ASSETS.find((item) => item.imagePath === imagePath);
