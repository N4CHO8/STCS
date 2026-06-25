export type PictogramCategoryId =
  | "core"
  | "needs"
  | "food"
  | "emotions"
  | "actions"
  | "sensory"
  | "school"
  | "health"
  | "places"
  | "people"
  | "routine"
  | "objects"
  | "social"
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
  | "sensory"
  | "school"
  | "health"
  | "place"
  | "person"
  | "routine"
  | "object"
  | "social"
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
  { id: "needs", label: "Necesito", helper: "Cuidado y ayuda." },
  { id: "food", label: "Comida", helper: "Comer y beber." },
  { id: "emotions", label: "Siento", helper: "Estados emocionales." },
  { id: "actions", label: "Hacer", helper: "Acciones y juego." },
  { id: "sensory", label: "Sensorial", helper: "Ruido, luz y calma." },
  { id: "school", label: "Colegio", helper: "Sala y tareas." },
  { id: "health", label: "Salud", helper: "Dolor y cuidado." },
  { id: "places", label: "Lugares", helper: "A donde ir." },
  { id: "people", label: "Personas", helper: "Con quien hablar." },
  { id: "routine", label: "Rutina", helper: "Momentos del dia." },
  { id: "objects", label: "Objetos", helper: "Cosas de uso diario." },
  { id: "social", label: "Social", helper: "Saludos y respeto." },
  { id: "questions", label: "Preguntas", helper: "Pedir informacion." }
];

export const defaultPictograms: PictogramItem[] = [
  { id: "core-i", categoryId: "core", label: "Yo", message: "yo", emoji: "🙂", tone: "core" },
  { id: "core-you", categoryId: "core", label: "Tu", message: "tu", emoji: "👉", tone: "core" },
  { id: "core-want", categoryId: "core", label: "Quiero", message: "quiero", emoji: "🤲", tone: "core" },
  { id: "core-need", categoryId: "core", label: "Necesito", message: "necesito", emoji: "🙏", tone: "core" },
  { id: "core-have", categoryId: "core", label: "Tengo", message: "tengo", emoji: "👐", tone: "core" },
  { id: "core-go", categoryId: "core", label: "Ir", message: "ir", emoji: "➡️", tone: "core" },
  { id: "core-see", categoryId: "core", label: "Ver", message: "ver", emoji: "👀", tone: "core" },
  { id: "core-like", categoryId: "core", label: "Me gusta", message: "me gusta", emoji: "👍", tone: "happy" },
  { id: "core-dont-like", categoryId: "core", label: "No gusta", message: "no me gusta", emoji: "👎", tone: "sad" },
  { id: "core-yes", categoryId: "core", label: "Si", message: "si", emoji: "✅", tone: "core" },
  { id: "core-no", categoryId: "core", label: "No", message: "no", emoji: "❌", tone: "core" },
  { id: "core-more", categoryId: "core", label: "Mas", message: "mas", emoji: "➕", tone: "core" },
  { id: "core-finish", categoryId: "core", label: "Terminar", message: "termine", emoji: "🏁", tone: "routine" },
  { id: "core-help", categoryId: "core", label: "Ayuda", message: "ayuda", emoji: "🆘", tone: "need" },
  { id: "core-now", categoryId: "core", label: "Ahora", message: "ahora", emoji: "⏱️", tone: "routine" },
  { id: "core-later", categoryId: "core", label: "Despues", message: "despues", emoji: "➡️", tone: "routine" },
  { id: "core-stop", categoryId: "core", label: "Parar", message: "parar", emoji: "🛑", tone: "angry" },
  { id: "core-good", categoryId: "core", label: "Bien", message: "bien", emoji: "👌", tone: "happy" },

  { id: "need-water", categoryId: "needs", label: "Agua", message: "quiero agua", emoji: "💧", tone: "need" },
  { id: "need-bathroom", categoryId: "needs", label: "Bano", message: "quiero ir al bano", emoji: "🚻", tone: "need" },
  { id: "need-rest", categoryId: "needs", label: "Descanso", message: "quiero descansar", emoji: "🌙", tone: "calm" },
  { id: "need-hug", categoryId: "needs", label: "Abrazo", message: "quiero un abrazo", emoji: "🤗", tone: "person" },
  { id: "need-alone", categoryId: "needs", label: "Solo", message: "quiero estar solo", emoji: "🧍", tone: "calm" },
  { id: "need-company", categoryId: "needs", label: "Acompaname", message: "acompaname", emoji: "👥", tone: "person" },
  { id: "need-hot", categoryId: "needs", label: "Calor", message: "tengo calor", emoji: "☀️", tone: "need" },
  { id: "need-cold", categoryId: "needs", label: "Frio", message: "tengo frio", emoji: "❄️", tone: "sad" },
  { id: "need-quiet", categoryId: "needs", label: "Silencio", message: "quiero silencio", emoji: "🤫", tone: "calm" },
  { id: "need-break", categoryId: "needs", label: "Pausa", message: "necesito una pausa", emoji: "⏸️", tone: "calm" },
  { id: "need-change", categoryId: "needs", label: "Cambiar", message: "quiero cambiar", emoji: "🔁", tone: "need" },
  { id: "need-wait", categoryId: "needs", label: "Esperar", message: "quiero esperar", emoji: "⏳", tone: "routine" },

  { id: "food-eat", categoryId: "food", label: "Comer", message: "quiero comer", emoji: "🍽️", tone: "food" },
  { id: "food-bread", categoryId: "food", label: "Pan", message: "quiero pan", emoji: "🍞", tone: "food" },
  { id: "food-fruit", categoryId: "food", label: "Fruta", message: "quiero fruta", emoji: "🍎", tone: "food" },
  { id: "food-banana", categoryId: "food", label: "Platano", message: "quiero platano", emoji: "🍌", tone: "food" },
  { id: "food-milk", categoryId: "food", label: "Leche", message: "quiero leche", emoji: "🥛", tone: "food" },
  { id: "food-juice", categoryId: "food", label: "Jugo", message: "quiero jugo", emoji: "🧃", tone: "food" },
  { id: "food-lunch", categoryId: "food", label: "Almuerzo", message: "quiero almorzar", emoji: "🍲", tone: "food" },
  { id: "food-rice", categoryId: "food", label: "Arroz", message: "quiero arroz", emoji: "🍚", tone: "food" },
  { id: "food-soup", categoryId: "food", label: "Sopa", message: "quiero sopa", emoji: "🥣", tone: "food" },
  { id: "food-cookie", categoryId: "food", label: "Galleta", message: "quiero galleta", emoji: "🍪", tone: "food" },
  { id: "food-yogurt", categoryId: "food", label: "Yogur", message: "quiero yogur", emoji: "🥄", tone: "food" },
  { id: "food-all-done", categoryId: "food", label: "Listo", message: "termine de comer", emoji: "✅", tone: "food" },

  { id: "emo-happy", categoryId: "emotions", label: "Feliz", message: "estoy feliz", emoji: "😊", tone: "happy" },
  { id: "emo-calm", categoryId: "emotions", label: "Tranquilo", message: "estoy tranquilo", emoji: "😌", tone: "calm" },
  { id: "emo-proud", categoryId: "emotions", label: "Orgulloso", message: "estoy orgulloso", emoji: "😄", tone: "happy" },
  { id: "emo-sad", categoryId: "emotions", label: "Triste", message: "estoy triste", emoji: "😢", tone: "sad" },
  { id: "emo-angry", categoryId: "emotions", label: "Enojado", message: "estoy enojado", emoji: "😠", tone: "angry" },
  { id: "emo-scared", categoryId: "emotions", label: "Asustado", message: "estoy asustado", emoji: "😟", tone: "sad" },
  { id: "emo-tired", categoryId: "emotions", label: "Cansado", message: "estoy cansado", emoji: "🥱", tone: "calm" },
  { id: "emo-confused", categoryId: "emotions", label: "Confundido", message: "no entiendo", emoji: "😕", tone: "sad" },
  { id: "emo-excited", categoryId: "emotions", label: "Emocionado", message: "estoy emocionado", emoji: "🤩", tone: "happy" },
  { id: "emo-nervous", categoryId: "emotions", label: "Nervioso", message: "estoy nervioso", emoji: "😬", tone: "sad" },
  { id: "emo-bored", categoryId: "emotions", label: "Aburrido", message: "estoy aburrido", emoji: "😐", tone: "sad" },
  { id: "emo-safe", categoryId: "emotions", label: "Seguro", message: "me siento seguro", emoji: "🛡️", tone: "calm" },

  { id: "act-play", categoryId: "actions", label: "Jugar", message: "quiero jugar", emoji: "🎲", tone: "action" },
  { id: "act-paint", categoryId: "actions", label: "Pintar", message: "quiero pintar", emoji: "🎨", tone: "action" },
  { id: "act-draw", categoryId: "actions", label: "Dibujar", message: "quiero dibujar", emoji: "✏️", tone: "action" },
  { id: "act-read", categoryId: "actions", label: "Leer", message: "quiero leer", emoji: "📖", tone: "action" },
  { id: "act-music", categoryId: "actions", label: "Musica", message: "quiero escuchar musica", emoji: "🎵", tone: "action" },
  { id: "act-video", categoryId: "actions", label: "Video", message: "quiero ver un video", emoji: "📺", tone: "action" },
  { id: "act-go", categoryId: "actions", label: "Salir", message: "quiero salir", emoji: "🚪", tone: "action" },
  { id: "act-walk", categoryId: "actions", label: "Caminar", message: "quiero caminar", emoji: "🚶", tone: "action" },
  { id: "act-run", categoryId: "actions", label: "Correr", message: "quiero correr", emoji: "🏃", tone: "action" },
  { id: "act-sleep", categoryId: "actions", label: "Dormir", message: "quiero dormir", emoji: "🛌", tone: "action" },
  { id: "act-open", categoryId: "actions", label: "Abrir", message: "abrir", emoji: "🔓", tone: "action" },
  { id: "act-close", categoryId: "actions", label: "Cerrar", message: "cerrar", emoji: "🔒", tone: "action" },

  { id: "sens-noise", categoryId: "sensory", label: "Ruido", message: "hay mucho ruido", emoji: "🔊", tone: "sensory" },
  { id: "sens-quiet", categoryId: "sensory", label: "Silencio", message: "necesito silencio", emoji: "🔇", tone: "calm" },
  { id: "sens-light", categoryId: "sensory", label: "Mucha luz", message: "hay mucha luz", emoji: "💡", tone: "sensory" },
  { id: "sens-dark", categoryId: "sensory", label: "Menos luz", message: "quiero menos luz", emoji: "🌙", tone: "calm" },
  { id: "sens-touch-no", categoryId: "sensory", label: "No tocar", message: "no quiero que me toquen", emoji: "✋", tone: "angry" },
  { id: "sens-pressure", categoryId: "sensory", label: "Presion", message: "quiero presion", emoji: "🤲", tone: "calm" },
  { id: "sens-headphones", categoryId: "sensory", label: "Audifonos", message: "quiero audifonos", emoji: "🎧", tone: "sensory" },
  { id: "sens-calm-corner", categoryId: "sensory", label: "Rincon calma", message: "quiero ir al rincon de calma", emoji: "🧘", tone: "calm" },

  { id: "school-class", categoryId: "school", label: "Clase", message: "estoy en clase", emoji: "🏫", tone: "school" },
  { id: "school-task", categoryId: "school", label: "Tarea", message: "hacer tarea", emoji: "📝", tone: "school" },
  { id: "school-pencil", categoryId: "school", label: "Lapiz", message: "necesito un lapiz", emoji: "✏️", tone: "object" },
  { id: "school-book", categoryId: "school", label: "Cuaderno", message: "necesito mi cuaderno", emoji: "📓", tone: "school" },
  { id: "school-recess", categoryId: "school", label: "Recreo", message: "quiero recreo", emoji: "⚽", tone: "school" },
  { id: "school-finished", categoryId: "school", label: "Termine", message: "termine la tarea", emoji: "✅", tone: "school" },
  { id: "school-dont-understand", categoryId: "school", label: "No entiendo", message: "no entiendo", emoji: "❓", tone: "question" },
  { id: "school-repeat", categoryId: "school", label: "Repite", message: "puedes repetir", emoji: "🔁", tone: "question" },

  { id: "health-pain", categoryId: "health", label: "Dolor", message: "me duele", emoji: "🤕", tone: "health" },
  { id: "health-head", categoryId: "health", label: "Cabeza", message: "me duele la cabeza", emoji: "🤯", tone: "health" },
  { id: "health-stomach", categoryId: "health", label: "Guata", message: "me duele la guata", emoji: "🤢", tone: "health" },
  { id: "health-throat", categoryId: "health", label: "Garganta", message: "me duele la garganta", emoji: "😷", tone: "health" },
  { id: "health-medicine", categoryId: "health", label: "Remedio", message: "necesito remedio", emoji: "💊", tone: "health" },
  { id: "health-doctor", categoryId: "health", label: "Doctor", message: "necesito al doctor", emoji: "🩺", tone: "health" },
  { id: "health-bandage", categoryId: "health", label: "Curita", message: "necesito una curita", emoji: "🩹", tone: "health" },
  { id: "health-breathe", categoryId: "health", label: "Respirar", message: "quiero respirar tranquilo", emoji: "🌬️", tone: "calm" },

  { id: "place-home", categoryId: "places", label: "Casa", message: "quiero ir a casa", emoji: "🏠", tone: "place" },
  { id: "place-school", categoryId: "places", label: "Colegio", message: "voy al colegio", emoji: "🏫", tone: "place" },
  { id: "place-classroom", categoryId: "places", label: "Sala", message: "quiero ir a la sala", emoji: "🪑", tone: "place" },
  { id: "place-yard", categoryId: "places", label: "Patio", message: "quiero ir al patio", emoji: "🌳", tone: "place" },
  { id: "place-car", categoryId: "places", label: "Auto", message: "quiero ir al auto", emoji: "🚗", tone: "place" },
  { id: "place-park", categoryId: "places", label: "Parque", message: "quiero ir al parque", emoji: "🛝", tone: "place" },
  { id: "place-kitchen", categoryId: "places", label: "Cocina", message: "quiero ir a la cocina", emoji: "🍳", tone: "place" },
  { id: "place-bedroom", categoryId: "places", label: "Pieza", message: "quiero ir a mi pieza", emoji: "🛏️", tone: "place" },
  { id: "place-bathroom", categoryId: "places", label: "Bano", message: "quiero ir al bano", emoji: "🚻", tone: "place" },
  { id: "place-therapy", categoryId: "places", label: "Terapia", message: "voy a terapia", emoji: "🧩", tone: "place" },

  { id: "person-mom", categoryId: "people", label: "Mama", message: "quiero a mama", emoji: "👩", tone: "person" },
  { id: "person-dad", categoryId: "people", label: "Papa", message: "quiero a papa", emoji: "👨", tone: "person" },
  { id: "person-teacher", categoryId: "people", label: "Profesor", message: "quiero al profesor", emoji: "🧑‍🏫", tone: "person" },
  { id: "person-therapist", categoryId: "people", label: "Terapeuta", message: "quiero al terapeuta", emoji: "🧑‍⚕️", tone: "person" },
  { id: "person-friend", categoryId: "people", label: "Amigo", message: "quiero a mi amigo", emoji: "🧒", tone: "person" },
  { id: "person-family", categoryId: "people", label: "Familia", message: "quiero a mi familia", emoji: "👨‍👩‍👧", tone: "person" },
  { id: "person-doctor", categoryId: "people", label: "Doctor", message: "quiero al doctor", emoji: "🩺", tone: "person" },
  { id: "person-assistant", categoryId: "people", label: "Asistente", message: "quiero al asistente", emoji: "🙋", tone: "person" },

  { id: "routine-start", categoryId: "routine", label: "Inicio", message: "empezar", emoji: "▶️", tone: "routine" },
  { id: "routine-arrive", categoryId: "routine", label: "Llegar", message: "llegue", emoji: "🚪", tone: "routine" },
  { id: "routine-task", categoryId: "routine", label: "Tarea", message: "hacer tarea", emoji: "✏️", tone: "routine" },
  { id: "routine-recess", categoryId: "routine", label: "Recreo", message: "ir a recreo", emoji: "🛝", tone: "routine" },
  { id: "routine-wash", categoryId: "routine", label: "Lavar manos", message: "lavar manos", emoji: "🧼", tone: "routine" },
  { id: "routine-teeth", categoryId: "routine", label: "Dientes", message: "lavar dientes", emoji: "🪥", tone: "routine" },
  { id: "routine-bag", categoryId: "routine", label: "Mochila", message: "guardar mochila", emoji: "🎒", tone: "routine" },
  { id: "routine-calendar", categoryId: "routine", label: "Calendario", message: "mirar calendario", emoji: "📅", tone: "routine" },
  { id: "routine-lunch", categoryId: "routine", label: "Colacion", message: "es hora de colacion", emoji: "🍎", tone: "routine" },
  { id: "routine-finish", categoryId: "routine", label: "Final", message: "terminar rutina", emoji: "🏁", tone: "routine" },

  { id: "object-tablet", categoryId: "objects", label: "Tablet", message: "quiero la tablet", emoji: "📱", tone: "object" },
  { id: "object-toy", categoryId: "objects", label: "Juguete", message: "quiero mi juguete", emoji: "🧸", tone: "object" },
  { id: "object-ball", categoryId: "objects", label: "Pelota", message: "quiero la pelota", emoji: "⚽", tone: "object" },
  { id: "object-book", categoryId: "objects", label: "Libro", message: "quiero un libro", emoji: "📚", tone: "object" },
  { id: "object-pencil", categoryId: "objects", label: "Lapices", message: "quiero lapices", emoji: "🖍️", tone: "object" },
  { id: "object-blanket", categoryId: "objects", label: "Manta", message: "quiero mi manta", emoji: "🧣", tone: "object" },
  { id: "object-backpack", categoryId: "objects", label: "Mochila", message: "quiero mi mochila", emoji: "🎒", tone: "object" },
  { id: "object-phone", categoryId: "objects", label: "Telefono", message: "quiero el telefono", emoji: "☎️", tone: "object" },

  { id: "social-hi", categoryId: "social", label: "Hola", message: "hola", emoji: "👋", tone: "social" },
  { id: "social-bye", categoryId: "social", label: "Chao", message: "chao", emoji: "👋", tone: "social" },
  { id: "social-thanks", categoryId: "social", label: "Gracias", message: "gracias", emoji: "🙏", tone: "social" },
  { id: "social-please", categoryId: "social", label: "Por favor", message: "por favor", emoji: "🤲", tone: "social" },
  { id: "social-sorry", categoryId: "social", label: "Perdon", message: "perdon", emoji: "🤝", tone: "social" },
  { id: "social-turn", categoryId: "social", label: "Mi turno", message: "mi turno", emoji: "🙋", tone: "social" },
  { id: "social-your-turn", categoryId: "social", label: "Tu turno", message: "tu turno", emoji: "👉", tone: "social" },
  { id: "social-good-job", categoryId: "social", label: "Bien hecho", message: "bien hecho", emoji: "⭐", tone: "happy" },

  { id: "q-what", categoryId: "questions", label: "Que", message: "que es", emoji: "❓", tone: "question" },
  { id: "q-where", categoryId: "questions", label: "Donde", message: "donde esta", emoji: "📍", tone: "question" },
  { id: "q-who", categoryId: "questions", label: "Quien", message: "quien es", emoji: "👤", tone: "question" },
  { id: "q-when", categoryId: "questions", label: "Cuando", message: "cuando", emoji: "🕘", tone: "question" },
  { id: "q-why", categoryId: "questions", label: "Por que", message: "por que", emoji: "🤔", tone: "question" },
  { id: "q-how", categoryId: "questions", label: "Como", message: "como", emoji: "💭", tone: "question" },
  { id: "q-which", categoryId: "questions", label: "Cual", message: "cual", emoji: "☝️", tone: "question" },
  { id: "q-again", categoryId: "questions", label: "Otra vez", message: "otra vez", emoji: "🔁", tone: "question" },
  { id: "q-can", categoryId: "questions", label: "Puedo", message: "puedo", emoji: "🙋", tone: "question" },
  { id: "q-help", categoryId: "questions", label: "Me ayudas", message: "me ayudas", emoji: "🆘", tone: "question" }
];
