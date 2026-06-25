// ── Sezione BIO ───────────────────────────────────────────────────────
// Render personalizzato: un "foglio" in stile editor con il pannello competenze.
import React from "react";
import "./Bio.css";
import SkillPanel from "./SkillPanel";

const avatar = process.env.PUBLIC_URL + "/bioPic.JPG";

// Riceve da App.js: { screenWidth, isFading }
function Bio({ isFading }) {
	return (
		<div className={`bioSheet-wrapper ${isFading ? "section-fading" : ""}`}>
			<div className="bioSheet">
				<SkillPanel />
			</div>
		</div>
	);
}

export const section = {
	key: "BIO",
	label: "BIO",
	avatar,
	render: Bio,
	// Testi della colonna sinistra specifici per la sezione BIO
	name: "Illustratore e 3D Generalist",
	bio:
		"“Unisco competenze tecniche e sensibilità visiva per costruire progetti " +
		"completi, dall'idea alla realizzazione. 3D, grafica e codice sono i miei " +
		"strumenti; il risultato è ciò che conta.”",
	bioItalic: true,
};

export default Bio;
