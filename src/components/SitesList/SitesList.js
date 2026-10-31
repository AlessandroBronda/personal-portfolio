import React, { useState } from "react";
import "./SitesList.css";
import { imageProps } from "../../lib/content";
import { softwareLabel, softwareMono } from "../../lib/software";
import ProjectModal from "../ProjectModal/ProjectModal";

// Card dei siti (sezioni con impaginazione "sites" nel gestionale, es. Web
// design): una card orizzontale a tutta larghezza per sito, una sotto
// l'altra. A sinistra l'anteprima della pagina iniziale dentro una finestra
// del browser stilizzata (porta al sito), a destra titolo, descrizione, tag,
// software e i pulsanti. Sul telefono l'anteprima va sopra e il testo sotto.

// Larghezza a schermo dell'anteprima: ~60% della card su desktop, tutta la
// larghezza sul telefono (vedi SitesList.css).
const SHOT_SIZES = "(max-width: 900px) 100vw, 60vw";

const domain = (url) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

function SiteCard({ project, index, onOpen }) {
  const { url, preview } = project;
  const hasDetails = project.media?.length > 0;
  const shot = (
    <>
      <span className="site-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        {url && <span className="site-bar-url">{domain(url)}</span>}
      </span>
      <span className="site-shot-frame">
        <img
          {...imageProps(preview, SHOT_SIZES)}
          alt={`Pagina iniziale di ${project.title}`}
          loading={index < 2 ? "eager" : "lazy"}
          decoding="async"
          className="site-shot-img"
        />
      </span>
    </>
  );

  return (
    <article
      className="site-card"
      style={{ animationDelay: `${Math.min(index, 6) * 0.08}s` }}
      aria-labelledby={`site-${project.id}`}
    >
      {url ? (
        <a className="site-shot" href={url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
          {shot}
        </a>
      ) : (
        <div className="site-shot">{shot}</div>
      )}

      <div className="site-info">
        <h3 className="site-title" id={`site-${project.id}`}>
          {project.title}
        </h3>
        {url && <span className="site-domain">{domain(url)}</span>}
        {project.description && <p className="site-desc">{project.description}</p>}

        {project.tags?.length > 0 && (
          <ul className="site-tags" aria-label="Tag">
            {project.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}

        {project.software?.length > 0 && (
          <ul className="site-software" aria-label="Software utilizzati">
            {project.software.map((id) => (
              <li key={id} className="sw-pill">
                <span className="sw-chip" aria-hidden="true">
                  {softwareMono(id)}
                </span>
                <span className="sw-name">{softwareLabel(id)}</span>
              </li>
            ))}
          </ul>
        )}

        {(url || hasDetails) && (
          <div className="site-actions">
            {url && (
              <a className="site-btn site-btn--primary" href={url} target="_blank" rel="noopener noreferrer">
                Visita il sito
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
            )}
            {hasDetails && (
              <button type="button" className="site-btn" onClick={onOpen}>
                Scopri il progetto
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function SitesList({ projects, isFading }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className={`sites-wrapper ${isFading ? "section-fading" : ""}`}>
      {projects.length === 0 ? (
        <p className="grid-state">Contenuti in arrivo.</p>
      ) : (
        <div className="sites-list">
          {projects.map((p, i) => (
            <SiteCard key={p.id} project={p} index={i} onOpen={() => setSelected(p)} />
          ))}
        </div>
      )}
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default SitesList;
