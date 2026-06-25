import React, { useState, useEffect, useRef, useMemo } from 'react';

const SKILL_GROUPS = [
	{
		label: 'generiche',
		skills: [
			{ key: 'Illustrazione',           level: 5 },
			{ key: 'Modellazione 3D',          level: 4 },
			{ key: 'Sculpting',               level: 3 },
			{ key: 'Texturing (PBR)',          level: 3 },
			{ key: 'Rigging & Animazione',     level: 3 },
			{ key: 'Lighting & Rendering',     level: 4 },
			{ key: 'Archviz',                 level: 4 },
			{ key: 'Disegno tecnico CAD 2D',  level: 5 },
		],
	},
	{
		label: 'linguaggi',
		skills: [
			{ key: 'Python',      level: 3 },
			{ key: 'JavaScript',  level: 4 },
			{ key: 'HTML / CSS',  level: 5 },
		],
	},
	{
		label: 'programmi',
		skills: [
			{ key: 'Blender / Cinema 4D',              level: 5 },
			{ key: 'AutoCAD',                          level: 5 },
			{ key: 'Adobe Suite (2D + Substance 3D)',  level: 5 },
			{ key: 'Unreal / Unity',                   level: 3 },
		],
	},
];

const LEGEND = [
	{ level: 5, desc: 'uso professionale quotidiano' },
	{ level: 4, desc: 'solido, autonomo' },
	{ level: 3, desc: 'buona padronanza' },
	{ level: 2, desc: 'funzionale' },
	{ level: 1, desc: 'basi' },
];

function makeBar(level) {
	return '▰'.repeat(level) + '▱'.repeat(5 - level);
}

const MAX_KEY_LEN = Math.max(
	...SKILL_GROUPS.flatMap(g => g.skills.map(s => s.key.length))
);

// Indentazione delle skill: ampia su desktop, ridotta su mobile per far
// stare tutte le righe nel box senza scroll orizzontale.
const INDENT_DESKTOP = 6;
const INDENT_MOBILE = 3;

// Colonna dove inizia "[": indent + virgolette(2) + due punti(1) + chiave + pad(2)
function getBracketCol(indent) {
	return indent + MAX_KEY_LEN + 5;
}

// Righe strutturali (indipendenti dall'indentazione)
function buildLines() {
	const lines = [];

	lines.push({ type: 'const' });

	SKILL_GROUPS.forEach(({ label, skills }) => {
		lines.push({ type: 'section', label });
		skills.forEach(({ key, level }) => {
			lines.push({ type: 'skill', key, level });
		});
	});

	lines.push({ type: 'close' });
	lines.push({ type: 'blank' });

	LEGEND.forEach(({ level, desc }) => {
		lines.push({ type: 'legend', level, desc });
	});

	return lines;
}

const LINES = buildLines();

function getLineTokens(line, indent, bracketCol) {
	switch (line.type) {
		case 'const':
			return [
				{ text: 'const ',      className: 'sk-keyword'  },
				{ text: 'competenze',  className: 'sk-variable' },
				{ text: ' = {',        className: 'sk-punct'    },
			];
		case 'section':
			return [{ text: `  // ${line.label}`, className: 'sk-comment' }];
		case 'skill': {
			const lead = ' '.repeat(indent);
			const prefix = `${lead}"${line.key}":`;
			const pad = ' '.repeat(Math.max(bracketCol - prefix.length, 1));
			return [
				{ text: lead,                className: ''          },
				{ text: `"${line.key}"`,     className: 'sk-string' },
				{ text: ':',                 className: 'sk-punct'  },
				{ text: pad,                 className: ''          },
				{ text: '[',                 className: 'sk-punct'  },
				{ text: makeBar(line.level), className: 'sk-bar'    },
				{ text: '],',               className: 'sk-punct'  },
			];
		}
		case 'close':
			return [{ text: '};', className: 'sk-punct' }];
		case 'blank':
			return [{ text: ' ', className: '' }]; // 1 char placeholder per avanzare il cursore
		case 'legend':
			return [{ text: `// [${makeBar(line.level)}] = ${line.desc}`, className: 'sk-legend' }];
		default:
			return [];
	}
}

// ── Timing (modifica questi valori per regolare l'animazione) ──
const ENTRANCE_MS   = 1500; // durata animazione entrata bioSheet
const PAUSE_MS      = 200;  // pausa con cursore prima della digitazione
const TYPING_MS     = 2500; // durata totale digitazione

function SkillPanel() {
	const [visibleChars, setVisibleChars] = useState(0);
	const [started, setStarted]           = useState(false);
	const [isSmall, setIsSmall]           = useState(() => window.innerWidth < 800);
	const timerRef = useRef(null);
	const rafRef   = useRef(null);

	// Aggiorna l'indentazione quando si attraversa il breakpoint mobile.
	useEffect(() => {
		const onResize = () => setIsSmall(window.innerWidth < 800);
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, []);

	// Token e conteggi caratteri, ricalcolati solo al cambio di indentazione.
	const { lineTokens, lineCharCounts, lineStartChars, totalChars } = useMemo(() => {
		const indent = isSmall ? INDENT_MOBILE : INDENT_DESKTOP;
		const bracketCol = getBracketCol(indent);
		const tokens = LINES.map((l) => getLineTokens(l, indent, bracketCol));
		const counts = tokens.map((t) => t.reduce((s, { text }) => s + text.length, 0));
		const starts = [];
		let cum = 0;
		counts.forEach((n) => { starts.push(cum); cum += n; });
		return { lineTokens: tokens, lineCharCounts: counts, lineStartChars: starts, totalChars: cum };
	}, [isSmall]);

	useEffect(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			setStarted(true);
			setVisibleChars(Number.MAX_SAFE_INTEGER);
			return;
		}

		timerRef.current = setTimeout(() => {
			setStarted(true);
			const t0 = performance.now();
			const tick = (now) => {
				const progress = Math.min((now - t0) / TYPING_MS, 1);
				setVisibleChars(Math.ceil(progress * 1e6)); // valore relativo, clampato sotto
				if (progress < 1) rafRef.current = requestAnimationFrame(tick);
			};
			rafRef.current = requestAnimationFrame(tick);
		}, ENTRANCE_MS + PAUSE_MS);

		return () => {
			clearTimeout(timerRef.current);
			cancelAnimationFrame(rafRef.current);
		};
	}, []);

	// visibleChars è un valore "grezzo" su scala 1e6: lo riscalo sui caratteri reali.
	const shownChars = Math.min(Math.floor((visibleChars / 1e6) * totalChars), totalChars);
	const isDone = shownChars >= totalChars;

	// Fase di pausa: pannello vuoto con solo cursore
	if (!started) {
		return (
			<div className="skill-panel">
				<div className="code-line">
					<span className="gutter"> </span>
					<span className="code-content"><span className="cursor" /></span>
				</div>
			</div>
		);
	}

	return (
		<div className="skill-panel">
			{lineTokens.map((tokens, lineIdx) => {
				const lineStart = lineStartChars[lineIdx];
				const lineLen   = lineCharCounts[lineIdx];
				const lineEnd   = lineStart + lineLen;

				if (shownChars < lineStart) return null;

				const charsInLine   = Math.min(shownChars - lineStart, lineLen);
				const isCurrentLine = shownChars >= lineStart && shownChars < lineEnd;
				const isLastLine    = lineIdx === lineTokens.length - 1;

				// Costruisce gli span visibili per questa riga
				const spans = [];
				let rem = charsInLine;
				tokens.forEach(({ text, className }, tIdx) => {
					if (rem <= 0) return;
					const visible = text.slice(0, rem);
					rem -= text.length;
					if (!visible) return;
					spans.push(
						className
							? <span key={tIdx} className={className}>{visible}</span>
							: <React.Fragment key={tIdx}>{visible}</React.Fragment>
					);
				});

				return (
					<div className="code-line" key={lineIdx}>
						<span className="gutter">{lineIdx + 1}</span>
						<span className="code-content">
							{spans}
							{(isCurrentLine || (isDone && isLastLine)) && <span className="cursor" />}
						</span>
					</div>
				);
			})}
		</div>
	);
}

export default SkillPanel;
