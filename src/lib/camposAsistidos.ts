export const CAMPO_IA_IDS = [
  "mensaje",
  "link",
  "datosVerificados",
  "nombreOrganizacion",
  "textoEyebrow",
  "keyword",
] as const;

export type CampoIAId = (typeof CAMPO_IA_IDS)[number];

interface CampoIAConfig {
  titulo: string;
  nombreCampo: string;
  descripcion: string;
  preguntas: readonly string[];
  ejemploPrompt: string;
  objetivoModelo: string;
  reglasModelo: readonly string[];
}

export const CAMPOS_IA: Record<CampoIAId, CampoIAConfig> = {
  mensaje: {
    titulo: "Dale forma a tu campaña",
    nombreCampo: "mensaje central",
    descripcion:
      "Convierte una idea todavía suelta en una instrucción clara para generar tus piezas.",
    preguntas: [
      "¿Qué cambio quieres provocar en las personas?",
      "¿A quién le hablas y qué necesita entender?",
      "¿Qué tono, dato o llamado a la acción no puede faltar?",
    ],
    ejemploPrompt:
      "Ej. Quiero motivar a familias del barrio a separar reciclables. Que suene cercano, práctico y positivo; deben saber que pueden llevarlos al centro comunitario los sábados.",
    objetivoModelo:
      "Redactar una descripción completa de campaña en lenguaje natural que otra IA pueda convertir después en piezas publicitarias.",
    reglasModelo: [
      "Integra objetivo, audiencia, mensaje, tono y acción solo cuando el usuario los haya aportado.",
      "No redactes todavía titulares, variantes ni formatos de redes sociales.",
      "Entrega un párrafo claro de máximo 90 palabras.",
    ],
  },
  link: {
    titulo: "Aclara el destino de la acción",
    nombreCampo: "link o CTA",
    descripcion:
      "Define a dónde debe ir la audiencia o qué acción concreta debería realizar.",
    preguntas: [
      "¿La persona debe visitar un sitio o realizar una acción?",
      "¿Ya existe una URL exacta que debamos conservar?",
      "¿Cuál es el siguiente paso más importante?",
    ],
    ejemploPrompt:
      "Ej. Ya existe la página ecoverde.org/talleres y quiero que la acción sea registrarse a un taller gratuito.",
    objetivoModelo:
      "Proponer el valor más útil para un campo que admite una URL real o un llamado a la acción muy corto.",
    reglasModelo: [
      "Si el usuario proporciona una URL, consérvala y no inventes otra.",
      "Si no hay una URL real, devuelve un CTA imperativo de máximo 3 palabras.",
      "Devuelve un solo valor, nunca una lista de alternativas.",
    ],
  },
  datosVerificados: {
    titulo: "Ordena la información oficial",
    nombreCampo: "datos verificados",
    descripcion:
      "Organiza hechos y lineamientos para que la campaña sea precisa y no prometa de más.",
    preguntas: [
      "¿Qué cifras, fechas o beneficios están confirmados?",
      "¿Hay restricciones o cosas que no se deben afirmar?",
      "¿Qué fuente o área responsable respalda la información?",
    ],
    ejemploPrompt:
      "Ej. Los talleres son gratuitos, ocurren los sábados de agosto y tienen cupo de 25 personas. No afirmar que se entregan materiales; eso aún no está aprobado.",
    objetivoModelo:
      "Organizar los datos oficiales proporcionados por el usuario como lineamientos claros para la generación de copy.",
    reglasModelo: [
      "No inventes, completes ni deduzcas cifras, fechas, beneficios o fuentes.",
      "Conserva explícitamente las restricciones y los grados de incertidumbre.",
      "Usa frases breves o viñetas de texto simple cuando mejore la lectura.",
    ],
  },
  nombreOrganizacion: {
    titulo: "Define quién firma la campaña",
    nombreCampo: "nombre de la organización",
    descripcion:
      "Encuentra una denominación clara y coherente con la identidad de quien comunica.",
    preguntas: [
      "¿Qué tipo de organización es?",
      "¿Qué nombre, sigla o territorio ya usa públicamente?",
      "¿Debe sonar institucional, ciudadano o cercano?",
    ],
    ejemploPrompt:
      "Ej. Es una asociación vecinal de Chapalita enfocada en sostenibilidad. Usamos las iniciales AVC y queremos sonar cercanos.",
    objetivoModelo:
      "Proponer un nombre breve para la organización que firma la campaña.",
    reglasModelo: [
      "Prioriza nombres, siglas y territorios que el usuario ya haya mencionado.",
      "No suplantes ni sugieras afiliación con instituciones reales no aportadas.",
      "Devuelve un solo nombre de máximo 60 caracteres.",
    ],
  },
  textoEyebrow: {
    titulo: "Resume el marco de la campaña",
    nombreCampo: "texto superior",
    descripcion:
      "Crea la frase breve que contextualiza la pieza antes del titular principal.",
    preguntas: [
      "¿Cuál es el tema o programa de esta campaña?",
      "¿Conviene mencionar una etapa, edición o territorio?",
      "¿Qué contexto debe entenderse antes de leer el titular?",
    ],
    ejemploPrompt:
      "Ej. Es la campaña anual de reciclaje responsable del barrio, edición 2026.",
    objetivoModelo:
      "Escribir un eyebrow breve que ubique el tema de la pieza antes del titular.",
    reglasModelo: [
      "Usa de 2 a 7 palabras.",
      "No repitas el nombre de la organización salvo que sea imprescindible.",
      "No agregues punto final ni comillas.",
    ],
  },
  keyword: {
    titulo: "Encuentra la foto adecuada",
    nombreCampo: "palabra clave de foto",
    descripcion:
      "Convierte la escena que imaginas en una búsqueda concreta para el banco de imágenes.",
    preguntas: [
      "¿Qué persona, objeto o escena debería aparecer?",
      "¿En qué entorno ocurre la acción?",
      "¿Qué detalle visual representa mejor el mensaje?",
    ],
    ejemploPrompt:
      "Ej. Una familia separando botellas y cartón en contenedores de reciclaje dentro de casa.",
    objetivoModelo:
      "Generar una consulta fotográfica concreta en inglés para buscar en Pexels.",
    reglasModelo: [
      "Devuelve entre 1 y 3 palabras en inglés.",
      "Describe un sujeto u objeto fotografiable, no una emoción abstracta.",
      "No incluyas comillas, explicación ni variantes.",
    ],
  },
};

export function esCampoIAId(valor: unknown): valor is CampoIAId {
  return typeof valor === "string" && CAMPO_IA_IDS.includes(valor as CampoIAId);
}
