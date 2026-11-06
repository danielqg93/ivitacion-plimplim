import { useEffect, useMemo, useRef, useState } from "react";
import invitados from "../db/invitados.json";
import itinerario from "../db/itinerario.json";
import { config } from "./config";

declare global {
   interface Window {
      YT?: {
         Player: new (
            element: HTMLElement | string,
            options: {
               height?: string;
               width?: string;
               videoId?: string;
               playerVars?: Record<string, number | string>;
               events?: {
                  onReady?: (event: {
                     target: {
                        playVideo: () => void;
                        pauseVideo: () => void;
                     };
                  }) => void;
                  onStateChange?: (event: { data: number }) => void;
               };
            },
         ) => {
            playVideo: () => void;
            pauseVideo: () => void;
            destroy: () => void;
            addEventListener: (
               event: string,
               callback: (event: { data: number }) => void,
            ) => void;
         };
         PlayerState?: {
            PLAYING: number;
            PAUSED: number;
         };
      };
      onYouTubeIframeAPIReady?: () => void;
   }
}

const ASSET_IMG = `${import.meta.env.BASE_URL}img`;
const img = (file: string) => `${ASSET_IMG}/${file}`;
const BG_SOFT = "#eaf6ff";

/** Oculta una imagen si el archivo no existe (evita el ícono de imagen rota). */
const hideOnError = (event: React.SyntheticEvent<HTMLImageElement>) => {
   event.currentTarget.style.display = "none";
};

const pad = (n: number) => String(n).padStart(2, "0");
const capitalize = (text: string) =>
   text.charAt(0).toUpperCase() + text.slice(1);

const fecha = config.fechaEvento;
const fechaCorta = `${pad(fecha.getDate())}.${pad(fecha.getMonth() + 1)}.${fecha.getFullYear()}`;
const horaTexto = fecha
   .toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
   })
   .replace(/\s*a\.?\s*m\.?/i, " am")
   .replace(/\s*p\.?\s*m\.?/i, " pm");
const fechaTexto = `${capitalize(
   fecha.toLocaleDateString("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
   }),
)} - ${horaTexto}`;

const toCalendarDate = (date: Date) =>
   date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
   `${config.nombre} - ${config.edadTexto}`,
)}&dates=${toCalendarDate(fecha)}/${toCalendarDate(
   new Date(fecha.getTime() + config.duracionHoras * 3600000),
)}&location=${encodeURIComponent(`${config.lugar}, ${config.direccion}`)}`;

const galleryImages = config.galeria.fotos.map((f) => img(`galeria/${f}`));
const hasMusic = config.youtubeVideoId.trim() !== "";

type ModalName =
   | "welcome"
   | "rsvp"
   | "song"
   | "dress"
   | "tips"
   | "gifts"
   | null;

type IconName =
   | "calendar"
   | "pin"
   | "check"
   | "music"
   | "paint"
   | "food"
   | "party"
   | "balloon"
   | "dress"
   | "info"
   | "gift"
   | "instagram"
   | "heart"
   | "star";

type Invitado = {
   nombre: string;
   apellidos: string;
   codigoInvitacion: string;
};

type ItinerarioItem = {
   hour: string;
   event: string;
   icon: IconName;
};

const invitadosRegistrados = invitados as Invitado[];
const eventos = itinerario as ItinerarioItem[];

function obtenerInvitado(): Invitado | null {
   const hash = window.location.hash.replace(/^#\/?/, "").trim();
   const codigo = hash.split("/").filter(Boolean)[0] || "";
   if (!codigo) return null;

   return (
      invitadosRegistrados.find(
         (invitado) =>
            invitado.codigoInvitacion.toUpperCase() === codigo.toUpperCase(),
      ) ?? null
   );
}

function Icon({ name }: { name: IconName }) {
   const common = {
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.8,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
   };
   const paths: Record<IconName, React.ReactNode> = {
      calendar: (
         <>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M7 3v4M17 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
         </>
      ),
      pin: (
         <>
            <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
         </>
      ),
      check: (
         <>
            <circle cx="12" cy="12" r="9" />
            <path d="m8 12 2.6 2.6L16.5 9" />
         </>
      ),
      music: (
         <>
            <path d="M9 18V5l10-2v13M9 9l10-2" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="16" cy="16" r="3" />
         </>
      ),
      paint: (
         <>
            <path d="m14 4 6 6-9.5 9.5a2.8 2.8 0 0 1-4-4L16 6Z" />
            <path d="m13 5 6 6M5.5 19.5c-.7 1.7-2.2 2.5-3.5 2.5 0-1.6.7-3 2.5-3.7" />
         </>
      ),
      food: (
         <>
            <path d="M6 3v7M4 3v4a2 2 0 0 0 4 0V3M6 10v11" />
            <path d="M14 3v18M14 3c3 1 5 3.5 5 6h-5" />
         </>
      ),
      party: (
         <>
            <path d="m12 3 1.2 3.2L16 7.5l-2.8 1.3L12 12l-1.2-3.2L8 7.5l2.8-1.3L12 3Z" />
            <path d="m5 13 .8 2.2L8 16l-2.2.8L5 19l-.8-2.2L2 16l2.2-.8L5 13ZM19 13l.6 1.6L21 15l-1.4.4L19 17l-.6-1.6L17 15l1.4-.4L19 13Z" />
         </>
      ),
      balloon: (
         <>
            <path d="M12 3a6 7 0 0 1 6 7c0 3.6-2.7 6-6 6s-6-2.4-6-6a6 7 0 0 1 6-7Z" />
            <path d="M10 15.5 12 21l2-5.5M12 21v-2" />
         </>
      ),
      dress: (
         <>
            <path d="M9 3h6l1 5-2 2c1 3 3.5 6 5 10H5c1.5-4 4-7 5-10L8 8l1-5Z" />
            <path d="M10 3c0 2.5 4 2.5 4 0" />
         </>
      ),
      info: (
         <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v6M12 7h.01" />
         </>
      ),
      gift: (
         <>
            <path d="M3 10h18v11H3zM2 7h20v4H2zM12 7v14" />
            <path d="M12 7C8 7 6 6 6 4.5S8 2 9.5 3C11 4 12 7 12 7Zm0 0c4 0 6-1 6-2.5S16 2 14.5 3C13 4 12 7 12 7Z" />
         </>
      ),
      instagram: (
         <>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle
               cx="17.5"
               cy="6.5"
               r=".8"
               fill="currentColor"
               stroke="none"
            />
         </>
      ),
      heart: (
         <path d="M12 21S3 16 3 9.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 9 1.5C21 16 12 21 12 21Z" />
      ),
      star: (
         <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
      ),
   };
   return (
      <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
         {paths[name]}
      </svg>
   );
}

function Button({
   children,
   onClick,
   href,
   light = false,
   type = "button",
}: {
   children: React.ReactNode;
   onClick?: () => void;
   href?: string;
   light?: boolean;
   type?: "button" | "submit";
}) {
   const className = `pill ${light ? "pill-light" : ""}`;
   return href ? (
      <a
         className={className}
         href={href}
         target={href.startsWith("http") ? "_blank" : undefined}
         rel="noreferrer"
      >
         {children}
      </a>
   ) : (
      <button className={className} type={type} onClick={onClick}>
         {children}
      </button>
   );
}

/** Separador decorativo con tres estrellas de colores. */
function StarMark() {
   return (
      <div className="star-mark" aria-hidden="true">
         <span />
         <i className="c-red">★</i>
         <i className="c-yellow">★</i>
         <i className="c-green">★</i>
         <span />
      </div>
   );
}

/** Burbujas flotantes decorativas. */
function Bubbles({ count = 10 }: { count?: number }) {
   return (
      <div className="bubbles" aria-hidden="true">
         {Array.from({ length: count }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: lista estática decorativa
            <span key={i} />
         ))}
      </div>
   );
}

function Cloud({ className = "" }: { className?: string }) {
   return (
      <svg
         className={`cloud ${className}`}
         viewBox="0 0 200 100"
         aria-hidden="true"
      >
         <path
            fill="#fff"
            d="M45 90a35 35 0 0 1-4-69.8A45 45 0 0 1 125 18a32 32 0 0 1 45 26 23 23 0 0 1 2 46Z"
         />
      </svg>
   );
}

function Rainbow({ className = "" }: { className?: string }) {
   const colors = ["#e53935", "#ffb300", "#ffd54f", "#43a047", "#1e88e5"];
   return (
      <svg
         className={`rainbow ${className}`}
         viewBox="0 0 200 105"
         aria-hidden="true"
      >
         {colors.map((c, i) => (
            <path
               key={c}
               d={`M${10 + i * 12} 100a${90 - i * 12} ${90 - i * 12} 0 0 1 ${180 - i * 24} 0`}
               fill="none"
               stroke={c}
               strokeWidth="12"
            />
         ))}
      </svg>
   );
}

function Wave({
   color = "#fff",
   flip = false,
   flip2 = false,
}: {
   color?: string;
   flip?: boolean;
   flip2?: boolean;
}) {
   return (
      <svg
         className={`wave ${flip ? "wave-flip" : flip2 ? "wave-flip2" : ""}`}
         viewBox="0 0 1440 110"
         preserveAspectRatio="none"
         aria-hidden="true"
      >
         <path
            fill={color}
            d="M0,65 C280,130 470,8 735,46 C1040,90 1170,22 1440,52 L1440,110 L0,110 Z"
         />
      </svg>
   );
}

async function enviarConfirmacion(body: {
   nombre: string;
   asistira: boolean;
   mensaje: FormDataEntryValue | null;
}) {
   const endpoint = config.rsvpEndpoint;
   const isAppsScript = endpoint.includes("script.google.com");
   const response = await fetch(endpoint, {
      method: "POST",
      // Google Apps Script no permite CORS: se envía "a ciegas".
      mode: isAppsScript ? "no-cors" : "cors",
      headers: {
         "Content-Type": isAppsScript
            ? "text/plain;charset=utf-8"
            : "application/json",
      },
      body: JSON.stringify(body),
   });
   if (!isAppsScript && !response.ok) throw new Error("No se pudo guardar");
}

function Modal({
   active,
   close,
   invitado,
}: {
   active: Exclude<ModalName, "welcome" | null>;
   close: () => void;
   invitado: Invitado | null;
}) {
   const [rsvpStatus, setRsvpStatus] = useState<
      "idle" | "saving" | "success" | "error"
   >("idle");
   const title = {
      rsvp: "Confirmar Asistencia",
      song: "Sugerir Canción",
      dress: "Vestimenta",
      tips: "Tips y Notas",
      gifts: "Regalos",
   }[active];
   return (
      <div className="modal-backdrop" role="presentation" onMouseDown={close}>
         <div
            className="modal-card form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onMouseDown={(e) => e.stopPropagation()}
         >
            <button className="modal-close" onClick={close} aria-label="Cerrar">
               ×
            </button>
            <div className="tiny-star" aria-hidden="true">
               ★
            </div>
            <h2 id="modal-title">{title}</h2>
            {active === "rsvp" && (
               <form
                  onSubmit={async (e) => {
                     e.preventDefault();
                     setRsvpStatus("saving");
                     const formElement = e.currentTarget;
                     const form = new FormData(formElement);

                     try {
                        await enviarConfirmacion({
                           nombre: invitado
                              ? `${invitado.nombre} ${invitado.apellidos}`.trim()
                              : "Invitado sin código",
                           asistira: form.get("asistira") === "si",
                           mensaje: form.get("mensaje"),
                        });
                        setRsvpStatus("success");
                        formElement.reset();
                        window.setTimeout(close, 3000);
                     } catch {
                        setRsvpStatus("error");
                     }
                  }}
               >
                  <fieldset>
                     <legend>¿Asistes a la Celebración? *</legend>
                     <label className="inline">
                        <input
                           type="radio"
                           name="asistira"
                           value="si"
                           required
                        />
                        Sí, asistiré
                     </label>
                     <label className="inline">
                        <input type="radio" name="asistira" value="no" /> No
                        asistiré
                     </label>
                  </fieldset>
                  <label>
                     Mensaje para {config.cumpleanero} (opcional)
                     <textarea
                        name="mensaje"
                        placeholder="Puedes dejarle un mensaje de cariño"
                     />
                  </label>
                  <Button type="submit">
                     {rsvpStatus === "saving"
                        ? "GUARDANDO..."
                        : "ENVIAR CONFIRMACIÓN"}
                  </Button>
                  {rsvpStatus === "success" && (
                     <p className="form-status success" role="status">
                        ¡Gracias! Tu confirmación fue guardada.
                     </p>
                  )}
                  {rsvpStatus === "error" && (
                     <p className="form-status error" role="alert">
                        No se pudo guardar. Inténtalo nuevamente.
                     </p>
                  )}
               </form>
            )}

            {active === "dress" && (
               <div className="modal-copy">
                  <Icon name="dress" />
                  <p>{config.modales.vestimenta.titulo}</p>
                  <span>{config.modales.vestimenta.texto}</span>
               </div>
            )}
            {active === "tips" && (
               <div className="modal-copy">
                  <Icon name="info" />
                  <p>{config.modales.tips.titulo}</p>
                  <span>
                     La recepción comienza a las {horaTexto}.{" "}
                     {config.modales.tips.texto}
                  </span>
               </div>
            )}
            {active === "gifts" && (
               <div className="modal-copy">
                  <Icon name="gift" />
                  <p>{config.modales.regalos.titulo}</p>
                  <span>{config.modales.regalos.texto}</span>
               </div>
            )}
         </div>
      </div>
   );
}

function App() {
   const invitado = obtenerInvitado();
   const [modal, setModal] = useState<ModalName>("welcome");
   const [welcomeClosed, setWelcomeClosed] = useState(false);
   const [slide, setSlide] = useState(0);
   const [galleryOpen, setGalleryOpen] = useState(false);
   const touchStartX = useRef<number | null>(null);
   const [musicControlsVisible, setMusicControlsVisible] = useState(false);
   const [isMusicPlaying, setIsMusicPlaying] = useState(false);
   const playerRef = useRef<{
      playVideo: () => void;
      pauseVideo: () => void;
      destroy: () => void;
      addEventListener: (
         event: string,
         callback: (event: { data: number }) => void,
      ) => void;
   } | null>(null);
   const target = useMemo(() => config.fechaEvento, []);
   const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
   const gallery = galleryImages;

   useEffect(() => {
      const tick = () => {
         const d = Math.max(0, target.getTime() - Date.now());
         setTime({
            days: Math.floor(d / 86400000),
            hours: Math.floor(d / 3600000) % 24,
            mins: Math.floor(d / 60000) % 60,
            secs: Math.floor(d / 1000) % 60,
         });
      };
      tick();
      const id = window.setInterval(tick, 1000);
      return () => window.clearInterval(id);
   }, [target]);

   useEffect(() => {
      const key = (e: KeyboardEvent) => {
         if (e.key === "Escape") {
            if (modal === "welcome") setWelcomeClosed(true);
            setModal(null);
            setGalleryOpen(false);
         }
         if (!galleryOpen || gallery.length === 0) return;
         if (e.key === "ArrowLeft") {
            setSlide(
               (current) => (current + gallery.length - 1) % gallery.length,
            );
         }
         if (e.key === "ArrowRight") {
            setSlide((current) => (current + 1) % gallery.length);
         }
      };
      window.addEventListener("keydown", key);
      return () => window.removeEventListener("keydown", key);
   }, [galleryOpen, modal, gallery.length]);

   useEffect(() => {
      if (!welcomeClosed) return;

      const timeoutId = window.setTimeout(() => {
         setModal((current) => (current === null ? "tips" : current));
      }, 15000);

      return () => window.clearTimeout(timeoutId);
   }, [welcomeClosed]);

   const open = (name: ModalName) => setModal(name);

   const changeSlide = (direction: 1 | -1) => {
      if (gallery.length === 0) return;
      setSlide(
         (current) => (current + gallery.length + direction) % gallery.length,
      );
   };

   const handleGalleryTouchStart = (event: React.TouchEvent) => {
      touchStartX.current = event.touches[0]?.clientX ?? null;
   };

   const handleGalleryTouchEnd = (event: React.TouchEvent) => {
      if (touchStartX.current === null) return;

      const distance = event.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;

      if (Math.abs(distance) < 45) return;
      changeSlide(distance < 0 ? 1 : -1);
   };

   const handleMusicEnter = () => {
      setMusicControlsVisible(true);
      setIsMusicPlaying(true);
      setWelcomeClosed(true);
      setModal(null);
   };

   const handleMusicSkip = () => {
      setMusicControlsVisible(hasMusic);
      setIsMusicPlaying(false);
      setWelcomeClosed(true);
      setModal(null);
   };

   const toggleMusic = () => {
      const nextState = !isMusicPlaying;
      setIsMusicPlaying(nextState);

      if (!playerRef.current) return;

      if (nextState) {
         playerRef.current.playVideo();
      } else {
         playerRef.current.pauseVideo();
      }
   };

   useEffect(() => {
      if (!musicControlsVisible || !hasMusic) return;

      const setupPlayer = () => {
         const container = document.getElementById("music-player-container");
         if (!container || !window.YT || !window.YT.Player) return;

         playerRef.current = new window.YT.Player(container, {
            height: "1",
            width: "1",
            videoId: config.youtubeVideoId,
            playerVars: {
               autoplay: isMusicPlaying ? 1 : 0,
               loop: 1,
               playlist: config.youtubeVideoId,
               controls: 0,
               rel: 0,
               modestbranding: 1,
               playsinline: 1,
            },
            events: {
               onReady: (event) => {
                  if (isMusicPlaying) {
                     event.target.playVideo();
                  } else {
                     event.target.pauseVideo();
                  }
               },
               onStateChange: (event) => {
                  const isPlaying =
                     event.data === window.YT?.PlayerState?.PLAYING;
                  setIsMusicPlaying(isPlaying);
               },
            },
         });
      };

      const existingScript = document.querySelector(
         'script[src="https://www.youtube.com/iframe_api"]',
      );

      if (window.YT && window.YT.Player) {
         setupPlayer();
         return;
      }

      if (!existingScript) {
         const tag = document.createElement("script");
         tag.src = "https://www.youtube.com/iframe_api";
         document.body.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => {
         setupPlayer();
      };

      return () => {
         if (playerRef.current) {
            playerRef.current.destroy();
            playerRef.current = null;
         }
         if (window.onYouTubeIframeAPIReady) {
            delete window.onYouTubeIframeAPIReady;
         }
      };
   }, [musicControlsVisible, isMusicPlaying]);

   const mainStyle = {
      "--fotocumple": `url("${img(config.imagenes.fotoCumple)}")`,
   } as React.CSSProperties;

   return (
      <main style={mainStyle}>
         {musicControlsVisible && hasMusic && (
            <>
               <div className="hidden-music-player" aria-hidden="true">
                  <div id="music-player-container" />
               </div>
               <button
                  type="button"
                  className="music-toggle"
                  onClick={toggleMusic}
                  aria-label={
                     isMusicPlaying ? "Pausar música" : "Reproducir música"
                  }
               >
                  {isMusicPlaying ? "❚❚" : "▶"}
               </button>
            </>
         )}

         <section className="hero" id="inicio">
            <div className="hero-photo" />
            <div className="hero-tint" />
            <Bubbles count={14} />
            <Cloud className="cloud-hero-1" />
            <Cloud className="cloud-hero-2" />
            <div className="hero-content reveal">
               <div className="date">{fechaCorta}</div>
               <h1>{config.nombre}</h1>
               <p>{config.edadTexto}</p>
            </div>
            <div className="scroll-mark" aria-hidden="true">
               <span>⌄</span>
            </div>
         </section>
         <div className="content">
            <Wave color="#fff" flip2 />
            <section className="intro section-white">
               <Rainbow className="rainbow-intro" />
               <div className="quote-mark">"</div>
               <p className="quote">{config.frase}</p>
               <div className="intro-story">
                  <div className="intro-story-image">
                     <img
                        src={img(config.imagenes.hero)}
                        alt=""
                        onError={hideOnError}
                     />
                  </div>
                  <div className="intro-story-copy">
                     <p>El tiempo vuela...</p>
                     <p>{config.edad * 12} meses mágicos</p>
                     <p>
                        {(config.edad * 8760).toLocaleString("es-PE")} horas de
                        aventuras
                     </p>
                     <p>
                        {(config.edad * 365).toLocaleString("es-PE")} días de
                        burbujas y risas
                     </p>
                  </div>
               </div>

               <div className="quote-mark closing">"</div>
               <StarMark />
               <div className="countdown-wrap">
                  <span>Falta</span>
                  <div className="countdown">
                     {[
                        [time.days, "días"],
                        [time.hours, "hs"],
                        [time.mins, "min"],
                        [time.secs, "seg"],
                     ].map(([n, l]) => (
                        <div key={l}>
                           <strong>{String(n).padStart(2, "0")}</strong>
                           <small>{l}</small>
                        </div>
                     ))}
                  </div>
               </div>
            </section>

            <section className="guests blush-section">
               <Wave color="#fff" flip />
               <Bubbles count={8} />
               <div className="guest-card reveal">
                  <div className="guest-number">
                     <img
                        src={img(config.imagenes.saludo)}
                        alt="Hola"
                        onError={hideOnError}
                     />
                  </div>
                  <h3>INVITADO(A)</h3>
                  <h1>{invitado?.nombre ?? "¡Hola amiguito!"}</h1>
                  <p>{invitado?.apellidos ?? ""}</p>
               </div>
               <p className="guest-note">
                  Tu presencia es lo más importante.
                  <br />
                  ¡No faltes!
               </p>
               <Wave color="#fff" />
            </section>
            <section className="celebration section-white" id="celebracion">
               <Cloud className="cloud-celebration" />
               <div className="section-heading">
                  <p>Será un día inolvidable y queremos vivirlo contigo.</p>
                  <h2>Celebración</h2>
                  <StarMark />
               </div>
               <div className="event-grid">
                  <article>
                     <div className="line-icon c-red">
                        <Icon name="calendar" />
                     </div>
                     <h4>DÍA</h4>
                     <p>{fechaTexto}</p>
                     <Button href={calendarUrl}>AGENDAR</Button>
                  </article>
                  <article>
                     <div className="line-icon c-yellow">
                        <Icon name="check" />
                     </div>
                     <h4>LUGAR</h4>
                     <p>{config.lugar}</p>
                     <Button onClick={() => open("rsvp")}>
                        CONFIRMAR ASISTENCIA
                     </Button>
                  </article>
                  <article>
                     <div className="line-icon c-green">
                        <Icon name="pin" />
                     </div>
                     <h4>DIRECCIÓN</h4>
                     <p style={{ marginBottom: config.referencia ? 0 : undefined }}>
                        {config.direccion}
                     </p>
                     {config.referencia && (
                        <p className="event-reference">{config.referencia}</p>
                     )}
                     <Button href={config.mapsUrl}>¿CÓMO LLEGAR?</Button>
                  </article>
               </div>
            </section>

            <section className="itinerary section-white" id="itinerario">
               <Wave color="#fff" flip />
               <div className="section-heading">
                  <p>Estos son algunos momentos que compartiremos.</p>
                  <h2>Itinerario</h2>
                  <StarMark />
               </div>
               <div className="timeline">
                  {eventos.map(({ hour, event, icon }) => (
                     <div className="timeline-item" key={`${hour}-${event}`}>
                        <time>{hour}</time>
                        <span className="timeline-dot" aria-hidden="true">
                           <Icon name={icon} />
                        </span>
                        <p>{event}</p>
                     </div>
                  ))}
               </div>
            </section>

            <section className="rsvp-banner">
               <Wave color="#fff" flip />
               <Bubbles count={10} />
               <div>
                  <Icon name="check" />
                  <h2>Confirmar Asistencia</h2>
                  <p>Es importante que confirmes tu asistencia</p>
                  <Button light onClick={() => open("rsvp")}>
                     CONFIRMAR ASISTENCIA
                  </Button>
               </div>
               <Wave color="#fff" />
            </section>

            {gallery.length > 0 && (
               <section className="gallery-section section-white" id="galeria">
                  <div className="section-heading">
                     <h2>{config.galeria.titulo}</h2>
                     <p>{config.galeria.subtitulo}</p>
                     <StarMark />
                  </div>
                  <div className="gallery-shell">
                     <button
                        type="button"
                        onClick={() => changeSlide(-1)}
                        aria-label="Foto anterior"
                     >
                        ‹
                     </button>
                     <button
                        type="button"
                        className="gallery-image-button"
                        onClick={() => setGalleryOpen(true)}
                        onTouchStart={handleGalleryTouchStart}
                        onTouchEnd={handleGalleryTouchEnd}
                        aria-label={`Ver foto ${slide + 1} en grande`}
                     >
                        <img
                           key={gallery[slide]}
                           src={gallery[slide]}
                           alt={`Recuerdo de ${config.nombre} ${slide + 1}`}
                        />
                     </button>
                     <button
                        type="button"
                        onClick={() => changeSlide(1)}
                        aria-label="Foto siguiente"
                     >
                        ›
                     </button>
                  </div>
                  <div className="dots">
                     {gallery.map((image, i) => (
                        <button
                           key={image}
                           className={i === slide ? "active" : ""}
                           onClick={() => setSlide(i)}
                           aria-label={`Ver foto ${i + 1}`}
                        />
                     ))}
                  </div>
               </section>
            )}

            {galleryOpen && gallery.length > 0 && (
               <div
                  className="gallery-lightbox"
                  role="dialog"
                  aria-modal="true"
                  aria-label={`Foto ${slide + 1} de ${gallery.length}`}
                  onMouseDown={(event) => {
                     if (event.target === event.currentTarget) {
                        setGalleryOpen(false);
                     }
                  }}
                  onTouchStart={handleGalleryTouchStart}
                  onTouchEnd={handleGalleryTouchEnd}
               >
                  <button
                     type="button"
                     className="lightbox-close"
                     onMouseDown={(event) => event.stopPropagation()}
                     onClick={() => setGalleryOpen(false)}
                     aria-label="Cerrar foto ampliada"
                  >
                     ×
                  </button>
                  <button
                     type="button"
                     className="lightbox-nav lightbox-prev"
                     onClick={(event) => {
                        event.stopPropagation();
                        changeSlide(-1);
                     }}
                     onMouseDown={(event) => event.stopPropagation()}
                     aria-label="Foto anterior"
                  >
                     ‹
                  </button>
                  <img
                     src={gallery[slide]}
                     alt={`Recuerdo de ${config.nombre} ${slide + 1}`}
                     onMouseDown={(event) => event.stopPropagation()}
                  />
                  <button
                     type="button"
                     className="lightbox-nav lightbox-next"
                     onClick={(event) => {
                        event.stopPropagation();
                        changeSlide(1);
                     }}
                     onMouseDown={(event) => event.stopPropagation()}
                     aria-label="Foto siguiente"
                  >
                     ›
                  </button>
                  <span className="lightbox-counter">
                     {slide + 1} / {gallery.length}
                  </span>
               </div>
            )}

            <section className="party blush-section" id="fiesta">
               <Wave color={BG_SOFT} flip />
               <div className="section-heading">
                  <h2>Fiesta</h2>
                  <p>
                     Hagamos juntos una fiesta mágica.
                     <br />
                     Aquí algunos detalles a tener en cuenta.
                  </p>
                  <StarMark />
               </div>
               <div className="party-grid">
                  <article>
                     <div className="circle-icon c-red">
                        <Icon name="dress" />
                     </div>
                     <h3>Vestimenta</h3>
                     <p>
                        Sugerencias para
                        <br />
                        vestir ese día
                     </p>
                     <Button onClick={() => open("dress")}>+ INFO</Button>
                  </article>
                  <article>
                     <div className="circle-icon c-yellow">
                        <Icon name="info" />
                     </div>
                     <h3>Tips y Notas</h3>
                     <p>
                        Información adicional
                        <br />
                        para tener en cuenta
                     </p>
                     <Button onClick={() => open("tips")}>+ INFO</Button>
                  </article>
                  <article>
                     <div className="circle-icon c-green">
                        <Icon name="gift" />
                     </div>
                     <h3>Regalos</h3>
                     <p>
                        Si deseas hacerme
                        <br />
                        un obsequio
                     </p>
                     <Button onClick={() => open("gifts")}>+ INFO</Button>
                  </article>
               </div>
               <Wave color="#fff" />
            </section>

            <section className="instagram-section">
               <Wave color="#fff" flip />
               <Bubbles count={8} />
               <div className="insta-overlay">
                  <Icon name="instagram" />
                  <h2>Una gran fiesta junto a ti</h2>
                  <p>Comparte tus fotos y videos de este hermoso día</p>
                  {config.fotos.albumUrl ? (
                     <a
                        href={config.fotos.albumUrl}
                        target="_blank"
                        rel="noreferrer"
                     >
                        <strong>{config.fotos.hashtag}</strong>
                        <span>COMPARTE TUS FOTOS AQUÍ</span>
                     </a>
                  ) : (
                     <strong className="insta-hashtag">
                        {config.fotos.hashtag}
                     </strong>
                  )}
               </div>
            </section>

            <footer>
               <h2>{config.nombre}</h2>
               <p>{config.edadTexto}</p>
               <nav>
                  <button onClick={() => open("rsvp")}>
                     Confirmar asistencia
                  </button>
                  <i>·</i>
                  <a href="#celebracion">Agendar celebración</a>
               </nav>
               <div className="footer-rule" />
               <small>
                  Desarrollado con <Icon name="heart" /> por{" "}
                  <b>{config.creditos}</b>
               </small>
            </footer>
         </div>

         {modal === "welcome" && (
            <div className="modal-backdrop welcome" role="presentation">
               <div
                  className="modal-card welcome-card"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="welcome-title"
               >
                  <img
                     src={img(config.imagenes.bienvenida)}
                     alt=""
                     onError={hideOnError}
                  />
                  <p>Bienvenid@ a la invitación de</p>
                  <h2 id="welcome-title">{config.nombre}</h2>
                  {hasMusic ? (
                     <>
                        <span>
                           La música de fondo es parte de la experiencia
                        </span>
                        <Button onClick={handleMusicEnter}>
                           INGRESAR CON MÚSICA
                        </Button>
                        <button
                           className="text-button"
                           onClick={handleMusicSkip}
                        >
                           Ingresar sin música
                        </button>
                     </>
                  ) : (
                     <Button onClick={handleMusicSkip}>INGRESAR</Button>
                  )}
               </div>
            </div>
         )}
         {modal && modal !== "welcome" && (
            <Modal
               active={modal}
               close={() => setModal(null)}
               invitado={invitado}
            />
         )}
      </main>
   );
}

export default App;
