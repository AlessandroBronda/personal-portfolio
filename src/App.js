import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";
import "./media.css";
import ProjectGrid from "./components/ProjectGrid/ProjectGrid";
import { useContent, imageProps } from "./lib/content";

// ── Sezioni ──────────────────────────────────────────────────────────────
// HOME e BIO sono moduli nel codice (cartelle Home/ e Bio/) e restano
// sempre le prime due voci. Tutte le altre sezioni arrivano da content.json
// sul bucket, nell'ordine e con i nomi scelti nel gestionale: si
// aggiungono, rinominano, nascondono e riordinano senza deploy.
import { section as home } from "./Home/Home";
import { section as bio } from "./Bio/Bio";

const FIXED_SECTIONS = [home, bio];

// Immagine della colonna sinistra per le sezioni senza un'immagine propria.
const DEFAULT_AVATAR = process.env.PUBLIC_URL + "/semoy.jpg";
// Il ritratto è un cerchio di 350 px (più piccolo su mobile).
const AVATAR_SIZES = "350px";

// Avatar come attributi di <img>: le sezioni fisse hanno un file in
// public/, quelle del gestionale un'immagine sul bucket in più larghezze.
const avatarOf = (a) => (typeof a === "string" ? { src: a } : a);

/**
 * Sezione del gestionale → stessa forma delle sezioni nel codice.
 * Di norma la griglia è a tutta larghezza (colonna sinistra nascosta);
 * se nel gestionale le dai un'immagine o un testo, la colonna sinistra
 * resta visibile e li mostra.
 */
function fromContent(s) {
	const intro = s.intro || {};
	const hasLeftColumn = Boolean(s.avatar || intro.name || intro.bio);
	return {
		key: s.id,
		label: s.label,
		avatar: s.avatar ? imageProps(s.avatar, AVATAR_SIZES) : DEFAULT_AVATAR,
		projects: s.projects,
		name: intro.name,
		bio: intro.bio,
		bioItalic: Boolean(intro.italic),
		fullWidth: !hasLeftColumn,
	};
}

// Durata (ms) del fade-out del contenuto prima di cambiare sezione.
const FADE_MS = 300;

// Testi di default della colonna sinistra (una sezione può sovrascriverli
// con i campi `name` / `bio` / `bioItalic`: nel codice per HOME e BIO,
// dal gestionale per le altre).
const DEFAULT_NAME = "Alessandro Bronda";
const DEFAULT_BIO =
	"Ciao, sono un freelance e mi occupo di 3D, grafica e programmazione. Mi piace " +
	"unire diverse discipline per dare vita a progetti creativi, d'impatto, funzionali " +
	"ma sopratutto belli.";

function App() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [activeSection, setActiveSection] = useState("HOME");
	const [isFading, setIsFading] = useState(false);
	const [clickedItem, setClickedItem] = useState(null);
	const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
	const [screenWidth, setScreenWidth] = useState(window.innerWidth);

	const isMobileNav = screenWidth >= 800 && screenWidth < 1450;

	// Finché content.json non arriva (o se il bucket non risponde) il menu
	// ha solo HOME e BIO.
	const content = useContent();
	const sections = useMemo(
		() => [...FIXED_SECTIONS, ...(content?.sections ?? []).map(fromContent)],
		[content]
	);
	// Avatar unici: una sola immagine per layer, crossfade gestito via opacity.
	const avatars = useMemo(() => {
		const bySrc = new Map();
		sections.forEach((s) => {
			const a = avatarOf(s.avatar);
			if (!bySrc.has(a.src)) bySrc.set(a.src, a);
		});
		return [...bySrc.values()];
	}, [sections]);

	const active = sections.find((s) => s.key === activeSection) || home;
	const activeAvatar = avatarOf(active.avatar).src;
	const Render = active.render; // componente custom della sezione (es. BIO) o null
	const boxes = active.boxes || { c1: null, c2: null, c3: null };
	const isFullWidth = !!active.fullWidth;

	// Tiene aggiornata la larghezza per i breakpoint responsive.
	useEffect(() => {
		const handleResize = () => setScreenWidth(window.innerWidth);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Applica il tema al <body> e lo salva tra le sessioni.
	useEffect(() => {
		document.body.classList.toggle("dark", theme === "dark");
		localStorage.setItem("theme", theme);
	}, [theme]);

	// Voci del menu su sfondo scuro → testo bianco (solo mobile, a menu aperto).
	// La bioSheet (foglio competenze) è scura: le voci che la sovrappongono
	// sarebbero illeggibili. Calcolo la sovrapposizione reale e la ricalcolo a
	// ogni scroll (il foglio scorre dietro al menu che è fisso). Il cambio di
	// colore è animato dalla transition CSS su .glass-shell-nav li.
	useEffect(() => {
		if (screenWidth >= 800 || !menuOpen) return;
		const nav = document.querySelector(".glass-shell-nav");
		if (!nav) return;
		const items = Array.from(nav.querySelectorAll("li"));
		let raf = null;

		const update = () => {
			raf = null;
			const sheet = document.querySelector(".bioSheet");
			const s = sheet ? sheet.getBoundingClientRect() : null;
			items.forEach((li) => {
				const r = li.getBoundingClientRect();
				let onDark = false;
				if (s) {
					const hOverlap = Math.min(r.right, s.right) - Math.max(r.left, s.left);
					const vOverlap = Math.min(r.bottom, s.bottom) - Math.max(r.top, s.top);
					// Almeno metà voce sopra il foglio → evita sfarfallii sul bordo.
					onDark = hOverlap > 0 && vOverlap > r.height * 0.5;
				}
				li.classList.toggle("on-dark", onDark);
			});
		};

		const onScroll = () => {
			if (raf == null) raf = requestAnimationFrame(update);
		};

		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		// Con molte sezioni la colonna del menu scorre da sola.
		nav.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			nav.removeEventListener("scroll", onScroll);
			if (raf) cancelAnimationFrame(raf);
		};
	}, [menuOpen, screenWidth, activeSection, sections]);

	// Cambio sezione con fade-out → swap → fade-in.
	const handleNavClick = useCallback(
		(item) => {
			if (item === activeSection) return;
			setIsFading(true);
			setTimeout(() => {
				setActiveSection(item);
				setMenuOpen(false);
				setIsFading(false);
			}, FADE_MS);
		},
		[activeSection]
	);

	const navItems = sections.map(({ key, label }) => (
		<li
			key={key}
			className={`${activeSection === key ? "active" : ""} ${
				clickedItem === key ? "clicked" : ""
			}`}
			onClick={() => {
				setClickedItem(key);
				handleNavClick(key);
			}}
			onAnimationEnd={() => setClickedItem(null)}
		>
			{label}
		</li>
	));

	// Toggle tema riutilizzabile (topbar, guscio mobile, navbar full-width).
	const themeToggleButton = (className = "theme-toggle") => (
		<button
			className={className}
			onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
			aria-label="Cambia tema"
		>
			{theme === "light" ? (
				// Luna (passa al tema scuro)
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
				</svg>
			) : (
				// Sole (passa al tema chiaro)
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
					<circle cx="12" cy="12" r="4" />
					<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
				</svg>
			)}
		</button>
	);

	const fadeClass = isFading ? "section-fading" : "";

	return (
		<div className={`App ${isFullWidth ? "App--full-width" : ""}`}>
			{/* Barra superiore (tablet/desktop). Sotto i 1450px il menu (lista
			    sezioni) vive DENTRO la topbar; su desktop ≥1450 il menu è laterale
			    nella RightCl e la topbar ha solo il toggle. Su mobile (<800) è
			    sostituita dal guscio in vetro unico qui sotto. */}
			{screenWidth >= 800 && (
				<div className="topbar">
					{isMobileNav && <ul className="sections topbar-nav">{navItems}</ul>}
					{themeToggleButton()}
				</div>
			)}

			{/* ── Mobile: guscio in vetro unico ──
			    Topbar e drawer sono lo STESSO elemento: una sola superficie di
			    vetro ritagliata con clip-path. Chiusa = solo la barra in alto;
			    aperta = barra + colonna a sinistra in un'unica forma a Γ. */}
			{screenWidth < 800 && (
				<div className={`glass-shell ${menuOpen ? "open" : ""}`}>
					<div className="glass-shell-bar">
						<button
							className={`hamburger ${menuOpen ? "open" : ""}`}
							onClick={() => setMenuOpen(!menuOpen)}
							aria-label="Apri o chiudi il menu"
							aria-expanded={menuOpen}
						>
							<span className="hamburger-bar" />
							<span className="hamburger-bar" />
							<span className="hamburger-bar" />
						</button>
						{/* Nome della categoria al centro: solo per le sezioni a tutta
						    larghezza (i progetti), mai per HOME e BIO. */}
						{isFullWidth && (
							<span className="glass-shell-title">{active.label}</span>
						)}
						{themeToggleButton()}
					</div>
					<ul className={`glass-shell-nav ${menuOpen ? "open" : ""}`}>{navItems}</ul>
				</div>
			)}

			{/* Scrim: oscura lo sfondo e chiude il menu cliccando fuori (solo mobile) */}
			<div
				className={`nav-scrim ${menuOpen ? "open" : ""}`}
				onClick={() => setMenuOpen(false)}
			/>

			<header className={`App-header ${isFullWidth ? "App-header--full" : ""}`}>

				{/* Colonna sinistra: avatar (crossfade), nome, bio breve */}
				<div className={`LeftCl ${isFullWidth ? "LeftCl--hidden" : ""}`}>
					<div className="profilePic-wrapper">
						{avatars.map(({ width, height, ...img }) => (
							<img
								key={img.src}
								{...img}
								className={`pic-layer ${activeAvatar === img.src ? "" : "hidden"}`}
								alt="Alessandro Bronda"
							/>
						))}
					</div>
					<div className="LeftCl-text">
						<h1 className="Name" key={`name-${activeSection}`}>
							{active.name || DEFAULT_NAME}
						</h1>
						<p
							className={`bio ${active.bioItalic ? "bio-italic" : ""}`}
							key={`bio-${activeSection}`}
						>
							{active.bio || DEFAULT_BIO}
						</p>
					</div>
				</div>

				{/* Colonna destra: navbar (desktop/mobile) + contenuto della sezione */}
				<div className={`RightCl ${isFullWidth ? "RightCl--full" : ""}`}>
					{screenWidth >= 1450 && (
						<ul className={`sections ${menuOpen ? "open" : ""}`}>
							{navItems}
							{isFullWidth && (
								<li className="nav-theme-toggle">{themeToggleButton()}</li>
							)}
						</ul>
					)}

					{Render ? (
						// Sezione con render personalizzato (es. BIO)
						<Render screenWidth={screenWidth} isFading={isFading} />
					) : active.projects ? (
						// Sezione del gestionale: griglia dei lavori. La key la
						// rimonta a ogni cambio sezione (comparsa a cascata, scheda chiusa).
						<ProjectGrid key={active.key} projects={active.projects} isFading={isFading} />
					) : (
						// Layout a tre box (HOME)
						<>
							<div className={`cMaster ${fadeClass}`}>
								<div className="c1">{boxes.c1}</div>
								<div className="c2">{boxes.c2}</div>
								{screenWidth < 800 && <div className="c3">{boxes.c3}</div>}
							</div>
							{screenWidth > 1450 && (
								<div className={`c3 specialPosition ${fadeClass}`}>{boxes.c3}</div>
							)}
						</>
					)}
				</div>
			</header>

			{/* c3 a tutta larghezza sotto l'header (solo su tablet, layout a box) */}
			{!Render && !active.projects && screenWidth >= 800 && screenWidth <= 1450 && (
				<div className={`c3 ${fadeClass}`}>{boxes.c3}</div>
			)}
		</div>
	);
}

export default App;
