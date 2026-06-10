export type PictogramCategoryId =
  | "core"
  | "needs"
  | "food"
  | "emotions"
  | "actions"
  | "places"
  | "people"
  | "routine"
  | "questions";

export type PictogramTone =
  | "core"
  | "need"
  | "food"
  | "happy"
  | "sad"
  | "angry"
  | "calm"
  | "action"
  | "place"
  | "person"
  | "routine"
  | "question"
  | "custom";

export interface PictogramCategory {
  id: PictogramCategoryId;
  label: string;
  helper: string;
}

export interface PictogramItem {
  id: string;
  categoryId: PictogramCategoryId;
  label: string;
  message: string;
  emoji: string;
  tone: PictogramTone;
}

export const pictogramCategories: PictogramCategory[] = [
  { id: "core", label: "Clave", helper: "Palabras para armar frases." },
  { id: "needs", label: "Necesito", helper: "Pedir ayuda o cuidado." },
  { id: "food", label: "Comida", helper: "Comer y beber." },
  { id: "emotions", label: "Siento", helper: "Comunicar emociones." },
  { id: "actions", label: "Hacer", helper: "Actividades y acciones." },
  { id: "places", label: "Lugares", helper: "Ir o ubicarse." },
  { id: "people", label: "Personas", helper: "Buscar a alguien." },
  { id: "routine", label: "Rutina", helper: "Momentos del dia." },
  { id: "questions", label: "Preguntas", helper: "Preguntar o aclarar." }
];

export const defaultPictograms: PictogramItem[] = [
  { id: "core-i", categoryId: "core", label: "Yo", message: "yo", emoji: "🙂", tone: "core" },
  { id: "core-want", categoryId: "core", label: "Quiero", message: "quiero", emoji: "👉", tone: "core" },
  { id: "core-need", categoryId: "core", label: "Necesito", message: "necesito", emoji: "🤲", tone: "core" },
  { id: "core-yes", categoryId: "core", label: "Si", message: "si", emoji: "✅", tone: "core" },
  { id: "core-no", categoryId: "core", label: "No", message: "no", emoji: "❌", tone: "core" },
  { id: "core-more", categoryId: "core", label: "Mas", message: "mas", emoji: "➕", tone: "core" },
  { id: "core-finish", categoryId: "core", label: "Terminar", message: "termine", emoji: "🏁", tone: "core" },
  { id: "core-help", categoryId: "core", label: "Ayuda", message: "ayuda", emoji: "🆘", tone: "need" },
  { id: "core-now", categoryId: "core", label: "Ahora", message: "ahora", emoji: "⏱️", tone: "routine" },
  { id: "core-later", categoryId: "core", label: "Despues", message: "despues", emoji: "➡️", tone: "routine" },
  { id: "core-stop", categoryId: "core", label: "Parar", message: "parar", emoji: "🛑", tone: "angry" },
  { id: "core-good", categoryId: "core", label: "Bien", message: "bien", emoji: "👍", tone: "happy" },

  { id: "need-water", categoryId: "needs", label: "Agua", message: "quiero agua", emoji: "💧", tone: "need" },
  { id: "need-bathroom", categoryId: "needs", label: "Bano", message: "quiero ir al bano", emoji: "🚻", tone: "need" },
  { id: "need-rest", categoryId: "needs", label: "Descanso", message: "quiero descansar", emoji: "🌙", tone: "calm" },
  { id: "need-pain", categoryId: "needs", label: "Dolor", message: "me duele", emoji: "🤕", tone: "angry" },
  { id: "need-hot", categoryId: "needs", label: "Calor", message: "tengo calor", emoji: "☀️", tone: "need" },
  { id: "need-cold", categoryId: "needs", label: "Frio", message: "tengo frio", emoji: "❄️", tone: "sad" },
  { id: "need-quiet", categoryId: "needs", label: "Silencio", message: "quiero silencio", emoji: "🤫", tone: "calm" },
  { id: "need-break", categoryId: "needs", label: "Pausa", message: "necesito una pausa", emoji: "⏸️", tone: "calm" },

  { id: "food-eat", categoryId: "food", label: "Comer", message: "quiero comer", emoji: "🍽️", tone: "food" },
  { id: "food-bread", categoryId: "food", label: "Pan", message: "quiero pan", emoji: "🍞", tone: "food" },
  { id: "food-fruit", categoryId: "food", label: "Fruta", message: "quiero fruta", emoji: "🍎", tone: "food" },
  { id: "food-milk", categoryId: "food", label: "Leche", message: "quiero leche", emoji: "🥛", tone: "food" },
  { id: "food-juice", categoryId: "food", label: "Jugo", message: "quiero jugo", emoji: "🧃", tone: "food" },
  { id: "food-lunch", categoryId: "food", label: "Almuerzo", message: "quiero almorzar", emoji: "🍲", tone: "food" },
  { id: "food-cookie", categoryId: "food", label: "Galleta", message: "quiero galleta", emoji: "🍪", tone: "food" },
  { id: "food-all-done", categoryId: "food", label: "Listo", message: "termine de comer", emoji: "✅", tone: "food" },

  { id: "emo-happy", categoryId: "emotions", label: "Feliz", message: "estoy feliz", emoji: "😊", tone: "happy" },
  { id: "emo-calm", categoryId: "emotions", label: "Tranquilo", message: "estoy tranquilo", emoji: "😌", tone: "calm" },
  { id: "emo-sad", categoryId: "emotions", label: "Triste", message: "estoy triste", emoji: "😢", tone: "sad" },
  { id: "emo-angry", categoryId: "emotions", label: "Enojado", message: "estoy enojado", emoji: "😠", tone: "angry" },
  { id: "emo-scared", categoryId: "emotions", label: "Asustado", message: "estoy asustado", emoji: "😟", tone: "sad" },
  { id: "emo-tired", categoryId: "emotions", label: "Cansado", message: "estoy cansado", emoji: "🥱", tone: "calm" },
  { id: "emo-confused", categoryId: "emotions", label: "Confundido", message: "no entiendo", emoji: "😕", tone: "sad" },
  { id: "emo-excited", categoryId: "emotions", label: "Emocionado", message: "estoy emocionado", emoji: "🤩", tone: "happy" },

  { id: "act-play", categoryId: "actions", label: "Jugar", message: "quiero jugar", emoji: "🎲", tone: "action" },
  { id: "act-paint", categoryId: "actions", label: "Pintar", message: "quiero pintar", emoji: "🎨", tone: "action" },
  { id: "act-read", categoryId: "actions", label: "Leer", message: "quiero leer", emoji: "📖", tone: "action" },
  { id: "act-go", categoryId: "actions", label: "Salir", message: "quiero salir", emoji: "🚪", tone: "action" },
  { id: "act-walk", categoryId: "actions", label: "Caminar", message: "quiero caminar", emoji: "🚶", tone: "action" },
  { id: "act-sleep", categoryId: "actions", label: "Dormir", message: "quiero dormir", emoji: "🛌", tone: "action" },
  { id: "act-open", categoryId: "actions", label: "Abrir", message: "abrir", emoji: "🔓", tone: "action" },
  { id: "act-close", categoryId: "actions", label: "Cerrar", message: "cerrar", emoji: "🔒", tone: "action" },

  { id: "place-home", categoryId: "places", label: "Casa", message: "quiero ir a casa", emoji: "🏠", tone: "place" },
  { id: "place-school", categoryId: "places", label: "Colegio", message: "voy al colegio", emoji: "🏫", tone: "place" },
  { id: "place-classroom", categoryId: "places", label: "Sala", message: "quiero ir a la sala", emoji: "🪑", tone: "place" },
  { id: "place-yard", categoryId: "places", label: "Patio", message: "quiero ir al patio", emoji: "🌳", tone: "place" },
  { id: "place-car", categoryId: "places", label: "Auto", message: "quiero ir al auto", emoji: "🚗", tone: "place" },
  { id: "place-park", categoryId: "places", label: "Parque", message: "quiero ir al parque", emoji: "🛝", tone: "place" },
  { id: "place-kitchen", categoryId: "places", label: "Cocina", message: "quiero ir a la cocina", emoji: "🍳", tone: "place" },
  { id: "place-bedroom", categoryId: "places", label: "Pieza", message: "quiero ir a mi pieza", emoji: "🛏️", tone: "place" },

  { id: "person-mom", categoryId: "people", label: "Mama", message: "quiero a mama", emoji: "👩", tone: "person" },
  { id: "person-dad", categoryId: "people", label: "Papa", message: "quiero a papa", emoji: "👨", tone: "person" },
  { id: "person-teacher", categoryId: "people", label: "Profesor", message: "quiero al profesor", emoji: "🧑‍🏫", tone: "person" },
  { id: "person-therapist", categoryId: "people", label: "Terapeuta", message: "quiero al terapeuta", emoji: "🧑‍⚕️", tone: "person" },
  { id: "person-friend", categoryId: "people", label: "Amigo", message: "quiero a mi amigo", emoji: "🧒", tone: "person" },
  { id: "person-family", categoryId: "people", label: "Familia", message: "quiero a mi familia", emoji: "👨‍👩‍👧", tone: "person" },
  { id: "person-doctor", categoryId: "people", label: "Doctor", message: "quiero al doctor", emoji: "🩺", tone: "person" },
  { id: "person-me", categoryId: "people", label: "Yo", message: "yo", emoji: "🙋", tone: "person" },

  { id: "routine-start", categoryId: "routine", label: "Inicio", message: "empezar", emoji: "▶️", tone: "routine" },
  { id: "routine-task", categoryId: "routine", label: "Tarea", message: "hacer tarea", emoji: "✏️", tone: "routine" },
  { id: "routine-recess", categoryId: "routine", label: "Recreo", message: "ir a recreo", emoji: "🛝", tone: "routine" },
  { id: "routine-wash", categoryId: "routine", label: "Lavar manos", message: "lavar manos", emoji: "🧼", tone: "routine" },
  { id: "routine-teeth", categoryId: "routine", label: "Dientes", message: "lavar dientes", emoji: "🪥", tone: "routine" },
  { id: "routine-bag", categoryId: "routine", label: "Mochila", message: "guardar mochila", emoji: "🎒", tone: "routine" },
  { id: "routine-calendar", categoryId: "routine", label: "Calendario", message: "mirar calendario", emoji: "📅", tone: "routine" },
  { id: "routine-finish", categoryId: "routine", label: "Final", message: "terminar rutina", emoji: "🏁", tone: "routine" },

  { id: "q-what", categoryId: "questions", label: "Que", message: "que es", emoji: "❓", tone: "question" },
  { id: "q-where", categoryId: "questions", label: "Donde", message: "donde esta", emoji: "📍", tone: "question" },
  { id: "q-who", categoryId: "questions", label: "Quien", message: "quien es", emoji: "👤", tone: "question" },
  { id: "q-when", categoryId: "questions", label: "Cuando", message: "cuando", emoji: "🕘", tone: "question" },
  { id: "q-why", categoryId: "questions", label: "Por que", message: "por que", emoji: "🤔", tone: "question" },
  { id: "q-how", categoryId: "questions", label: "Como", message: "como", emoji: "💭", tone: "question" },
  { id: "q-which", categoryId: "questions", label: "Cual", message: "cual", emoji: "☝️", tone: "question" },
  { id: "q-again", categoryId: "questions", label: "Otra vez", message: "otra vez", emoji: "🔁", tone: "question" }
];
