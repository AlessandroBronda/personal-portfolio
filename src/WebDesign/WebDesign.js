// ── Sezione WEB DESIGN ────────────────────────────────────────────────
// A differenza di Progetti 3D / Grafica ecc., qui NON si caricano progetti
// dal manifest remoto: i contenuti verranno inseriti a mano dentro questo
// componente. Per ora un placeholder, ma usa lo STESSO contenitore full-width
// delle altre sezioni, così l'aspetto è coerente (e non somiglia alla HOME).
import React from "react";
import "../components/ProjectGrid/ProjectGrid.css";

const avatar = process.env.PUBLIC_URL + "/semoy.jpg";

function WebDesignSection({ isFading }) {
	return (
		<div className={`project-grid-wrapper ${isFading ? "section-fading" : ""}`}>
			{/* Inserisci qui i tuoi elementi (immagini, embed, testo...). */}
			<p className="grid-state">Sezione Web Design — contenuti in arrivo.</p>
		</div>
	);
}

export const section = {
	key: "WEB DESIGN",
	label: "WEB DESIGN",
	avatar,
	render: WebDesignSection,
	fullWidth: true,
};

export default WebDesignSection;
