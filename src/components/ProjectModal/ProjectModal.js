import React, { useEffect, useRef, useState, useCallback } from "react";
import "./ProjectModal.css";
import CompareSlider from "../CompareSlider/CompareSlider";
import { fallbackCdn } from "../../lib/useManifest";
import { softwareIconUrl, softwareLabel } from "../../lib/software";

// Converte URL YouTube/Vimeo nel formato embed corrispondente.
function toEmbedUrl(url) {
  if (!url) return null;
  const ytWatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`;
  const ytShort = url.match(/youtu\.be\/([\w-]+)/);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function ProjectModal({ project, imageBase = "", onClose }) {
  const overlayRef = useRef(null);
  // Stato di chiusura: fa partire l'animazione di USCITA (verso sinistra).
  // Lo smontaggio reale (onClose) avviene solo a fine animazione, gestito
  // da handleContentAnimEnd sul contenuto.
  const [closing, setClosing] = useState(false);
  const startClose = useCallback(() => setClosing(true), []);

  // Chiusura con tasto ESC.
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") startClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [startClose]);

  // Focus sull'overlay all'apertura (accessibilità).
  useEffect(() => {
    overlayRef.current?.focus();
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) startClose();
  };

  // Quando l'animazione del contenuto finisce: se stiamo chiudendo, smonta.
  const handleContentAnimEnd = () => {
    if (closing) onClose();
  };

  const renderMediaItem = (item, idx) => {
    if (item.type === "image") {
      // Coppia di confronto (es. Beauty vs Topologia): slider con barra
      // divisoria. Un manifest senza compareSrc mostra l'immagine normale.
      // Nota: le didascalie delle immagini restano nel manifest (servono
      // lato backend) ma NON vengono mostrate — le immagini scorrono come
      // un flusso continuo, stile Behance.
      if (item.compareSrc) {
        return (
          <div key={idx} className="modal-media-item">
            <CompareSlider
              baseSrc={`${imageBase}/${item.src}`}
              overlaySrc={`${imageBase}/${item.compareSrc}`}
              alt={item.caption || project.title}
              onImgError={fallbackCdn}
            />
          </div>
        );
      }
      return (
        <div key={idx} className="modal-media-item">
          <img
            src={`${imageBase}/${item.src}`}
            alt={item.caption || project.title}
            loading="lazy"
            className="modal-image"
            onError={fallbackCdn}
          />
        </div>
      );
    }

    if (item.type === "video") {
      const embedUrl = toEmbedUrl(item.url);
      if (embedUrl) {
        return (
          <div key={idx} className="modal-media-item">
            <div className="modal-video-embed">
              <iframe
                src={embedUrl}
                title={item.caption || `Video ${idx + 1}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {item.caption && <p className="modal-caption">{item.caption}</p>}
          </div>
        );
      }
    }

    // type "link" o video con URL non riconoscibile come embed
    return (
      <div key={idx} className="modal-media-item modal-media-link">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="modal-link"
        >
          {item.caption || item.url}
        </a>
      </div>
    );
  };

  return (
    <div
      className={`modal-overlay ${closing ? "closing" : ""}`}
      ref={overlayRef}
      tabIndex={-1}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      <div className="modal-content" onAnimationEnd={handleContentAnimEnd}>
        <button className="modal-close" onClick={startClose} aria-label="Chiudi">
          ✕
        </button>

        <h2 className="modal-title">{project.title}</h2>

        {project.description && (
          <p className="modal-description">{project.description}</p>
        )}

        {project.tags?.length > 0 && (
          <div className="modal-tags">
            {project.tags.map((tag, i) => (
              <span key={i} className="modal-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="modal-media-list">
          {project.media?.map(renderMediaItem)}
        </div>

        {/* Footer software (solo mobile): loghi centrati in fondo al post */}
        {project.software?.length > 0 && (
          <div className="modal-software">
            {project.software.map((id) => (
              <img
                key={id}
                src={softwareIconUrl(id)}
                alt={softwareLabel(id)}
                title={softwareLabel(id)}
                className="modal-software-icon"
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>

      {/* Rail software (solo desktop): fissa a destra, stile Behance —
          resta ferma mentre il contenuto del post scorre */}
      {project.software?.length > 0 && (
        <div className="modal-software-rail">
          {project.software.map((id) => (
            <img
              key={id}
              src={softwareIconUrl(id)}
              alt={softwareLabel(id)}
              title={softwareLabel(id)}
              className="modal-software-icon"
              loading="lazy"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectModal;
