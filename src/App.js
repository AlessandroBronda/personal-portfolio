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

	const fadeClass = isFading ? "section-fading" : "";

	return (
		<div className="App">
			{/* Barra superiore fissa: hamburger (mobile) + toggle tema */}
			<div className="topbar">
			<button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
				☰
			</button>
			<button
				className="theme-toggle"
				onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
				aria-label="Cambia tema"
			>
				{theme === "light" ? (
					// Luna (passa al tema scuro)
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
					</svg>
				) : (
					// Sole (passa al tema chiaro)
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="12" cy="12" r="4" />
						<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
					</svg>
				)}
			</button>
			</div>

			{/* Navbar superiore (solo su tablet) */}
			{isMobileNav && (
				<nav className={`sections ${menuOpen ? "open" : ""}`}>
					<div className="navbar">
						<ul className="sections">{navItems}</ul>
					</div>
				</nav>
			)}

			<header className="App-header">

				{/* Colonna sinistra: avatar (crossfade), nome, bio breve */}
				<div className="LeftCl">
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
				<div className="RightCl">
					{!isMobileNav && (
						<ul className={`sections ${menuOpen ? "open" : ""}`}>{navItems}</ul>
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
