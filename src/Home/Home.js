// ── Sezione HOME ──────────────────────────────────────────────────────
// Usa il layout a tre box (c1/c2/c3) gestito da App.js.
// c1 = Contatti. c2 e c3 ancora da definire.

import "./Home.css";
import Contacts from "./Contacts";

const avatar = process.env.PUBLIC_URL + "/semoy.jpg";

export const section = {
	key: "HOME",
	label: "HOME",
	avatar,
	render: null, // null → App usa il layout a box
	boxes: {
		c1: <Contacts />,
		c2: null,
		c3: null,
	},
};
