import React, { useEffect, useRef, useState, useCallback } from "react";
import "./ProjectModal.css";
import CompareSlider from "../CompareSlider/CompareSlider";
import { imageProps } from "../../lib/content";
import { embedUrl } from "../../lib/video";
import { softwareLabel, softwareMono } from "../../lib/software";

// Larghezza a schermo delle immagini del post: il riquadro è largo al
// massimo 800 px meno 32 px di margine per lato (vedi ProjectModal.css).
const MEDIA_SIZES = "(max-width: 800px) 100vw, 736px";

function ProjectModal({ project, onClose }) {
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
      // Le didascalie delle immagini restano nel gestionale ma NON vengono
      // mostrate: le immagini scorrono come un flusso continuo, stile Behance.
      const alt = item.image.alt || item.caption || project.title;
      // Coppia di confronto (es. Beauty vs Topologia): slider con barra
      // divisoria. Senza `compare` si vede l'immagine normale.
      if (item.compare) {
        return (
          <div key={item.id || idx} className="modal-media-item">
            <CompareSlider
              base={imageProps(item.image, MEDIA_SIZES)}
              overlay={imageProps(item.compare, MEDIA_SIZES)}
              alt={alt}
            />
          </div>
        );
      }
      return (
        <div key={item.id || idx} className="modal-media-item">
          <img
            {...imageProps(item.image, MEDIA_SIZES)}
            alt={alt}
            loading={idx < 2 ? "eager" : "lazy"}
            decoding="async"
            className="modal-image"
          />
        </div>
      );
    }

    if (item.type === "video") {
      const src = embedUrl(item.url);
      if (src) {
        return (
          <div key={item.id || idx} className="modal-media-item">
            <div className="modal-video-embed">
              <iframe
                src={src}
                title={item.caption || `Video ${idx + 1}`}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
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
      <div key={item.id || idx} className="modal-media-item modal-media-link">
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

        {/* Footer software (telefono e tablet): pillole in vetro con sigla e
            nome, centrate in fondo al post */}
        {project.software?.length > 0 && (
          <ul className="modal-software" aria-label="Software utilizzati">
            {project.software.map((id) => (
              <li key={id} className="sw-pill">
                <span className="sw-chip" aria-hidden="true">{softwareMono(id)}</span>
                <span className="sw-name">{softwareLabel(id)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Rail software (desktop): tessere in vetro fisse a destra, stile
          Behance — restano ferme mentre il post scorre. Il nome compare
          passando sopra con il mouse. */}
      {project.software?.length > 0 && (
        <ul className="modal-software-rail" aria-label="Software utilizzati">
          {project.software.map((id) => (
            <li key={id} className="sw-chip sw-chip--rail" aria-label={softwareLabel(id)}>
              <span aria-hidden="true">{softwareMono(id)}</span>
              <span className="sw-tip" aria-hidden="true">{softwareLabel(id)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjectModal;
