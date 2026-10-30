import React, { useState } from "react";
import "./ProjectGrid.css";
import { imageProps } from "../../lib/content";
import ProjectModal from "../ProjectModal/ProjectModal";

// Larghezza a schermo di una copertina: 3 colonne in una griglia larga al
// massimo 1040 px (vedi ProjectGrid.css).
const COVER_SIZES = "(max-width: 1064px) 33vw, 340px";

// Le prime righe arrivano subito, le altre quando si scorre la griglia.
const EAGER = 9;

// Griglia dei lavori di una sezione (dati da content.json, già in ordine).
function ProjectGrid({ projects, isFading }) {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className={`project-grid-wrapper ${isFading ? "section-fading" : ""}`}>
      {projects.length === 0 ? (
        <p className="grid-state">Contenuti in arrivo.</p>
      ) : (
        <div className="project-grid">
          {projects.map((project, i) => (
            <button
              key={project.id}
              className="grid-cell"
              // Ritardo progressivo per la comparsa a cascata (max ~0.75s).
              style={{ animationDelay: `${Math.min(i, 15) * 0.05}s` }}
              onClick={() => setSelectedProject(project)}
              aria-label={project.title}
            >
              <img
                {...imageProps(project.cover, COVER_SIZES)}
                alt={project.cover.alt || project.title}
                loading={i < EAGER ? "eager" : "lazy"}
                decoding="async"
                className="grid-cover"
              />
              <div className="grid-overlay">
                <span className="grid-title">{project.title}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

export default ProjectGrid;
