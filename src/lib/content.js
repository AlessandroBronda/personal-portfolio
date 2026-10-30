import { useEffect, useState } from "react";

// ── Contenuti del portfolio ─────────────────────────────────────────────
// Sezioni e lavori vivono in content.json sul bucket Cloudflare R2
// (media.alessandrobronda.com), scritto dal gestionale locale. Il sito lo
// legge a ogni visita: quello che si salva nel gestionale è online subito,
// senza deploy. HOME e BIO restano nel codice (cartelle Home/ e Bio/).
//
// Per provare il sito contro un altro bucket: REACT_APP_MEDIA_URL=<indirizzo>
export const MEDIA_URL = (
	process.env.REACT_APP_MEDIA_URL || "https://media.alessandrobronda.com"
).replace(/\/+$/, "");

// Formato del contratto con il gestionale (data/content.schema.json).
const VERSION = 4;

const byOrder = (a, b) => a.order - b.order;
const isImageRef = (r) =>
	Boolean(r && typeof r.key === "string" && Array.isArray(r.widths) && r.widths.length);

/**
 * Tiene solo ciò che il sito sa mostrare, nell'ordine scelto nel gestionale.
 * content.json pubblico contiene già solo sezioni visibili e lavori
 * pubblicati: il filtro qui è una seconda sicurezza.
 */
function normalize(data) {
	if (!data || data.version !== VERSION || !Array.isArray(data.sections)) {
		throw new Error("content.json non ha il formato atteso");
	}
	const sections = data.sections.filter((s) => s && s.visible && s.id && s.label).sort(byOrder);
	const ids = new Set(sections.map((s) => s.id));
	const projects = (data.projects || [])
		.filter((p) => p && p.status === "published" && ids.has(p.section) && isImageRef(p.cover))
		.map((p) => ({
			...p,
			media: (p.media || []).filter((m) =>
				m.type === "image" ? isImageRef(m.image) : typeof m.url === "string"
			),
		}))
		.sort(byOrder);
	return {
		sections: sections.map((s) => ({
			...s,
			projects: projects.filter((p) => p.section === s.id),
		})),
	};
}

// Una sola richiesta per caricamento della pagina, condivisa da tutto il sito.
let request = null;

function loadContent() {
	if (!request) {
		// Il parametro ?t= scavalca qualunque cache (browser e Cloudflare):
		// a ogni visita arriva la versione appena salvata dal gestionale.
		request = Promise.resolve()
			.then(() => fetch(`${MEDIA_URL}/content.json?t=${Date.now()}`, { cache: "no-store" }))
			.then((res) => {
				if (!res.ok) throw new Error(`content.json: HTTP ${res.status}`);
				return res.json();
			})
			.then(normalize)
			.catch((err) => {
				request = null; // il prossimo tentativo riparte da capo
				throw err;
			});
	}
	return request;
}

/**
 * Contenuti del sito: { sections: [{ id, label, avatar, intro, projects }] }.
 * Finché non arrivano (o se il bucket non risponde) vale null: il sito
 * mostra comunque HOME e BIO. Un errore viene ritentato una volta.
 */
export function useContent() {
	const [content, setContent] = useState(null);

	useEffect(() => {
		let cancelled = false;
		let timer = null;

		const attempt = (left) =>
			loadContent()
				.then((c) => !cancelled && setContent(c))
				.catch((err) => {
					if (cancelled) return;
					if (left > 0) timer = setTimeout(() => attempt(left - 1), 3000);
					else console.warn("Portfolio: contenuti non disponibili.", err);
				});

		attempt(1);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, []);

	return content;
}

// ── Immagini ────────────────────────────────────────────────────────────
// Ogni immagine è salvata in più larghezze: <key>-600|1200|2400.webp.
// `width`/`height` sono le misure reali della versione più grande, che può
// essere più stretta della sua etichetta (originale da 2000 px → file -2400
// largo 2000): per questo il descrittore di srcset è min(etichetta, width).

export const imageUrl = (ref, w) => `${MEDIA_URL}/${ref.key}-${w}.webp`;

/**
 * Attributi per <img>: src, srcSet, sizes, width e height (niente salti
 * di impaginazione mentre l'immagine arriva). Il browser sceglie la
 * versione giusta per lo schermo.
 */
export function imageProps(ref, sizes) {
	const widths = [...ref.widths].sort((a, b) => a - b);
	const seen = new Set();
	const srcSet = widths
		.map((w) => [w, Math.min(w, ref.width || w)])
		.filter(([, d]) => !seen.has(d) && seen.add(d))
		.map(([w, d]) => `${imageUrl(ref, w)} ${d}w`)
		.join(", ");
	const fallback = widths.find((w) => w >= 1200) ?? widths[widths.length - 1];
	return {
		src: imageUrl(ref, fallback),
		srcSet,
		sizes,
		...(ref.width && ref.height && { width: ref.width, height: ref.height }),
	};
}
