import React from "react";

// ── Icone (SVG outline, stile coerente con il resto del sito) ─────────
// Aggiungere una nuova icona qui e referenziarla con il suo `id` in CONTACTS.
const ICONS = {
	email: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<rect x="3" y="5" width="18" height="14" rx="2" />
			<path d="m3 7 9 6 9-6" />
		</svg>
	),
	phone: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
		</svg>
	),
	instagram: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<rect x="2" y="2" width="20" height="20" rx="5" />
			<circle cx="12" cy="12" r="4" />
			<line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
		</svg>
	),
	linkedin: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
			<rect x="2" y="9" width="4" height="12" />
			<circle cx="4" cy="4" r="2" />
		</svg>
	),
};

// ── Elementi principali dei contatti ──────────────────────────────────
// Il valore (href + testo) lo popoli tu nell'HTML: vedi i segnaposto sotto.
const CONTACTS = [
	{ id: "email",     label: "Email",     placeholder: "nome@email.com" },
	{ id: "phone",     label: "Telefono",  placeholder: "+39 000 000 0000" },
	{ id: "instagram", label: "Instagram", placeholder: "@username" },
	{ id: "linkedin",  label: "LinkedIn",  placeholder: "/in/username" },
];

function Contacts() {
	return (
		<div className="contacts">
			<h2 className="contacts-title">Contatti</h2>

			<ul className="contacts-list">
				{CONTACTS.map(({ id, label, placeholder }) => (
					<li className="contact-item" key={id}>
						<span className="contact-icon">{ICONS[id]}</span>
						<span className="contact-text">
							<span className="contact-label">{label}</span>
							{/* POPOLA QUI: sostituisci href e testo con i tuoi dati */}
							{/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
							<a className="contact-value" href="#">
								{placeholder}
							</a>
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

export default Contacts;
