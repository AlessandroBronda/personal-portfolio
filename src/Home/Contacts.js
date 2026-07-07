import React from "react";

// ── Icone (SVG, stile coerente con il resto del sito) ─────────────────
// email/linkedin: outline (stroke). behance/artstation: loghi di brand (fill).
// Aggiungere una nuova icona qui e referenziarla con il suo `id` in CONTACTS.
const ICONS = {
	email: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<rect x="3" y="5" width="18" height="14" rx="2" />
			<path d="m3 7 9 6 9-6" />
		</svg>
	),
	behance: (
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
		</svg>
	),
	artstation: (
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path d="M0 17.723l2.027 3.505h.001a2.424 2.424 0 0 0 2.164 1.333h13.457l-3.62-6.328H0zm24 .728c0-.493-.139-.955-.379-1.349L15.428 2.945A2.422 2.422 0 0 0 13.331 1.722H9.05l11.954 20.694 2.554-4.408c.275-.395.442-.872.442-1.557zM12.36 8.69l-3.469 6.012h6.946L12.36 8.69z" />
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

// ── Elementi dei contatti ─────────────────────────────────────────────
// `value` + `href` = dato reale; `placeholder` = segnaposto da popolare.
const CONTACTS = [
	{
		id: "email",
		label: "Email",
		value: "alessandrobronda@gmail.com",
		href: "mailto:alessandrobronda@gmail.com",
	},
	{
		id: "behance",
		label: "Behance",
		value: "behance/alessandrobronda",
		href: "https://www.behance.net/alessandro5b27",
	},
	{
		id: "artstation",
		label: "ArtStation",
		value: "artstation/alessandrobronda",
		href: "https://www.artstation.com/alessandrobronda",
	},
	{ id: "linkedin",   label: "LinkedIn",   placeholder: "/in/username" },
];

function Contacts() {
	return (
		<div className="contacts">
			<h2 className="contacts-title">Contatti</h2>

			<ul className="contacts-list">
				{CONTACTS.map(({ id, label, value, placeholder, href }) => {
					// I link a profili esterni (http) si aprono in una nuova scheda.
					const esterno = typeof href === "string" && href.startsWith("http");
					return (
					<li className="contact-item" key={id}>
						<span className="contact-icon">{ICONS[id]}</span>
						<span className="contact-text">
							<span className="contact-label">{label}</span>
							{/* POPOLA QUI Behance/ArtStation/LinkedIn: sostituisci href e testo */}
							{/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
							<a
								className="contact-value"
								href={href || "#"}
								target={esterno ? "_blank" : undefined}
								rel={esterno ? "noopener noreferrer" : undefined}
							>
								{value || placeholder}
							</a>
						</span>
					</li>
					);
				})}
			</ul>
		</div>
	);
}

export default Contacts;
