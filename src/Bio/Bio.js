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
};

export default Bio;
