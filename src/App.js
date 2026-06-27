import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import "./media.css";

// ── Registro delle sezioni ───────────────────────────────────────────────
// Ogni voce della navbar è un modulo in una sua cartella che esporta `section`.
// L'ordine di questo array determina l'ordine della navbar.
import { section as home } from "./Home/Home";
import { section as bio } from "./Bio/Bio";
import { section as progetti3d } from "./Progetti3D/Progetti3D";
import { section as animazione } from "./Animazione/Animazione";
import { section as grafica } from "./Grafica/Grafica";
import { section as programmazione } from "./Programmazione/Programmazione";
import { section as webDesign } from "./WebDesign/WebDesign";

const SECTIONS = [
	home,
	bio,
	progetti3d,
	animazione,
	grafica,
	programmazione,
	webDesign,
];

const SECTION_BY_KEY = Object.fromEntries(SECTIONS.map((s) => [s.key, s]));
const NAV_ITEMS = SECTIONS.map((s) => s.key);
// Avatar unici: una sola immagine per layer, crossfade gestito via opacity.
const AVATARS = [...new Set(SECTIONS.map((s) => s.avatar))];

// Durata (ms) del fade-out del contenuto prima di cambiare sezione.
const FADE_MS = 300;

// Testi di default della colonna sinistra (una sezione può sovrascriverli
// con i campi `name` / `bio` / `bioItalic` nel suo config).
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

	const active = SECTION_BY_KEY[activeSection];
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

	const navItems = NAV_ITEMS.map((item) => (
		<li
			key={item}
			className={`${activeSection === item ? "active" : ""} ${
				clickedItem === item ? "clicked" : ""
			}`}
			onClick={() => {
				setClickedItem(item);
				handleNavClick(item);
			}}
			onAnimationEnd={() => setClickedItem(null)}
		>
			{item}
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
			{/* Barra superiore (tablet/desktop): solo toggle tema.
			    Su mobile è sostituita dal guscio in vetro unico qui sotto. */}
			{screenWidth >= 800 && (
				<div className="topbar">{themeToggleButton()}</div>
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

			{/* Navbar superiore (solo su tablet) */}
			{isMobileNav && (
				<nav className={`sections ${menuOpen ? "open" : ""}`}>
					<div className="navbar">
						<ul className="sections">{navItems}</ul>
					</div>
				</nav>
			)}

			<header className={`App-header ${isFullWidth ? "App-header--full" : ""}`}>

				{/* Colonna sinistra: avatar (crossfade), nome, bio breve */}
				<div className={`LeftCl ${isFullWidth ? "LeftCl--hidden" : ""}`}>
					<div className="profilePic-wrapper">
						{AVATARS.map((src) => (
							<img
								key={src}
								className={`pic-layer ${active.avatar === src ? "" : "hidden"}`}
								src={src}
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
					) : (
						// Layout a tre box (HOME e sezioni non ancora implementate)
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
			{!Render && screenWidth >= 800 && screenWidth <= 1450 && (
				<div className={`c3 ${fadeClass}`}>{boxes.c3}</div>
			)}
		</div>
	);
}

export default App;
