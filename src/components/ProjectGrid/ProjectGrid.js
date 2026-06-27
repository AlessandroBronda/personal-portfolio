import React, { useState } from "react";
import "./ProjectGrid.css";
import { useManifest } from "../../lib/useManifest";
import ProjectModal from "../ProjectModal/ProjectModal";

function ProjectGrid({ category, isFading }) {
  const { manifest, loading, error, imageBase } = useManifest();
  const [selectedProject, setSelectedProject] = useState(null);

  const projects =
    manifest?.projects?.filter((p) => p.category === category) ?? [];

  return (
    <div className={`project-grid-wrapper ${isFading ? "section-fading" : ""}`}>
      {loading && <p className="grid-state">Caricamento...</p>}
      {error && (
        <p className="grid-state">Errore nel caricamento dei progetti.</p>
      )}
      {!loading && !error && projects.length === 0 && (
        <p className="grid-state">Nessun progetto disponibile.</p>
      )}
      {!loading && !error && projects.length > 0 && (
        <div className="project-grid">
          {projects.map((project) => (
            <button
              key={project.id}
              className="grid-cell"
              onClick={() => setSelectedProject(project)}
              aria-label={project.title}
            >
              <img
                src={`${imageBase}/${project.cover.thumb || project.cover.src}`}
                alt={project.title}
                loading="eager"
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
          imageBase={imageBase}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

export default ProjectGrid;
