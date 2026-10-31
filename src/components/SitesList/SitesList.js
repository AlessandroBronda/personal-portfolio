import React, { useEffect, useId, useState } from "react";
import "./SitesList.css";
import { imageProps } from "../../lib/content";
import { softwareLabel, softwareMono } from "../../lib/software";
import ProjectModal from "../ProjectModal/ProjectModal";

// Card dei siti (sezioni con impaginazione "sites" nel gestionale, es. Web
// design), una sotto l'altra.
// • Desktop (≥1200 px): card orizzontale, anteprima della pagina iniziale a
//   sinistra (porta al sito), a destra titolo, descrizione, tag, software e
//   "Visita il sito".
// • Sotto i 1200 px: card compatta (anteprima + titolo). Toccando
//   l'anteprima o il titolo si apre con un'animazione e mostra descrizione,
//   tag, "Visita il sito" e poi i software, in piccolo. Così si vedono più
//   siti uno dopo l'altro.

const COMPACT = "(max-width: 1199px)";

// Larghezza a schermo dell'anteprima: metà della card su desktop, tutta la
// larghezza sotto i 1200 px (vedi SitesList.css).
const SHOT_SIZES = "(max-width: 1199px) 100vw, 50vw";

const domain = (url) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

function useCompact() {
  const [compact, setCompact] = useState(() => window.matchMedia?.(COMPACT).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.(COMPACT);
    if (!mq) return;
    const onChange = (e) => setCompact(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return compact;
}

function Software({ ids }) {
  if (!ids?.length) return null;
  return (
    <ul className="site-software" aria-label="Software utilizzati">
      {ids.map((id) => (
        <li key={id} className="sw-pill">
          <span className="sw-chip" aria-hidden="true">
            {softwareMono(id)}
          </span>
          <span className="sw-name">{softwareLabel(id)}</span>
        </li>
      ))}
    </ul>
  );
}

function Actions({ url, hasDetails, onOpen }) {
  if (!url && !hasDetails) return null;
  return (
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
  );
}

function SiteCard({ project, index, compact, onOpen }) {
  const { url, preview } = project;
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const hasDetails = project.media?.length > 0;
  const expanded = !compact || open;
  const toggle = () => setOpen((o) => !o);

  const img = (
    <img
      {...imageProps(preview, SHOT_SIZES)}
      alt={`Pagina iniziale di ${project.title}`}
      loading={index < 2 ? "eager" : "lazy"}
      decoding="async"
      className="site-shot-img"
    />
  );

  const tags = project.tags?.length > 0 && (
    <ul className="site-tags" aria-label="Tag">
      {project.tags.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );

  return (
    <article
      className={`site-card ${compact ? "site-card--compact" : ""} ${expanded ? "is-open" : ""}`}
      style={{ animationDelay: `${Math.min(index, 6) * 0.08}s` }}
      aria-labelledby={`site-${project.id}`}
    >
      {compact ? (
        // Compatta: l'anteprima apre e chiude la card
        <button
          type="button"
          className="site-shot"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={bodyId}
          aria-label={`${open ? "Chiudi" : "Apri"} ${project.title}`}
        >
          {img}
        </button>
      ) : url ? (
        <a className="site-shot" href={url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
          {img}
        </a>
      ) : (
        <div className="site-shot">{img}</div>
      )}

      <div className="site-info">
        {compact ? (
          <button
            type="button"
            className="site-head"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={bodyId}
          >
            <span className="site-head-text">
              {/* dentro un pulsante non può stare un <h3>: titolo con role="heading" */}
              <span className="site-title" role="heading" aria-level={3} id={`site-${project.id}`}>
                {project.title}
              </span>
              {url && <span className="site-domain">{domain(url)}</span>}
            </span>
            <svg className="site-chevron" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        ) : (
          <div className="site-head-text">
            <h3 className="site-title" id={`site-${project.id}`}>
              {project.title}
            </h3>
            {url && <span className="site-domain">{domain(url)}</span>}
          </div>
        )}

        <div className="site-body" id={bodyId} inert={!expanded ? true : undefined}>
          <div className="site-body-inner">
            {project.description && <p className="site-desc">{project.description}</p>}
            {tags}
            {compact ? (
              // Telefono/tablet: prima "Visita il sito", poi i software (in piccolo)
              <>
                <Actions url={url} hasDetails={hasDetails} onOpen={onOpen} />
                <Software ids={project.software} />
              </>
            ) : (
              <>
                <Software ids={project.software} />
                <Actions url={url} hasDetails={hasDetails} onOpen={onOpen} />
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function SitesList({ projects, isFading }) {
  const [selected, setSelected] = useState(null);
  const compact = useCompact();

  return (
    <div className={`sites-wrapper ${isFading ? "section-fading" : ""}`}>
      {projects.length === 0 ? (
        <p className="grid-state">Contenuti in arrivo.</p>
      ) : (
        <div className="sites-list">
          {projects.map((p, i) => (
            <SiteCard key={p.id} project={p} index={i} compact={compact} onOpen={() => setSelected(p)} />
          ))}
        </div>
      )}
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default SitesList;
