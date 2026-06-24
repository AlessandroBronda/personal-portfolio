// ── Sezione HOME ──────────────────────────────────────────────────────
// Usa il layout a tre box (c1/c2/c3) gestito da App.js.
// Per ora i box sono vuoti: riempi c1/c2/c3 con dei nodi React quando vuoi.

const avatar = process.env.PUBLIC_URL + "/semoy.jpg";

export const section = {
	key: "HOME",
	label: "HOME",
	avatar,
	render: null, // null → App usa il layout a box
	boxes: { c1: null, c2: null, c3: null },
};
