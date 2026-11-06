/**
 * ============================================================
 *  CONFIGURACIÓN DE LA INVITACIÓN
 *  Todo lo que dice "TODO" debe reemplazarse con los datos reales.
 * ============================================================
 */

export const config = {
   /** Nombre del cumpleañero/a tal como aparece en grande. */
   nombre: "Nombre", // TODO

   /** Cómo referirse a él/ella en textos ("el cumpleañero" / "la cumpleañera"). */
   cumpleanero: "el cumpleañero", // TODO

   /** Años que cumple (se usa para los números de "El tiempo vuela..."). */
   edad: 2, // TODO

   /** Texto que acompaña al nombre ("Mi 2do añito", "Mis 3 añitos"...). */
   edadTexto: "Mi 2do añito", // TODO

   /**
    * Fecha y hora de inicio. OJO: el mes empieza en 0 (0 = enero, 11 = diciembre).
    * Ejemplo: new Date(2027, 0, 16, 15, 0) = 16 de enero 2027, 3:00 pm.
    */
   fechaEvento: new Date(2027, 0, 16, 15, 0), // TODO

   /** Duración aproximada en horas (para el botón "Agendar" de Google Calendar). */
   duracionHoras: 4,

   /** Frase principal de la portada/intro. */
   frase: "¡Prepárate para una aventura llena de magia, burbujas y amigos! Ven a festejar con nosotros.",

   lugar: "Nombre del local", // TODO
   direccion: "Dirección del local", // TODO
   referencia: "Referencia: cerca de...", // TODO (deja "" para ocultarla)
   mapsUrl: "https://maps.google.com", // TODO link de Google Maps

   /**
    * ID del video de YouTube para la música de fondo
    * (lo que va después de "watch?v=" en el link). Deja "" para no usar música.
    */
   youtubeVideoId: "", // TODO

   /**
    * Dónde se guardan las confirmaciones de asistencia.
    * - "/api/confirmaciones": funciona en local (bun run dev) y en Netlify.
    * - Para GitHub Pages usa la URL de tu propio Google Apps Script
    *   (https://script.google.com/macros/s/.../exec).
    */
   rsvpEndpoint: "/api/confirmaciones",

   galeria: {
      titulo: "Mis aventuras favoritas", // TODO
      subtitulo: "Junto a las personas que más quiero",
      /** Archivos dentro de public/img/galeria/. Si la lista está vacía, la sección se oculta. */
      fotos: [] as string[], // TODO ej: ["1.jpg", "2.jpg", "3.jpg"]
   },

   fotos: {
      /** Álbum compartido donde los invitados suben fotos. "" para ocultar el enlace. */
      albumUrl: "", // TODO
      hashtag: "#MiFiestaPlimPlim", // TODO
   },

   modales: {
      vestimenta: {
         titulo: "Casual y colorido",
         texto: "¡Ven cómodo y listo para jugar! Si quieres, usa algo azul, rojo o amarillo para sumarte a la aventura.",
      },
      tips: {
         titulo: "¡Ven puntual, la aventura empieza a tiempo!",
         texto: "Te recomendamos llegar unos minutos antes para que no te pierdas de nada.",
      },
      regalos: {
         titulo: "Tu presencia es mi mejor regalo",
         texto: "Si aun así deseas obsequiarme algo, podrás consultar los datos con mi familia.",
      },
   },

   /** Créditos del pie de página. */
   creditos: "Daniel Quezada",

   /**
    * Imágenes que debes colocar en public/img/ (ver public/img/LEEME.txt).
    * Si alguna falta, simplemente no se muestra.
    */
   imagenes: {
      fotoCumple: "foto-cumple.jpg",
      hero: "plim-hero.png",
      saludo: "plim-saludo.png",
      bienvenida: "plim-bienvenida.png",
   },
};
